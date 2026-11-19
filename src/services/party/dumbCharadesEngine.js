/**
 * BIDBATTLE 8.1 - DUMB CHARADES: Tournament Engine & Persistence
 * Manages unique prompt consumption, Fisher-Yates shuffle queue,
 * strict pass-the-laptop turn lifecycle, team scoring, streaks, penalties, and LocalStorage persistence.
 */

import { fisherYatesShuffle } from './dumbCharadesParser.js';
import { FIXED_PARTY_PLAYERS } from './gameRegistry.js';
import { DUMB_CHARADES_TAMIL } from './offlineDatabase.js';

export const DUMB_CHARADES_STORAGE_KEY = 'bidbattle_dumb_charades_v2';

/**
 * Creates initial tournament state from setup parameters
 */
export function createDumbCharadesTournament({
  prompts = [],
  listName = 'Tamil Cinema Charades',
  selectedTeams = FIXED_PARTY_PLAYERS.slice(0, 4),
  timerDuration = 60,
  scoringConfig = {},
}) {
  const basePrompts = prompts && prompts.length > 0 ? prompts : DUMB_CHARADES_TAMIL.map((item, idx) => ({
    id: item.id || `dc_built_in_${idx + 1}`,
    name: item.title,
    title: item.title,
    category: item.category || 'Tamil Cinema',
    wordsCount: item.wordsCount || item.title.split(/\s+/).length || 1,
    hint: item.hint || item.stars || '',
    year: item.year || '',
  }));

  // Fisher-Yates shuffle copy of all prompts
  const shuffledQueue = fisherYatesShuffle(basePrompts);

  // Normalized scoring configuration (Preserves existing defaults: 1 pt base, 0 bonuses, 0 penalties)
  const normalizedScoring = {
    basePoints: Number(scoringConfig?.basePoints) || 1,
    streakBonusEnabled: Boolean(scoringConfig?.streakBonusEnabled),
    skipPenalty: Math.abs(Number(scoringConfig?.skipPenalty) || 0),
    timeoutPenalty: Math.abs(Number(scoringConfig?.timeoutPenalty) || 0),
  };

  // Initialize per-team scoreboard with streak tracking
  const teamStats = {};
  selectedTeams.forEach((team) => {
    teamStats[team.id] = {
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      teamAvatar: team.avatar,
      found: 0,
      notFound: 0,
      timeout: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakBonusPoints: 0,
      penaltyPoints: 0,
    };
  });

  const initialState = {
    originalPrompts: basePrompts,
    listName,
    shuffledQueue,
    consumedPromptIds: [], // array of IDs strictly consumed
    selectedTeams,
    currentTeamIndex: 0,
    activePrompt: null, // Assigned strictly when turn begins
    turnState: 'pass', // 'pass' (Pass screen) | 'acting' (Countdown active) | 'result' (Result transition) | 'completed' (Game finished)
    timerDuration: Number(timerDuration) || 60,
    remainingTime: Number(timerDuration) || 60,
    scoringConfig: normalizedScoring,
    teamStats,
    turnHistory: [],
    lastTurnOutcome: null,
    isCompleted: false,
    startedAt: Date.now(),
  };

  saveDumbCharadesState(initialState);
  return initialState;
}

/**
 * Storage helpers
 */
export const getSavedDumbCharadesState = () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(DUMB_CHARADES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to parse Dumb Charades state from localStorage:', err);
    return null;
  }
};

export const saveDumbCharadesState = (state) => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    if (!state) {
      localStorage.removeItem(DUMB_CHARADES_STORAGE_KEY);
    } else {
      localStorage.setItem(DUMB_CHARADES_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to persist Dumb Charades state:', err);
  }
};

export const clearDumbCharadesState = () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    localStorage.removeItem(DUMB_CHARADES_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear Dumb Charades state:', err);
  }
};

/**
 * Assigns the next unconsumed prompt from the shuffled queue and marks it consumed IMMEDIATELY.
 * This guarantees the prompt can never return regardless of turn outcome.
 */
export function assignNextPromptAndConsume(currentState) {
  const consumedSet = new Set(currentState.consumedPromptIds || []);
  const remaining = (currentState.shuffledQueue || []).filter((p) => !consumedSet.has(p.id));

  if (remaining.length === 0) {
    return {
      ...currentState,
      activePrompt: null,
      isCompleted: true,
      turnState: 'completed',
    };
  }

  // Pick the next unconsumed prompt
  const nextPrompt = remaining[0];
  const updatedConsumed = [...currentState.consumedPromptIds, nextPrompt.id];

  const updatedState = {
    ...currentState,
    activePrompt: nextPrompt,
    consumedPromptIds: updatedConsumed,
    turnState: 'acting',
    remainingTime: currentState.timerDuration,
    lastTurnOutcome: null,
  };

  saveDumbCharadesState(updatedState);
  return updatedState;
}

/**
 * Settles current turn (FOUND, NOT_FOUND, or TIMEOUT)
 * Supports configurable base scoring, streaks, and penalties.
 * Advances turn to result transition, then to next selected team in rotation.
 */
export function recordDumbCharadesTurnOutcome(currentState, outcomeType, secondsUsed = 0) {
  const { currentTeamIndex, selectedTeams, teamStats, turnHistory, activePrompt, consumedPromptIds, shuffledQueue } = currentState;
  const currentTeam = selectedTeams[currentTeamIndex];

  // Prevent duplicate settlement if no prompt is active
  if (!activePrompt) {
    return currentState;
  }

  const scoringConfig = currentState.scoringConfig || {
    basePoints: 1,
    streakBonusEnabled: false,
    skipPenalty: 0,
    timeoutPenalty: 0,
  };

  const currentStats = teamStats[currentTeam.id] || {
    teamId: currentTeam.id,
    teamName: currentTeam.name,
    teamColor: currentTeam.color,
    teamAvatar: currentTeam.avatar,
    found: 0,
    notFound: 0,
    timeout: 0,
    score: 0,
    currentStreak: 0,
    bestStreak: 0,
    streakBonusPoints: 0,
    penaltyPoints: 0,
  };

  let pointsAwarded = 0;
  let streakBonus = 0;
  let penaltyApplied = 0;
  let updatedCurrentStreak = currentStats.currentStreak || 0;
  let updatedBestStreak = currentStats.bestStreak || 0;
  let updatedStreakBonusPoints = currentStats.streakBonusPoints || 0;
  let updatedPenaltyPoints = currentStats.penaltyPoints || 0;

  if (outcomeType === 'found') {
    updatedCurrentStreak += 1;
    if (updatedCurrentStreak > updatedBestStreak) {
      updatedBestStreak = updatedCurrentStreak;
    }

    // Check optional streak bonus: 3 in a row = +2, 5 in a row = +5, every subsequent 5 = +5
    if (scoringConfig.streakBonusEnabled) {
      if (updatedCurrentStreak === 3) {
        streakBonus = 2;
      } else if (updatedCurrentStreak === 5) {
        streakBonus = 5;
      } else if (updatedCurrentStreak > 5 && updatedCurrentStreak % 5 === 0) {
        streakBonus = 5;
      }
    }

    pointsAwarded = scoringConfig.basePoints + streakBonus;
    updatedStreakBonusPoints += streakBonus;
  } else if (outcomeType === 'timeout') {
    updatedCurrentStreak = 0;
    if (scoringConfig.timeoutPenalty > 0) {
      penaltyApplied = scoringConfig.timeoutPenalty;
      pointsAwarded = -penaltyApplied;
      updatedPenaltyPoints += penaltyApplied;
    }
  } else {
    // not_found / skipped
    updatedCurrentStreak = 0;
    if (scoringConfig.skipPenalty > 0) {
      penaltyApplied = scoringConfig.skipPenalty;
      pointsAwarded = -penaltyApplied;
      updatedPenaltyPoints += penaltyApplied;
    }
  }

  const newScore = Math.max(0, currentStats.score + pointsAwarded);

  const updatedTeamStats = {
    ...teamStats,
    [currentTeam.id]: {
      ...currentStats,
      found: currentStats.found + (outcomeType === 'found' ? 1 : 0),
      notFound: currentStats.notFound + (outcomeType === 'not_found' ? 1 : 0),
      timeout: currentStats.timeout + (outcomeType === 'timeout' ? 1 : 0),
      score: newScore,
      currentStreak: updatedCurrentStreak,
      bestStreak: updatedBestStreak,
      streakBonusPoints: updatedStreakBonusPoints,
      penaltyPoints: updatedPenaltyPoints,
    },
  };

  const turnRecord = {
    turnNumber: turnHistory.length + 1,
    teamId: currentTeam.id,
    teamName: currentTeam.name,
    teamColor: currentTeam.color,
    teamAvatar: currentTeam.avatar,
    promptId: activePrompt?.id,
    promptName: activePrompt?.name || activePrompt?.title,
    result: outcomeType,
    points: pointsAwarded,
    streakBonus,
    penaltyApplied,
    currentStreak: updatedCurrentStreak,
    secondsUsed,
    timestamp: Date.now(),
  };

  const updatedHistory = [...turnHistory, turnRecord];

  // Check remaining prompt count after this turn
  const consumedSet = new Set(consumedPromptIds);
  const remainingCount = shuffledQueue.filter((p) => !consumedSet.has(p.id)).length;

  if (remainingCount === 0) {
    // Pool exhausted! Complete tournament
    const completedState = {
      ...currentState,
      teamStats: updatedTeamStats,
      turnHistory: updatedHistory,
      activePrompt: null,
      turnState: 'completed',
      isCompleted: true,
      lastTurnOutcome: turnRecord,
    };
    saveDumbCharadesState(completedState);
    return completedState;
  }

  // Advance to next team
  const nextTeamIdx = (currentTeamIndex + 1) % selectedTeams.length;

  const nextState = {
    ...currentState,
    teamStats: updatedTeamStats,
    turnHistory: updatedHistory,
    currentTeamIndex: nextTeamIdx,
    activePrompt: null, // Clear prompt immediately so pass screen shows nothing
    turnState: 'result', // Transition state showing result before next turn
    remainingTime: currentState.timerDuration,
    lastTurnOutcome: turnRecord,
  };

  saveDumbCharadesState(nextState);
  return nextState;
}

/**
 * Advances from 'result' screen to the next turn's 'pass' screen
 */
export function proceedToNextTurn(currentState) {
  if (currentState.isCompleted) {
    return currentState;
  }
  const nextState = {
    ...currentState,
    turnState: 'pass',
    activePrompt: null,
  };
  saveDumbCharadesState(nextState);
  return nextState;
}

/**
 * Replays with remaining unused prompts in the current collection.
 * Does not reuse consumed prompts. Resets scores and turn state for a fresh round.
 */
export function replayDumbCharadesWithUnusedPrompts(currentState) {
  const consumedSet = new Set(currentState.consumedPromptIds || []);
  const remainingPrompts = (currentState.shuffledQueue || []).filter((p) => !consumedSet.has(p.id));

  if (remainingPrompts.length === 0) {
    throw new Error('All prompts in this collection have been consumed. Please start a new game.');
  }

  // Re-shuffle remaining prompts
  const newQueue = fisherYatesShuffle(remainingPrompts);

  // Reset team scores
  const newTeamStats = {};
  currentState.selectedTeams.forEach((team) => {
    newTeamStats[team.id] = {
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      teamAvatar: team.avatar,
      found: 0,
      notFound: 0,
      timeout: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakBonusPoints: 0,
      penaltyPoints: 0,
    };
  });

  const replayState = {
    ...currentState,
    shuffledQueue: newQueue,
    consumedPromptIds: [], // New game with the remaining pool
    currentTeamIndex: 0,
    activePrompt: null,
    turnState: 'pass',
    remainingTime: currentState.timerDuration,
    teamStats: newTeamStats,
    turnHistory: [],
    lastTurnOutcome: null,
    isCompleted: false,
    startedAt: Date.now(),
  };

  saveDumbCharadesState(replayState);
  return replayState;
}

/**
 * Calculates current leaderboard sorted by score, found count, fewest timeouts, and best streak
 */
export function calculateDumbCharadesStandings(teamStats = {}, selectedTeams) {
  const teamsList = selectedTeams && selectedTeams.length > 0 
    ? selectedTeams 
    : Object.keys(teamStats).map((id) => ({
        id,
        name: teamStats[id]?.teamName || id,
        color: teamStats[id]?.teamColor || '#9147FF',
        avatar: teamStats[id]?.teamAvatar || '👑',
      }));

  const list = teamsList.map((team) => {
    const stats = teamStats[team.id] || {
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      teamAvatar: team.avatar,
      found: 0,
      notFound: 0,
      timeout: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakBonusPoints: 0,
      penaltyPoints: 0,
    };
    const totalTurns = stats.found + stats.notFound + stats.timeout;
    const accuracy = totalTurns > 0 ? Math.round((stats.found / totalTurns) * 100) : 0;

    return {
      ...team,
      ...stats,
      accuracy,
      totalTurns,
    };
  });

  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.found !== a.found) return b.found - a.found;
    if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
    return a.timeout - b.timeout;
  });

  return list.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

/**
 * Generates full tournament summary with champion, runner up, best streak, and statistics
 */
export function getDumbCharadesPerformanceSummary(teamStats = {}, selectedTeamsOrHistory = [], maybeHistory = []) {
  let selectedTeams = null;
  let turnHistory = [];

  if (Array.isArray(selectedTeamsOrHistory)) {
    if (selectedTeamsOrHistory.length > 0 && selectedTeamsOrHistory[0]?.result !== undefined) {
      // Called as (teamStats, turnHistory)
      turnHistory = selectedTeamsOrHistory;
    } else {
      selectedTeams = selectedTeamsOrHistory;
      turnHistory = Array.isArray(maybeHistory) ? maybeHistory : [];
    }
  } else if (Array.isArray(maybeHistory)) {
    turnHistory = maybeHistory;
  }

  const standings = calculateDumbCharadesStandings(teamStats, selectedTeams);
  const champion = standings[0] || null;
  const runnerUp = standings[1] || null;

  const totalTurns = turnHistory.length;
  const totalFound = turnHistory.filter((t) => t.result === 'found').length;
  const totalSkipped = turnHistory.filter((t) => t.result === 'not_found').length;
  const totalTimeouts = turnHistory.filter((t) => t.result === 'timeout').length;
  const overallAccuracy = totalTurns > 0 ? Math.round((totalFound / totalTurns) * 100) : 0;

  // Best streak across all teams
  let bestStreakTeam = null;
  let highestStreak = 0;
  standings.forEach((team) => {
    if (team.bestStreak > highestStreak) {
      highestStreak = team.bestStreak;
      bestStreakTeam = team;
    }
  });

  return {
    standings,
    champion,
    runnerUp,
    totalTurns,
    totalFound,
    totalSkipped,
    totalTimeouts,
    overallAccuracy,
    highestStreak,
    bestStreakTeam,
  };
}
