/**
 * BIDBATTLE 7.4 - Battle Arena Tournament Import Service
 * Handles schema validation, unique ID checks, sufficiency validation, and data normalization
 * specifically for Battle Arena tournaments without modifying Auction Arena or Party Arena.
 */

import { validateTournamentJSON } from './tournamentSchema.js';

/**
 * Validates a tournament JSON input specifically for Battle Arena.
 * 
 * Rules enforced:
 * 1. Valid JSON syntax.
 * 2. Supported schema version (schemaVersion 1 or 2).
 * 3. Tournament information exists (tournament object with name).
 * 4. Entries is a non-empty array.
 * 5. Every entry has a valid unique ID.
 * 6. Every entry has a valid name.
 * 7. Base prices and ratings are valid numbers within supported ranges (basePrice > 0, rating 0-100).
 * 8. Strictly no duplicate entry IDs.
 * 9. Imported entry count is sufficient for the selected teamCount and squadSize (min: teamCount * squadSize).
 */
export function validateBattleTournamentJSON(rawInput, { teamCount = 4, squadSize = 3 } = {}) {
  const errors = [];
  const warnings = [];

  // 1. Valid JSON syntax
  let parsed = null;
  if (typeof rawInput === 'string') {
    if (!rawInput.trim()) {
      return {
        valid: false,
        isValid: false,
        syntaxError: true,
        errors: [{ field: 'JSON Syntax', message: 'Input cannot be empty. Please upload or paste a JSON file.' }],
        warnings: [],
        data: null,
      };
    }
    try {
      parsed = JSON.parse(rawInput);
    } catch (e) {
      return {
        valid: false,
        isValid: false,
        syntaxError: true,
        errors: [{ field: 'JSON Syntax', message: `Invalid JSON syntax: ${e.message}` }],
        warnings: [],
        data: null,
      };
    }
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    parsed = rawInput;
  } else {
    return {
      valid: false,
      isValid: false,
      errors: [{ field: 'Format', message: 'Input must be a valid JSON string or object.' }],
      warnings: [],
      data: null,
    };
  }

  // 2. Supported schema version
  if (parsed.schemaVersion === undefined || parsed.schemaVersion === null) {
    errors.push({ field: 'schemaVersion', message: 'Missing "schemaVersion". Supported version is 1.' });
  } else {
    const sVer = Number(parsed.schemaVersion);
    if (isNaN(sVer) || sVer < 1 || sVer > 2) {
      errors.push({ field: 'schemaVersion', message: `Unsupported schemaVersion "${parsed.schemaVersion}". Supported version is 1.` });
    }
  }

  // 3. Tournament information exists
  const tInfo = parsed.tournament;
  if (!tInfo || typeof tInfo !== 'object' || Array.isArray(tInfo)) {
    errors.push({ field: 'tournament', message: 'Missing "tournament" object containing tournament metadata.' });
  } else {
    if (!tInfo.name || typeof tInfo.name !== 'string' || !tInfo.name.trim()) {
      errors.push({ field: 'tournament.name', message: 'Tournament name ("tournament.name") is required.' });
    }
  }

  // 4. Entries is a non-empty array
  const rawEntries = parsed.entries || parsed.items;
  if (!rawEntries || !Array.isArray(rawEntries)) {
    errors.push({ field: 'entries', message: 'Missing "entries" array. A tournament must contain a list of entries/characters.' });
  } else if (rawEntries.length === 0) {
    errors.push({ field: 'entries', message: 'The "entries" array is empty. At least one player or character is required.' });
  } else {
    // 5. Every entry has a valid unique ID
    // 6. Every entry has a valid name
    // 7. Base prices and ratings are valid numbers within supported ranges
    // 8. Strictly no duplicate entry IDs
    const seenIds = new Set();
    const seenNames = new Set();

    rawEntries.forEach((entry, idx) => {
      const path = `entries[${idx}]`;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push({ field: path, message: `Entry at index ${idx} is not a valid object.` });
        return;
      }

      // 5. Valid unique ID
      if (entry.id === undefined || entry.id === null || String(entry.id).trim() === '') {
        errors.push({ field: `${path}.id`, message: `Missing entry ID at index ${idx}. Every entry must have a valid ID.` });
      } else {
        const strId = String(entry.id).trim();
        // 8. No duplicate entry IDs
        if (seenIds.has(strId)) {
          errors.push({ field: `${path}.id`, message: `Duplicate entry ID "${strId}" at index ${idx}. Every entry must have a strictly unique ID.` });
        }
        seenIds.add(strId);
      }

      // 6. Valid Name
      if (!entry.name || typeof entry.name !== 'string' || !entry.name.trim()) {
        errors.push({ field: `${path}.name`, message: `Missing lot name for entry at index ${idx}.` });
      } else {
        const lowerName = entry.name.trim().toLowerCase();
        if (seenNames.has(lowerName)) {
          warnings.push(`Duplicate lot name "${entry.name}" detected in entries.`);
        }
        seenNames.add(lowerName);
      }

      // 7. Base price validation
      if (entry.basePrice === undefined || entry.basePrice === null || String(entry.basePrice).trim() === '') {
        errors.push({ field: `${path}.basePrice`, message: `Base price is required for "${entry.name || `Entry #${idx + 1}`}."` });
      } else {
        const numPrice = Number(entry.basePrice);
        if (isNaN(numPrice) || numPrice <= 0) {
          errors.push({ field: `${path}.basePrice`, message: `Base price must be a positive number greater than 0 for "${entry.name || `Entry #${idx + 1}`}" (got "${entry.basePrice}").` });
        }
      }

      // 7. Rating validation
      const rawRating = entry.rating !== undefined ? entry.rating : entry.score;
      if (rawRating === undefined || rawRating === null || String(rawRating).trim() === '') {
        errors.push({ field: `${path}.rating`, message: `Rating is required for "${entry.name || `Entry #${idx + 1}`}."` });
      } else {
        const numRating = Number(rawRating);
        if (isNaN(numRating) || numRating < 0 || numRating > 100) {
          errors.push({ field: `${path}.rating`, message: `Rating must be a valid number between 0 and 100 for "${entry.name || `Entry #${idx + 1}`}" (got "${rawRating}").` });
        }
      }
    });

    // 9. Sufficient entries check: Battle Arena requires at least 4 entries (min 2 teams * 2 squad size)
    const requiredPoolSize = teamCount * squadSize;
    if (rawEntries.length < 4) {
      errors.push({
        field: 'entries.count',
        message: `Insufficient entries: Battle Arena requires at least 4 entries (minimum 2 teams × 2 squad size), but imported file only has ${rawEntries.length}.`,
      });
    } else if (rawEntries.length < requiredPoolSize) {
      warnings.push({
        field: 'entries.count',
        message: `Note: File has ${rawEntries.length} entries. Target requires ${requiredPoolSize} lots (${teamCount} teams × ${squadSize}). You can configure team count and squad size in the configuration step.`,
      });
    }
  }

  const isValid = errors.length === 0;

  // Normalized preview items (normalize with base price, rating, movie, actor, category, etc.)
  let normalizedItems = [];
  if (rawEntries && Array.isArray(rawEntries)) {
    normalizedItems = rawEntries.map((e, idx) => ({
      id: e.id ? String(e.id).trim() : `lot_${idx + 1}`,
      name: e.name ? String(e.name).trim() : `Item ${idx + 1}`,
      movie: e.movie || e.film || e.universe || '',
      actor: e.actor || e.star || '',
      year: e.year || '',
      category: e.category || e.role || 'Superstar Fighter',
      basePrice: Number(e.basePrice) > 0 ? Number(e.basePrice) : 2.0,
      rating: Number(e.rating !== undefined ? e.rating : e.score) || 80,
      description: e.description || '',
      imageUrl: e.imageUrl || e.image || '',
      metadata: e.metadata || {},
      status: 'pending',
    }));
  }

  const tournamentInfo = {
    id: tInfo?.id || `custom_battle_${Date.now()}`,
    name: tInfo?.name || 'Imported Battle Tournament',
    description: tInfo?.description || '',
    category: tInfo?.category || 'Custom Battle Tournament',
    currency: typeof tInfo?.currency === 'object' ? (tInfo.currency.name || 'INR') : (tInfo?.currency || 'INR'),
    currencyUnit: tInfo?.currencyUnit || (typeof tInfo?.currency === 'object' ? tInfo.currency.unit : 'Cr') || 'Cr',
    scoring: tInfo?.scoring || { metricName: 'Combat Rating', minScore: 0, maxScore: 100 },
    theme: {
      primary: '#FF8A35',
      secondary: '#9147FF',
    },
    items: normalizedItems,
    entries: normalizedItems,
  };

  return {
    valid: isValid,
    isValid,
    errors,
    warnings,
    entryCount: rawEntries?.length || 0,
    requiredCount: teamCount * squadSize,
    tournament: tournamentInfo,
    items: normalizedItems,
    rawParsed: parsed,
  };
}

/**
 * Checks if a given entry count satisfies teamCount * squadSize.
 */
export function checkPoolSufficiency(entryCount, teamCount, squadSize) {
  const required = teamCount * squadSize;
  const isSufficient = entryCount >= required;
  const deficit = Math.max(0, required - entryCount);
  return {
    isSufficient,
    required,
    entryCount,
    deficit,
  };
}
