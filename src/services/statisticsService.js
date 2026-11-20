/**
 * PLAYZONE STATISTICS & RECORDS SERVICE
 * Aggregates authoritative historical records across completed tournaments,
 * franchises, Auction Arena, Battle Arena, and Party Arena.
 * Zero placeholder data. Zero state mutation.
 */

import { tournamentHubService } from './tournamentHubService.js';
import { franchiseService } from './franchiseService.js';
import { getSavedDumbCharadesState } from './party/dumbCharadesEngine.js';

export const statisticsService = {
  /**
   * Retrieves aggregated statistics with multi-criteria filtering
   */
  getStatistics(filters = {}) {
    const {
      season = 'all',
      tournamentId = 'all',
      franchiseId = 'all',
      arenaType = 'all',
      format = 'all',
    } = filters;

    // 1. Load authoritative tournaments
    const allTournaments = tournamentHubService.getAllTournaments();
    const allFranchises = franchiseService.getAllFranchises({ includeArchived: true });

    // Filter strictly to COMPLETED tournaments for historical validity
    let completedTournaments = allTournaments.filter((t) => t.status === 'completed');

    // Available filter options extracted from real data
    const availableSeasons = Array.from(
      new Set(allTournaments.map((t) => t.season).filter(Boolean))
    );
    const availableFormats = Array.from(
      new Set(allTournaments.map((t) => t.format || 'round_robin').filter(Boolean))
    );

    // Apply Filter: Season
    if (season !== 'all') {
      completedTournaments = completedTournaments.filter((t) => t.season === season);
    }

    // Apply Filter: Format
    if (format !== 'all') {
      completedTournaments = completedTournaments.filter(
        (t) => (t.format || 'round_robin') === format
      );
    }

    // Apply Filter: Tournament ID
    if (tournamentId !== 'all') {
      completedTournaments = completedTournaments.filter((t) => t.id === tournamentId);
    }

    // Apply Filter: Arena Type
    if (arenaType !== 'all') {
      completedTournaments = completedTournaments.filter(
        (t) => Array.isArray(t.gameModes) && t.gameModes.includes(arenaType)
      );
    }

    // Apply Filter: Franchise ID (tournament must include franchise)
    if (franchiseId !== 'all') {
      completedTournaments = completedTournaments.filter((t) => {
        const ids = t.franchiseIds || [];
        const snapshotIds = (t.franchisesSnapshot || []).map((f) => f.id);
        return ids.includes(franchiseId) || snapshotIds.includes(franchiseId);
      });
    }

    // 2. Aggregate Franchise Rankings
    const franchiseMap = new Map();

    // Seed franchiseMap with all registered franchises
    allFranchises.forEach((f) => {
      franchiseMap.set(f.id, {
        id: f.id,
        name: f.name,
        shortName: f.shortName,
        logo: f.logo || f.avatar || '👑',
        color: f.color,
        isArchived: Boolean(f.isArchived),
        appearances: 0,
        titles: 0,
        runnerUps: 0,
        battleMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        battlePoints: 0,
        lotsAcquired: 0,
        totalSpent: 0,
        minPurseRemaining: null,
      });
    });

    // Populate stats from each completed tournament
    let totalAuctionLotsCount = 0;
    let totalNormalSoldCount = 0;
    let totalSpecialSettlementCount = 0;
    let totalUnsoldCount = 0;

    const allCompletedAuctionLots = [];
    const allCompletedBattleMatches = [];

    completedTournaments.forEach((tourn) => {
      const results = tourn.results || {};
      const champions = results.championTeamIds || (results.championTeamId ? [results.championTeamId] : []);
      const runnerUpId = results.runnerUpTeamId;

      // Extract participating franchises using tournament snapshot
      const participants = tourn.franchisesSnapshot && tourn.franchisesSnapshot.length > 0
        ? tourn.franchisesSnapshot
        : (tourn.franchiseIds || []).map((id) => allFranchises.find((f) => f.id === id) || { id, name: id, color: '#D4B879' });

      participants.forEach((p) => {
        if (!franchiseMap.has(p.id)) {
          franchiseMap.set(p.id, {
            id: p.id,
            name: p.name,
            shortName: p.shortName || p.name.slice(0, 3).toUpperCase(),
            logo: p.logo || '👑',
            color: p.color,
            isArchived: false,
            appearances: 0,
            titles: 0,
            runnerUps: 0,
            battleMatches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            battlePoints: 0,
            lotsAcquired: 0,
            totalSpent: 0,
            minPurseRemaining: null,
          });
        }

        const entry = franchiseMap.get(p.id);
        entry.appearances += 1;

        if (champions.includes(p.id)) {
          entry.titles += 1;
        } else if (p.id === runnerUpId) {
          entry.runnerUps += 1;
        }
      });

      // Aggregate Auction Arena data
      const auctionState = tourn.arenaState?.auction;
      if (auctionState?.items && Array.isArray(auctionState.items)) {
        auctionState.items.forEach((item) => {
          totalAuctionLotsCount += 1;
          const status = item.status;
          const settlement = item.settlementType || (status === 'sold' ? 'normal' : 'unsold');

          if (status === 'sold') {
            if (settlement === 'mandatory_last_bidder' || settlement === 'special_base_price') {
              totalSpecialSettlementCount += 1;
            } else {
              totalNormalSoldCount += 1;
            }

            const buyerId = item.soldTo || item.buyerId;
            const price = Number(item.soldPrice) || 0;

            if (buyerId && franchiseMap.has(buyerId)) {
              const fEntry = franchiseMap.get(buyerId);
              fEntry.lotsAcquired += 1;
              fEntry.totalSpent += price;
            }

            allCompletedAuctionLots.push({
              ...item,
              tournamentId: tourn.id,
              tournamentName: tourn.name,
              category: tourn.category,
              season: tourn.season,
              settlementType: settlement,
            });
          } else if (status === 'unsold') {
            totalUnsoldCount += 1;
          }
        });
      }

      // Check auction teams remaining purses
      if (auctionState?.teams && Array.isArray(auctionState.teams)) {
        auctionState.teams.forEach((t) => {
          if (franchiseMap.has(t.id)) {
            const fEntry = franchiseMap.get(t.id);
            const purse = Number(t.purse);
            if (fEntry.minPurseRemaining === null || purse < fEntry.minPurseRemaining) {
              fEntry.minPurseRemaining = purse;
            }
          }
        });
      }

      // Aggregate Battle Arena data
      const battleState = tourn.arenaState?.battle;
      if (battleState) {
        // Collect matches
        const matches = battleState.completedMatches || [];
        matches.forEach((m) => {
          allCompletedBattleMatches.push({
            ...m,
            tournamentId: tourn.id,
            tournamentName: tourn.name,
          });

          const teamA = franchiseMap.get(m.teamAId);
          const teamB = franchiseMap.get(m.teamBId);

          if (teamA) teamA.battleMatches += 1;
          if (teamB) teamB.battleMatches += 1;

          if (m.isDraw) {
            if (teamA) { teamA.draws += 1; teamA.battlePoints += 1; }
            if (teamB) { teamB.draws += 1; teamB.battlePoints += 1; }
          } else if (m.winnerId === m.teamAId) {
            if (teamA) { teamA.wins += 1; teamA.battlePoints += 3; }
            if (teamB) { teamB.losses += 1; }
          } else if (m.winnerId === m.teamBId) {
            if (teamB) { teamB.wins += 1; teamB.battlePoints += 3; }
            if (teamA) { teamA.losses += 1; }
          }
        });
      }
    });

    // Calculate Win Percentages for Franchises
    const franchiseRankings = Array.from(franchiseMap.values())
      .filter((f) => (franchiseId === 'all' ? f.appearances > 0 : f.id === franchiseId))
      .map((f) => {
        const decidedMatches = f.wins + f.losses;
        const winPercentage = decidedMatches > 0 ? Math.round((f.wins / decidedMatches) * 100) : 0;
        return {
          ...f,
          winPercentage,
        };
      });

    // Default sort: Most tournament titles desc, then battle points desc, then appearances desc
    franchiseRankings.sort((a, b) => {
      if (b.titles !== a.titles) return b.titles - a.titles;
      if (b.battlePoints !== a.battlePoints) return b.battlePoints - a.battlePoints;
      return b.appearances - a.appearances;
    });

    franchiseRankings.forEach((f, idx) => {
      f.rank = idx + 1;
    });

    // 3. Auction Records Derivation
    let mostExpensivePlayer = null;
    let highestBasePricePurchase = null;
    let biggestPriceDelta = null;
    let biggestBargain = null;

    if (allCompletedAuctionLots.length > 0) {
      // Most expensive purchase
      mostExpensivePlayer = [...allCompletedAuctionLots].sort(
        (a, b) => (Number(b.soldPrice) || 0) - (Number(a.soldPrice) || 0)
      )[0];

      // Highest base price purchase
      highestBasePricePurchase = [...allCompletedAuctionLots].sort(
        (a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0)
      )[0];

      // Biggest delta between base price and sold price
      biggestPriceDelta = [...allCompletedAuctionLots].sort((a, b) => {
        const deltaA = (Number(a.soldPrice) || 0) - (Number(a.basePrice) || 0);
        const deltaB = (Number(b.soldPrice) || 0) - (Number(b.basePrice) || 0);
        return deltaB - deltaA;
      })[0];

      // Biggest bargain: Sold exactly at base price or lowest ratio (excluding 0)
      const validBuys = allCompletedAuctionLots.filter((a) => (Number(a.soldPrice) || 0) > 0);
      biggestBargain = [...validBuys].sort((a, b) => {
        const ratioA = (Number(a.soldPrice) || 1) / (Number(a.basePrice) || 1);
        const ratioB = (Number(b.soldPrice) || 1) / (Number(b.basePrice) || 1);
        return ratioA - ratioB;
      })[0];
    }

    // Top purchases by franchise
    const mostPurchasesFranchise = [...franchiseRankings].sort(
      (a, b) => b.lotsAcquired - a.lotsAcquired
    )[0];

    const highestSquadSpendingFranchise = [...franchiseRankings].sort(
      (a, b) => b.totalSpent - a.totalSpent
    )[0];

    // Lowest remaining purse
    const lowestPurseFranchise = [...franchiseRankings]
      .filter((f) => f.minPurseRemaining !== null)
      .sort((a, b) => a.minPurseRemaining - b.minPurseRemaining)[0];

    // 4. Battle Records Derivation
    const mostBattleVictories = [...franchiseRankings].sort((a, b) => b.wins - a.wins)[0];
    const highestWinRateFranchise = [...franchiseRankings]
      .filter((f) => f.battleMatches >= 2)
      .sort((a, b) => b.winPercentage - a.winPercentage)[0];
    const mostBattlePoints = [...franchiseRankings].sort(
      (a, b) => b.battlePoints - a.battlePoints
    )[0];
    const mostMatchesPlayed = [...franchiseRankings].sort(
      (a, b) => b.battleMatches - a.battleMatches
    )[0];
    const mostDraws = [...franchiseRankings].sort((a, b) => b.draws - a.draws)[0];

    // Highest scoring match
    let highestScoringMatch = null;
    if (allCompletedBattleMatches.length > 0) {
      highestScoringMatch = [...allCompletedBattleMatches].sort((a, b) => {
        const totalA = (Number(a.scoreA) || 0) + (Number(a.scoreB) || 0);
        const totalB = (Number(b.scoreA) || 0) + (Number(b.scoreB) || 0);
        return totalB - totalA;
      })[0];
    }

    // 5. Player Records Derivation
    const playerMap = new Map();
    allCompletedAuctionLots.forEach((lot) => {
      const name = lot.name;
      if (!name) return;

      if (!playerMap.has(name)) {
        playerMap.set(name, {
          name,
          role: lot.role || lot.category || 'Contender',
          appearances: 0,
          timesAcquired: 0,
          highestPrice: 0,
          lowestPrice: Infinity,
          franchises: new Set(),
        });
      }

      const pEntry = playerMap.get(name);
      pEntry.appearances += 1;
      pEntry.timesAcquired += 1;
      const price = Number(lot.soldPrice) || 0;
      if (price > pEntry.highestPrice) pEntry.highestPrice = price;
      if (price > 0 && price < pEntry.lowestPrice) pEntry.lowestPrice = price;
      if (lot.soldTo) pEntry.franchises.add(lot.soldTo);
    });

    const playerRecords = Array.from(playerMap.values()).map((p) => ({
      ...p,
      lowestPrice: p.lowestPrice === Infinity ? 0 : p.lowestPrice,
      franchisesCount: p.franchises.size,
    }));
    playerRecords.sort((a, b) => b.timesAcquired - a.timesAcquired || b.highestPrice - a.highestPrice);

    // 6. Party Records Derivation
    const dumbCharadesState = getSavedDumbCharadesState();
    let dcSessionsCount = dumbCharadesState ? 1 : 0;
    let dcTurns = dumbCharadesState?.turnHistory || [];
    let dcTotalFound = dcTurns.filter((t) => t.result === 'found').length;
    let dcEarlyGuesses = dcTurns.filter((t) => t.isEarlyGuess).length;
    let dcEarlyBonusPoints = dcEarlyGuesses; // +1 pt per early guess

    // Highest party team score
    let highestPartyScore = 0;
    let bestPartyTeamName = 'N/A';
    if (dumbCharadesState?.teamStats) {
      Object.values(dumbCharadesState.teamStats).forEach((ts) => {
        if (ts.score > highestPartyScore) {
          highestPartyScore = ts.score;
          bestPartyTeamName = ts.teamName;
        }
      });
    }

    // 7. Overview High-Level Summary
    const mostSuccessful = franchiseRankings[0] || null;

    return {
      overview: {
        totalCompletedTournaments: completedTournaments.length,
        totalFranchiseAppearances: franchiseRankings.reduce((acc, f) => acc + f.appearances, 0),
        totalAuctionTransactions: totalAuctionLotsCount,
        totalBattleMatches: allCompletedBattleMatches.length,
        totalPartySessions: dcSessionsCount,
        mostSuccessfulFranchise: mostSuccessful ? mostSuccessful.name : 'N/A',
        mostTournamentTitles: mostSuccessful ? mostSuccessful.titles : 0,
        mostExpensivePurchase: mostExpensivePlayer ? Number(mostExpensivePlayer.soldPrice) : 0,
        highestWinPercentage: highestWinRateFranchise ? highestWinRateFranchise.winPercentage : 0,
      },
      availableFilters: {
        seasons: availableSeasons,
        formats: availableFormats,
        tournaments: completedTournaments.map((t) => ({ id: t.id, name: t.name, season: t.season })),
        franchises: allFranchises.map((f) => ({ id: f.id, name: f.name })),
      },
      activeFilters: filters,
      franchiseRankings,
      auctionRecords: {
        mostExpensivePlayer,
        highestBasePricePurchase,
        biggestPriceDelta,
        biggestBargain,
        mostPurchasesFranchise,
        highestSquadSpendingFranchise,
        lowestPurseFranchise,
        totalNormalSold: totalNormalSoldCount,
        totalSpecialSettlement: totalSpecialSettlementCount,
        totalUnsold: totalUnsoldCount,
        topLots: allCompletedAuctionLots.slice(0, 8),
      },
      battleRecords: {
        mostBattleVictories,
        highestWinRateFranchise,
        mostBattlePoints,
        mostMatchesPlayed,
        mostDraws,
        highestScoringMatch,
        completedMatches: allCompletedBattleMatches.slice(0, 10),
      },
      playerRecords: playerRecords.slice(0, 10),
      tournamentHistory: completedTournaments.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        season: t.season,
        format: t.format || 'round_robin',
        completedAt: t.results?.completedAt || new Date(t.updatedAt).toISOString(),
        championName: t.results?.championTeamName || 'Joint Champions',
        championColor: t.results?.championColor || '#D4B879',
        championLogo: t.results?.championLogo || '👑',
        runnerUpName: t.results?.runnerUpTeamName || null,
        thirdPlaceName: t.results?.thirdPlaceTeamName || (t.bracketData?.thirdPlaceId ? allFranchises.find(f => f.id === t.bracketData.thirdPlaceId)?.name : null),
        franchisesSnapshot: t.franchisesSnapshot || [],
        gameModes: t.gameModes || [],
        standings: t.results?.standings || [],
      })),
      partyRecords: {
        totalDumbCharadesSessions: dcSessionsCount,
        totalWhoAmISessions: 0,
        highestTeamScore: highestPartyScore,
        bestTeamName: bestPartyTeamName,
        totalCorrectGuesses: dcTotalFound,
        totalEarlyGuesses: dcEarlyGuesses,
        totalEarlyBonusPoints: dcEarlyBonusPoints,
      },
    };
  },

  /**
   * Head-to-Head rivalry comparison between two franchises
   */
  getHeadToHead(franchiseAId, franchiseBId) {
    if (!franchiseAId || !franchiseBId || franchiseAId === franchiseBId) {
      return null;
    }

    const allTournaments = tournamentHubService.getAllTournaments();
    const allFranchises = franchiseService.getAllFranchises({ includeArchived: true });

    const franchiseA = allFranchises.find((f) => f.id === franchiseAId) || { id: franchiseAId, name: franchiseAId };
    const franchiseB = allFranchises.find((f) => f.id === franchiseBId) || { id: franchiseBId, name: franchiseBId };

    const encounters = [];
    let winsA = 0;
    let winsB = 0;
    let draws = 0;
    let tournamentsTogether = 0;

    allTournaments.forEach((tourn) => {
      const pIds = tourn.franchiseIds || (tourn.franchisesSnapshot || []).map((f) => f.id);
      if (pIds.includes(franchiseAId) && pIds.includes(franchiseBId)) {
        tournamentsTogether += 1;
      }

      // Check battle matches
      const matches = tourn.arenaState?.battle?.completedMatches || [];
      matches.forEach((m) => {
        const isMatch =
          (m.teamAId === franchiseAId && m.teamBId === franchiseBId) ||
          (m.teamAId === franchiseBId && m.teamBId === franchiseAId);

        if (isMatch) {
          encounters.push({
            tournamentId: tourn.id,
            tournamentName: tourn.name,
            season: tourn.season,
            date: tourn.results?.completedAt || new Date(tourn.updatedAt).toISOString(),
            scoreA: m.teamAId === franchiseAId ? m.scoreA : m.scoreB,
            scoreB: m.teamAId === franchiseAId ? m.scoreB : m.scoreA,
            winnerId: m.winnerId,
            isDraw: m.isDraw,
          });

          if (m.isDraw) {
            draws += 1;
          } else if (m.winnerId === franchiseAId) {
            winsA += 1;
          } else if (m.winnerId === franchiseBId) {
            winsB += 1;
          }
        }
      });
    });

    const totalMatches = winsA + winsB + draws;
    const decided = winsA + winsB;
    const winRateA = decided > 0 ? Math.round((winsA / decided) * 100) : 0;
    const winRateB = decided > 0 ? Math.round((winsB / decided) * 100) : 0;

    return {
      franchiseA,
      franchiseB,
      totalEncounters: totalMatches,
      tournamentsTogether,
      winsA,
      winsB,
      draws,
      winRateA,
      winRateB,
      encounters,
    };
  },
};
