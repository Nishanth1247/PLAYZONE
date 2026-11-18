// BIDBATTLE 7.2 — Core Auction Math, Progressive Increments & Modes Engine

export const DEFAULT_INCREMENTS = [0.5, 1.0, 2.0, 5.0, 10.0];

// Fixed precision conversion to avoid floating-point inaccuracies
export const toPaise = (val) => Math.round(Number(val || 0) * 100);
export const fromPaise = (paise) => Number((paise / 100).toFixed(2));

/**
 * AUCTION MODES CONFIGURATION
 */
export const AUCTION_MODES = {
  standard: {
    id: 'standard',
    name: 'Standard Arena',
    description: '20s countdown timer, ₹100 Cr purse, max 8 squad lots.',
    timerDuration: 20,
    defaultPurse: 100,
    maxSquadSize: 8,
    badge: 'Classic 20s',
    badgeVariant: 'purple',
    accentColor: '#9147FF',
  },
  quick: {
    id: 'quick',
    name: 'Blitz Auction',
    description: '10s fast countdown, instant pace and fast transitions.',
    timerDuration: 10,
    defaultPurse: 100,
    maxSquadSize: 8,
    badge: 'Blitz 10s',
    badgeVariant: 'orange',
    accentColor: '#FF8A35',
  },
  marathon: {
    id: 'marathon',
    name: 'Marathon Arena',
    description: '35s deliberate countdown, strategic long bidding wars.',
    timerDuration: 35,
    defaultPurse: 100,
    maxSquadSize: 10,
    badge: 'Marathon 35s',
    badgeVariant: 'cyan',
    accentColor: '#00D9FF',
  },
  sudden_death: {
    id: 'sudden_death',
    name: 'Sudden Death',
    description: '10s timer, high-pressure ₹50 Cr purse limit, tight 4 squad cap.',
    timerDuration: 10,
    defaultPurse: 50,
    maxSquadSize: 4,
    badge: 'Sudden Death 10s',
    badgeVariant: 'red',
    accentColor: '#EF4444',
  },
};

/**
 * AUTOMATIC PROGRESSIVE INCREMENT CALCULATOR
 * Strict tier breakdown:
 * - < ₹5 Cr: +₹0.50 Cr
 * - ₹5 Cr to < ₹10 Cr: +₹1.00 Cr
 * - ₹10 Cr to < ₹25 Cr: +₹2.00 Cr
 * - ₹25 Cr to < ₹50 Cr: +₹5.00 Cr
 * - >= ₹50 Cr: +₹10.00 Cr
 */
export const getProgressiveIncrement = (bidAmount) => {
  const paise = toPaise(bidAmount);
  if (paise < 500) return 0.50;   // < 5 Cr
  if (paise < 1000) return 1.00;  // 5 to < 10 Cr
  if (paise < 2500) return 2.00;  // 10 to < 25 Cr
  if (paise < 5000) return 5.00;  // 25 to < 50 Cr
  return 10.00;                   // >= 50 Cr
};

export const getProgressiveTierLabel = (bidAmount) => {
  const paise = toPaise(bidAmount);
  if (paise < 500) return 'Tier 1 (< ₹5 Cr → +₹0.50 Cr)';
  if (paise < 1000) return 'Tier 2 (₹5–10 Cr → +₹1.00 Cr)';
  if (paise < 2500) return 'Tier 3 (₹10–25 Cr → +₹2.00 Cr)';
  if (paise < 5000) return 'Tier 4 (₹25–50 Cr → +₹5.00 Cr)';
  return 'Tier 5 (≥ ₹50 Cr → +₹10.00 Cr)';
};

/**
 * Calculates the next valid bid for a franchise using progressive increments.
 * If no bid has been placed yet on this lot, the opening bid is the base price.
 * If a bid already exists, next bid = currentBid + getProgressiveIncrement(currentBid).
 * Flexible parameter ordering handles both modern and legacy call signatures seamlessly.
 */
export const calculateNextBid = (currentBid, arg2, arg3, arg4) => {
  let hasHighestBidder = false;
  let basePrice = 1.0;
  let manualIncrement = null;

  if (typeof arg2 === 'boolean') {
    hasHighestBidder = arg2;
    basePrice = arg3;
    manualIncrement = arg4;
  } else if (typeof arg3 === 'boolean') {
    manualIncrement = arg2;
    hasHighestBidder = arg3;
    basePrice = arg4;
  } else {
    hasHighestBidder = Boolean(arg2);
    basePrice = arg3;
  }

  if (!hasHighestBidder) {
    return fromPaise(toPaise(basePrice || currentBid));
  }

  const inc = (manualIncrement !== null && manualIncrement !== undefined && !isNaN(manualIncrement))
    ? Number(manualIncrement)
    : getProgressiveIncrement(currentBid);

  const currentPaise = toPaise(currentBid);
  const incPaise = toPaise(inc);
  return fromPaise(currentPaise + incPaise);
};

/**
 * Central bid validation function
 */
export const validateBid = ({ auction, teamId, targetAmount }) => {
  if (!auction || auction.status !== 'in_progress') {
    return { valid: false, reason: 'Auction is not currently active' };
  }

  const team = auction.teams?.find((t) => t.id === teamId);
  if (!team) {
    return { valid: false, reason: 'Franchise not found' };
  }

  // 1. Anti-self-bidding: highest bidder cannot outbid themselves
  if (auction.rules?.antiSelfBidding && auction.highestBidder === teamId) {
    return { 
      valid: false, 
      reason: `${team.name} is already the highest bidder`,
      code: 'SELF_BIDDING'
    };
  }

  // 2. Squad size limit
  const currentSquadCount = (auction.items || []).filter((i) => i.soldTo === teamId).length;
  const maxSquad = Number(auction.rules?.maxSquadSize) || 8;
  if (currentSquadCount >= maxSquad) {
    return { 
      valid: false, 
      reason: `${team.name} reached maximum squad limit (${maxSquad} lots)`,
      code: 'SQUAD_FULL'
    };
  }

  // 3. Amount sanity
  const numAmount = Number(targetAmount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { 
      valid: false, 
      reason: 'Bid amount must be a positive number',
      code: 'INVALID_AMOUNT'
    };
  }

  const targetPaise = toPaise(numAmount);
  const currentPaise = toPaise(auction.currentBid);
  const basePaise = toPaise(auction.items?.[auction.currentItemIndex]?.basePrice || 1.0);

  // 4. Greater than current bid check
  if (auction.highestBidder) {
    if (targetPaise <= currentPaise) {
      return { 
        valid: false, 
        reason: `Bid must be strictly higher than current highest bid (${auction.currency?.symbol || '₹'}${auction.currentBid} Cr)`,
        code: 'BELOW_CURRENT'
      };
    }
  } else {
    // Opening bid must be at least base price
    if (targetPaise < basePaise) {
      return { 
        valid: false, 
        reason: `Opening bid must be at least the base price of ${auction.currency?.symbol || '₹'}${auction.items?.[auction.currentItemIndex]?.basePrice} Cr`,
        code: 'BELOW_BASE'
      };
    }
  }

  // 5. Remaining purse check
  const teamPursePaise = toPaise(team.purse);
  if (teamPursePaise < targetPaise) {
    return { 
      valid: false, 
      reason: `Insufficient purse: ${team.name} has ${auction.currency?.symbol || '₹'}${team.purse} Cr, needs ${auction.currency?.symbol || '₹'}${numAmount} Cr`,
      code: 'INSUFFICIENT_PURSE'
    };
  }

  return { 
    valid: true, 
    team, 
    amount: fromPaise(targetPaise) 
  };
};

/**
 * Calculates health status of team's purse for UI indicators
 */
export const getPurseHealth = (currentPurse, initialPurse) => {
  const init = Number(initialPurse) || 1;
  const curr = Number(currentPurse) || 0;
  const percentage = Math.max(0, Math.min(100, Math.round((curr / init) * 100)));

  if (percentage > 55) {
    return { status: 'healthy', color: 'green', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500', percentage };
  }
  if (percentage >= 25) {
    return { status: 'moderate', color: 'orange', textClass: 'text-amber-400', bgClass: 'bg-amber-500', percentage };
  }
  return { status: 'critical', color: 'red', textClass: 'text-rose-400', bgClass: 'bg-rose-500', percentage };
};
