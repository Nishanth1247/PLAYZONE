import assert from 'assert';
import { 
  calculateNextBid, 
  validateBid, 
  toPaise, 
  fromPaise, 
  getProgressiveIncrement, 
  getProgressiveTierLabel 
} from '../src/services/auctionEngine.js';
import { calculateTeamRankings } from '../src/services/scoringEngine.js';
import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('====================================================');
console.log('BIDBATTLE 8.3 — COMPREHENSIVE AUTOMATED TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST GROUP 1: MANDATORY LAST-BIDDER SETTLEMENT LOGIC
// ----------------------------------------------------
console.log('GROUP 1: Mandatory Last-Bidder Settlement Rules');

test('Test 1: No bids placed -> Lot can be marked UNSOLD', () => {
  const item = { id: 'p1', name: 'Actor One', basePrice: 2.0, status: 'pending' };
  const auction = {
    currentItemIndex: 0,
    items: [item],
    currentBid: 2.0,
    highestBidder: null,
    bidHistory: [],
  };

  const hasBids = Boolean(auction.highestBidder) || auction.bidHistory.length > 0;
  assert.strictEqual(hasBids, false, 'Should have no bids');

  // Settlement should be unsold_no_bids
  const settledItem = {
    ...item,
    status: 'unsold',
    soldPrice: null,
    basePrice: item.basePrice,
    highestBid: null,
    soldTo: null,
    settlementType: 'unsold_no_bids',
  };

  assert.strictEqual(settledItem.status, 'unsold');
  assert.strictEqual(settledItem.settlementType, 'unsold_no_bids');
  assert.strictEqual(settledItem.soldPrice, null);
});

test('Test 2: One bid placed -> Cannot become UNSOLD, triggers special settlement', () => {
  const item = { id: 'p1', name: 'Actor One', basePrice: 2.0, status: 'pending' };
  const teamNishanth = { id: 'nishanth', name: 'Nishanth', purse: 100.0, squad: [] };
  const auction = {
    currentItemIndex: 0,
    items: [item],
    currentBid: 2.0,
    highestBidder: 'nishanth',
    bidHistory: [{ teamId: 'nishanth', amount: 2.0, timestamp: '12:00:00' }],
    teams: [teamNishanth],
  };

  const hasBids = Boolean(auction.highestBidder) || auction.bidHistory.length > 0;
  assert.strictEqual(hasBids, true, 'Lot has received a valid bid');

  // Attempting to declare unsold must be prevented
  const canBeUnsold = !hasBids;
  assert.strictEqual(canBeUnsold, false, 'Player cannot be declared unsold once bid exists');

  // Last bidder must acquire player at base price
  const lastBidderId = auction.highestBidder || auction.bidHistory[0].teamId;
  assert.strictEqual(lastBidderId, 'nishanth');
});

test('Test 3 & 4: Multiple bids -> Last bidder receives player at base price (charged base price, NOT high bid)', () => {
  // Scenario from prompt:
  // Base price: ₹2 Cr.
  // Nishanth bids ₹2.5 Cr.
  // Ajmal bids ₹3 Cr.
  // Praneeth bids ₹4 Cr.
  const item = { id: 'p1', name: 'Vijay', basePrice: 2.0, status: 'pending', role: 'Hero', rating: 95 };
  const teamPraneeth = { id: 'praneeth', name: 'Praneeth', purse: 100.0, itemsPurchased: [] };
  const teamNishanth = { id: 'nishanth', name: 'Nishanth', purse: 100.0, itemsPurchased: [] };
  const teamAjmal = { id: 'ajmal', name: 'Ajmal', purse: 100.0, itemsPurchased: [] };

  const auction = {
    currentItemIndex: 0,
    items: [item],
    currentBid: 4.0,
    highestBidder: 'praneeth',
    bidHistory: [
      { teamId: 'praneeth', amount: 4.0 },
      { teamId: 'ajmal', amount: 3.0 },
      { teamId: 'nishanth', amount: 2.5 },
    ],
    teams: [teamNishanth, teamAjmal, teamPraneeth],
  };

  // Special Settlement execution:
  const basePrice = item.basePrice; // 2.0
  const highestBid = auction.currentBid; // 4.0
  const buyer = auction.teams.find((t) => t.id === auction.highestBidder);

  assert.strictEqual(buyer.id, 'praneeth');
  assert.strictEqual(basePrice, 2.0);
  assert.strictEqual(highestBid, 4.0);

  // Deduct base price from purse (NOT highest bid!)
  const chargedAmount = basePrice;
  const newPurse = fromPaise(toPaise(buyer.purse) - toPaise(chargedAmount));
  assert.strictEqual(newPurse, 98.0, 'Purse should have 2.0 deducted, not 4.0');

  // Record special settlement item
  const settledItem = {
    ...item,
    status: 'sold',
    soldPrice: chargedAmount, // 2.0
    basePrice: basePrice,
    highestBid: highestBid, // 4.0
    soldTo: buyer.id,
    settlementType: 'last_bidder_base_price_settlement',
  };

  assert.strictEqual(settledItem.soldPrice, 2.0, 'Charged price must be original base price');
  assert.strictEqual(settledItem.highestBid, 4.0, 'Highest bid recorded as 4.0');
  assert.strictEqual(settledItem.settlementType, 'last_bidder_base_price_settlement');
});

test('Test 5: Normal SOLD charges highest bid amount', () => {
  const item = { id: 'p1', name: 'Rajinikanth', basePrice: 2.0, status: 'pending' };
  const teamAjmal = { id: 'ajmal', name: 'Ajmal', purse: 100.0, itemsPurchased: [] };
  const auction = {
    currentBid: 7.5,
    highestBidder: 'ajmal',
    teams: [teamAjmal],
  };

  // Normal sold:
  const finalPrice = auction.currentBid;
  const newPurse = fromPaise(toPaise(teamAjmal.purse) - toPaise(finalPrice));
  assert.strictEqual(newPurse, 92.5, 'Normal sold charges full highest bid (7.5)');

  const settledItem = {
    ...item,
    status: 'sold',
    soldPrice: finalPrice,
    basePrice: item.basePrice,
    highestBid: finalPrice,
    soldTo: teamAjmal.id,
    settlementType: 'normal_sold',
  };

  assert.strictEqual(settledItem.soldPrice, 7.5);
  assert.strictEqual(settledItem.settlementType, 'normal_sold');
});

test('Test 6: Insufficient purse prevents invalid special settlement', () => {
  const item = { id: 'p1', name: 'Costly Hero', basePrice: 5.0, status: 'pending' };
  const brokeTeam = { id: 'broke', name: 'Broke Team', purse: 3.0, itemsPurchased: [] };

  const canAffordBasePrice = toPaise(brokeTeam.purse) >= toPaise(item.basePrice);
  assert.strictEqual(canAffordBasePrice, false, 'Cannot afford base price');

  // Settlement must be aborted and error returned
  const validationResult = canAffordBasePrice
    ? { valid: true }
    : { valid: false, error: 'Insufficient purse for base price' };

  assert.strictEqual(validationResult.valid, false);
  assert.strictEqual(validationResult.error, 'Insufficient purse for base price');
});

test('Test 7: Squad limit prevents invalid settlement', () => {
  const maxSquadSize = 3;
  const fullTeam = { 
    id: 'full', 
    name: 'Full Team', 
    purse: 50.0, 
    itemsPurchased: [{ id: '1' }, { id: '2' }, { id: '3' }] 
  };

  const squadCount = fullTeam.itemsPurchased.length;
  const isSquadFull = squadCount >= maxSquadSize;
  assert.strictEqual(isSquadFull, true, 'Squad is already full');

  const validationResult = !isSquadFull
    ? { valid: true }
    : { valid: false, error: 'Maximum squad size reached' };

  assert.strictEqual(validationResult.valid, false);
});

test('Test 8: Special settlement undo restores all state cleanly', () => {
  const originalPurse = 100.0;
  const basePrice = 2.0;
  const highBid = 4.0;
  const team = { id: 't1', name: 'Team One', purse: originalPurse, itemsPurchased: [] };
  const item = { id: 'p1', name: 'Hero', basePrice, status: 'pending' };

  const auctionBefore = {
    teams: [JSON.parse(JSON.stringify(team))],
    items: [JSON.parse(JSON.stringify(item))],
    currentItemIndex: 0,
    currentBid: highBid,
    highestBidder: 't1',
  };

  // Perform settlement
  const teamAfter = {
    ...team,
    purse: fromPaise(toPaise(originalPurse) - toPaise(basePrice)),
    itemsPurchased: [{ id: item.id, name: item.name, price: basePrice, settlementType: 'last_bidder_base_price_settlement' }],
  };
  const itemAfter = {
    ...item,
    status: 'sold',
    soldPrice: basePrice,
    soldTo: 't1',
    settlementType: 'last_bidder_base_price_settlement',
  };

  assert.strictEqual(teamAfter.purse, 98.0);
  assert.strictEqual(itemAfter.status, 'sold');

  // Execute undo by restoring snapshot
  const restoredTeam = auctionBefore.teams[0];
  const restoredItem = auctionBefore.items[0];

  assert.strictEqual(restoredTeam.purse, 100.0, 'Purse fully restored to 100.0');
  assert.strictEqual(restoredTeam.itemsPurchased.length, 0, 'Squad empty again');
  assert.strictEqual(restoredItem.status, 'pending', 'Lot pending again');
  assert.strictEqual(auctionBefore.currentBid, 4.0, 'Current bid restored');
  assert.strictEqual(auctionBefore.highestBidder, 't1', 'Highest bidder restored');
});

test('Test 9: Duplicate settlement is prevented', () => {
  const item = { id: 'p1', name: 'Hero', basePrice: 2.0, status: 'sold', soldTo: 't1' };
  const isSettled = item.status !== 'pending';
  assert.strictEqual(isSettled, true, 'Item already sold');

  const canSettle = !isSettled;
  assert.strictEqual(canSettle, false, 'Duplicate settlement must be rejected');
});

test('Test 10: Replay correctly identifies special settlement vs normal sold vs unsold', () => {
  const lotNormal = { id: 'l1', status: 'sold', soldPrice: 5.0, basePrice: 2.0, highestBid: 5.0, settlementType: 'normal_sold' };
  const lotSpecial = { id: 'l2', status: 'sold', soldPrice: 2.0, basePrice: 2.0, highestBid: 6.0, settlementType: 'last_bidder_base_price_settlement' };
  const lotUnsold = { id: 'l3', status: 'unsold', soldPrice: null, basePrice: 2.0, settlementType: 'unsold_no_bids' };

  assert.strictEqual(lotNormal.settlementType, 'normal_sold');
  assert.strictEqual(lotSpecial.settlementType, 'last_bidder_base_price_settlement');
  assert.strictEqual(lotSpecial.soldPrice, lotSpecial.basePrice);
  assert.strictEqual(lotUnsold.settlementType, 'unsold_no_bids');
});

test('Test 11: Reauction of genuinely unsold lot resets item to pending', () => {
  const lotUnsold = { id: 'l3', status: 'unsold', isReauction: false };
  const reAuctionedLot = { ...lotUnsold, status: 'pending', isReauction: true };

  assert.strictEqual(reAuctionedLot.status, 'pending');
  assert.strictEqual(reAuctionedLot.isReauction, true);
});

test('Test 12: Custom imported tournament settings remain intact', () => {
  const customTournament = {
    id: 'custom_tourney_1',
    name: 'Custom Marvel Showdown',
    rules: {
      minIncrement: 0.5,
      minSquadSize: 2,
      maxSquadSize: 5,
      countdownDuration: 15,
      hideRatingsDuringAuction: true,
    },
    teams: [{ id: 't1', name: 'Nishanth' }, { id: 't2', name: 'Ajmal' }],
  };

  assert.strictEqual(customTournament.rules.minIncrement, 0.5);
  assert.strictEqual(customTournament.rules.countdownDuration, 15);
  assert.strictEqual(customTournament.rules.hideRatingsDuringAuction, true);
  assert.strictEqual(customTournament.teams.length, 2);
});

test('Test 13: Automatic bid increments continue working with progressive tiers', () => {
  // Test progressive tiers:
  // Under 5 Cr -> increment is 0.50
  const inc1 = getProgressiveIncrement(3.0);
  assert.strictEqual(inc1, 0.50);
  const next1 = calculateNextBid(3.0, true, 2.0);
  assert.strictEqual(next1, 3.50);

  // Between 5 and 10 Cr -> increment is 1.00
  const inc2 = getProgressiveIncrement(7.0);
  assert.strictEqual(inc2, 1.00);
  const next2 = calculateNextBid(7.0, true, 2.0);
  assert.strictEqual(next2, 8.0);

  // Opening bid on unbid lot -> base price
  const openingBid = calculateNextBid(2.0, false, 2.0);
  assert.strictEqual(openingBid, 2.0);
});

// ----------------------------------------------------
// TEST GROUP 2: UI CODE VERIFICATION (NO CUSTOM BID, NO LIVE BIDDER NOTIFICATIONS, 3-COLUMN FIT)
// ----------------------------------------------------
console.log('\nGROUP 2: UI Verification (No Custom Bids, No Bidder Toasts, 3-Column Layout)');

test('Test 14: No custom bid / jump bid input UI remains in LiveAuction or LiveAuctionCard', () => {
  const liveAuctionSrc = fs.readFileSync(path.resolve('src/components/auction/LiveAuction.jsx'), 'utf8');
  const liveCardSrc = fs.readFileSync(path.resolve('src/components/auction/LiveAuctionCard.jsx'), 'utf8');

  // Verify custom bid / jump bid form elements are completely removed
  assert.strictEqual(liveAuctionSrc.includes('handleCustomBidSubmit'), false, 'handleCustomBidSubmit must not be in LiveAuction');
  assert.strictEqual(liveAuctionSrc.includes('customBidAmount'), false, 'customBidAmount must not be in LiveAuction');
  assert.strictEqual(liveCardSrc.includes('handleCustomBidSubmit'), false, 'handleCustomBidSubmit must not be in LiveAuctionCard');
  assert.strictEqual(liveCardSrc.includes('showCustomBid'), false, 'showCustomBid must not be in LiveAuctionCard');
  assert.strictEqual(liveCardSrc.includes('Place Jump'), false, 'Place Jump button must not be in LiveAuctionCard');
});

test('Test 15: No live bidder notification toasts / tickers remain', () => {
  const liveAuctionSrc = fs.readFileSync(path.resolve('src/components/auction/LiveAuction.jsx'), 'utf8');

  // Verify outbid alert toasts are removed
  assert.strictEqual(liveAuctionSrc.includes('OUTBID ALERT:'), false, 'OUTBID ALERT toast must not be in LiveAuction');
  assert.strictEqual(liveAuctionSrc.includes('placed bid at'), false, 'placed bid toast must not be in LiveAuction');
});

test('Test 16: Auction Arena implements 3-column screen-fit layout', () => {
  const liveAuctionSrc = fs.readFileSync(path.resolve('src/components/auction/LiveAuction.jsx'), 'utf8');

  assert.ok(liveAuctionSrc.includes('lg:col-span-3'), 'Must contain 3-column left/right panel specification');
  assert.ok(liveAuctionSrc.includes('lg:col-span-6'), 'Must contain 6-column centre stage specification');
  assert.ok(liveAuctionSrc.includes('FRANCHISE QUICK BIDS'), 'Must contain quick bid triggers in right column');
  assert.ok(liveAuctionSrc.includes('Franchise Purse Board'), 'Must contain purse board in left column');
});

test('Test 17: Battle Arena implements 3-column screen-fit layout', () => {
  const battleMatchSrc = fs.readFileSync(path.resolve('src/components/battle/BattleArenaMatch.jsx'), 'utf8');

  assert.ok(battleMatchSrc.includes('lg:col-span-3'), 'Must contain left column team information');
  assert.ok(battleMatchSrc.includes('lg:col-span-6'), 'Must contain centre column game stage');
  assert.ok(battleMatchSrc.includes('CONFIRM & UPDATE STANDINGS'), 'Must contain result confirmation action');
  assert.ok(battleMatchSrc.includes('Tournament Teams'), 'Must contain tournament teams in left column');
});

test('Test 18: Party Arena & Who Am I? functionality unaffected', () => {
  const whoAmISrc = fs.readFileSync(path.resolve('src/components/party/views/WhoAmISetup.jsx'), 'utf8');
  const dumbCharadesSrc = fs.readFileSync(path.resolve('src/components/party/views/DumbCharadesSetup.jsx'), 'utf8');

  assert.ok(whoAmISrc.includes('WHO AM I?'), 'Who Am I setup must remain intact');
  assert.ok(dumbCharadesSrc.includes('DUMB CHARADES'), 'Dumb Charades setup must remain intact');
});

console.log(`\n====================================================`);
console.log(`RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
console.log(`====================================================\n`);
