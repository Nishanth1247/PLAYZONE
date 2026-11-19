import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { storageService } from '../services/storageService';
import { soundService } from '../services/soundService';
import { AUCTION_PRESETS, FIXED_TEAMS, shuffleArray, getScoreMetricLabel } from '../services/presets';
import { calculateTeamRankings } from '../services/scoringEngine';
import { validateBid, toPaise, fromPaise, DEFAULT_INCREMENTS, calculateNextBid, AUCTION_MODES } from '../services/auctionEngine';

const AuctionContext = createContext(null);

export const AuctionProvider = ({ children }) => {
  // Navigation: 'home' | 'setup' | 'live' | 'teams' | 'unsold' | 'results'
  const [activePage, setActivePage] = useState('home');

  // Sound settings
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  // Active auction data
  const [auction, setAuction] = useState(null);

  // Saved custom tournaments list
  const [customTournaments, setCustomTournaments] = useState([]);

  // Active random event modal data
  const [activeEvent, setActiveEvent] = useState(null);

  // Outbid notification trigger
  const [outbidAlert, setOutbidAlert] = useState(null);

  // Sold/Unsold overlay state
  const [saleCelebration, setSaleCelebration] = useState(null);
  const [unsoldPrompt, setUnsoldPrompt] = useState(null);

  // Undo stack & transaction safety
  const [undoStack, setUndoStack] = useState([]);
  const [undoConfirmDialog, setUndoConfirmDialog] = useState(null);

  // Guard against rapid duplicate clicks
  const isBiddingRef = useRef(false);
  const isActionPendingRef = useRef(false);

  // Timer interval ref
  const timerRef = useRef(null);

  // Auction and settlement refs for stable timer callbacks
  const auctionRef = useRef(auction);
  const settleCurrentLotRef = useRef(null);

  useEffect(() => {
    auctionRef.current = auction;
  }, [auction]);

  // Initialize from storage on mount
  useEffect(() => {
    const savedAuction = storageService.loadActiveAuction();
    if (savedAuction) {
      setAuction(savedAuction);
    }
    setCustomTournaments(storageService.getCustomTournaments());
  }, []);

  // Update sound service on settings change
  useEffect(() => {
    soundService.setMuted(isMuted);
    soundService.setVolume(volume);
  }, [isMuted, volume]);

  // Persist auction state on change
  useEffect(() => {
    if (auction) {
      storageService.saveActiveAuction(auction);
    }
  }, [auction]);

  // Master Countdown Timer Loop
  useEffect(() => {
    if (
      auction &&
      auction.status === 'in_progress' &&
      auction.isTimerRunning &&
      auction.timer > 0
    ) {
      timerRef.current = setInterval(() => {
        setAuction((prev) => {
          if (!prev || !prev.isTimerRunning || prev.status !== 'in_progress') return prev;

          const nextTime = prev.timer - 1;

          // Sound effects for ticking
          if (prev.rules?.soundEffects && !isMuted) {
            if (nextTime <= 5 && nextTime > 0) {
              soundService.playUrgentTick();
            } else if (nextTime > 5) {
              soundService.playTick();
            }
          }

          if (nextTime <= 0) {
            clearInterval(timerRef.current);
            setTimeout(() => {
              if (settleCurrentLotRef.current) {
                settleCurrentLotRef.current({ isTimeout: true });
              }
            }, 50);
            return {
              ...prev,
              timer: 0,
              isTimerRunning: false,
            };
          }

          return { ...prev, timer: nextTime };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auction?.status, auction?.isTimerRunning, isMuted]);

  // Helper: Get current item
  const getCurrentItem = () => {
    if (!auction || !auction.items || auction.currentItemIndex >= auction.items.length) {
      return null;
    }
    return auction.items[auction.currentItemIndex];
  };

  // Helper: Take snapshot for Undo with rich action metadata
  const pushUndoSnapshot = (currentAuction, actionMeta = {}) => {
    if (!currentAuction) return;
    const snapshot = JSON.parse(JSON.stringify(currentAuction));
    setUndoStack((prev) => [{ snapshot, meta: actionMeta }, ...prev].slice(0, 15));
  };

  // 1. Start New Auction from Setup Wizard or Preset
  const createNewAuction = (setupData) => {
    const mappedItems = (setupData.items || []).map((item, idx) => ({
      ...item,
      id: item.id || `hero_${idx + 1}`,
      name: item.name,
      role: item.role || 'Hero',
      category: item.category || setupData.category || 'Standard',
      basePrice: Number(item.basePrice) || 1.0,
      rating: Number(item.rating) || 90,
      imdbRating: item.imdbRating !== undefined ? Number(item.imdbRating) : null,
      desc: item.desc || '',
      imageUrl: item.imageUrl || '',
      status: 'pending',
      soldPrice: null,
      soldTo: null,
      bidCount: 0,
      bidHistory: [],
    }));

    // Fresh Fisher-Yates shuffle for new tournament
    const randomizedItems = shuffleArray(mappedItems);

    // Fixed teams default fallback
    const rawTeams = (setupData.teams && setupData.teams.length > 0) ? setupData.teams : FIXED_TEAMS;
    const initialPurseAmount = Number(rawTeams[0]?.initialPurse || rawTeams[0]?.purse || 100);

    const configuredTeams = rawTeams.map((t, idx) => {
      const p = Number(t.purse || t.initialPurse || initialPurseAmount);
      return {
        id: t.id || `team_${idx + 1}`,
        name: t.name,
        shortName: t.shortName || t.name.slice(0, 3).toUpperCase(),
        color: t.color || '#9147FF',
        logo: t.logo || '👑',
        initialPurse: p,
        purse: p,
        itemsPurchased: [],
      };
    });

    const scoreMetric = setupData.scoreLabel || getScoreMetricLabel(setupData.category);

    const selectedModeId = setupData.mode || 'standard';
    const modeConfig = AUCTION_MODES[selectedModeId] || AUCTION_MODES.standard;
    const finalCountdown = Number(setupData.rules?.countdownDuration) || modeConfig.timerDuration || 20;
    const finalMaxSquad = Number(setupData.rules?.maxSquadSize) || modeConfig.maxSquadSize || 8;

    const newAuction = {
      id: `auction_${Date.now()}`,
      name: setupData.name || 'Hero Auction Showdown',
      category: setupData.category || 'Hero Cinema',
      scoreLabel: scoreMetric,
      mode: selectedModeId,
      description: setupData.description || '',
      currency: setupData.currency || { symbol: '₹', name: 'INR', unit: 'Cr', factor: 1 },
      rules: {
        minIncrement: Number(setupData.rules?.minIncrement) || 0.50,
        customIncrements: setupData.rules?.customIncrements || [0.50, 1.00, 2.00, 5.00, 10.00],
        minSquadSize: Number(setupData.rules?.minSquadSize) || 4,
        maxSquadSize: finalMaxSquad,
        countdownDuration: finalCountdown,
        soundEffects: setupData.rules?.soundEffects !== false,
        autoNext: Boolean(setupData.rules?.autoNext),
        antiSelfBidding: setupData.rules?.antiSelfBidding !== false,
        allowReAuction: setupData.rules?.allowReAuction !== false,
        randomEvents: Boolean(setupData.rules?.randomEvents),
        hideRatingsDuringAuction: Boolean(setupData.rules?.hideRatingsDuringAuction),
      },
      teams: configuredTeams,
      items: randomizedItems,
      currentItemIndex: 0,
      currentBid: Number(randomizedItems[0]?.basePrice) || 1.0,
      highestBidder: null,
      bidHistory: [],
      tickerEvents: [
        {
          id: `tick_start_${Date.now()}`,
          text: `🏟️ Tournament Arena initialized: ${setupData.name || 'Hero Auction Showdown'}. Mode: ${modeConfig.name}. Lot #1 is on the block!`,
          type: 'event',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }
      ],
      activityTimeline: [
        {
          id: `act_${Date.now()}_start`,
          type: 'tournament_started',
          title: 'Tournament Arena Initialized',
          description: `Tournament "${setupData.name || 'Hero Auction Showdown'}" initialized with ${configuredTeams.length} franchises.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        {
          id: `act_${Date.now()}_lot1`,
          type: 'lot_introduced',
          title: `Lot #1 Introduced: ${randomizedItems[0]?.name}`,
          description: `Base Price: ${setupData.currency?.symbol || '₹'}${randomizedItems[0]?.basePrice} ${setupData.currency?.unit || 'Cr'} • Category: ${randomizedItems[0]?.category}`,
          lotName: randomizedItems[0]?.name,
          lotNumber: 1,
          basePrice: randomizedItems[0]?.basePrice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }
      ],
      status: 'in_progress',
      timer: finalCountdown,
      isTimerRunning: true,
      round: 1,
      createdAt: new Date().toISOString(),
    };

    setAuction(newAuction);
    setUndoStack([]);
    storageService.saveActiveAuction(newAuction);
    setActivePage('live');
  };

  // 2. Load Preset Tournament with support for custom configurable team budgets and auction modes
  const loadPresetAuction = (presetId, customTeamBudgets = null, modeId = 'standard') => {
    const preset = AUCTION_PRESETS.find((p) => p.id === presetId) || AUCTION_PRESETS[0];
    const modeConfig = AUCTION_MODES[modeId] || AUCTION_MODES.standard;

    let tournamentTeams;
    if (customTeamBudgets && Array.isArray(customTeamBudgets) && customTeamBudgets.length > 0) {
      tournamentTeams = customTeamBudgets.map((t) => {
        const p = Number(t.initialPurse || t.purse || (modeConfig.defaultPurse || 100));
        return {
          ...t,
          initialPurse: p,
          purse: p,
        };
      });
    } else {
      const presetPurse = modeConfig.defaultPurse || preset.teams?.[0]?.initialPurse || 100;
      tournamentTeams = FIXED_TEAMS.map((t) => ({
        ...t,
        initialPurse: presetPurse,
        purse: presetPurse,
      }));
    }

    createNewAuction({
      name: preset.name,
      category: preset.category,
      scoreLabel: preset.scoreLabel,
      scoreMetric: preset.scoreMetric || (preset.category?.toLowerCase().includes('movie') || preset.id?.includes('imdb') ? 'imdb' : 'points'),
      mode: modeId,
      description: preset.description,
      currency: preset.currency,
      rules: {
        ...preset.rules,
        countdownDuration: modeConfig.timerDuration,
        maxSquadSize: modeConfig.maxSquadSize,
        customIncrements: DEFAULT_INCREMENTS,
        minIncrement: 0.50,
      },
      teams: tournamentTeams,
      items: preset.items,
    });
  };

  // 2b. Refresh custom tournaments list from storage
  const refreshCustomTournaments = () => {
    setCustomTournaments(storageService.getCustomTournaments());
  };

  // 2c. Play Now: Launch custom tournament immediately without opening modal/editor
  const launchCustomTournamentPlayNow = (tournamentPreset) => {
    if (!tournamentPreset) return;
    const rawItems = tournamentPreset.entries || tournamentPreset.items || [];
    if (rawItems.length === 0) {
      return;
    }

    const defaultPurse = Number(tournamentPreset.teamBudgets?.defaultPurse || 100);
    const baseTeamsToUse = (tournamentPreset.teams && Array.isArray(tournamentPreset.teams) && tournamentPreset.teams.length >= 2 && tournamentPreset.teams.length <= 4)
      ? tournamentPreset.teams
      : FIXED_TEAMS;

    const configuredTeams = baseTeamsToUse.map((t, idx) => {
      const customT = tournamentPreset.teamBudgets?.teams?.find(
        (ct) => ct.id === t.id || ct.name?.toLowerCase() === t.name.toLowerCase()
      ) || tournamentPreset.teams?.find(
        (ct) => ct.id === t.id || ct.name?.toLowerCase() === t.name.toLowerCase()
      );
      const purse = Number(customT?.purse || customT?.initialPurse || t.purse || t.initialPurse || defaultPurse);
      return {
        ...t,
        initialPurse: purse,
        purse: purse,
        itemsPurchased: [],
      };
    });

    const mappedItems = rawItems.map((item, idx) => ({
      ...item,
      id: item.id || `lot_${idx + 1}`,
      name: item.name,
      role: item.role || item.category || 'Lot',
      category: item.category || tournamentPreset.category || 'Custom',
      basePrice: Number(item.basePrice) || 1.0,
      rating: Number(item.rating) || 90,
      imdbRating: item.imdbRating !== undefined && item.imdbRating !== null ? Number(item.imdbRating) : null,
      desc: item.desc || '',
      imageUrl: item.imageUrl || '',
      status: 'pending',
      soldPrice: null,
      soldTo: null,
      bidCount: 0,
      bidHistory: [],
    }));

    const randomizedItems = shuffleArray(mappedItems);

    const newAuction = {
      id: `auction_${Date.now()}`,
      presetId: tournamentPreset.id,
      name: tournamentPreset.name || 'Custom Auction Showdown',
      category: tournamentPreset.category || 'Custom',
      scoreLabel: tournamentPreset.scoreLabel || 'Power Rating',
      description: tournamentPreset.description || '',
      currency: tournamentPreset.currency || { symbol: '₹', name: 'INR', unit: 'Cr', factor: 1 },
      rules: {
        minIncrement: Number(tournamentPreset.rules?.minIncrement) || 1.00,
        customIncrements: tournamentPreset.rules?.customIncrements || DEFAULT_INCREMENTS,
        minSquadSize: Number(tournamentPreset.rules?.minSquadSize) || 2,
        maxSquadSize: Number(tournamentPreset.rules?.maxSquadSize) || 8,
        countdownDuration: Number(tournamentPreset.rules?.countdownDuration) || 20,
        soundEffects: tournamentPreset.rules?.soundEffects !== false,
        autoNext: Boolean(tournamentPreset.rules?.autoNext),
        antiSelfBidding: tournamentPreset.rules?.antiSelfBidding !== false,
        allowReAuction: tournamentPreset.rules?.allowReAuction !== false,
        randomEvents: Boolean(tournamentPreset.rules?.randomEvents),
        hideRatingsDuringAuction: Boolean(tournamentPreset.rules?.hideRatingsDuringAuction),
      },
      teams: configuredTeams,
      items: randomizedItems,
      currentItemIndex: 0,
      currentBid: Number(randomizedItems[0]?.basePrice) || 1.0,
      highestBidder: null,
      bidHistory: [],
      tickerEvents: [
        {
          id: `tick_start_${Date.now()}`,
          text: `🏟️ Tournament Arena initialized: ${tournamentPreset.name}. Lot #1 is on the block!`,
          type: 'event',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }
      ],
      status: 'in_progress',
      timer: Number(tournamentPreset.rules?.countdownDuration) || 20,
      isTimerRunning: true,
      round: 1,
      createdAt: new Date().toISOString(),
    };

    setAuction(newAuction);
    setUndoStack([]);
    storageService.saveActiveAuction(newAuction);
    setActivePage('live');
  };

  // 2d. Save and Launch: Saves custom tournament preset and launches Play Now
  const saveAndLaunchCustomTournament = (tournamentData) => {
    storageService.saveCustomTournament(tournamentData);
    setCustomTournaments(storageService.getCustomTournaments());
    launchCustomTournamentPlayNow(tournamentData);
  };

  // Restart an active tournament as a fresh game (new Fisher-Yates shuffle, reset purses)
  const restartTournamentFresh = () => {
    if (!auction) return;

    // Reset items to pending and fresh shuffle
    const freshItems = auction.items.map((i) => ({
      ...i,
      status: 'pending',
      soldPrice: null,
      soldTo: null,
      bidCount: 0,
      bidHistory: [],
    }));
    const reshuffled = shuffleArray(freshItems);

    // Reset team purses to initialPurse
    const resetTeams = auction.teams.map((t) => ({
      ...t,
      purse: t.initialPurse,
      itemsPurchased: [],
    }));

    const freshAuction = {
      ...auction,
      id: `auction_${Date.now()}`,
      items: reshuffled,
      teams: resetTeams,
      currentItemIndex: 0,
      currentBid: Number(reshuffled[0]?.basePrice) || 1.0,
      highestBidder: null,
      bidHistory: [],
      status: 'in_progress',
      timer: auction.rules?.countdownDuration || 20,
      isTimerRunning: true,
      round: 1,
      completedAt: null,
    };

    setAuction(freshAuction);
    setUndoStack([]);
    storageService.saveActiveAuction(freshAuction);
    setActivePage('live');
  };

  // 3. Centralized Place a Bid with fixed-paise precision and debounce
  const placeBid = (teamId, customAmount = null) => {
    if (!auction || auction.status !== 'in_progress') {
      return { success: false, reason: 'Auction is not active' };
    }

    if (auction.timer <= 0 || !auction.isTimerRunning) {
      return { success: false, reason: 'Bidding closed: Countdown reached zero' };
    }

    const currentItem = getCurrentItem();
    if (!currentItem || currentItem.status !== 'pending') {
      return { success: false, reason: 'Bidding closed: Current lot is already settled' };
    }

    if (isBiddingRef.current) {
      return { success: false, reason: 'Bid processing, please wait' };
    }

    const team = auction.teams.find((t) => t.id === teamId);
    if (!team) {
      return { success: false, reason: 'Team not found' };
    }

    // Determine target amount
    let targetAmount = customAmount;
    if (targetAmount === null || targetAmount === undefined) {
      const inc = Number(auction.rules?.minIncrement) || 1.0;
      targetAmount = calculateNextBid(
        auction.currentBid,
        inc,
        Boolean(auction.highestBidder),
        auction.items?.[auction.currentItemIndex]?.basePrice
      );
    }

    // Central validation
    const validation = validateBid({
      auction,
      teamId,
      targetAmount,
    });

    if (!validation.valid) {
      return { success: false, reason: validation.reason, code: validation.code };
    }

    // Lock debounce
    isBiddingRef.current = true;
    setTimeout(() => {
      isBiddingRef.current = false;
    }, 200);

    const validAmount = validation.amount;
    const prevHighestBidderId = auction.highestBidder;
    const prevTeam = prevHighestBidderId ? auction.teams.find((t) => t.id === prevHighestBidderId) : null;

    // Save undo state before modifying
    const currentLotItem = auction.items?.[auction.currentItemIndex];
    pushUndoSnapshot(auction, {
      type: 'bid',
      description: `Bid of ${auction.currency?.symbol || '₹'}${validAmount} Cr by ${team.name} on ${currentLotItem?.name || 'Lot'}`,
      teamId: team.id,
      teamName: team.name,
      amount: validAmount,
      lotName: currentLotItem?.name,
      effects: [
        `Restore lot bid to ${auction.currency?.symbol || '₹'}${auction.currentBid} Cr`,
        prevTeam ? `Highest bidder will revert to ${prevTeam.name}` : 'Highest bidder will be cleared',
      ],
    });

    if (prevTeam && prevTeam.id !== team.id) {
      setOutbidAlert({
        outbidTeam: prevTeam,
        newBidder: team,
        amount: validAmount,
      });
      if (auction.rules?.soundEffects && !isMuted) {
        soundService.playOutbid();
      }
    } else {
      if (auction.rules?.soundEffects && !isMuted) {
        soundService.playBid();
      }
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const diffPaise = toPaise(validAmount) - toPaise(auction.currentBid);

    const newBidRecord = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      seq: (auction.bidHistory?.length || 0) + 1,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      teamColor: team.color,
      amount: validAmount,
      increment: fromPaise(diffPaise),
      timestamp: timeStr,
    };

    const newTickerMsg = {
      id: `tick_${Date.now()}`,
      text: `${team.logo} ${team.name} raised the bid to ${auction.currency?.symbol || '₹'}${validAmount} Cr`,
      type: 'bid',
      timestamp: timeStr,
    };

    const bidTimelineEntry = {
      id: `act_${Date.now()}_bid`,
      type: 'bid_placed',
      title: `Bid: ${auction.currency?.symbol || '₹'}${validAmount} Cr`,
      description: `${team.name} placed a bid of ${auction.currency?.symbol || '₹'}${validAmount} Cr (+${auction.currency?.symbol || '₹'}${fromPaise(diffPaise)} Cr)`,
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      teamLogo: team.logo,
      amount: validAmount,
      lotName: currentLotItem?.name,
      lotNumber: (auction.currentItemIndex || 0) + 1,
      timestamp: timeStr,
    };

    const newTimelineEntries = [bidTimelineEntry];
    if (prevTeam && prevTeam.id !== team.id) {
      newTimelineEntries.unshift({
        id: `act_${Date.now()}_lead`,
        type: 'leader_changed',
        title: `Lead Outbid by ${team.name}`,
        description: `${team.name} took the lead over ${prevTeam.name} at ${auction.currency?.symbol || '₹'}${validAmount} Cr.`,
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        amount: validAmount,
        lotName: currentLotItem?.name,
        lotNumber: (auction.currentItemIndex || 0) + 1,
        timestamp: timeStr,
      });
    }

    setAuction((prev) => ({
      ...prev,
      currentBid: validAmount,
      highestBidder: team.id,
      bidHistory: [newBidRecord, ...prev.bidHistory],
      tickerEvents: [newTickerMsg, ...(prev.tickerEvents || [])].slice(0, 20),
      activityTimeline: [...newTimelineEntries, ...(prev.activityTimeline || [])].slice(0, 100),
      timer: prev.rules?.countdownDuration || 20,
      isTimerRunning: true,
    }));

    return { success: true, amount: validAmount, team };
  };

  // 4. Quick Increment bid
  const placeIncrementBid = (teamId, incrementAmount) => {
    if (!auction) return { success: false, reason: 'Auction not active' };
    const inc = Number(incrementAmount) || 1.0;
    const target = calculateNextBid(
      auction.currentBid,
      inc,
      Boolean(auction.highestBidder),
      auction.items?.[auction.currentItemIndex]?.basePrice
    );
    return placeBid(teamId, target);
  };

  // 5. Transaction Safety: Request Undo with Confirmation
  const requestUndo = () => {
    if (undoStack.length === 0) {
      toast.error('No transactions available to undo');
      return false;
    }
    const top = undoStack[0];
    setUndoConfirmDialog(top);
    return true;
  };

  const cancelUndo = () => {
    setUndoConfirmDialog(null);
  };

  const executeConfirmedUndo = () => {
    if (!undoConfirmDialog || undoStack.length === 0) return false;
    const { snapshot, meta } = undoConfirmDialog;
    setUndoStack((prev) => prev.slice(1));
    setUndoConfirmDialog(null);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const reversalMsg = meta?.description
      ? `Reversed: ${meta.description}`
      : `Reversed transaction at ${timeStr}`;

    const undoTimelineEntry = {
      id: `act_${Date.now()}_undo`,
      type: 'undo_transaction',
      title: 'Transaction Reversed (Undo)',
      description: reversalMsg,
      timestamp: timeStr,
    };

    setAuction({
      ...snapshot,
      activityTimeline: [undoTimelineEntry, ...(snapshot.activityTimeline || [])].slice(0, 100),
      tickerEvents: [
        {
          id: `tick_${Date.now()}`,
          text: `↩️ ${reversalMsg}`,
          type: 'undo',
          timestamp: timeStr,
        },
        ...(snapshot.tickerEvents || [])
      ].slice(0, 20),
    });
    setSaleCelebration(null);
    setUnsoldPrompt(null);
    setOutbidAlert(null);
    toast.success('Transaction successfully reversed!');
    return true;
  };

  // Keep legacy direct undo as alias to requestUndo
  const undoLastBid = () => {
    return requestUndo();
  };

  // 6. Centralized Authoritative Settlement (Timeout, SOLD, or UNSOLD)
  const settleCurrentLot = (options = {}) => {
    const curAuction = auctionRef.current;
    if (!curAuction || curAuction.status !== 'in_progress') return;

    const currentItem = curAuction.items?.[curAuction.currentItemIndex];
    if (!currentItem || currentItem.status !== 'pending') return;

    if (isActionPendingRef.current) return;
    isActionPendingRef.current = true;
    setTimeout(() => {
      isActionPendingRef.current = false;
    }, 400);

    if (timerRef.current) clearInterval(timerRef.current);

    const hasValidBid = Boolean(curAuction.highestBidder) && !options.forceUnsold;
    const shouldForceSold = Boolean(options.forceSold);

    if (hasValidBid || shouldForceSold) {
      const winningTeam = curAuction.teams.find((t) => t.id === curAuction.highestBidder);
      if (!winningTeam) {
        markUnsoldInternal(currentItem, curAuction);
        return;
      }
      confirmSoldInternal(currentItem, winningTeam, curAuction.currentBid, curAuction);
    } else {
      markUnsoldInternal(currentItem, curAuction);
    }
  };

  const confirmSoldInternal = (currentItem, winningTeam, finalPrice, curAuction) => {
    // Record undoable snapshot with clear metadata
    pushUndoSnapshot(curAuction, {
      type: 'settlement',
      description: `Sale of Lot #${curAuction.currentItemIndex + 1} (${currentItem.name}) to ${winningTeam.name} for ${curAuction.currency?.symbol || '₹'}${finalPrice} Cr`,
      teamId: winningTeam.id,
      teamName: winningTeam.name,
      amount: finalPrice,
      lotName: currentItem.name,
      effects: [
        `Refund ${curAuction.currency?.symbol || '₹'}${finalPrice} Cr to ${winningTeam.name}'s purse`,
        `Restore 1 squad slot to ${winningTeam.name}`,
        `Lot #${curAuction.currentItemIndex + 1} (${currentItem.name}) returns to active pending block`,
      ],
    });

    if (curAuction.rules?.soundEffects && !isMuted) {
      soundService.playSold();
    }

    setSaleCelebration({
      item: { ...currentItem },
      team: { ...winningTeam },
      price: finalPrice,
    });

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const soldTickerMsg = {
      id: `tick_${Date.now()}`,
      text: `🔨 Lot #${curAuction.currentItemIndex + 1} (${currentItem.name}) SOLD to ${winningTeam.name} for ${curAuction.currency?.symbol || '₹'}${finalPrice} Cr!`,
      type: 'sold',
      timestamp: timeStr,
    };

    const soldTimelineEntry = {
      id: `act_${Date.now()}_sold`,
      type: 'item_sold',
      title: `SOLD: ${currentItem.name}`,
      description: `Hammer fell! Acquired by ${winningTeam.name} for ${curAuction.currency?.symbol || '₹'}${finalPrice} Cr`,
      teamId: winningTeam.id,
      teamName: winningTeam.name,
      teamColor: winningTeam.color,
      teamLogo: winningTeam.logo,
      lotName: currentItem.name,
      lotNumber: curAuction.currentItemIndex + 1,
      price: finalPrice,
      timestamp: timeStr,
    };

    setAuction((prev) => {
      if (!prev) return prev;
      const updatedTeams = prev.teams.map((t) => {
        if (t.id === winningTeam.id) {
          const newPursePaise = toPaise(t.purse) - toPaise(finalPrice);
          return {
            ...t,
            purse: fromPaise(Math.max(0, newPursePaise)),
            itemsPurchased: [
              ...(t.itemsPurchased || []),
              {
                id: currentItem.id,
                name: currentItem.name,
                role: currentItem.role,
                rating: currentItem.rating,
                price: finalPrice,
                category: currentItem.category,
              },
            ],
          };
        }
        return t;
      });

      const updatedItems = prev.items.map((i, idx) => {
        if (idx === prev.currentItemIndex) {
          return {
            ...i,
            status: 'sold',
            soldPrice: finalPrice,
            soldTo: winningTeam.id,
            bidCount: prev.bidHistory?.length || 0,
            bidHistory: prev.bidHistory || [],
          };
        }
        return i;
      });

      return {
        ...prev,
        teams: updatedTeams,
        items: updatedItems,
        tickerEvents: [soldTickerMsg, ...(prev.tickerEvents || [])].slice(0, 20),
        activityTimeline: [soldTimelineEntry, ...(prev.activityTimeline || [])].slice(0, 100),
        timer: 0,
        isTimerRunning: false,
      };
    });
  };

  const markUnsoldInternal = (currentItem, curAuction) => {
    pushUndoSnapshot(curAuction, {
      type: 'unsold',
      description: `Marking Lot #${curAuction.currentItemIndex + 1} (${currentItem.name}) as UNSOLD`,
      lotName: currentItem.name,
      effects: [
        `Lot #${curAuction.currentItemIndex + 1} (${currentItem.name}) returns from unsold reserve to pending block`,
      ],
    });

    if (curAuction.rules?.soundEffects && !isMuted) {
      soundService.playUnsold();
    }

    setUnsoldPrompt({ item: { ...currentItem } });

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const unsoldTickerMsg = {
      id: `tick_${Date.now()}`,
      text: `❌ Lot #${curAuction.currentItemIndex + 1} (${currentItem.name}) passed and marked UNSOLD`,
      type: 'unsold',
      timestamp: timeStr,
    };

    const unsoldTimelineEntry = {
      id: `act_${Date.now()}_unsold`,
      type: 'item_unsold',
      title: `UNSOLD: ${currentItem.name}`,
      description: `No qualifying bids meeting reserve of ${curAuction.currency?.symbol || '₹'}${currentItem.basePrice} Cr. Lot passed to unsold reserve.`,
      lotName: currentItem.name,
      lotNumber: curAuction.currentItemIndex + 1,
      basePrice: currentItem.basePrice,
      timestamp: timeStr,
    };

    setAuction((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((i, idx) => {
        if (idx === prev.currentItemIndex) {
          return {
            ...i,
            status: 'unsold',
            bidCount: prev.bidHistory?.length || 0,
            bidHistory: prev.bidHistory || [],
          };
        }
        return i;
      });

      return {
        ...prev,
        items: updatedItems,
        tickerEvents: [unsoldTickerMsg, ...(prev.tickerEvents || [])].slice(0, 20),
        activityTimeline: [unsoldTimelineEntry, ...(prev.activityTimeline || [])].slice(0, 100),
        timer: 0,
        isTimerRunning: false,
      };
    });
  };

  settleCurrentLotRef.current = settleCurrentLot;

  const confirmSold = () => settleCurrentLot({ manual: true, forceSold: true });
  const markUnsold = () => settleCurrentLot({ manual: true, forceUnsold: true });

  // In-auction settings update
  const updateAuctionSettings = (newRules) => {
    if (!auction) return;
    setAuction((prev) => {
      const updated = {
        ...prev,
        rules: {
          ...prev.rules,
          ...newRules,
        },
      };
      storageService.saveActiveAuction(updated);
      return updated;
    });
  };

  // 8. Advance to Next Item
  const advanceToNextItem = () => {
    setSaleCelebration(null);
    setUnsoldPrompt(null);
    setOutbidAlert(null);
    // Keep most recent transaction in undo stack so accidental advance can still be reversed
    setUndoStack((prev) => prev.slice(0, 1));

    if (!auction) return;

    let nextIdx = auction.currentItemIndex + 1;
    while (nextIdx < auction.items.length && auction.items[nextIdx].status !== 'pending') {
      nextIdx++;
    }

    if (nextIdx >= auction.items.length) {
      const pendingItems = auction.items.filter((i) => i.status === 'pending');
      if (pendingItems.length === 0) {
        finishAuction();
        return;
      }
    }

    const nextItem = auction.items[nextIdx];
    const initialBid = nextItem ? Number(nextItem.basePrice) : 1.0;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const lotIntroTimeline = nextItem ? {
      id: `act_${Date.now()}_lot_${nextIdx + 1}`,
      type: 'lot_introduced',
      title: `Lot #${nextIdx + 1} Introduced: ${nextItem.name}`,
      description: `Base Price: ${auction.currency?.symbol || '₹'}${nextItem.basePrice} Cr • Category: ${nextItem.category || nextItem.role}`,
      lotName: nextItem.name,
      lotNumber: nextIdx + 1,
      basePrice: nextItem.basePrice,
      timestamp: timeStr,
    } : null;

    setAuction((prev) => ({
      ...prev,
      currentItemIndex: nextIdx,
      currentBid: initialBid,
      highestBidder: null,
      bidHistory: [],
      timer: prev.rules.countdownDuration || 20,
      isTimerRunning: true,
      status: 'in_progress',
      activityTimeline: lotIntroTimeline
        ? [lotIntroTimeline, ...(prev.activityTimeline || [])].slice(0, 100)
        : prev.activityTimeline,
    }));
  };

  // 9. Re-Auction a specific unsold item
  const reAuctionItem = (itemId) => {
    if (!auction) return;

    const itemIdx = auction.items.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) return;

    const targetItem = auction.items[itemIdx];

    setAuction((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'pending',
            soldPrice: null,
            soldTo: null,
          };
        }
        return item;
      });

      const reAuctionTimeline = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 're_auction',
        icon: '🔄',
        title: `Re-Auction: ${targetItem.name}`,
        description: `Returned to bidding pool at base price ₹${targetItem.basePrice} Cr`,
        badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      };

      return {
        ...prev,
        items: updatedItems,
        currentItemIndex: itemIdx,
        currentBid: Number(targetItem.basePrice),
        highestBidder: null,
        bidHistory: [],
        timer: prev.rules.countdownDuration || 20,
        isTimerRunning: true,
        status: 'in_progress',
        activityTimeline: [reAuctionTimeline, ...(prev.activityTimeline || [])].slice(0, 100),
      };
    });

    setActivePage('live');
  };

  // 10. Re-Auction ALL unsold items in Round 2
  const reAuctionAllUnsold = () => {
    if (!auction) return;

    const unsoldItems = auction.items.filter((i) => i.status === 'unsold');
    if (unsoldItems.length === 0) return;

    setAuction((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.status === 'unsold') {
          return {
            ...item,
            status: 'pending',
            soldPrice: null,
            soldTo: null,
          };
        }
        return item;
      });

      const firstIdx = updatedItems.findIndex((i) => i.status === 'pending');
      const firstPending = updatedItems[firstIdx];

      const reAllTimeline = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 're_auction_all',
        icon: '🔁',
        title: `Re-Auctioning ${unsoldItems.length} Unsold Lots`,
        description: `Round ${(prev.round || 1) + 1} initiated for all passed lots`,
        badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      };

      return {
        ...prev,
        round: (prev.round || 1) + 1,
        items: updatedItems,
        currentItemIndex: firstIdx,
        currentBid: Number(firstPending?.basePrice || 1.0),
        highestBidder: null,
        bidHistory: [],
        timer: prev.rules.countdownDuration || 20,
        isTimerRunning: true,
        status: 'in_progress',
        activityTimeline: [reAllTimeline, ...(prev.activityTimeline || [])].slice(0, 100),
      };
    });

    setActivePage('live');
  };

  // 11. Timer controls
  const toggleTimer = () => {
    setAuction((prev) => {
      if (!prev) return prev;
      const nextRunning = !prev.isTimerRunning;
      const timerTimeline = {
        id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        type: nextRunning ? 'timer_resume' : 'timer_pause',
        icon: nextRunning ? '▶️' : '⏸️',
        title: nextRunning ? 'Auction Timer Resumed' : 'Auction Timer Paused',
        description: `Timer ${nextRunning ? 'resumed at' : 'paused at'} ${prev.timer}s`,
        badgeColor: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
      };

      return {
        ...prev,
        isTimerRunning: nextRunning,
        activityTimeline: [timerTimeline, ...(prev.activityTimeline || [])].slice(0, 100),
      };
    });
  };

  const resetTimer = () => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timer: prev.rules.countdownDuration || 20,
        isTimerRunning: true,
      };
    });
  };

  // 12. Fun Random Event
  const triggerRandomEvent = () => {
    if (!auction) return;
    const currentItem = getCurrentItem();
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    const result = event.apply(auction, currentItem);

    if (auction.rules.soundEffects && !isMuted) {
      soundService.playEvent();
    }

    setActiveEvent({
      ...event,
      resultMessage: result?.message || '',
    });

    setAuction((prev) => ({ ...prev }));
  };

  // 13. Finish Auction & Go to Results
  const finishAuction = () => {
    if (!auction) return;
    const finishedAuction = {
      ...auction,
      status: 'finished',
      isTimerRunning: false,
      completedAt: new Date().toISOString(),
    };
    setAuction(finishedAuction);
    storageService.saveToHistory(finishedAuction);
    setActivePage('results');
  };

  // 14. Reset / Exit Auction
  const resetAuction = () => {
    storageService.clearActiveAuction();
    setAuction(null);
    setSaleCelebration(null);
    setUnsoldPrompt(null);
    setOutbidAlert(null);
    setActivePage('home');
  };

  return (
    <AuctionContext.Provider
      value={{
        activePage,
        setActivePage,
        isMuted,
        setIsMuted,
        volume,
        setVolume,
        auction,
        setAuction,
        getCurrentItem,
        createNewAuction,
        loadPresetAuction,
        customTournaments,
        refreshCustomTournaments,
        launchCustomTournamentPlayNow,
        saveAndLaunchCustomTournament,
        restartTournamentFresh,
        placeBid,
        placeIncrementBid,
        undoLastBid,
        canUndo: undoStack.length > 0,
        requestUndo,
        executeConfirmedUndo,
        cancelUndo,
        undoConfirmDialog,
        settleCurrentLot,
        confirmSold,
        markUnsold,
        advanceToNextItem,
        reAuctionItem,
        reAuctionAllUnsold,
        toggleTimer,
        resetTimer,
        triggerRandomEvent,
        activeEvent,
        setActiveEvent,
        outbidAlert,
        setOutbidAlert,
        saleCelebration,
        setSaleCelebration,
        unsoldPrompt,
        setUnsoldPrompt,
        finishAuction,
        resetAuction,
        updateAuctionSettings,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
