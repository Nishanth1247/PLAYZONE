/**
 * BIDBATTLE 7.8 — Universal Custom Tournament Configuration Service
 * 
 * Implements strict configuration priority:
 * 1. Valid user selections made in the current import configuration step.
 * 2. Valid settings supplied by the imported JSON file.
 * 3. Existing application defaults when missing or invalid.
 * 
 * Never mutates original imported JSON objects.
 * Supports both Auction Arena and Battle Arena with dynamic 2, 3, or 4 teams.
 */

import { FIXED_TEAMS } from './presets.js';
import { generateUniqueId } from './tournamentSchema.js';

/**
 * Resilient helper to match a team by ID, short ID, or name.
 */
export function matchFixedTeam(rawIdOrName) {
  if (!rawIdOrName) return null;
  const s = String(rawIdOrName).toLowerCase().replace(/^team-/, '').trim();
  return FIXED_TEAMS.find((ft) => {
    const ftClean = ft.id.toLowerCase().replace(/^team-/, '').trim();
    const ftName = ft.name.toLowerCase().trim();
    return ftClean === s || ftName === s || ft.id === rawIdOrName;
  });
}

/**
 * Extracts normalized defaults from an imported tournament JSON object.
 */
export function extractImportTournamentDefaults(rawParsed, arenaType = 'auction') {
  if (!rawParsed) return null;

  const tInfo = rawParsed.tournament || rawParsed;
  const rawEntries = Array.isArray(rawParsed.entries)
    ? rawParsed.entries
    : Array.isArray(rawParsed.items)
    ? rawParsed.items
    : [];

  const rawSettings = tInfo.rules || tInfo.settings || rawParsed.rules || {};
  const rawBudgets = tInfo.teamBudgets || tInfo.budgets || {};
  const rawScoring = tInfo.scoring || {};

  // 1. Tournament Info
  const name = String(tInfo.name || 'Custom Tournament').trim();
  const category = String(tInfo.category || tInfo.topic || (arenaType === 'battle' ? 'Battle Combat' : 'Custom')).trim();
  const description = String(tInfo.description || '').trim();

  // 2. Team Count & Selection
  // Detect if JSON explicitly configured 2, 3, or 4 teams
  let detectedTeamCount = 4;
  let detectedSelectedIds = FIXED_TEAMS.map((t) => t.id);

  const rawTeamsList = Array.isArray(tInfo.teams)
    ? tInfo.teams
    : Array.isArray(rawBudgets.teams)
    ? rawBudgets.teams
    : Array.isArray(rawParsed.teams)
    ? rawParsed.teams
    : null;

  if (rawTeamsList && [2, 3, 4].includes(rawTeamsList.length)) {
    detectedTeamCount = rawTeamsList.length;
    const matched = rawTeamsList
      .map((rt) => matchFixedTeam(rt.id || rt.name))
      .filter(Boolean)
      .map((t) => t.id);
    if (matched.length === detectedTeamCount) {
      detectedSelectedIds = matched;
    } else {
      detectedSelectedIds = FIXED_TEAMS.slice(0, detectedTeamCount).map((t) => t.id);
    }
  } else if (rawBudgets.individual && typeof rawBudgets.individual === 'object') {
    const keys = Object.keys(rawBudgets.individual);
    const matched = keys.map((k) => matchFixedTeam(k)).filter(Boolean).map((t) => t.id);
    const uniqueMatched = [...new Set(matched)];
    if ([2, 3, 4].includes(uniqueMatched.length)) {
      detectedTeamCount = uniqueMatched.length;
      detectedSelectedIds = uniqueMatched;
    }
  }

  // 3. Purse Configuration
  const defaultPurse = Number(rawBudgets.defaultPurse || rawSettings.defaultPurse || 100) || 100;
  let hasIndividualDiff = false;
  const individualMap = {};

  FIXED_TEAMS.forEach((ft) => {
    individualMap[ft.id] = defaultPurse;
    individualMap[ft.id.replace(/^team-/, '')] = defaultPurse;
  });

  // Populate from rawBudgets.teams if array
  if (Array.isArray(rawBudgets.teams)) {
    rawBudgets.teams.forEach((rt) => {
      const matched = matchFixedTeam(rt.id || rt.name);
      if (matched && Number(rt.purse || rt.initialPurse) > 0) {
        const val = Number(rt.purse || rt.initialPurse);
        individualMap[matched.id] = val;
        individualMap[matched.id.replace(/^team-/, '')] = val;
        if (val !== defaultPurse) hasIndividualDiff = true;
      }
    });
  }

  // Populate from rawBudgets.individual if object
  if (rawBudgets.individual && typeof rawBudgets.individual === 'object') {
    Object.keys(rawBudgets.individual).forEach((k) => {
      const matched = matchFixedTeam(k);
      if (matched && Number(rawBudgets.individual[k]) > 0) {
        const val = Number(rawBudgets.individual[k]);
        individualMap[matched.id] = val;
        individualMap[matched.id.replace(/^team-/, '')] = val;
        if (val !== defaultPurse) hasIndividualDiff = true;
      }
    });
  }

  const purseMode = rawBudgets.mode === 'custom' || rawBudgets.mode === 'individual' || hasIndividualDiff
    ? 'individual'
    : 'equal';

  // 4. Squad Configuration
  const parsedMaxSquad = Number(rawSettings.maxSquadSize || rawScoring.bestItemsCount || 8);
  const maxSquadSize = parsedMaxSquad > 0 ? parsedMaxSquad : 8;

  const parsedMinSquad = Number(rawSettings.minSquadSize || (arenaType === 'battle' ? 3 : 4));
  const minSquadSize = parsedMinSquad > 0 ? Math.min(parsedMinSquad, maxSquadSize) : Math.min(4, maxSquadSize);

  const bestItemsCount = Number(rawScoring.bestItemsCount || Math.min(maxSquadSize, 8)) || Math.min(maxSquadSize, 8);

  // 5. Auction Settings
  const defaultBasePrice = Number(rawSettings.defaultBasePrice || 1.0) || 1.0;
  const countdownDuration = Number(rawSettings.countdownSeconds || rawSettings.countdownDuration || (arenaType === 'battle' ? 20 : 20)) || 20;
  const surpriseReveal = Boolean(rawSettings.surpriseReveal);
  const auctionMode = String(rawSettings.auctionMode || 'standard');

  // 6. Scoring Configuration
  const metricName = String(rawScoring.metricName || (arenaType === 'battle' ? 'Combat Rating' : 'Overall Rating')).trim();
  const minScore = Number(rawScoring.minScore !== undefined ? rawScoring.minScore : 0);
  const maxScore = Number(rawScoring.maxScore !== undefined ? rawScoring.maxScore : 100);

  return {
    rawTournamentId: tInfo.id || null,
    name,
    category,
    description,
    entriesCount: rawEntries.length,
    rawEntries,
    // Detected defaults
    teamCount: detectedTeamCount,
    selectedTeamIds: detectedSelectedIds,
    purseMode,
    defaultPurse,
    individualMap,
    minSquadSize,
    maxSquadSize,
    bestItemsCount,
    defaultBasePrice,
    countdownDuration,
    surpriseReveal,
    auctionMode,
    metricName,
    minScore,
    maxScore,
  };
}

/**
 * Validates the user's import configuration before allowing launch.
 */
export function validateImportTournamentConfig({
  name,
  teamCount,
  selectedTeamIds = [],
  teamsWithPurses = [],
  minSquadSize,
  maxSquadSize,
  bestItemsCount,
  defaultBasePrice,
  countdownDuration,
  entriesCount = 0,
  arenaType = 'auction',
  squadSize, // for battle arena
}) {
  const errors = [];
  const warnings = [];

  // Name
  if (!name || !String(name).trim()) {
    errors.push('Tournament name cannot be empty.');
  }

  // Team count
  if (![2, 3, 4].includes(Number(teamCount))) {
    errors.push('Participating team count must be 2, 3, or 4 teams.');
  }

  // Franchise selection
  if (selectedTeamIds.length !== Number(teamCount)) {
    errors.push(`Select exactly ${teamCount} franchises (${selectedTeamIds.length} currently selected).`);
  }

  // Purses
  teamsWithPurses.forEach((t) => {
    const p = Number(t.purse ?? t.initialPurse);
    if (isNaN(p) || p <= 0) {
      errors.push(`Franchise "${t.name}" must have a starting purse greater than ₹0 Cr.`);
    }
  });

  // Default base price
  if (isNaN(Number(defaultBasePrice)) || Number(defaultBasePrice) <= 0) {
    errors.push('Default base price must be greater than 0.');
  }

  // Countdown duration
  if (isNaN(Number(countdownDuration)) || Number(countdownDuration) < 5) {
    errors.push('Countdown duration must be at least 5 seconds.');
  }

  if (arenaType === 'battle') {
    // Battle Arena checks
    const sSize = Number(squadSize || minSquadSize || 3);
    if (isNaN(sSize) || sSize <= 0) {
      errors.push('Battle squad size must be a positive integer.');
    } else {
      const requiredFighters = Number(teamCount) * sSize;
      if (entriesCount < requiredFighters) {
        errors.push(
          `Insufficient entries: Roster has ${entriesCount} fighters, but ${teamCount} teams × ${sSize} squad requires at least ${requiredFighters} fighters.`
        );
      }
    }
  } else {
    // Auction Arena checks
    const minS = Number(minSquadSize);
    const maxS = Number(maxSquadSize);

    if (isNaN(maxS) || maxS <= 0 || !Number.isInteger(maxS)) {
      errors.push('Maximum squad size must be a positive integer.');
    }
    if (isNaN(minS) || minS <= 0 || !Number.isInteger(minS)) {
      errors.push('Minimum squad size must be a positive integer.');
    }
    if (minS > maxS) {
      errors.push(`Minimum squad size (${minS}) cannot exceed maximum squad size (${maxS}).`);
    }

    const bestCount = Number(bestItemsCount);
    if (isNaN(bestCount) || bestCount <= 0 || bestCount > maxS) {
      errors.push(`Best items counted (${bestCount}) must be between 1 and maximum squad size (${maxS}).`);
    }

    const minRequiredLots = Number(teamCount) * minS;
    if (entriesCount < minRequiredLots) {
      errors.push(
        `Insufficient entries: Tournament has ${entriesCount} entries, but ${teamCount} teams with minimum squad ${minS} requires at least ${minRequiredLots} lots.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Builds the runtime tournament configuration by applying:
 * Priority 1: User selections made in the configuration modal.
 * Priority 2: Valid settings from the imported JSON.
 * Priority 3: Application defaults.
 */
export function buildRuntimeTournamentConfig({
  importedData,
  userConfig,
  arenaType = 'auction',
}) {
  const tInfo = importedData?.tournament || importedData || {};
  const rawEntries = Array.isArray(importedData?.entries)
    ? importedData.entries
    : Array.isArray(importedData?.items)
    ? importedData.items
    : [];

  const tournamentId = userConfig.forceNewId
    ? generateUniqueId(arenaType === 'battle' ? 'battle_custom' : 'custom_tourn')
    : (tInfo.id || generateUniqueId(arenaType === 'battle' ? 'battle_custom' : 'custom_tourn'));

  // 1. Tournament Metadata (User override > Imported > Default)
  const name = String(userConfig.name || tInfo.name || 'Custom Tournament').trim();
  const category = String(userConfig.category || tInfo.category || (arenaType === 'battle' ? 'Battle Combat' : 'Custom')).trim();
  const description = String(userConfig.description !== undefined ? userConfig.description : (tInfo.description || '')).trim();

  // 2. Teams and Purses (User override > Imported > Default)
  const teamCount = Number(userConfig.teamCount || 4);
  const selectedTeamIds = Array.isArray(userConfig.selectedTeamIds) && userConfig.selectedTeamIds.length === teamCount
    ? userConfig.selectedTeamIds
    : FIXED_TEAMS.slice(0, teamCount).map((t) => t.id);

  const selectedTeamsMeta = selectedTeamIds
    .map((id) => matchFixedTeam(id))
    .filter(Boolean);

  // Configure each selected franchise's starting purse
  const configuredTeams = selectedTeamsMeta.map((t) => {
    let purse = 100;
    if (userConfig.purseMode === 'equal') {
      purse = Number(userConfig.defaultPurse || 100);
    } else if (userConfig.individualMap) {
      const cleanKey = t.id.replace(/^team-/, '');
      const foundVal = userConfig.individualMap[t.id] ?? userConfig.individualMap[cleanKey] ?? userConfig.individualMap[t.name.toLowerCase()];
      if (foundVal !== undefined && foundVal !== null && !isNaN(Number(foundVal))) {
        purse = Number(foundVal);
      } else {
        purse = Number(userConfig.defaultPurse || t.initialPurse || 100);
      }
    } else {
      purse = Number(userConfig.defaultPurse || t.initialPurse || 100);
    }

    purse = Math.max(0.5, Number(purse.toFixed(2)));

    return {
      ...t,
      initialPurse: purse,
      purse,
      itemsPurchased: [],
      squad: [],
    };
  });

  // 3. Entries (Preserve all ratings and individual base prices unless explicitly overridden)
  const overrideBasePrice = Boolean(userConfig.overrideBasePrice);
  const defaultBasePrice = Number(userConfig.defaultBasePrice || 1.0);

  const mappedItems = rawEntries.map((entry, idx) => {
    const rawRating = entry.rating !== undefined ? entry.rating : (entry.score !== undefined ? entry.score : 85);
    const numRating = Math.max(0, Math.min(100, Number(rawRating) || 80));

    let finalBasePrice = defaultBasePrice;
    if (!overrideBasePrice) {
      const entryPrice = Number(entry.basePrice);
      if (!isNaN(entryPrice) && entryPrice > 0) {
        finalBasePrice = entryPrice;
      } else {
        // Suggested base price by rating
        if (numRating >= 95) finalBasePrice = 5.0;
        else if (numRating >= 90) finalBasePrice = 4.0;
        else if (numRating >= 85) finalBasePrice = 3.0;
        else if (numRating >= 80) finalBasePrice = 2.0;
        else finalBasePrice = 1.0;
      }
    }

    const uniqueId = entry.id ? String(entry.id) : `${tournamentId}_lot_${idx + 1}`;

    return {
      id: uniqueId,
      name: entry.name ? String(entry.name).trim() : `Lot #${idx + 1}`,
      role: entry.role || entry.category || (arenaType === 'battle' ? 'Fighter' : 'Contender'),
      category: entry.category || category || 'General',
      basePrice: Number(finalBasePrice.toFixed(2)),
      rating: numRating,
      desc: entry.description || entry.desc || '',
      imageUrl: entry.imageUrl || entry.image || '',
      movie: entry.movie || entry.film || '',
      actor: entry.actor || entry.star || '',
      director: entry.director || '',
      year: entry.year ? Number(entry.year) : null,
      metadata: entry.metadata || {},
      status: 'pending',
      soldPrice: null,
      soldTo: null,
      bidCount: 0,
      bidHistory: [],
    };
  });

  // 4. Squad & Rules
  const maxSquadSize = Number(userConfig.maxSquadSize || userConfig.squadSize || 8);
  const minSquadSize = Number(userConfig.minSquadSize || (arenaType === 'battle' ? maxSquadSize : 4));
  const bestItemsCount = Number(userConfig.bestItemsCount || Math.min(maxSquadSize, 8));
  const countdownDuration = Number(userConfig.countdownDuration || 20);
  const hideRatingsDuringAuction = Boolean(userConfig.surpriseReveal);
  const selectedMode = String(userConfig.auctionMode || 'standard');

  const metricName = String(userConfig.metricName || (arenaType === 'battle' ? 'Combat Rating' : 'Overall Rating')).trim();

  // Create immutable runtime configuration
  return {
    id: tournamentId,
    name,
    category,
    description,
    isCustom: true,
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    scoreLabel: metricName,
    bestItemsCount,
    currency: {
      symbol: '₹',
      name: 'INR',
      unit: 'Cr',
      factor: 1,
    },
    rules: {
      minIncrement: 0.50,
      customIncrements: [0.5, 1.0, 2.0, 5.0, 10.0],
      minSquadSize,
      maxSquadSize,
      countdownDuration,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: false,
      hideRatingsDuringAuction,
      surpriseReveal: hideRatingsDuringAuction,
    },
    scoring: {
      metricName,
      minScore: Number(userConfig.minScore || 0),
      maxScore: Number(userConfig.maxScore || 100),
      bestItemsCount,
    },
    teamBudgets: {
      mode: userConfig.purseMode,
      defaultPurse: Number(userConfig.defaultPurse || 100),
      individual: userConfig.individualMap || {},
      teams: configuredTeams,
    },
    theme: {
      primary: arenaType === 'battle' ? '#FF8A35' : '#9147FF',
      secondary: '#00D9FF',
      accent: '#FF8A35',
      badgeText: arenaType === 'battle' ? 'Battle Tournament' : 'Custom Tournament',
    },
    teams: configuredTeams,
    items: mappedItems,
    entries: mappedItems,
  };
}
