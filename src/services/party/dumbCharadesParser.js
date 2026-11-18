/**
 * BIDBATTLE - DUMB CHARADES 2.0: Prompt Parser & Validator
 * Supports .json, .csv, and .txt files, as well as raw text entry.
 * Enforces strict validation: syntax, empty lists, empty names, duplicate IDs,
 * duplicate names, and insufficient prompts for the chosen teams.
 */

/**
 * Fisher-Yates shuffle algorithm.
 * Guarantees a truly uniform random shuffle without modifying the source array.
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
 * Parses raw text input based on format ('json' | 'csv' | 'txt' | 'auto').
 */
export function parseDumbCharadesInput(content, formatHint = 'auto', options = {}) {
  const { listNameFallback = 'Custom Prompt List', minPrompts = 2 } = options;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return {
      isValid: false,
      errors: ['Input is empty. Please provide prompt content.'],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
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
        return parseJSONPrompts(trimmed, listNameFallback, minPrompts);
      case 'csv':
        return parseCSVPrompts(trimmed, listNameFallback, minPrompts);
      case 'txt':
      default:
        return parseTXTPrompts(trimmed, listNameFallback, minPrompts);
    }
  } catch (err) {
    return {
      isValid: false,
      errors: [`Parse error (${detectedFormat.toUpperCase()}): ${err.message}`],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
    };
  }
}

/**
 * Parses JSON format
 */
function parseJSONPrompts(jsonStr, listNameFallback, minPrompts) {
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return {
      isValid: false,
      errors: [`Invalid JSON syntax: ${e.message}`],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
    };
  }

  let listName = listNameFallback;
  let defaultCategory = 'General';
  let rawItems = [];

  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    listName = parsed.name || parsed.title || listNameFallback;
    defaultCategory = parsed.category || defaultCategory;

    if (Array.isArray(parsed.prompts)) {
      rawItems = parsed.prompts;
    } else if (Array.isArray(parsed.items)) {
      rawItems = parsed.items;
    } else if (Array.isArray(parsed.entries)) {
      rawItems = parsed.entries;
    } else {
      return {
        isValid: false,
        errors: ['JSON must contain a "prompts", "items", or "entries" array.'],
        prompts: [],
        categories: {},
        totalCount: 0,
        name: listName,
      };
    }
  } else {
    return {
      isValid: false,
      errors: ['Invalid JSON structure: Root must be an object or array.'],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
    };
  }

  // Convert raw items into candidate prompt list
  const candidateList = rawItems.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `p_${idx + 1}`,
        name: item,
        category: defaultCategory,
      };
    }
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id !== undefined && item.id !== null ? String(item.id).trim() : `p_${idx + 1}`,
        name: item.name || item.title || item.prompt || '',
        category: item.category || defaultCategory,
        hint: item.hint || item.stars || item.actor || item.description || '',
        year: item.year || '',
      };
    }
    return { id: `p_${idx + 1}`, name: '', category: defaultCategory };
  });

  return validateAndNormalizePrompts(candidateList, listName, minPrompts);
}

/**
 * Parses TXT format: One prompt per line
 */
function parseTXTPrompts(txtStr, listNameFallback, minPrompts) {
  const lines = txtStr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {
      isValid: false,
      errors: ['The text file contains no prompts. At least one prompt is required.'],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
    };
  }

  const candidateList = lines.map((line, idx) => ({
    id: `txt_p_${idx + 1}`,
    name: line,
    category: 'Custom Text List',
  }));

  return validateAndNormalizePrompts(candidateList, listNameFallback, minPrompts);
}

/**
 * Parses CSV format: Prompt, Category (optional)
 */
function parseCSVPrompts(csvStr, listNameFallback, minPrompts) {
  const lines = csvStr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return {
      isValid: false,
      errors: ['The CSV file is empty.'],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
    };
  }

  // Parse lines, taking care of simple quoted tokens
  const parsedRows = lines.map((line) => {
    // Simple CSV tokenizer supporting basic quotes
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  });

  // Check if first line is a header
  const firstRow = parsedRows[0].map((c) => c.toLowerCase());
  const hasHeader =
    firstRow.some((c) => ['prompt', 'movie', 'title', 'name', 'item'].includes(c)) ||
    firstRow.some((c) => ['category', 'genre', 'universe'].includes(c));

  const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows;

  if (dataRows.length === 0) {
    return {
      isValid: false,
      errors: ['No prompt rows found in CSV after header.'],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listNameFallback,
    };
  }

  // Determine prompt and category column indexes
  let promptColIdx = 0;
  let categoryColIdx = 1;
  let idColIdx = -1;

  if (hasHeader) {
    const headerCols = firstRow;
    const foundPromptIdx = headerCols.findIndex((c) => ['prompt', 'movie', 'title', 'name', 'item'].includes(c));
    if (foundPromptIdx !== -1) promptColIdx = foundPromptIdx;

    const foundCatIdx = headerCols.findIndex((c) => ['category', 'genre', 'universe'].includes(c));
    if (foundCatIdx !== -1) categoryColIdx = foundCatIdx;

    const foundIdIdx = headerCols.findIndex((c) => ['id', 'prompt_id', 'code'].includes(c));
    if (foundIdIdx !== -1) idColIdx = foundIdIdx;
  }

  const candidateList = dataRows.map((row, idx) => {
    const rawName = row[promptColIdx] || '';
    const rawCat = row[categoryColIdx] || 'Custom CSV';
    const rawId = idColIdx !== -1 && row[idColIdx] ? row[idColIdx] : `csv_p_${idx + 1}`;
    return {
      id: String(rawId).trim(),
      name: rawName,
      category: rawCat,
    };
  });

  return validateAndNormalizePrompts(candidateList, listNameFallback, minPrompts);
}

/**
 * Validates candidates against all required rules:
 * 1. Empty list
 * 2. Empty prompt names
 * 3. Duplicate prompt IDs
 * 4. Duplicate prompt names
 * 5. Minimum prompts check
 */
export function validateAndNormalizePrompts(candidateList, listName = 'Custom List', minPrompts = 2) {
  const errors = [];
  const warnings = [];

  if (!candidateList || !Array.isArray(candidateList) || candidateList.length === 0) {
    return {
      isValid: false,
      errors: ['The prompt list is empty. At least one prompt is required.'],
      prompts: [],
      categories: {},
      totalCount: 0,
      name: listName,
    };
  }

  const seenIds = new Set();
  const seenNames = new Set();
  const categories = {};
  const normalizedPrompts = [];

  candidateList.forEach((item, idx) => {
    const lineNumber = idx + 1;

    // 1. Name check
    if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
      errors.push(`Prompt #${lineNumber}: Empty prompt name. Every prompt must have a non-empty name.`);
      return;
    }

    const cleanName = item.name.trim();
    const cleanLowerName = cleanName.toLowerCase();

    // 2. Duplicate prompt name check
    if (seenNames.has(cleanLowerName)) {
      errors.push(`Duplicate prompt name "${cleanName}" found at entry #${lineNumber}.`);
    }
    seenNames.add(cleanLowerName);

    // 3. ID check
    let cleanId = item.id ? String(item.id).trim() : `prompt_${lineNumber}`;
    if (seenIds.has(cleanId)) {
      errors.push(`Duplicate prompt ID "${cleanId}" found at entry #${lineNumber}. Every prompt must have a unique ID.`);
    }
    seenIds.add(cleanId);

    const cat = item.category && String(item.category).trim() ? String(item.category).trim() : 'General';
    categories[cat] = (categories[cat] || 0) + 1;

    const wordsCount = cleanName.split(/\s+/).filter(Boolean).length;

    normalizedPrompts.push({
      id: cleanId,
      name: cleanName,
      title: cleanName, // Compatibility with legacy view
      category: cat,
      wordsCount,
      hint: item.hint || '',
      year: item.year || '',
    });
  });

  // 4. Insufficient prompts check
  if (normalizedPrompts.length < minPrompts) {
    errors.push(
      `Insufficient prompts: The list contains only ${normalizedPrompts.length} valid prompt${
        normalizedPrompts.length === 1 ? '' : 's'
      }, but at least ${minPrompts} are required for the selected game.`
    );
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    prompts: normalizedPrompts,
    categories,
    totalCount: normalizedPrompts.length,
    name: listName,
  };
}
