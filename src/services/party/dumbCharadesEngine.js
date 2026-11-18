/**
 * BIDBATTLE - DUMB CHARADES 2.0: Tournament Engine & Persistence
 * Manages unique prompt consumption, Fisher-Yates shuffle queue,
 * strict pass-the-laptop turn lifecycle, team scoring, and LocalStorage persistence.
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

  // Initialize per-team scoreboard
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
    turnState: 'pass', // 'pass' (Pass screen) | 'acting' (Countdown active) | 'completed' (Game finished)
    timerDuration: Number(timerDuration) || 60,
    remainingTime: Number(timerDuration) || 60,
    teamStats,
    turnHistory: [],
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
  };

  saveDumbCharadesState(updatedState);
  return updatedState;
}

/**
 * Settles current turn (FOUND, NOT_FOUND, or TIMEOUT)
 * Scoring: FOUND = +1, NOT_FOUND = 0, TIMEOUT = 0
 * Advances turn to next selected team in rotation.
 */
export function recordDumbCharadesTurnOutcome(currentState, outcomeType, secondsUsed = 0) {
  const { currentTeamIndex, selectedTeams, teamStats, turnHistory, activePrompt, consumedPromptIds, shuffledQueue } = currentState;
  const currentTeam = selectedTeams[currentTeamIndex];

  let points = 0;
  const currentStats = teamStats[currentTeam.id] || {
    teamId: currentTeam.id,
    teamName: currentTeam.name,
    teamColor: currentTeam.color,
    teamAvatar: currentTeam.avatar,
    found: 0,
    notFound: 0,
    timeout: 0,
    score: 0,
  };

  const updatedTeamStats = { ...teamStats };

  if (outcomeType === 'found') {
    points = 1;
    updatedTeamStats[currentTeam.id] = {
      ...currentStats,
      found: currentStats.found + 1,
      score: currentStats.score + 1,
    };
  } else if (outcomeType === 'timeout') {
    points = 0;
    updatedTeamStats[currentTeam.id] = {
      ...currentStats,
      timeout: currentStats.timeout + 1,
    };
  } else {
    // not_found / skipped
    points = 0;
    updatedTeamStats[currentTeam.id] = {
      ...currentStats,
      notFound: currentStats.notFound + 1,
    };
  }

  const turnRecord = {
    turnNumber: turnHistory.length + 1,
    teamId: currentTeam.id,
    teamName: currentTeam.name,
    teamColor: currentTeam.color,
    teamAvatar: currentTeam.avatar,
    promptId: activePrompt?.id,
    promptName: activePrompt?.name || activePrompt?.title,
    result: outcomeType,
    points,
    secondsUsed,
    timestamp: Date.now(),
  };

  const updatedHistory = [...turnHistory, turnRecord];

  // Check remaining prompt count after this turn
  const consumedSet = new Set(consumedPromptIds);
  const remainingCount = shuffledQueue.filter((p) => !consumedSet.has(p.id)).length;

  if (remainingCount === 0) {
    // Pool exhausted! Finish tournament
    const completedState = {
      ...currentState,
      teamStats: updatedTeamStats,
      turnHistory: updatedHistory,
      activePrompt: null,
      turnState: 'completed',
      isCompleted: true,
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
    turnState: 'pass', // Step 1: Pass the laptop screen
    remainingTime: currentState.timerDuration,
  };

  saveDumbCharadesState(nextState);
  return nextState;
}

/**
 * Calculates current leaderboard sorted by score, found count, fewest timeouts
 */
export function calculateDumbCharadesStandings(teamStats, selectedTeams) {
  const list = selectedTeams.map((team) => {
    const stats = teamStats[team.id] || {
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      teamAvatar: team.avatar,
      found: 0,
      notFound: 0,
      timeout: 0,
      score: 0,
    };
    return {
      ...team,
      ...stats,
    };
  });

  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.found !== a.found) return b.found - a.found;
    return a.timeout - b.timeout;
  });

  return list.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
