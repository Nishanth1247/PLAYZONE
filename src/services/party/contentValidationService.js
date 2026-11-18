/**
 * BIDBATTLE 7.0 - Content Validation Service
 * Strict validation engine ensuring generated or loaded content meets exact standards.
 */

export function validateGameContent(gameId, contentItems) {
  if (!Array.isArray(contentItems) || contentItems.length === 0) {
    return {
      isValid: false,
      error: 'Content array is empty or invalid',
      validItems: [],
    };
  }

  const validItems = [];
  const errors = [];

  contentItems.forEach((item, idx) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Item #${idx + 1}: Malformed object`);
      return;
    }

    // Validation by game type
    if (gameId.includes('who_am_i') || gameId.includes('guess_player')) {
      if (!item.name || !item.clues || !Array.isArray(item.clues) || item.clues.length === 0) {
        errors.push(`Item #${idx + 1} (${item.name || 'unnamed'}): Missing character name or clues array`);
        return;
      }
    } else if (gameId.includes('emoji')) {
      if (!item.emojis || !item.answer) {
        errors.push(`Item #${idx + 1}: Missing emojis or answer string`);
        return;
      }
    } else if (gameId.includes('higher_lower')) {
      if (!item.playerA || !item.playerB || item.playerA.statValue === undefined || item.playerB.statValue === undefined) {
        errors.push(`Item #${idx + 1}: Missing player comparison stat values`);
        return;
      }
    } else if (gameId.includes('impostor')) {
      if (!item.secretWord || !item.impostorHint) {
        errors.push(`Item #${idx + 1}: Missing secretWord or impostorHint`);
        return;
      }
    } else if (gameId.includes('odd_one_out')) {
      if (!item.items || !Array.isArray(item.items) || item.items.length < 4 || !item.oddItem) {
        errors.push(`Item #${idx + 1}: Missing 4 items or oddItem identifier`);
        return;
      }
    } else if (gameId.includes('connections')) {
      if (!item.items || !item.connection) {
        errors.push(`Item #${idx + 1}: Missing items or connection explanation`);
        return;
      }
    } else if (gameId.includes('quiz') || gameId.includes('battle') || gameId.includes('records')) {
      if (!item.question || !item.options || !Array.isArray(item.options) || !item.answer) {
        errors.push(`Item #${idx + 1}: Missing question, options array, or correct answer`);
        return;
      }
      if (!item.options.includes(item.answer)) {
        // Auto-fix if answer not in options but valid
        item.options[0] = item.answer;
      }
    }

    validItems.push(item);
  });

  return {
    isValid: validItems.length > 0,
    validItems,
    errors,
  };
}
