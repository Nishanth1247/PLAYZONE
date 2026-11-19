/**
 * BIDBATTLE 8.0 - Who Am I? Tournament & Gameplay Engine
 * Local multiplayer turn-by-turn guessing engine.
 * Single laptop, shared screen. Guesser stands facing away, audience answers.
 * Manages tournament state, turn progression, speed bonus scoring, and persistence.
 */

import { fisherYatesShuffle } from './whoAmIParser.js';

export const WHO_AM_I_STORAGE_KEY = 'bidbattle_who_am_i_v1';
export const WHO_AM_I_CUSTOM_COLLECTIONS_KEY = 'bidbattle_who_am_i_custom_collections_v1';

/**
 * Retrieve saved active session state from LocalStorage
 */
export function getSavedWhoAmIState() {
  try {
    const raw = localStorage.getItem(WHO_AM_I_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    console.error('Failed to parse Who Am I state:', err);
    return null;
  }
}

/**
 * Persist active session state to LocalStorage
 */
export function saveWhoAmIState(state) {
  try {
    if (!state) {
      localStorage.removeItem(WHO_AM_I_STORAGE_KEY);
    } else {
      localStorage.setItem(WHO_AM_I_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to persist Who Am I state:', err);
  }
}

/**
 * Clear active session state
 */
export function clearWhoAmIState() {
  try {
    localStorage.removeItem(WHO_AM_I_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear Who Am I state:', err);
  }
}

/**
 * Retrieve saved custom collections from LocalStorage
 */
export function getSavedWhoAmICustomCollections() {
  try {
    const raw = localStorage.getItem(WHO_AM_I_CUSTOM_COLLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read custom Who Am I collections:', err);
    return [];
  }
}

/**
 * Save a new or updated custom collection to LocalStorage
 */
export function saveWhoAmICustomCollection(collection) {
  try {
    const collections = getSavedWhoAmICustomCollections();
    const existingIndex = collections.findIndex((c) => c.id === collection.id);
    if (existingIndex >= 0) {
      collections[existingIndex] = collection;
    } else {
      collections.unshift(collection);
    }
    localStorage.setItem(WHO_AM_I_CUSTOM_COLLECTIONS_KEY, JSON.stringify(collections));
    return collections;
  } catch (err) {
    console.error('Failed to save custom collection:', err);
    return [];
  }
}

/**
 * Delete a custom collection from LocalStorage
 */
export function deleteWhoAmICustomCollection(collectionId) {
  try {
    const collections = getSavedWhoAmICustomCollections().filter((c) => c.id !== collectionId);
    localStorage.setItem(WHO_AM_I_CUSTOM_COLLECTIONS_KEY, JSON.stringify(collections));
    return collections;
  } catch (err) {
    console.error('Failed to delete custom collection:', err);
    return [];
  }
}

/**
 * Creates and initializes a new Who Am I? Tournament session
 */
export function createWhoAmISession(config) {
  const {
    collection,
    selectedTeams = [],
    roundsCount = 3,
    timerDuration = 60,
    questionLimit = 0, // 0 means unlimited
  } = config;

  if (!collection?.characters || collection.characters.length === 0) {
    throw new Error('Cannot create Who Am I session without characters.');
  }

  if (!selectedTeams || selectedTeams.length < 2) {
    throw new Error('At least 2 participating teams are required.');
  }

  // Shuffle character queue
  const shuffledQueue = fisherYatesShuffle(collection.characters);

  // Generate turns array: round-robin across selected teams
  const turns = [];
  let charIndex = 0;

  for (let r = 1; r <= roundsCount; r++) {
    for (let t = 0; t < selectedTeams.length; t++) {
      if (charIndex >= shuffledQueue.length) {
        // Recycle characters if pool is exhausted
        const recycled = fisherYatesShuffle(collection.characters);
        shuffledQueue.push(...recycled);
      }

      turns.push({
        turnIndex: turns.length,
        roundNumber: r,
        player: selectedTeams[t],
        character: shuffledQueue[charIndex],
        status: 'pending', // 'pending' | 'active' | 'completed'
      });
      charIndex++;
    }
  }

  // Initialize scores map
  const scores = {};
  selectedTeams.forEach((team) => {
    scores[team.id] = {
      playerId: team.id,
      name: team.name,
      color: team.color,
      avatar: team.avatar,
      totalScore: 0,
      correctGuesses: 0,
      speedBonuses: 0,
      skips: 0,
      timeouts: 0,
      fastestGuessTime: null,
      totalQuestionsAsked: 0,
    };
  });

  const sessionState = {
    version: '8.0',
    id: `whoami_${Date.now()}`,
    createdAt: new Date().toISOString(),
    collectionName: collection.name,
    collectionCategory: collection.category || 'General',
    totalCharactersInPool: collection.characters.length,
    selectedTeams,
    roundsCount,
    timerDuration,
    questionLimit,
    turns,
    currentTurnIndex: 0,
    scores,
    turnsLog: [],
    isCompleted: false,
  };

  saveWhoAmIState(sessionState);
  return sessionState;
}

/**
 * Settle the current turn and advance to the next turn or tournament completion
 */
export function settleWhoAmITurn(currentState, result) {
  if (!currentState || currentState.isCompleted) return currentState;

  const {
    outcome, // 'correct' | 'skip' | 'timeout'
    timeRemaining = 0,
    questionsAsked = 0,
  } = result;

  const currentTurn = currentState.turns[currentState.currentTurnIndex];
  if (!currentTurn) return currentState;

  // Prevent duplicate settlement if turn is already completed
  if (currentTurn.status === 'completed') {
    return currentState;
  }

  const player = currentTurn.player;
  const timeTaken = Math.max(0, currentState.timerDuration - timeRemaining);
  const isSpeedBonus = outcome === 'correct' && timeRemaining > (currentState.timerDuration / 2);

  let pointsAwarded = 0;
  if (outcome === 'correct') {
    pointsAwarded = 10 + (isSpeedBonus ? 5 : 0);
  }

  // Clone scores
  const updatedScores = { ...currentState.scores };
  const pScore = { ...updatedScores[player.id] };

  if (outcome === 'correct') {
    pScore.totalScore += pointsAwarded;
    pScore.correctGuesses += 1;
    if (isSpeedBonus) pScore.speedBonuses += 1;
    if (pScore.fastestGuessTime === null || timeTaken < pScore.fastestGuessTime) {
      pScore.fastestGuessTime = timeTaken;
    }
  } else if (outcome === 'skip') {
    pScore.skips += 1;
  } else if (outcome === 'timeout') {
    pScore.timeouts += 1;
  }
  pScore.totalQuestionsAsked += questionsAsked;
  updatedScores[player.id] = pScore;

  // Log turn outcome
  const logEntry = {
    turnNumber: currentState.currentTurnIndex + 1,
    roundNumber: currentTurn.roundNumber,
    playerId: player.id,
    playerName: player.name,
    playerColor: player.color,
    characterName: currentTurn.character.name,
    characterCategory: currentTurn.character.category,
    characterDifficulty: currentTurn.character.difficulty,
    outcome,
    pointsAwarded,
    speedBonus: isSpeedBonus,
    timeTaken,
    timeRemaining,
    questionsAsked,
    timestamp: new Date().toISOString(),
  };

  const updatedTurnsLog = [logEntry, ...currentState.turnsLog];

  // Mark turn completed
  const updatedTurns = currentState.turns.map((t, idx) =>
    idx === currentState.currentTurnIndex ? { ...t, status: 'completed', result: logEntry } : t
  );

  const nextTurnIndex = currentState.currentTurnIndex + 1;
  const isCompleted = nextTurnIndex >= updatedTurns.length;

  const nextState = {
    ...currentState,
    turns: updatedTurns,
    currentTurnIndex: nextTurnIndex,
    scores: updatedScores,
    turnsLog: updatedTurnsLog,
    isCompleted,
    lastSettledOutcome: logEntry,
  };

  saveWhoAmIState(nextState);
  return nextState;
}

/**
 * Calculates final rankings and podium statistics
 */
export function calculateWhoAmIStandings(scores) {
  if (!scores) return [];

  const scoreArray = Object.values(scores);
  return scoreArray.sort((a, b) => {
    // 1. Total score descending
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // 2. Correct guesses descending
    if (b.correctGuesses !== a.correctGuesses) return b.correctGuesses - a.correctGuesses;
    // 3. Fastest guess time ascending (null is slowest)
    if (a.fastestGuessTime !== null && b.fastestGuessTime !== null) {
      return a.fastestGuessTime - b.fastestGuessTime;
    }
    if (a.fastestGuessTime !== null) return -1;
    if (b.fastestGuessTime !== null) return 1;
    // 4. Fewest questions asked ascending
    return a.totalQuestionsAsked - b.totalQuestionsAsked;
  });
}
