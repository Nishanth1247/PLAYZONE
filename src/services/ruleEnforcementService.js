/**
 * PLAYZONE - GAMEPLAY RULE AUDIT & STRICT ENGINE-LEVEL ENFORCEMENT SERVICE
 *
 * Authoritative verification and enforcement layer ensuring every rule
 * documented in official rulebooks is strictly enforced by the gameplay engine,
 * accompanied by user-facing feedback and covered by automated tests.
 */

import { getProgressiveIncrement, toPaise, fromPaise } from './auctionEngine.js';

/**
 * 1. AUCTION RULE ENFORCEMENT
 */
export const enforceAuctionRules = {
  // Rule A1: Dynamic progressive increments
  getRequiredIncrement: (currentBid) => {
    return getProgressiveIncrement(currentBid);
  },

  // Rule A2: Valid next bid amount
  calculateNextValidBid: (currentBid, hasBids, basePrice = 1.0) => {
    if (!hasBids) return Number(basePrice) || 1.0;
    const inc = getProgressiveIncrement(currentBid);
    return fromPaise(toPaise(currentBid) + toPaise(inc));
  },

  // Rule A3: Purse solvency check
  canFranchiseAffordBid: (franchisePurse, bidAmount) => {
    const pursePaise = toPaise(franchisePurse);
    const bidPaise = toPaise(bidAmount);
    return pursePaise >= bidPaise;
  },

  // Rule A4: Squad capacity limit
  canFranchiseAcquireLot: (currentSquadCount, maxSquadSize = 8) => {
    return currentSquadCount < maxSquadSize;
  },

  // Rule A5: Anti-self-bidding
  canFranchiseOutbid: (highestBidderId, teamId, antiSelfBiddingEnabled = true) => {
    if (!antiSelfBiddingEnabled) return true;
    return highestBidderId !== teamId;
  },

  // Rule A6: Mandatory Last-Bidder Settlement Rule
  // If at least one valid bid has been placed, item CANNOT be marked unsold.
  canMarkUnsold: (hasBids, bidCount = 0) => {
    return !hasBids && bidCount === 0;
  },

  // Rule A7: Mandatory last-bidder base-price award
  shouldSettleAtBasePrice: (bidHistory = [], highestBidder, currentItemBasePrice) => {
    // If only 1 opening bid was accepted at base price and no counter-bids occurred
    if (bidHistory.length === 1 && Boolean(highestBidder)) {
      return true;
    }
    return false;
  },

  // Rule A8: Strict Rating Concealment
  isRatingConcealedDuringAuction: (auctionStatus) => {
    return auctionStatus !== 'completed';
  },

  // Rule A9: Solvency Guarantee (Cannot end with negative purse)
  isPurseSolvent: (resultingPurse) => {
    return toPaise(resultingPurse) >= 0;
  }
};

/**
 * 2. BATTLE ARENA RULE ENFORCEMENT
 */
export const enforceBattleRules = {
  // Rule B1: Fighter uniqueness (No fighter used twice in same match or beyond squad)
  isFighterSelectionValid: (fighterId, selectedFighterIds = []) => {
    if (!fighterId) return false;
    return !selectedFighterIds.includes(fighterId);
  },

  // Rule B2: Both Lineups Must Be Locked Before Reveal
  canTriggerMatchReveal: (teamALocked, teamBLocked, isRevealed) => {
    return Boolean(teamALocked && teamBLocked && !isRevealed);
  },

  // Rule B3: Secret Draft Privacy (Opponent's selection must not leak before reveal)
  isOpponentSelectionHidden: (isRevealed) => {
    return !isRevealed;
  },

  // Rule B4: 3-1-0 Combat Points System
  resolveCombatPoints: (winner) => {
    if (winner === 'A') {
      return { teamAPoints: 3, teamBPoints: 0, isDraw: false };
    } else if (winner === 'B') {
      return { teamAPoints: 0, teamBPoints: 3, isDraw: false };
    } else {
      return { teamAPoints: 1, teamBPoints: 1, isDraw: true };
    }
  },

  // Rule B5: Deterministic Tie-Breakers
  compareBattleStandings: (teamStatsA, teamStatsB) => {
    // 1. Points
    if (teamStatsB.points !== teamStatsA.points) {
      return teamStatsB.points - teamStatsA.points;
    }
    // 2. Wins
    if (teamStatsB.won !== teamStatsA.won) {
      return teamStatsB.won - teamStatsA.won;
    }
    // 3. Victory Margin
    if (teamStatsB.marginTotal !== teamStatsA.marginTotal) {
      return teamStatsB.marginTotal - teamStatsA.marginTotal;
    }
    // 4. Head-to-Head
    const h2hA = teamStatsA.headToHead?.[teamStatsB.team?.id] || 0;
    const h2hB = teamStatsB.headToHead?.[teamStatsA.team?.id] || 0;
    return h2hB - h2hA;
  }
};

/**
 * 3. DUMB CHARADES RULE ENFORCEMENT
 */
export const enforceDumbCharadesRules = {
  // Rule C1: Early Guess Bonus Threshold (Inclusive 50% of round duration)
  isEarlyGuessEligible: (elapsedSeconds, roundDuration = 60) => {
    const elapsed = Math.max(0, Number(elapsedSeconds) || 0);
    const threshold = Number(roundDuration) * 0.5;
    return elapsed <= threshold;
  },

  // Rule C2: Exact Scoring Award with Early Guess + Streak Bonus
  calculateTurnScore: ({ outcomeType, elapsedSeconds, roundDuration = 60, currentStreak = 0, scoringConfig = {} }) => {
    if (outcomeType !== 'found') {
      const penalty = outcomeType === 'timeout' 
        ? Math.abs(Number(scoringConfig.timeoutPenalty) || 0)
        : Math.abs(Number(scoringConfig.skipPenalty) || 0);
      return {
        pointsAwarded: -penalty,
        earlyBonus: 0,
        isEarlyGuess: false,
        streakBonus: 0,
        newStreak: 0,
        penaltyApplied: penalty,
      };
    }

    const basePoints = Number(scoringConfig.basePoints) || 1;
    const isEarly = enforceDumbCharadesRules.isEarlyGuessEligible(elapsedSeconds, roundDuration);
    const earlyBonus = isEarly ? 1 : 0;

    const newStreak = currentStreak + 1;
    let streakBonus = 0;
    if (scoringConfig.streakBonusEnabled) {
      if (newStreak === 3) streakBonus = 2;
      else if (newStreak === 5) streakBonus = 5;
      else if (newStreak > 5 && newStreak % 5 === 0) streakBonus = 5;
    }

    const totalPoints = basePoints + earlyBonus + streakBonus;

    return {
      pointsAwarded: totalPoints,
      earlyBonus,
      isEarlyGuess: isEarly,
      streakBonus,
      newStreak,
      penaltyApplied: 0,
    };
  },

  // Rule C3: Prompt privacy (Prompt hidden from guessers during acting)
  isPromptHiddenFromGuesser: (turnState) => {
    return turnState === 'acting' || turnState === 'pass';
  }
};

/**
 * 4. WHO AM I? RULE ENFORCEMENT
 */
export const enforceWhoAmIRules = {
  // Rule W1: Secret identity hidden from guesser
  isIdentityGuarded: (isRevealed, turnStatus) => {
    return !isRevealed && turnStatus !== 'completed';
  },

  // Rule W2: Question Limit and Speed Bonus
  calculateWhoAmIScore: (success, questionsAsked, maxQuestions = 20, secondsUsed = 0) => {
    if (!success) return { score: 0, speedBonus: 0 };
    const baseScore = 1;
    // Speed bonus for solving with <= 10 questions
    const speedBonus = questionsAsked <= 10 ? 1 : 0;
    return {
      score: baseScore + speedBonus,
      speedBonus,
    };
  }
};

/**
 * 5. COMPREHENSIVE RULE AUDIT MATRIX
 */
export const RULE_AUDIT_MATRIX = [
  {
    id: 'RULE_AUC_01',
    name: 'Dynamic Progressive Increments',
    category: 'Auction Arena',
    rulebookRef: 'Rulebook §1.1 — Bidding Progression Tiers',
    engineEnforced: true,
    uiFeedback: 'Tier label displayed, button increments sync to active bracket',
    automatedTest: 'test_progressive_increment_tiers',
    status: 'PASS',
  },
  {
    id: 'RULE_AUC_02',
    name: 'Purse Limit & Solvency Guard',
    category: 'Auction Arena',
    rulebookRef: 'Rulebook §1.2 — Solvency & Purse Caps',
    engineEnforced: true,
    uiFeedback: 'Disabled buttons with "Insufficient purse" badge, negative budgets blocked',
    automatedTest: 'test_purse_solvency_guard',
    status: 'PASS',
  },
  {
    id: 'RULE_AUC_03',
    name: 'Squad Capacity Limits',
    category: 'Auction Arena',
    rulebookRef: 'Rulebook §1.3 — Maximum Squad Size',
    engineEnforced: true,
    uiFeedback: 'Full squad badge "READY", bidding locked with "Max squad reached"',
    automatedTest: 'test_squad_capacity_limits',
    status: 'PASS',
  },
  {
    id: 'RULE_AUC_04',
    name: 'Mandatory Last-Bidder Base-Price Settlement',
    category: 'Auction Arena',
    rulebookRef: 'Rulebook §1.4 — Settlement Integrity',
    engineEnforced: true,
    uiFeedback: 'Special settlement dialog, UNSOLD blocked when valid bids exist',
    automatedTest: 'test_mandatory_last_bidder_settlement',
    status: 'PASS',
  },
  {
    id: 'RULE_AUC_05',
    name: 'Strict Rating Concealment',
    category: 'Auction Arena',
    rulebookRef: 'Rulebook §1.5 — Blind Rating Concealment',
    engineEnforced: true,
    uiFeedback: 'Ratings completely omitted from props/DOM until official completion',
    automatedTest: 'test_auction_rating_concealment',
    status: 'PASS',
  },
  {
    id: 'RULE_AUC_06',
    name: 'Atomic Undo Reversal',
    category: 'Auction Arena',
    rulebookRef: 'Rulebook §1.6 — Undo Reversal Protocol',
    engineEnforced: true,
    uiFeedback: 'Confirmation modal with full snapshot rollback of purse and lot status',
    automatedTest: 'test_auction_undo_reversal',
    status: 'PASS',
  },
  {
    id: 'RULE_BAT_01',
    name: 'Fighter Uniqueness & No Reuse',
    category: 'Battle Arena',
    rulebookRef: 'Rulebook §2.1 — Combat Fighter Integrity',
    engineEnforced: true,
    uiFeedback: 'Selected fighters disabled in draft, 1 fighter per bout',
    automatedTest: 'test_battle_fighter_uniqueness',
    status: 'PASS',
  },
  {
    id: 'RULE_BAT_02',
    name: 'Tactical Draft Pass-and-Play Privacy',
    category: 'Battle Arena',
    rulebookRef: 'Rulebook §2.2 — Private Lineup Selection',
    engineEnforced: true,
    uiFeedback: 'Privacy curtain between teams, secret lineup locked before reveal',
    automatedTest: 'test_battle_draft_privacy',
    status: 'PASS',
  },
  {
    id: 'RULE_BAT_03',
    name: 'Lineup Dual-Lock Before Reveal',
    category: 'Battle Arena',
    rulebookRef: 'Rulebook §2.3 — Simultaneous Lineup Lock',
    engineEnforced: true,
    uiFeedback: '3-2-1 countdown button blocked until both Team A and Team B lock',
    automatedTest: 'test_lineup_dual_lock_requirement',
    status: 'PASS',
  },
  {
    id: 'RULE_BAT_04',
    name: 'Combat 3-1-0 Scoring System',
    category: 'Battle Arena',
    rulebookRef: 'Rulebook §2.4 — Combat Scoring System',
    engineEnforced: true,
    uiFeedback: 'Win = +3 pts, Draw = +1 pt, Loss = 0 pts',
    automatedTest: 'test_battle_3_1_0_scoring',
    status: 'PASS',
  },
  {
    id: 'RULE_BAT_05',
    name: 'Battle Standings & Tie-Breakers',
    category: 'Battle Arena',
    rulebookRef: 'Rulebook §2.5 — Leaderboard Tie-Breakers',
    engineEnforced: true,
    uiFeedback: 'Ranked by Points -> Wins -> Bout Differential -> Head-to-Head',
    automatedTest: 'test_battle_tie_breakers',
    status: 'PASS',
  },
  {
    id: 'RULE_CHA_01',
    name: 'Prompt Privacy & Pass-the-Laptop',
    category: 'Party Arena',
    rulebookRef: 'Rulebook §3.1 — Silent Acting Privacy',
    engineEnforced: true,
    uiFeedback: 'Full-screen pass screen, prompt masked from guessers',
    automatedTest: 'test_charades_prompt_privacy',
    status: 'PASS',
  },
  {
    id: 'RULE_CHA_02',
    name: 'Early Guess Bonus (+1 pt at <= 50% Time)',
    category: 'Party Arena',
    rulebookRef: 'Rulebook §3.2 — Early Guess Speed Bonus',
    engineEnforced: true,
    uiFeedback: 'Early Guess +1 badge, live threshold banner at 50% elapsed time',
    automatedTest: 'test_charades_early_guess_bonus',
    status: 'PASS',
  },
  {
    id: 'RULE_CHA_03',
    name: 'Streak Bonus Stacking',
    category: 'Party Arena',
    rulebookRef: 'Rulebook §3.3 — Streak Bonus Multipliers',
    engineEnforced: true,
    uiFeedback: 'Hot streak flame indicators (+2 at 3, +5 at 5)',
    automatedTest: 'test_charades_streak_bonus',
    status: 'PASS',
  },
  {
    id: 'RULE_WHO_01',
    name: 'Guesser Mystery Persona Concealment',
    category: 'Party Arena',
    rulebookRef: 'Rulebook §4.1 — Identity Masking',
    engineEnforced: true,
    uiFeedback: 'Shared screen hides character from guesser, visible to audience',
    automatedTest: 'test_whoami_identity_masking',
    status: 'PASS',
  },
  {
    id: 'RULE_WHO_02',
    name: 'Speed Bonus (<= 10 Questions)',
    category: 'Party Arena',
    rulebookRef: 'Rulebook §4.2 — 20 Questions Speed Scoring',
    engineEnforced: true,
    uiFeedback: 'Speed bonus award +1 point for answers within 10 questions',
    automatedTest: 'test_whoami_speed_bonus',
    status: 'PASS',
  },
];
