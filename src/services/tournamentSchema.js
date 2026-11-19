// BIDBATTLE 6.0 — Tournament Schema Validation, Normalization & Export Engine

export const SCHEMA_VERSION = 1;

export const SAMPLE_TOURNAMENT_JSON = {
  schemaVersion: 1,
  tournament: {
    id: "custom-tamil-villains-001",
    name: "Tamil Cinema Villain Auction",
    description: "Auction the most iconic villains and ruthless masterminds in Tamil cinema history.",
    category: "Tamil Cinema",
    currency: "INR",
    currencyUnit: "Cr",
    scoring: {
      metricName: "Villain Impact Score",
      minScore: 0,
      maxScore: 100,
      bestItemsCount: 8
    },
    settings: {
      defaultPurse: 100,
      defaultBasePrice: 2,
      countdownSeconds: 20,
      surpriseReveal: false
    },
    teamBudgets: {
      mode: "equal",
      defaultPurse: 100,
      individual: {
        "Nishanth": 100,
        "Ajmal": 100,
        "Praneeth": 100,
        "Nagulan": 100
      }
    }
  },
  entries: [
    {
      id: "villain-001",
      name: "Rolex",
      movie: "Vikram",
      actor: "Suriya",
      year: 2022,
      category: "Drug Syndicate Emperor",
      basePrice: 5,
      rating: 98,
      description: "A volcanic 3-minute cameo that sent theaters into manic frenzy: 'Just call me Rolex, sir!'",
      imageUrl: "",
      metadata: {
        universe: "Lokesh Cinematic Universe",
        role: "Main Overlord"
      }
    },
    {
      id: "villain-002",
      name: "Bhavani",
      movie: "Master",
      actor: "Vijay Sethupathi",
      year: 2021,
      category: "Cold-Blooded Syndicate Kingpin",
      basePrice: 5,
      rating: 96,
      description: "Brutally pragmatic villain with an iron fist, sinister smile, and zero remorse.",
      imageUrl: "",
      metadata: {
        weapon: "Punch & Iron Bracelet"
      }
    },
    {
      id: "villain-003",
      name: "Siddharth Abhimanyu",
      movie: "Thani Oruvan",
      actor: "Arvind Swamy",
      year: 2015,
      category: "White-Collar Evil Genius",
      basePrice: 5,
      rating: 97,
      description: "Suave, hyper-intelligent pharmaceutical mastermind who believes peace is a pause between wars.",
      imageUrl: "",
      metadata: {
        field: "Medical Mafia"
      }
    },
    {
      id: "villain-004",
      name: "Muthupandi",
      movie: "Ghilli",
      actor: "Prakash Raj",
      year: 2004,
      category: "Obsessive Madurai Factionist",
      basePrice: 5,
      rating: 96,
      description: "Terrifying yet hilarious factionist villain whose obsessive line 'Chellam' became pop-culture folklore.",
      imageUrl: "",
      metadata: {
        catchphrase: "Chellam"
      }
    },
    {
      id: "villain-005",
      name: "Dhanushkodi",
      movie: "Maanadu",
      actor: "SJ Suryah",
      year: 2021,
      category: "Time-Loop Corrupt DCP",
      basePrice: 5,
      rating: 95,
      description: "High-octane corrupt police chief whose manic loop meltdowns spawned immortal memes.",
      imageUrl: "",
      metadata: {
        ability: "Time Loop Memory"
      }
    }
  ]
};

export function generateUniqueId(prefix = 'custom') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Validates a tournament JSON input (string or object).
 * Returns detailed error paths and normalized preview data.
 */
export function validateTournamentJSON(rawInput) {
  const errors = [];
  const warnings = [];

  // Stage 1: Parse JSON syntax
  let parsed = null;
  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput);
    } catch (e) {
      return {
        valid: false,
        isValid: false,
        syntaxError: true,
        errors: [{ field: 'Syntax Error', message: e.message }],
        rawErrors: [`JSON Syntax Error: ${e.message}`],
        warnings: [],
        data: null,
        normalizedData: null,
      };
    }
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    parsed = rawInput;
  } else {
    return {
      valid: false,
      isValid: false,
      syntaxError: true,
      errors: [{ field: 'root', message: 'Input must be a valid JSON string or object.' }],
      rawErrors: ['Input must be a valid JSON string or object.'],
      warnings: [],
      data: null,
      normalizedData: null,
    };
  }

  // Stage 2: Structural validation
  // Support both schemaVersion: 1 format and simplified flat format
  const tInfo = parsed.tournament || parsed;
  const entries = Array.isArray(parsed.entries) 
    ? parsed.entries 
    : (Array.isArray(parsed.items) ? parsed.items : null);

  // Tournament Name
  if (!tInfo.name || typeof tInfo.name !== 'string' || !tInfo.name.trim()) {
    errors.push('tournament.name: Tournament name is required.');
  }

  // Category
  if (!tInfo.category || typeof tInfo.category !== 'string' || !tInfo.category.trim()) {
    warnings.push('tournament.category: Missing category. Defaulting to "Custom Tournament".');
  }

  // Entries existence
  if (!entries) {
    errors.push('entries: Missing "entries" (or "items") array. A tournament must include auction lots.');
  } else if (!Array.isArray(entries) || entries.length === 0) {
    errors.push('entries: The "entries" array is empty. At least one auction lot is required.');
  } else {
    // Validate each entry
    const seenIds = new Set();
    const seenNames = new Set();

    entries.forEach((item, idx) => {
      const path = `entries[${idx}]`;

      // Name
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
        errors.push(`${path}.name: Missing lot name.`);
      } else {
        const lowerName = item.name.trim().toLowerCase();
        if (seenNames.has(lowerName)) {
          warnings.push(`${path}.name: Duplicate item name "${item.name}".`);
        }
        seenNames.add(lowerName);
      }

      // ID check
      if (item.id) {
        if (seenIds.has(item.id)) {
          warnings.push(`${path}.id: Duplicate ID "${item.id}". A new unique ID will be assigned.`);
        }
        seenIds.add(item.id);
      }

      // Rating / Score validation
      const rating = item.rating !== undefined ? item.rating : item.score;
      if (rating === undefined || rating === null) {
        warnings.push(`${path}.rating: Missing rating score. Defaulting to 80.`);
      } else {
        const numRating = Number(rating);
        if (isNaN(numRating) || numRating < 0 || numRating > 100) {
          errors.push(`${path}.rating: Rating must be a valid number between 0 and 100 (got "${rating}").`);
        }
      }

      // Base Price validation
      if (item.basePrice !== undefined && item.basePrice !== null) {
        const numPrice = Number(item.basePrice);
        if (isNaN(numPrice) || numPrice <= 0) {
          errors.push(`${path}.basePrice: Base price must be a positive number greater than 0 (got "${item.basePrice}").`);
        }
      }
    });
  }

  // Budget Validation
  const teamBudgets = tInfo.teamBudgets || tInfo.budgets;
  if (teamBudgets) {
    if (teamBudgets.defaultPurse !== undefined) {
      const defP = Number(teamBudgets.defaultPurse);
      if (isNaN(defP) || defP <= 0) {
        errors.push('tournament.teamBudgets.defaultPurse: Default purse must be a positive number.');
      }
    }
    if (teamBudgets.individual && typeof teamBudgets.individual === 'object') {
      Object.entries(teamBudgets.individual).forEach(([teamName, purse]) => {
        const p = Number(purse);
        if (isNaN(p) || p <= 0) {
          errors.push(`tournament.teamBudgets.individual.${teamName}: Budget must be greater than zero.`);
        }
      });
    }
  }

  const isValid = errors.length === 0;
  const normalizedData = isValid ? normalizeTournamentData(parsed) : null;

  const formattedErrors = errors.map((err) => {
    if (typeof err === 'object' && err !== null && err.field) return err;
    const colonIdx = err.indexOf(':');
    if (colonIdx !== -1) {
      return { field: err.slice(0, colonIdx).trim(), message: err.slice(colonIdx + 1).trim() };
    }
    return { field: 'schema', message: err };
  });

  return {
    valid: isValid,
    isValid,
    errors: formattedErrors,
    rawErrors: errors,
    warnings,
    data: parsed,
    normalizedData,
    rawParsed: parsed,
  };
}

/**
 * Normalizes raw validated JSON into standard BIDBATTLE tournament preset format.
 */
export function normalizeTournamentData(rawInput, options = {}) {
  const tInfo = rawInput.tournament || rawInput;
  const rawEntries = Array.isArray(rawInput.entries)
    ? rawInput.entries
    : (Array.isArray(rawInput.items) ? rawInput.items : []);

  const generatedTournamentId = options.forceNewId 
    ? generateUniqueId('custom_tourn') 
    : (tInfo.id || generateUniqueId('custom_tourn'));

  const currencySymbol = typeof tInfo.currency === 'object' && tInfo.currency !== null
    ? (tInfo.currency.symbol || '₹')
    : (tInfo.currency === 'INR' || tInfo.currency === '₹' ? '₹' : (tInfo.currency || '₹'));
  const currencyName = typeof tInfo.currency === 'object' && tInfo.currency !== null
    ? (tInfo.currency.name || 'INR')
    : (typeof tInfo.currency === 'string' ? tInfo.currency : 'INR');
  const currencyUnit = tInfo.currencyUnit || (typeof tInfo.currency === 'object' ? tInfo.currency?.unit : null) || 'Cr';

  const defaultPurse = Number(
    tInfo.teamBudgets?.defaultPurse || 
    tInfo.settings?.defaultPurse || 
    tInfo.defaultPurse || 
    100
  );

  const scoringConfig = tInfo.scoring || {};
  const scoreMetricName = scoringConfig.metricName || tInfo.scoreLabel || 'Hero Rating';
  const bestItemsCount = Number(scoringConfig.bestItemsCount) || 8;

  // Normalized items/lots
  const items = rawEntries.map((entry, idx) => {
    const rawRating = entry.rating !== undefined ? entry.rating : (entry.score !== undefined ? entry.score : 85);
    const numRating = Math.max(0, Math.min(100, Number(rawRating) || 80));
    
    // Auto-calculate base price if omitted
    let basePrice = Number(entry.basePrice);
    if (isNaN(basePrice) || basePrice <= 0) {
      if (numRating >= 95) basePrice = 5.0;
      else if (numRating >= 90) basePrice = 4.0;
      else if (numRating >= 85) basePrice = 3.0;
      else if (numRating >= 80) basePrice = 2.0;
      else basePrice = 1.0;
    }

    const uniqueItemId = entry.id && !options.regenerateItemIds 
      ? String(entry.id) 
      : `${generatedTournamentId}_item_${idx + 1}`;

    return {
      id: uniqueItemId,
      name: entry.name ? String(entry.name).trim() : `Lot #${idx + 1}`,
      role: entry.role || entry.category || 'Contender',
      category: entry.category || tInfo.category || 'General',
      basePrice: Number(basePrice.toFixed(2)),
      rating: numRating,
      desc: entry.description || entry.desc || '',
      imageUrl: entry.imageUrl || entry.image || '',
      movie: entry.movie || entry.film || '',
      actor: entry.actor || entry.star || '',
      director: entry.director || '',
      year: entry.year ? Number(entry.year) : null,
      genre: entry.genre || '',
      imdbRating: entry.imdbRating !== undefined ? Number(entry.imdbRating) : null,
      imdbId: entry.imdbId || '',
      metadata: entry.metadata || {},
    };
  });

  // Four Fixed Teams with configured budgets
  const FIXED_TEAMS_META = [
    { id: 'team-nishanth', name: 'Nishanth', owner: 'Nishanth', shortName: 'NIS', color: '#8875A8', logo: '👑' },
    { id: 'team-ajmal', name: 'Ajmal', owner: 'Ajmal', shortName: 'AJM', color: '#71999B', logo: '⚡' },
    { id: 'team-praneeth', name: 'Praneeth', owner: 'Praneeth', shortName: 'PRA', color: '#B68B68', logo: '🔥' },
    { id: 'team-nagulan', name: 'Nagulan', owner: 'Nagulan', shortName: 'NAG', color: '#84977B', logo: '🛡️' },
  ];

  const individualBudgets = tInfo.teamBudgets?.individual || {};
  const teams = FIXED_TEAMS_META.map((t) => {
    // Check if team name exists in individual budgets map
    const customAmount = individualBudgets[t.name] || individualBudgets[t.id];
    const purseVal = customAmount !== undefined && !isNaN(Number(customAmount)) && Number(customAmount) > 0
      ? Number(customAmount)
      : defaultPurse;
    return {
      ...t,
      initialPurse: purseVal,
      purse: purseVal,
    };
  });

  return {
    id: generatedTournamentId,
    name: String(tInfo.name).trim(),
    description: tInfo.description || '',
    category: tInfo.category || 'Custom Tournament',
    isCustom: true,
    schemaVersion: 1,
    createdAt: tInfo.createdAt || new Date().toISOString(),
    scoreLabel: scoreMetricName,
    scoreMetric: scoreMetricName.toLowerCase().includes('imdb') ? 'imdb' : 'points',
    bestItemsCount,
    theme: {
      primary: '#9147FF',
      secondary: '#00D9FF',
      accent: '#FF8A35',
      badgeText: 'Custom Tournament',
      cardGlow: 'hover:border-[#9147FF] hover:shadow-[0_0_35px_rgba(145,71,255,0.35)]',
    },
    currency: {
      symbol: currencySymbol,
      name: currencyName,
      unit: currencyUnit,
      factor: 1,
    },
    rules: {
      minIncrement: Number(tInfo.settings?.minIncrement || 0.20),
      customIncrements: tInfo.settings?.customIncrements || [0.5, 1.0, 2.0, 5.0, 10.0],
      minSquadSize: Number(tInfo.settings?.minSquadSize || 4),
      maxSquadSize: bestItemsCount,
      countdownDuration: Number(tInfo.settings?.countdownSeconds || 20),
      soundEffects: tInfo.settings?.soundEffects !== false,
      autoNext: Boolean(tInfo.settings?.autoNext),
      antiSelfBidding: tInfo.settings?.antiSelfBidding !== false,
      allowReAuction: tInfo.settings?.allowReAuction !== false,
      randomEvents: Boolean(tInfo.settings?.randomEvents),
      hideRatingsDuringAuction: Boolean(tInfo.settings?.surpriseReveal),
    },
    teamBudgets: {
      mode: tInfo.teamBudgets?.mode || (Object.keys(individualBudgets).length > 0 ? 'custom' : 'equal'),
      defaultPurse,
      individual: individualBudgets,
    },
    teams,
    items,
  };
}

/**
 * Exports a tournament object into standardized JSON format matching Section 4.
 */
export function exportTournamentToJSON(tournament) {
  const individualBudgets = {};
  (tournament.teams || []).forEach((t) => {
    individualBudgets[t.name] = t.initialPurse || t.purse || 100;
  });

  const exportObj = {
    schemaVersion: 1,
    tournament: {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description || '',
      category: tournament.category || 'Custom Tournament',
      currency: tournament.currency?.name || 'INR',
      currencyUnit: tournament.currency?.unit || 'Cr',
      scoring: {
        metricName: tournament.scoreLabel || 'Hero Rating',
        minScore: 0,
        maxScore: 100,
        bestItemsCount: tournament.rules?.maxSquadSize || 8,
      },
      settings: {
        defaultPurse: tournament.teams?.[0]?.initialPurse || 100,
        defaultBasePrice: tournament.items?.[0]?.basePrice || 2,
        countdownSeconds: tournament.rules?.countdownDuration || 20,
        surpriseReveal: Boolean(tournament.rules?.hideRatingsDuringAuction),
      },
      teamBudgets: {
        mode: tournament.teamBudgets?.mode || 'equal',
        defaultPurse: tournament.teams?.[0]?.initialPurse || 100,
        individual: individualBudgets,
      },
    },
    entries: (tournament.items || []).map((i) => ({
      id: i.id,
      name: i.name,
      movie: i.movie || '',
      actor: i.actor || '',
      director: i.director || '',
      year: i.year || undefined,
      category: i.category || i.role || 'Contender',
      basePrice: i.basePrice,
      rating: i.rating,
      description: i.desc || '',
      imageUrl: i.imageUrl || '',
      imdbRating: i.imdbRating || undefined,
      imdbId: i.imdbId || undefined,
      metadata: i.metadata || {},
    })),
  };

  return exportObj;
}

/**
 * Triggers browser download of a JSON file.
 */
export function downloadJSONFile(data, filename) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('File download error:', e);
    return false;
  }
}
