/**
 * PLAYER RATING VISIBILITY CONTROLLER
 * Authoritative security layer governing player rating concealments across
 * Auction Arena, Battle Arena, Tactical Drafts, Broadcast Overlays, and Previews.
 *
 * Rules:
 * 1. Auction Arena: Ratings are STRICTLY CONCEALED during active bidding and partially
 *    completed auctions. Ratings are revealed ONLY after official auction completion.
 * 2. Battle Arena Round 1 (Auction): Ratings strictly concealed throughout bidding.
 * 3. Battle Arena Round 2 (Tactical Draft): Ratings strictly concealed during private selection
 *    and for all future matches. Only when both lineups are locked and the 3-2-1 reveal
 *    completes for the active match are ratings revealed for that specific bout.
 */

/**
 * Determines whether ratings are permitted to be visible in Auction Arena.
 * @param {object} auction - The auction state object
 * @returns {boolean} - true only if auction is officially completed
 */
export const isAuctionRatingVisible = (auction) => {
  if (!auction) return false;
  return auction.status === 'completed';
};

/**
 * Determines whether a fighter's combat rating is permitted to be revealed in Battle Arena.
 * @param {object} matchState - Match execution state
 * @param {boolean} isRevealed - Whether the 3-2-1 countdown has completed for this match
 * @returns {boolean} - true only for the active revealed bout
 */
export const isBattleFighterRatingVisible = (matchState, isRevealed = false) => {
  if (!matchState) return false;
  // Match must be evaluated, confirmed, or finished, and 3-2-1 reveal must have fired
  const isMatchActiveOrCompleted = 
    matchState.status === 'evaluated' || 
    matchState.status === 'confirmed' || 
    matchState.status === 'completed';

  return Boolean(isRevealed && isMatchActiveOrCompleted);
};

/**
 * Sanitizes a player object for UI rendering in Auction Arena.
 * Strips rating numbers, stars, combat power, and hidden score unless auction is completed.
 * @param {object} player - Raw player item from tournament roster
 * @param {object} auction - The auction state object
 * @returns {object} - Sanitized player safe for public UI rendering
 */
export const sanitizePlayerForAuction = (player, auction) => {
  if (!player) return null;
  const isVisible = isAuctionRatingVisible(auction);

  if (isVisible) {
    return { ...player };
  }

  // Clone and sanitize unauthorized rating properties
  const sanitized = { ...player };
  delete sanitized.rating;
  delete sanitized.combatRating;
  delete sanitized.hiddenScore;
  delete sanitized.powerScore;
  delete sanitized.combatScore;
  delete sanitized.starRating;

  // Add explicit indicator
  sanitized._ratingConcealed = true;
  return sanitized;
};

/**
 * Sanitizes a fighter object for UI rendering in Battle Tactical Draft.
 * Strips rating numbers during secret selection and future match previews.
 * @param {object} fighter - Fighter item from team squad
 * @param {boolean} isRevealed - Whether authorized 3-2-1 reveal completed
 * @returns {object} - Sanitized fighter safe for public UI rendering
 */
export const sanitizeFighterForDraft = (fighter, isRevealed = false) => {
  if (!fighter) return null;

  if (isRevealed) {
    return { ...fighter };
  }

  const sanitized = { ...fighter };
  delete sanitized.rating;
  delete sanitized.combatRating;
  delete sanitized.combatScore;
  delete sanitized.hiddenScore;

  sanitized._ratingConcealed = true;
  return sanitized;
};

/**
 * Helper to get safe rating display text.
 */
export const getSafeRatingDisplay = (ratingValue, isVisible = false, fallback = 'Concealed') => {
  if (isVisible && ratingValue != null) {
    return String(ratingValue);
  }
  return fallback;
};
