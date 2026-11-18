/**
 * BIDBATTLE 7.2 - Question Bank & Freshness Service
 * Prevents repetition, manages randomized seeds, and ensures fresh gameplay for the 4 Party games:
 * 1. Dumb Charades
 * 2. Impostor
 * 3. Spyfall
 * 4. Find the Liar
 */

import {
  DUMB_CHARADES_TAMIL,
  DUMB_CHARADES_MCU,
  DUMB_CHARADES_MIXED,
  IMPOSTOR_DATA,
  SPYFALL_LOCATIONS,
  FIND_THE_LIAR_DATA,
} from './offlineDatabase';

const RECENTLY_PLAYED_KEY = 'bidbattle_party_recently_played_v2';
const MAX_RECENT_HISTORY = 100;

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRecentlyPlayedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordPlayedIds(ids) {
  if (!ids || ids.length === 0) return;
  try {
    const existing = getRecentlyPlayedIds();
    const updated = Array.from(new Set([...ids, ...existing])).slice(0, MAX_RECENT_HISTORY);
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record played question history:', e);
  }
}

/**
 * Retrieves content for a specific game, prioritizing fresh items not played recently.
 */
export function getOfflineContentForGame(gameId, requestedCount = 4, difficulty = 'mixed', category = 'mixed') {
  const recentIds = new Set(getRecentlyPlayedIds());
  let sourceList = [];

  switch (gameId) {
    case 'party_dumb_charades':
      if (category === 'tamil' || category === 'cinema_tamil' || category === 'Tamil Cinema') {
        sourceList = DUMB_CHARADES_TAMIL;
      } else if (category === 'mcu' || category === 'cinema_mcu' || category === 'Marvel Cinematic Universe') {
        sourceList = DUMB_CHARADES_MCU;
      } else {
        sourceList = DUMB_CHARADES_MIXED;
      }
      break;

    case 'party_impostor':
      sourceList = IMPOSTOR_DATA;
      break;

    case 'party_spyfall':
      sourceList = SPYFALL_LOCATIONS;
      break;

    case 'party_find_the_liar':
      sourceList = FIND_THE_LIAR_DATA;
      break;

    default:
      sourceList = DUMB_CHARADES_MIXED;
      break;
  }

  if (!sourceList || sourceList.length === 0) {
    sourceList = DUMB_CHARADES_MIXED;
  }

  // Filter out recently played items to guarantee variety
  const freshItems = sourceList.filter((item) => !recentIds.has(item.id));
  const availablePool = freshItems.length >= requestedCount ? freshItems : sourceList;

  // Shuffle and slice requested count
  const shuffled = shuffleArray(availablePool);
  const selected = shuffled.slice(0, requestedCount);

  // If pool was exhausted and had to reuse, record new batch
  recordPlayedIds(selected.map((item) => item.id));

  return selected;
}

/**
 * Quick fallback item for individual turns
 */
export function getSingleOfflineFallbackItem(gameId, category = 'mixed') {
  const list = getOfflineContentForGame(gameId, 1, 'mixed', category);
  return list[0] || DUMB_CHARADES_TAMIL[0];
}
