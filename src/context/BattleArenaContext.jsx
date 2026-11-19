import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FIXED_TEAMS, AUCTION_PRESETS } from '../services/presets';
import { 
  toPaise, 
  fromPaise, 
  getProgressiveIncrement, 
  getProgressiveTierLabel, 
  calculateNextBid,
  validateBid 
} from '../services/auctionEngine';
import { 
  generateBattleSchedule, 
  validateSchedule, 
  evaluateBattleMatch, 
  calculateLeaderboard, 
  getSavedBattleState, 
  saveBattleState 
} from '../services/battleEngine';
import { soundService } from '../services/soundService';
import { toast } from 'sonner';

const BattleArenaContext = createContext(null);

export const BattleArenaProvider = ({ children }) => {
  // Restore initial state from LocalStorage if available
  const [battleState, setBattleState] = useState(() => {
    const saved = getSavedBattleState();
    if (saved && saved.phase) return saved;

    return {
      phase: 'setup', // 'setup' | 'auction' | 'roster_confirm' | 'transition' | 'battles' | 'results'
      teamCount: 4,
      squadSize: 3,
      startingPurse: 100,
      tournamentName: 'Tamil Hero Battle Clash',
      themeColor: '#9147FF',
      teams: FIXED_TEAMS.map((t) => ({
        ...t,
        initialPurse: 100,
        purse: 100,
        squad: [],
      })),
      auction: {
        items: [],
        currentItemIndex: 0,
        currentBid: 1.0,
        highestBidder: null,
        bidHistory: [],
        timer: 20,
        isTimerRunning: false,
        status: 'pending',
      },
      unsoldPool: [],
      schedule: [],
      currentMatchIndex: 0,
      usedPlayerIds: [],
      completedMatches: [],
      privateFighterSelection: {}, // { [teamId]: playerId }
      currentMatchEvaluation: null,
      matchStage: 'faceoff', // 'faceoff' | 'teamA_select' | 'teamA_locked' | 'teamB_select' | 'evaluated' | 'confirmed'
      leaderboard: [],
    };
  });

  const timerRef = useRef(null);

  // Auto-persist battle tournament state to LocalStorage
  useEffect(() => {
    saveBattleState(battleState);
  }, [battleState]);

  // Auction Timer Loop for Round 1
  useEffect(() => {
    if (
      battleState.phase === 'auction' &&
      battleState.auction.isTimerRunning &&
      battleState.auction.timer > 0
    ) {
      timerRef.current = setInterval(() => {
        setBattleState((prev) => {
          if (!prev || prev.phase !== 'auction' || !prev.auction.isTimerRunning) return prev;

          const nextTime = prev.auction.timer - 1;
          if (nextTime <= 0) {
            clearInterval(timerRef.current);
            // Auto timeout settlement
            if (prev.auction.highestBidder) {
              soundService.playGavel();
              return handleAutoSoldOnTimeout(prev);
            } else {
              soundService.playGavel();
              return handleAutoUnsoldOnTimeout(prev);
            }
          }

          if (nextTime <= 5) {
            soundService.playUrgentTick();
          } else if (nextTime % 5 === 0) {
            soundService.playTick();
          }

          return {
            ...prev,
            auction: {
              ...prev.auction,
              timer: nextTime,
            },
          };
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [battleState.phase, battleState.auction.isTimerRunning, battleState.auction.timer]);

  // Helper: auto settle lot as SOLD when timer runs out
  const handleAutoSoldOnTimeout = (prevState) => {
    const { items, currentItemIndex, currentBid, highestBidder } = prevState.auction;
    const currentItem = items[currentItemIndex];
    if (!currentItem) return prevState;

    const winningTeam = prevState.teams.find((t) => t.id === highestBidder);
    const updatedPurse = Number((winningTeam.purse - currentBid).toFixed(2));

    const soldItem = {
      ...currentItem,
      status: 'sold',
      soldTo: highestBidder,
      soldPrice: currentBid,
      basePrice: currentItem.basePrice,
      highestBid: currentBid,
      settlementType: 'normal_sold',
    };

    const updatedTeams = prevState.teams.map((t) => {
      if (t.id === highestBidder) {
        return {
          ...t,
          purse: updatedPurse,
          squad: [...t.squad, soldItem],
        };
      }
      return t;
    });

    const updatedItems = items.map((it, idx) => (idx === currentItemIndex ? soldItem : it));

    // Check if next lot exists or if all squads are full
    const allSquadsFull = updatedTeams.every((t) => t.squad.length >= prevState.squadSize);
    const nextIdx = currentItemIndex + 1;

    if (allSquadsFull || nextIdx >= items.length) {
      soundService.playSold();
      return {
        ...prevState,
        phase: 'roster_confirm',
        teams: updatedTeams,
        auction: {
          ...prevState.auction,
          items: updatedItems,
          status: 'concluded',
          isTimerRunning: false,
          timer: 0,
        },
      };
    }

    const nextItem = updatedItems[nextIdx];
    const duration = prevState.auction.countdownDuration || prevState.countdownDuration || 20;
    return {
      ...prevState,
      teams: updatedTeams,
      auction: {
        ...prevState.auction,
        items: updatedItems,
        currentItemIndex: nextIdx,
        currentBid: Number(nextItem?.basePrice) || 1.0,
        highestBidder: null,
        bidHistory: [],
        timer: duration,
        isTimerRunning: true,
      },
    };
  };

  // Helper: auto settle lot as UNSOLD when timer runs out
  const handleAutoUnsoldOnTimeout = (prevState) => {
    const { items, currentItemIndex, highestBidder, currentBid } = prevState.auction;
    const currentItem = items[currentItemIndex];
    if (!currentItem) return prevState;

    // MANDATORY LAST-BIDDER SETTLEMENT RULE (Part 3):
    // If at least one valid bid was placed, player cannot be unsold!
    // Last accepted bidder acquires the player at base price.
    if (highestBidder) {
      const winningTeam = prevState.teams.find((t) => t.id === highestBidder);
      const basePrice = Number(currentItem.basePrice) || 1.0;
      const updatedPurse = Number((winningTeam.purse - basePrice).toFixed(2));

      const soldItem = {
        ...currentItem,
        status: 'sold',
        soldTo: highestBidder,
        soldPrice: basePrice,
        basePrice: basePrice,
        highestBid: currentBid,
        settlementType: 'last_bidder_base_price_settlement',
      };

      const updatedTeams = prevState.teams.map((t) => {
        if (t.id === highestBidder) {
          return {
            ...t,
            purse: Math.max(0, updatedPurse),
            squad: [...t.squad, soldItem],
          };
        }
        return t;
      });

      const updatedItems = items.map((it, idx) => (idx === currentItemIndex ? soldItem : it));
      const allSquadsFull = updatedTeams.every((t) => t.squad.length >= prevState.squadSize);
      const nextIdx = currentItemIndex + 1;

      if (allSquadsFull || nextIdx >= items.length) {
        soundService.playSold();
        return {
          ...prevState,
          phase: 'roster_confirm',
          teams: updatedTeams,
          auction: {
            ...prevState.auction,
            items: updatedItems,
            status: 'concluded',
            isTimerRunning: false,
            timer: 0,
          },
        };
      }

      const nextItem = updatedItems[nextIdx];
      const duration = prevState.auction.countdownDuration || prevState.countdownDuration || 20;
      return {
        ...prevState,
        teams: updatedTeams,
        auction: {
          ...prevState.auction,
          items: updatedItems,
          currentItemIndex: nextIdx,
          currentBid: Number(nextItem?.basePrice) || 1.0,
          highestBidder: null,
          bidHistory: [],
          timer: duration,
          isTimerRunning: true,
        },
      };
    }

    const unsoldItem = {
      ...currentItem,
      status: 'unsold',
      basePrice: currentItem.basePrice,
      settlementType: 'unsold_no_bids',
    };

    const updatedItems = items.map((it, idx) => (idx === currentItemIndex ? unsoldItem : it));
    const updatedUnsold = [...prevState.unsoldPool, unsoldItem];

    const nextIdx = currentItemIndex + 1;
    if (nextIdx >= items.length) {
      return {
        ...prevState,
        unsoldPool: updatedUnsold,
        phase: 'roster_confirm',
        auction: {
          ...prevState.auction,
          items: updatedItems,
          status: 'concluded',
          isTimerRunning: false,
          timer: 0,
        },
      };
    }

    const nextItem = updatedItems[nextIdx];
    const duration = prevState.auction.countdownDuration || prevState.countdownDuration || 20;
    return {
      ...prevState,
      unsoldPool: updatedUnsold,
      auction: {
        ...prevState.auction,
        items: updatedItems,
        currentItemIndex: nextIdx,
        currentBid: Number(nextItem?.basePrice) || 1.0,
        highestBidder: null,
        bidHistory: [],
        timer: duration,
        isTimerRunning: true,
      },
    };
  };

  // 1. Initialize Battle Tournament from Setup Screen
  const initializeBattleTournament = ({
    preset,
    teamCount = 4,
    selectedTeams = null,
    squadSize = 3,
    startingPurse = 100,
    countdownDuration = 20,
    customItems = null,
    customTournament = null,
  }) => {
    const selectedPreset = preset || AUCTION_PRESETS[0];
    const pool = customItems && customItems.length > 0 ? customItems : selectedPreset.items;

    // Validate pool size
    const requiredPoolSize = teamCount * squadSize;
    if (pool.length < requiredPoolSize) {
      toast.error(`Auction pool has only ${pool.length} items. Need at least ${requiredPoolSize} lots for ${teamCount} teams of ${squadSize}!`);
      return false;
    }

    // Configure teams for 2, 3, or 4 teams using selected franchises
    const teamsToUse = (selectedTeams && Array.isArray(selectedTeams) && selectedTeams.length === teamCount)
      ? selectedTeams
      : FIXED_TEAMS.slice(0, teamCount);

    const activeTeams = teamsToUse.map((t) => {
      const p = Number(t.initialPurse != null ? t.initialPurse : (t.purse != null ? t.purse : startingPurse));
      return {
        ...t,
        initialPurse: p,
        purse: p,
        squad: [],
      };
    });

    const finalCountdown = Number(countdownDuration) || Number(customTournament?.rules?.countdownSeconds) || Number(customTournament?.rules?.countdownDuration) || 20;

    // Randomize pool order, preserving all metadata, unique IDs, base prices, and ratings
    const randomizedPool = [...pool].sort(() => Math.random() - 0.5).map((item, idx) => ({
      ...item,
      id: item.id ? String(item.id) : `battle_lot_${idx + 1}`,
      name: item.name,
      movie: item.movie || item.film || '',
      actor: item.actor || item.star || '',
      year: item.year || '',
      category: item.category || item.role || 'Superstar Fighter',
      basePrice: Number(item.basePrice) > 0 ? Number(item.basePrice) : 1.0,
      rating: typeof item.rating === 'number' ? item.rating : (Number(item.rating) || 80),
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      metadata: item.metadata || {},
      status: 'pending',
    }));

    // Generate schedule
    const schedule = generateBattleSchedule(activeTeams, squadSize);
    const scheduleValidation = validateSchedule(schedule, activeTeams, squadSize);

    if (!scheduleValidation.valid) {
      toast.error('Could not generate an equal battle schedule for the chosen squad size.');
      return false;
    }

    const initialLeaderboard = calculateLeaderboard(activeTeams, []);

    setBattleState({
      phase: 'auction',
      teamCount,
      squadSize,
      startingPurse,
      countdownDuration: finalCountdown,
      tournamentName: customTournament?.name || selectedPreset.name || 'Battle Arena Clash',
      themeColor: customTournament?.theme?.primary || selectedPreset.theme?.primary || '#FF8A35',
      tournamentMetadata: customTournament || null,
      teams: activeTeams,
      auction: {
        items: randomizedPool,
        currentItemIndex: 0,
        currentBid: Number(randomizedPool[0]?.basePrice) || 1.0,
        highestBidder: null,
        bidHistory: [],
        timer: finalCountdown,
        countdownDuration: finalCountdown,
        isTimerRunning: true,
        status: 'in_progress',
      },
      unsoldPool: [],
      schedule,
      currentMatchIndex: 0,
      usedPlayerIds: [],
      completedMatches: [],
      privateFighterSelection: {},
      currentMatchEvaluation: null,
      leaderboard: initialLeaderboard,
    });

    soundService.playBid();
    toast.success(`⚔️ Battle Arena Initialized: ${teamCount} Teams • Squad Size ${squadSize}!`);
    return true;
  };

  // 2. Place Bid in Battle Auction
  const placeBattleBid = (teamId, targetAmount = null) => {
    const { auction, teams, squadSize } = battleState;
    if (auction.status !== 'in_progress') return;

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    // Check squad capacity
    if (team.squad.length >= squadSize) {
      toast.warning(`${team.name}'s squad is already complete (${squadSize}/${squadSize})!`);
      return;
    }

    // Check anti-self bidding
    if (auction.highestBidder === teamId) {
      toast.info(`${team.name} is already the highest bidder!`);
      return;
    }

    const currentItem = auction.items[auction.currentItemIndex];
    const calculatedTarget = targetAmount !== null
      ? Number(targetAmount)
      : calculateNextBid(auction.currentBid, Boolean(auction.highestBidder), currentItem.basePrice);

    // Validate purse
    if (team.purse < calculatedTarget) {
      toast.error(`Insufficient purse: ${team.name} has ₹${team.purse} Cr, needs ₹${calculatedTarget} Cr`);
      return;
    }

    soundService.playBid();
    setBattleState((prev) => ({
      ...prev,
      auction: {
        ...prev.auction,
        currentBid: calculatedTarget,
        highestBidder: teamId,
        timer: prev.auction.countdownDuration || prev.countdownDuration || 20, // Reset timer on new bid
        isTimerRunning: true,
        bidHistory: [
          { teamId, amount: calculatedTarget, timestamp: new Date().toLocaleTimeString() },
          ...prev.auction.bidHistory,
        ],
      },
    }));
  };

  // 3. Confirm Lot Sold
  const confirmBattleSold = () => {
    setBattleState((prev) => handleAutoSoldOnTimeout(prev));
  };

  // 4. Mark Lot Unsold
  const markBattleUnsold = () => {
    setBattleState((prev) => handleAutoUnsoldOnTimeout(prev));
  };

  // 5. Re-auction Unsold Lots if squads are incomplete
  const reAuctionUnsoldLots = () => {
    if (battleState.unsoldPool.length === 0) {
      toast.error('No unsold lots available to re-auction!');
      return;
    }

    const reItems = battleState.unsoldPool.map((it) => ({
      ...it,
      status: 'pending',
    }));

    setBattleState((prev) => ({
      ...prev,
      phase: 'auction',
      unsoldPool: [],
      auction: {
        ...prev.auction,
        items: [...prev.auction.items, ...reItems],
        currentItemIndex: prev.auction.items.length,
        currentBid: Number(reItems[0]?.basePrice) || 1.0,
        highestBidder: null,
        bidHistory: [],
        timer: prev.auction.countdownDuration || prev.countdownDuration || 20,
        isTimerRunning: true,
        status: 'in_progress',
      },
    }));

    toast.success(`Re-auctioning ${reItems.length} unsold lots to complete squad quotas!`);
  };

  // 6. Proceed from Roster Confirmation to Round 2
  const startRound2Battles = () => {
    // Strict Equal Squad Size Check
    const incomplete = battleState.teams.find((t) => t.squad.length !== battleState.squadSize);
    if (incomplete) {
      toast.error(`Cannot proceed: ${incomplete.name} has ${incomplete.squad.length} / ${battleState.squadSize} players.`);
      return;
    }

    setBattleState((prev) => ({
      ...prev,
      phase: 'transition',
    }));
  };

  // 7. Transition into Battles Arena
  const enterBattleArenaStage = () => {
    setBattleState((prev) => ({
      ...prev,
      phase: 'battles',
      currentMatchIndex: 0,
      privateFighterSelection: {},
      currentMatchEvaluation: null,
      matchStage: 'faceoff',
    }));
    soundService.playBid();
  };

  // 8. Start Fighter Selection from Pre-Match Face-Off Screen (BIDBATTLE 7.7)
  const startFighterSelection = () => {
    setBattleState((prev) => ({
      ...prev,
      matchStage: 'teamA_select',
    }));
  };

  // 8a. Team A Selects Fighter (Saved privately, then transitions to privacy lock screen)
  const selectTeamAFighter = (playerId) => {
    setBattleState((prev) => {
      const currentMatch = prev.schedule[prev.currentMatchIndex];
      return {
        ...prev,
        privateFighterSelection: {
          ...prev.privateFighterSelection,
          [currentMatch.teamAId]: playerId,
        },
        matchStage: 'teamA_locked',
      };
    });
  };

  // 8b. Proceed from Team A Locked to Team B Selection
  const proceedToTeamB = () => {
    setBattleState((prev) => ({
      ...prev,
      matchStage: 'teamB_select',
    }));
  };

  // 8c. Team B Selects Fighter (Simultaneous Reveal & Immediate Evaluation)
  const selectTeamBFighter = (playerId) => {
    setBattleState((prev) => {
      const currentMatch = prev.schedule[prev.currentMatchIndex];
      const updatedPicks = {
        ...prev.privateFighterSelection,
        [currentMatch.teamBId]: playerId,
      };

      const teamA = prev.teams.find((t) => t.id === currentMatch.teamAId);
      const teamB = prev.teams.find((t) => t.id === currentMatch.teamBId);

      const playerA = teamA.squad.find((p) => p.id === updatedPicks[currentMatch.teamAId]);
      const playerB = teamB.squad.find((p) => p.id === playerId);

      const evaluation = evaluateBattleMatch(playerA, playerB);

      let winnerId = null;
      let isDraw = false;
      if (evaluation.winner === 'A') {
        winnerId = teamA.id;
      } else if (evaluation.winner === 'B') {
        winnerId = teamB.id;
      } else {
        isDraw = true;
      }

      // Dramatic sound effect on simultaneous reveal
      if (isDraw) {
        soundService.playGavel();
      } else {
        soundService.playSold();
      }

      return {
        ...prev,
        privateFighterSelection: updatedPicks,
        currentMatchEvaluation: {
          ...evaluation,
          playerA,
          playerB,
          winnerId,
          isDraw,
        },
        matchStage: 'evaluated',
      };
    });
  };

  // 8d. Explicit Match Result Confirmation (BIDBATTLE 7.7)
  const confirmMatchResult = () => {
    setBattleState((prev) => {
      if (!prev.currentMatchEvaluation || prev.matchStage !== 'evaluated') return prev;

      const currentMatch = prev.schedule[prev.currentMatchIndex];
      const { playerA, playerB, winnerId, isDraw, diff, scoreA, scoreB } = prev.currentMatchEvaluation;

      const evaluatedMatch = {
        ...currentMatch,
        teamAPlayer: playerA,
        teamBPlayer: playerB,
        winnerId,
        isDraw,
        scoreDiff: diff,
        teamAScore: scoreA,
        teamBScore: scoreB,
        status: 'completed',
      };

      const updatedSchedule = prev.schedule.map((m, idx) =>
        idx === prev.currentMatchIndex ? evaluatedMatch : m
      );

      const updatedCompleted = [...prev.completedMatches, evaluatedMatch];
      const updatedLeaderboard = calculateLeaderboard(prev.teams, updatedCompleted);

      toast.success('Match result confirmed! Tournament standings updated.');

      return {
        ...prev,
        schedule: updatedSchedule,
        completedMatches: updatedCompleted,
        usedPlayerIds: [...prev.usedPlayerIds, playerA.id, playerB.id],
        leaderboard: updatedLeaderboard,
        matchStage: 'confirmed',
      };
    });
  };

  // Fallback for direct private fighter selection
  const selectPrivateFighter = (teamId, playerId) => {
    setBattleState((prev) => {
      const currentMatch = prev.schedule[prev.currentMatchIndex];
      if (teamId === currentMatch.teamAId) {
        return {
          ...prev,
          privateFighterSelection: {
            ...prev.privateFighterSelection,
            [teamId]: playerId,
          },
          matchStage: 'teamA_locked',
        };
      } else {
        // Team B
        const updatedPicks = {
          ...prev.privateFighterSelection,
          [teamId]: playerId,
        };
        const teamA = prev.teams.find((t) => t.id === currentMatch.teamAId);
        const teamB = prev.teams.find((t) => t.id === currentMatch.teamBId);
        const playerA = teamA.squad.find((p) => p.id === updatedPicks[currentMatch.teamAId]);
        const playerB = teamB.squad.find((p) => p.id === playerId);
        const evaluation = evaluateBattleMatch(playerA, playerB);

        let winnerId = null;
        let isDraw = false;
        if (evaluation.winner === 'A') winnerId = teamA.id;
        else if (evaluation.winner === 'B') winnerId = teamB.id;
        else isDraw = true;

        return {
          ...prev,
          privateFighterSelection: updatedPicks,
          currentMatchEvaluation: {
            ...evaluation,
            playerA,
            playerB,
            winnerId,
            isDraw,
          },
          matchStage: 'evaluated',
        };
      }
    });
  };

  // 9. Advance to Next Battle or Tournament Results
  const advanceToNextBattle = () => {
    setBattleState((prev) => {
      const nextIndex = prev.currentMatchIndex + 1;
      if (nextIndex >= prev.schedule.length) {
        soundService.playSold();
        return {
          ...prev,
          phase: 'results',
        };
      }

      return {
        ...prev,
        currentMatchIndex: nextIndex,
        privateFighterSelection: {},
        currentMatchEvaluation: null,
        matchStage: 'faceoff',
      };
    });
  };

  // 10. Toggle / Reset Auction Timer
  const toggleBattleTimer = () => {
    setBattleState((prev) => ({
      ...prev,
      auction: {
        ...prev.auction,
        isTimerRunning: !prev.auction.isTimerRunning,
      },
    }));
  };

  const resetBattleTimer = () => {
    setBattleState((prev) => ({
      ...prev,
      auction: {
        ...prev.auction,
        timer: prev.auction.countdownDuration || prev.countdownDuration || 20,
        isTimerRunning: true,
      },
    }));
  };

  // 11. Full Reset
  const resetBattleTournament = () => {
    saveBattleState(null);
    setBattleState({
      phase: 'setup',
      teamCount: 4,
      squadSize: 3,
      startingPurse: 100,
      tournamentName: 'Tamil Hero Battle Clash',
      themeColor: '#9147FF',
      teams: FIXED_TEAMS.map((t) => ({
        ...t,
        initialPurse: 100,
        purse: 100,
        squad: [],
      })),
      auction: {
        items: [],
        currentItemIndex: 0,
        currentBid: 1.0,
        highestBidder: null,
        bidHistory: [],
        timer: 20,
        isTimerRunning: false,
        status: 'pending',
      },
      unsoldPool: [],
      schedule: [],
      currentMatchIndex: 0,
      usedPlayerIds: [],
      completedMatches: [],
      privateFighterSelection: {},
      currentMatchEvaluation: null,
      matchStage: 'faceoff',
      leaderboard: [],
    });
    toast.info('Battle Arena reset to setup.');
  };

  return (
    <BattleArenaContext.Provider
      value={{
        battleState,
        setBattleState,
        initializeBattleTournament,
        placeBattleBid,
        confirmBattleSold,
        markBattleUnsold,
        reAuctionUnsoldLots,
        startRound2Battles,
        enterBattleArenaStage,
        startFighterSelection,
        selectTeamAFighter,
        proceedToTeamB,
        selectTeamBFighter,
        confirmMatchResult,
        selectPrivateFighter,
        advanceToNextBattle,
        toggleBattleTimer,
        resetBattleTimer,
        resetBattleTournament,
      }}
    >
      {children}
    </BattleArenaContext.Provider>
  );
};

export const useBattleArena = () => {
  const context = useContext(BattleArenaContext);
  if (!context) {
    throw new Error('useBattleArena must be used within a BattleArenaProvider');
  }
  return context;
};
