/**
 * BIDBATTLE 7.3 - Battle Arena Engine
 * Handles Matchmaking schedules, Battle combat evaluation, and Leaderboard standings
 */

import { FIXED_TEAMS } from './presets';

export const BATTLE_STORAGE_KEY = 'bidbattle_battle_arena_v1';

/**
 * Generates an equal, fair round-robin battle schedule for 2, 3, or 4 teams.
 * Ensures:
 * - Every team plays the EXACT same number of matches.
 * - No team is scheduled for more matches than its squad size allows (1 player per match).
 * - No player is reused.
 */
export const generateBattleSchedule = (teams, squadSize) => {
  const teamCount = teams.length;
  const schedule = [];
  let matchId = 1;

  if (teamCount === 2) {
    // 2 Teams: Team 0 vs Team 1 for squadSize matches
    const totalMatches = squadSize;
    for (let i = 0; i < totalMatches; i++) {
      schedule.push({
        id: `match_${matchId++}`,
        matchNumber: i + 1,
        teamAId: teams[0].id,
        teamBId: teams[1].id,
        teamAName: teams[0].name,
        teamBName: teams[1].name,
        teamAColor: teams[0].color,
        teamBColor: teams[1].color,
        teamALogo: teams[0].logo,
        teamBLogo: teams[1].logo,
        teamAPlayer: null,
        teamBPlayer: null,
        winnerId: null,
        isDraw: false,
        scoreDiff: 0,
        teamAScore: 0,
        teamBScore: 0,
        status: 'pending', // 'pending' | 'selecting' | 'evaluated' | 'completed'
      });
    }
  } else if (teamCount === 3) {
    // 3 Teams (A, B, C):
    // 1 cycle = (A vs B, B vs C, C vs A) -> Each team plays 2 matches.
    // Number of cycles = floor(squadSize / 2)
    const cycles = Math.max(1, Math.floor(squadSize / 2));
    const roundPairs = [
      [0, 1], // A vs B
      [1, 2], // B vs C
      [2, 0], // C vs A
    ];

    let matchNum = 1;
    for (let c = 0; c < cycles; c++) {
      for (const [idxA, idxB] of roundPairs) {
        schedule.push({
          id: `match_${matchId++}`,
          matchNumber: matchNum++,
          cycle: c + 1,
          teamAId: teams[idxA].id,
          teamBId: teams[idxB].id,
          teamAName: teams[idxA].name,
          teamBName: teams[idxB].name,
          teamAColor: teams[idxA].color,
          teamBColor: teams[idxB].color,
          teamALogo: teams[idxA].logo,
          teamBLogo: teams[idxB].logo,
          teamAPlayer: null,
          teamBPlayer: null,
          winnerId: null,
          isDraw: false,
          scoreDiff: 0,
          teamAScore: 0,
          teamBScore: 0,
          status: 'pending',
        });
      }
    }
  } else if (teamCount === 4) {
    // 4 Teams (A, B, C, D):
    // 1 full round-robin cycle = 6 matches:
    // (A vs B, C vs D, A vs C, B vs D, A vs D, B vs C)
    // Each team plays exactly 3 matches per cycle.
    const cycles = squadSize >= 6 ? Math.floor(squadSize / 3) : 1;
    const roundPairs = [
      [0, 1], // A vs B
      [2, 3], // C vs D
      [0, 2], // A vs C
      [1, 3], // B vs D
      [0, 3], // A vs D
      [1, 2], // B vs C
    ];

    let matchNum = 1;
    for (let c = 0; c < cycles; c++) {
      for (const [idxA, idxB] of roundPairs) {
        schedule.push({
          id: `match_${matchId++}`,
          matchNumber: matchNum++,
          cycle: c + 1,
          teamAId: teams[idxA].id,
          teamBId: teams[idxB].id,
          teamAName: teams[idxA].name,
          teamBName: teams[idxB].name,
          teamAColor: teams[idxA].color,
          teamBColor: teams[idxB].color,
          teamALogo: teams[idxA].logo,
          teamBLogo: teams[idxB].logo,
          teamAPlayer: null,
          teamBPlayer: null,
          winnerId: null,
          isDraw: false,
          scoreDiff: 0,
          teamAScore: 0,
          teamBScore: 0,
          status: 'pending',
        });
      }
    }
  }

  return schedule;
};

/**
 * Validates that the schedule respects squad limits and equal participation.
 */
export const validateSchedule = (schedule, teams, squadSize) => {
  const matchesPerTeam = {};
  teams.forEach((t) => {
    matchesPerTeam[t.id] = 0;
  });

  schedule.forEach((m) => {
    matchesPerTeam[m.teamAId] = (matchesPerTeam[m.teamAId] || 0) + 1;
    matchesPerTeam[m.teamBId] = (matchesPerTeam[m.teamBId] || 0) + 1;
  });

  const matchCounts = Object.values(matchesPerTeam);
  const allEqual = matchCounts.every((count) => count === matchCounts[0]);
  const withinSquadCap = matchCounts.every((count) => count <= squadSize);

  return {
    valid: allEqual && withinSquadCap && matchCounts[0] > 0,
    matchesPerTeam: matchCounts[0] || 0,
    totalMatches: schedule.length,
    countsByTeam: matchesPerTeam,
  };
};

/**
 * Evaluates a head-to-head battle between two selected players.
 * Uses underlying ratings and transparent match dynamics.
 */
export const evaluateBattleMatch = (playerA, playerB) => {
  const baseRatingA = Number(playerA?.rating || playerA?.power || 80);
  const baseRatingB = Number(playerB?.rating || playerB?.power || 80);

  // Controlled tactical variance (-3 to +3) to simulate live match energy
  // Deterministic seed based on character IDs to avoid fluctuating results on re-render
  const seedString = `${playerA?.id}_vs_${playerB?.id}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const varianceA = (Math.abs(hash) % 7) - 3; // -3 to +3
  const varianceB = (Math.abs((hash >> 3)) % 7) - 3;

  const scoreA = Math.max(10, Math.min(100, baseRatingA + varianceA));
  const scoreB = Math.max(10, Math.min(100, baseRatingB + varianceB));

  const diff = Math.abs(scoreA - scoreB);

  let winner = null; // 'A' | 'B' | 'draw'
  if (scoreA > scoreB) {
    winner = 'A';
  } else if (scoreB > scoreA) {
    winner = 'B';
  } else {
    winner = 'draw';
  }

  return {
    scoreA,
    scoreB,
    diff,
    winner,
    baseRatingA,
    baseRatingB,
  };
};

/**
 * Calculates current Points Table / Leaderboard with tie-breakers:
 * 1. Points (Win = 3, Draw = 1, Loss = 0)
 * 2. Total Wins
 * 3. Victory Margin Diff
 * 4. Head-to-Head
 */
export const calculateLeaderboard = (teams, completedMatches) => {
  const stats = {};
  teams.forEach((t) => {
    stats[t.id] = {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      marginTotal: 0,
      headToHead: {}, // { [opponentId]: pointsEarnedAgainst }
    };
  });

  completedMatches.forEach((m) => {
    if (!m.teamAPlayer || !m.teamBPlayer) return;
    const aId = m.teamAId;
    const bId = m.teamBId;

    if (!stats[aId] || !stats[bId]) return;

    stats[aId].played += 1;
    stats[bId].played += 1;

    if (m.winnerId === aId) {
      stats[aId].won += 1;
      stats[aId].points += 3;
      stats[aId].marginTotal += m.scoreDiff;
      stats[aId].headToHead[bId] = (stats[aId].headToHead[bId] || 0) + 3;

      stats[bId].lost += 1;
      stats[bId].marginTotal -= m.scoreDiff;
    } else if (m.winnerId === bId) {
      stats[bId].won += 1;
      stats[bId].points += 3;
      stats[bId].marginTotal += m.scoreDiff;
      stats[bId].headToHead[aId] = (stats[bId].headToHead[aId] || 0) + 3;

      stats[aId].lost += 1;
      stats[aId].marginTotal -= m.scoreDiff;
    } else if (m.isDraw) {
      stats[aId].drawn += 1;
      stats[aId].points += 1;
      stats[aId].headToHead[bId] = (stats[aId].headToHead[bId] || 0) + 1;

      stats[bId].drawn += 1;
      stats[bId].points += 1;
      stats[bId].headToHead[aId] = (stats[bId].headToHead[aId] || 0) + 1;
    }
  });

  const sorted = Object.values(stats).sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;
    // 2. Wins
    if (b.won !== a.won) return b.won - a.won;
    // 3. Victory Margin
    if (b.marginTotal !== a.marginTotal) return b.marginTotal - a.marginTotal;
    // 4. Head-to-Head
    const h2hA = a.headToHead[b.team.id] || 0;
    const h2hB = b.headToHead[a.team.id] || 0;
    if (h2hA !== h2hB) return h2hB - h2hA;

    return 0;
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

/**
 * Storage Helpers
 */
export const getSavedBattleState = () => {
  try {
    const raw = localStorage.getItem(BATTLE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load battle tournament from storage:', err);
    return null;
  }
};

export const saveBattleState = (state) => {
  try {
    if (!state) {
      localStorage.removeItem(BATTLE_STORAGE_KEY);
    } else {
      localStorage.setItem(BATTLE_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to persist battle tournament state:', err);
  }
};
