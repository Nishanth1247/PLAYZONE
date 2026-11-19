/**
 * BIDBATTLE 8.0 - Who Am I? Content Parser & Validator
 * Supports .json, .csv, and .txt files, as well as manual text entry.
 * Validates syntax, empty names, duplicate names/IDs, difficulty levels, and hints.
 */

/**
 * Fisher-Yates shuffle algorithm.
 * Uniform random distribution without mutating original array.
 */
export function fisherYatesShuffle(array) {
  if (!Array.isArray(array)) return [];
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Normalizes difficulty to one of 'Easy' | 'Medium' | 'Hard'
 */
export function normalizeDifficulty(diff) {
  if (!diff) return 'Medium';
  const lower = String(diff).trim().toLowerCase();
  if (lower.startsWith('e') || lower === 'easy') return 'Easy';
  if (lower.startsWith('h') || lower === 'hard') return 'Hard';
  return 'Medium';
}

/**
 * Parses raw text input based on format ('json' | 'csv' | 'txt' | 'auto').
 */
export function parseWhoAmIInput(content, formatHint = 'auto', options = {}) {
  const { collectionNameFallback = 'Custom Character Collection', minCharacters = 2 } = options;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return {
      isValid: false,
      errors: ['Input is empty. Please provide character data.'],
      characters: [],
      categories: {},
      difficulties: { Easy: 0, Medium: 0, Hard: 0 },
      totalCount: 0,
      name: collectionNameFallback,
    };
  }

  const trimmed = content.trim();
  let detectedFormat = formatHint;

  if (detectedFormat === 'auto') {
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      detectedFormat = 'json';
    } else if (trimmed.includes(',') && trimmed.includes('\n')) {
      detectedFormat = 'csv';
    } else {
      detectedFormat = 'txt';
    }
  }

  try {
    switch (detectedFormat) {
      case 'json':
        return parseJSONCharacters(trimmed, collectionNameFallback, minCharacters);
      case 'csv':
        return parseCSVCharacters(trimmed, collectionNameFallback, minCharacters);
      case 'txt':
      default:
        return parseTXTCharacters(trimmed, collectionNameFallback, minCharacters);
    }
  } catch (err) {
    return {
      isValid: false,
      errors: [`Parse error (${detectedFormat.toUpperCase()}): ${err.message}`],
      characters: [],
      categories: {},
      difficulties: { Easy: 0, Medium: 0, Hard: 0 },
      totalCount: 0,
      name: collectionNameFallback,
    };
  }
}

/**
 * Parses JSON format
 */
function parseJSONCharacters(jsonStr, fallbackName, minCharacters) {
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return {
      isValid: false,
      errors: [`Invalid JSON syntax: ${e.message}`],
      characters: [],
      categories: {},
      difficulties: { Easy: 0, Medium: 0, Hard: 0 },
      totalCount: 0,
      name: fallbackName,
    };
  }

  let collectionName = fallbackName;
  let defaultCategory = 'General';
  let rawItems = [];

  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    collectionName = parsed.name || parsed.title || fallbackName;
    defaultCategory = parsed.category || defaultCategory;

    if (Array.isArray(parsed.characters)) {
      rawItems = parsed.characters;
    } else if (Array.isArray(parsed.prompts)) {
      rawItems = parsed.prompts;
    } else if (Array.isArray(parsed.items)) {
      rawItems = parsed.items;
    } else if (Array.isArray(parsed.entries)) {
      rawItems = parsed.entries;
    } else {
      return {
        isValid: false,
        errors: ['JSON must contain a "characters", "items", or "entries" array.'],
        characters: [],
        categories: {},
        difficulties: { Easy: 0, Medium: 0, Hard: 0 },
        totalCount: 0,
        name: collectionName,
      };
    }
  } else {
    return {
      isValid: false,
      errors: ['Invalid JSON structure: Root must be an object or array.'],
      characters: [],
      categories: {},
      difficulties: { Easy: 0, Medium: 0, Hard: 0 },
      totalCount: 0,
      name: fallbackName,
    };
  }

  const candidateList = rawItems.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `char_${idx + 1}`,
        name: item,
        category: defaultCategory,
        difficulty: 'Medium',
        hint: '',
      };
    }
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id !== undefined && item.id !== null ? String(item.id).trim() : `char_${idx + 1}`,
        name: item.name || item.title || item.character || '',
        category: item.category || defaultCategory,
        difficulty: normalizeDifficulty(item.difficulty),
        hint: item.hint || item.clue || item.description || '',
      };
    }
    return { id: `char_${idx + 1}`, name: '', category: defaultCategory, difficulty: 'Medium', hint: '' };
  });

  return validateAndNormalizeCharacters(candidateList, collectionName, minCharacters);
}

/**
 * Parses TXT format: One character per line
 */
function parseTXTCharacters(txtStr, fallbackName, minCharacters) {
  const lines = txtStr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {
      isValid: false,
      errors: ['The text file contains no characters. At least one character is required.'],
      characters: [],
      categories: {},
      difficulties: { Easy: 0, Medium: 0, Hard: 0 },
      totalCount: 0,
      name: fallbackName,
    };
  }

  const candidateList = lines.map((line, idx) => {
    // Strip leading numbers like "1. ", "1 - ", etc.
    const cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '');
    return {
      id: `txt_char_${idx + 1}`,
      name: cleanLine,
      category: 'Custom Characters',
      difficulty: 'Medium',
      hint: '',
    };
  });

  return validateAndNormalizeCharacters(candidateList, fallbackName, minCharacters);
}

/**
 * Parses CSV format: Name, Category, Difficulty, Hint
 */
function parseCSVCharacters(csvStr, fallbackName, minCharacters) {
  const lines = csvStr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {
      isValid: false,
      errors: ['The CSV file is empty.'],
      characters: [],
      categories: {},
      difficulties: { Easy: 0, Medium: 0, Hard: 0 },
      totalCount: 0,
      name: fallbackName,
    };
  }

  const parsedRows = lines.map((line) => {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    cells.push(cur.trim());
    return cells;
  });

  // Check if first row is a header
  let startIndex = 0;
  const firstRow = parsedRows[0].map((c) => c.toLowerCase());
  if (
    firstRow[0]?.includes('name') ||
    firstRow[0]?.includes('character') ||
    firstRow[1]?.includes('category') ||
    firstRow[2]?.includes('diff')
  ) {
    startIndex = 1;
  }

  const candidateList = [];
  for (let i = startIndex; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const name = row[0] ? row[0].replace(/^\d+[\.\-\)]\s*/, '') : '';
    const category = row[1] || 'General';
    const difficulty = normalizeDifficulty(row[2]);
    const hint = row[3] || '';

    if (name) {
      candidateList.push({
        id: `csv_char_${i + 1}`,
        name,
        category,
        difficulty,
        hint,
      });
    }
  }

  return validateAndNormalizeCharacters(candidateList, fallbackName, minCharacters);
}

/**
 * Validates, deduplicates, and normalizes candidate character list
 */
function validateAndNormalizeCharacters(candidateList, collectionName, minCharacters) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const seenNames = new Set();
  const validCharacters = [];
  const categories = {};
  const difficulties = { Easy: 0, Medium: 0, Hard: 0 };

  candidateList.forEach((char, index) => {
    const rowNum = index + 1;
    const name = (char.name || '').trim();

    if (!name) {
      errors.push(`Row ${rowNum}: Character name is empty.`);
      return;
    }

    // Check duplicate names (case-insensitive)
    const normalizedName = name.toLowerCase();
    if (seenNames.has(normalizedName)) {
      warnings.push(`Duplicate character "${name}" skipped (Row ${rowNum}).`);
      return;
    }
    seenNames.add(normalizedName);

    // Normalize ID
    let finalId = char.id ? String(char.id).trim() : `char_${rowNum}`;
    if (seenIds.has(finalId)) {
      finalId = `${finalId}_${rowNum}`;
    }
    seenIds.add(finalId);

    const category = (char.category || 'General').trim();
    const difficulty = normalizeDifficulty(char.difficulty);
    const hint = (char.hint || '').trim();

    categories[category] = (categories[category] || 0) + 1;
    difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;

    validCharacters.push({
      id: finalId,
      name,
      category,
      difficulty,
      hint,
    });
  });

  if (validCharacters.length < minCharacters) {
    errors.push(`Found only ${validCharacters.length} valid character(s). A minimum of ${minCharacters} characters is required.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    characters: validCharacters,
    categories,
    difficulties,
    totalCount: validCharacters.length,
    name: collectionName,
  };
}
