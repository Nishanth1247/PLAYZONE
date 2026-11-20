// scratch/test_statistics_service.cjs
// Comprehensive Unit Test Suite for statisticsService.js

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

// 1. Prepare sample tournament data matching real schema
const sampleTournaments = [
  {
    id: 'tourn-s1-cup',
    name: 'Season 1 Grand Cup',
    season: 'Season 1',
    status: 'completed',
    gameModes: ['auction', 'battle'],
    franchiseIds: ['team-nishanth', 'team-ajmal', 'team-praneeth'],
    franchisesSnapshot: [
      { id: 'team-nishanth', name: 'Nishanth', color: '#8875A8', startingPurse: 100, purse: 31.5, squadCount: 3 },
      { id: 'team-ajmal', name: 'Ajmal', color: '#D97858', startingPurse: 100, purse: 31.5, squadCount: 3 },
      { id: 'team-praneeth', name: 'Praneeth', color: '#4D908E', startingPurse: 100, purse: 35.0, squadCount: 3 }
    ],
    results: {
      championTeamId: 'team-nishanth',
      championTeamName: 'Nishanth',
      runnerUpTeamId: 'team-ajmal',
      runnerUpTeamName: 'Ajmal',
      completedAt: '2026-10-15T18:00:00Z'
    },
    arenaState: {
      auction: {
        items: [
          {
            id: 'lot-1',
            name: 'Rajinikanth',
            role: 'Superstar Hero',
            basePrice: 2.0,
            soldPrice: 38.5,
            status: 'sold',
            soldTo: 'team-nishanth',
            buyerName: 'Nishanth',
            settlementType: 'normal'
          },
          {
            id: 'lot-2',
            name: 'Kamal Haasan',
            role: 'Ulaganayagan',
            basePrice: 2.0,
            soldPrice: 32.0,
            status: 'sold',
            soldTo: 'team-ajmal',
            buyerName: 'Ajmal',
            settlementType: 'normal'
          },
          {
            id: 'lot-3',
            name: 'Vikram',
            role: 'Chiyaan Chameleon',
            basePrice: 1.5,
            soldPrice: 1.5,
            status: 'sold',
            soldTo: 'team-nishanth',
            buyerName: 'Nishanth',
            settlementType: 'mandatory_last_bidder'
          },
          {
            id: 'lot-4',
            name: 'Silambarasan TR',
            role: 'Little Superstar',
            basePrice: 1.0,
            soldPrice: 0,
            status: 'unsold'
          }
        ]
      },
      battle: {
        completedMatches: [
          {
            matchId: 'm-1',
            teamAId: 'team-nishanth',
            teamBId: 'team-ajmal',
            teamAName: 'Nishanth',
            teamBName: 'Ajmal',
            scoreA: 88,
            scoreB: 84,
            winnerId: 'team-nishanth',
            isDraw: false
          },
          {
            matchId: 'm-2',
            teamAId: 'team-ajmal',
            teamBId: 'team-praneeth',
            teamAName: 'Ajmal',
            teamBName: 'Praneeth',
            scoreA: 86,
            scoreB: 82,
            winnerId: 'team-ajmal',
            isDraw: false
          },
          {
            matchId: 'm-3',
            teamAId: 'team-nishanth',
            teamBId: 'team-praneeth',
            teamAName: 'Nishanth',
            teamBName: 'Praneeth',
            scoreA: 92,
            scoreB: 85,
            winnerId: 'team-nishanth',
            isDraw: false
          }
        ]
      }
    }
  },
  {
    id: 'tourn-s2-open',
    name: 'Season 2 Open',
    season: 'Season 2',
    status: 'completed',
    gameModes: ['auction', 'battle'],
    franchiseIds: ['team-nishanth', 'team-ajmal'],
    franchisesSnapshot: [
      { id: 'team-nishanth', name: 'Nishanth', color: '#8875A8' },
      { id: 'team-ajmal', name: 'Ajmal', color: '#D97858' }
    ],
    results: {
      championTeamId: 'team-ajmal',
      championTeamName: 'Ajmal',
      runnerUpTeamId: 'team-nishanth',
      runnerUpTeamName: 'Nishanth',
      completedAt: '2026-11-01T18:00:00Z'
    },
    arenaState: {
      auction: {
        items: [
          {
            id: 'lot-s2-1',
            name: 'Vijay',
            role: 'Thalapathy',
            basePrice: 2.0,
            soldPrice: 40.0,
            status: 'sold',
            soldTo: 'team-ajmal',
            buyerName: 'Ajmal',
            settlementType: 'normal'
          }
        ]
      },
      battle: {
        completedMatches: [
          {
            matchId: 'm-s2-1',
            teamAId: 'team-ajmal',
            teamBId: 'team-nishanth',
            teamAName: 'Ajmal',
            teamBName: 'Nishanth',
            scoreA: 95,
            scoreB: 90,
            winnerId: 'team-ajmal',
            isDraw: false
          }
        ]
      }
    }
  }
];

const samplePartyState = {
  teamStats: {
    'team-1': { teamName: 'Red Dragons', score: 12 },
    'team-2': { teamName: 'Blue Titans', score: 8 }
  },
  turnHistory: [
    { teamName: 'Red Dragons', result: 'found', isEarlyGuess: true, earlyBonus: 1 },
    { teamName: 'Red Dragons', result: 'found', isEarlyGuess: true, earlyBonus: 1 },
    { teamName: 'Red Dragons', result: 'found', isEarlyGuess: false },
    { teamName: 'Blue Titans', result: 'found', isEarlyGuess: true, earlyBonus: 1 },
    { teamName: 'Blue Titans', result: 'skipped' },
    { teamName: 'Blue Titans', result: 'timeout' }
  ]
};

localStorage.setItem('playzone_tournaments', JSON.stringify(sampleTournaments));
localStorage.setItem('playzone_dumb_charades_state', JSON.stringify(samplePartyState));

// Mocks for dependencies of statisticsService
const mockTournamentHubService = {
  getAllTournaments: () => {
    const raw = localStorage.getItem('playzone_tournaments');
    return raw ? JSON.parse(raw) : [];
  }
};

const mockFranchiseService = {
  getAllFranchises: () => [
    { id: 'team-nishanth', name: 'Nishanth', color: '#8875A8' },
    { id: 'team-ajmal', name: 'Ajmal', color: '#D97858' },
    { id: 'team-praneeth', name: 'Praneeth', color: '#4D908E' }
  ]
};

const mockDumbCharadesEngine = {
  getSavedDumbCharadesState: () => {
    const raw = localStorage.getItem('playzone_dumb_charades_state');
    return raw ? JSON.parse(raw) : null;
  }
};

// Load and evaluate statisticsService.js with dependencies injected
const statsFilePath = path.join(__dirname, '..', 'src', 'services', 'statisticsService.js');
let code = fs.readFileSync(statsFilePath, 'utf8');

// Strip ES6 imports and exports
code = code.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
code = code.replace(/export\s+const\s+statisticsService\s*=/, 'const statisticsService =');
code += '\nreturn statisticsService;';

const serviceFactory = new Function(
  'tournamentHubService',
  'franchiseService',
  'getSavedDumbCharadesState',
  'localStorage',
  code
);

const statisticsService = serviceFactory(
  mockTournamentHubService,
  mockFranchiseService,
  mockDumbCharadesEngine.getSavedDumbCharadesState,
  localStorageMock
);

console.log('🧪 Running Playzone Statistics Service Verification Suite...\n');

let passCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// TEST 1: Overview Calculations
runTest('getStatistics returns complete Overview metrics', () => {
  const stats = statisticsService.getStatistics();
  const ov = stats.overview;
  assert.strictEqual(ov.totalCompletedTournaments, 2, 'Should have 2 completed tournaments');
  assert.strictEqual(ov.totalBattleMatches, 4, 'Should have 4 completed battle matches');
  assert.strictEqual(ov.totalAuctionTransactions, 5, 'Should count 5 auction lots');
  assert.strictEqual(stats.auctionRecords.totalNormalSold, 3, 'Should count 3 normal sales');
  assert.strictEqual(stats.auctionRecords.totalSpecialSettlement, 1, 'Should count 1 special settlement (Vikram)');
  assert.strictEqual(stats.auctionRecords.totalUnsold, 1, 'Should count 1 unsold lot');
});

// TEST 2: Franchise Rankings & Standings Points
runTest('Franchise rankings assigns correct titles and battle points', () => {
  const stats = statisticsService.getStatistics();
  const rankings = stats.franchiseRankings;
  assert.strictEqual(rankings.length, 3, 'Should rank 3 franchises');

  // Nishanth: 1 title (S1), 1 runner-up (S2), matches: 2 wins in S1 (vs Ajmal, vs Praneeth), 1 loss in S2 (vs Ajmal) => 2W 1L => 6 pts
  const nishanth = rankings.find(r => r.id === 'team-nishanth');
  assert.ok(nishanth, 'Nishanth found');
  assert.strictEqual(nishanth.titles, 1, 'Nishanth has 1 title');
  assert.strictEqual(nishanth.runnerUps, 1, 'Nishanth has 1 runner-up');
  assert.strictEqual(nishanth.wins, 2, 'Nishanth has 2 battle wins');
  assert.strictEqual(nishanth.losses, 1, 'Nishanth has 1 battle loss');
  assert.strictEqual(nishanth.battlePoints, 6, '2 wins * 3 pts = 6 battle points');

  // Ajmal: 1 title (S2), 1 runner-up (S1), matches: 1 win in S1, 1 loss in S1, 1 win in S2 => 2W 1L => 6 pts
  const ajmal = rankings.find(r => r.id === 'team-ajmal');
  assert.ok(ajmal, 'Ajmal found');
  assert.strictEqual(ajmal.titles, 1, 'Ajmal has 1 title');
  assert.strictEqual(ajmal.runnerUps, 1, 'Ajmal has 1 runner-up');
  assert.strictEqual(ajmal.wins, 2, 'Ajmal has 2 battle wins');
  assert.strictEqual(ajmal.battlePoints, 6, '2 wins * 3 pts = 6 battle points');

  // Praneeth: 0W 2L => 0 pts
  const praneeth = rankings.find(r => r.id === 'team-praneeth');
  assert.ok(praneeth, 'Praneeth found');
  assert.strictEqual(praneeth.wins, 0);
  assert.strictEqual(praneeth.losses, 2);
  assert.strictEqual(praneeth.battlePoints, 0);
});

// TEST 3: Auction Records & Settlement Distinction
runTest('Auction records identifies highest sale, bargain, and special last-bidder settlement', () => {
  const stats = statisticsService.getStatistics();
  const ar = stats.auctionRecords;
  assert.ok(ar.mostExpensivePlayer, 'Most expensive player exists');
  assert.strictEqual(ar.mostExpensivePlayer.name, 'Vijay', 'Highest sale was Vijay at 40.0 Cr');
  assert.strictEqual(ar.mostExpensivePlayer.soldPrice, 40.0);
  assert.strictEqual(ar.totalSpecialSettlement, 1, 'Special settlement count is 1');
  assert.ok(ar.biggestBargain, 'Biggest bargain exists');
  assert.strictEqual(ar.biggestBargain.name, 'Vikram', 'Special settlement was Vikram (sold at base price)');
});

// TEST 4: Battle Records
runTest('Battle records tracks top scoring matches and victory margins', () => {
  const stats = statisticsService.getStatistics();
  const br = stats.battleRecords;
  assert.ok(br.highestScoringMatch, 'Highest score match exists');
  const totalPoints = br.highestScoringMatch.scoreA + br.highestScoringMatch.scoreB;
  assert.strictEqual(totalPoints, 185, 'Combined score is 95 + 90 = 185 by Ajmal and Nishanth in S2');
});

// TEST 5: Player Records
runTest('Player records aggregates appearances, roles, and acquisition cost', () => {
  const stats = statisticsService.getStatistics();
  const pr = stats.playerRecords;
  assert.ok(Array.isArray(pr), 'playerRecords is an array');
  assert.strictEqual(pr.length, 4, 'Should record 4 acquired players');
  const rajini = pr.find(p => p.name === 'Rajinikanth');
  assert.ok(rajini, 'Rajinikanth in records');
  assert.strictEqual(rajini.highestPrice, 38.5);
  assert.strictEqual(rajini.timesAcquired, 1);
});

// TEST 6: Head to Head Rivalry
runTest('getHeadToHead computes accurate encounter history between any two teams', () => {
  const h2h = statisticsService.getHeadToHead('team-nishanth', 'team-ajmal');
  assert.ok(h2h, 'H2H exists');
  assert.strictEqual(h2h.totalEncounters, 2, 'Met 2 times');
  assert.strictEqual(h2h.winsA, 1, 'Nishanth won 1');
  assert.strictEqual(h2h.winsB, 1, 'Ajmal won 1');
  assert.strictEqual(h2h.draws, 0, '0 draws');
  assert.strictEqual(h2h.winRateA, 50, '50% win rate');
  assert.strictEqual(h2h.winRateB, 50, '50% win rate');
  assert.strictEqual(h2h.encounters.length, 2);
});

// TEST 7: Filtering by Season
runTest('Season filtering isolates Season 1 records correctly', () => {
  const s1Stats = statisticsService.getStatistics({ season: 'Season 1' });
  assert.strictEqual(s1Stats.overview.totalCompletedTournaments, 1);
  assert.strictEqual(s1Stats.overview.totalBattleMatches, 3);
  assert.strictEqual(s1Stats.overview.totalAuctionTransactions, 4);
});

// TEST 8: Party records includes early guesses and bonus metrics
runTest('Party records accurately summarizes Dumb Charades early guess bonuses', () => {
  const stats = statisticsService.getStatistics();
  const party = stats.partyRecords;
  assert.strictEqual(party.totalDumbCharadesSessions, 1);
  assert.strictEqual(party.totalEarlyGuesses, 3, 'Red Dragons (2) + Blue Titans (1) = 3 early guesses');
  assert.strictEqual(party.totalEarlyBonusPoints, 3, '3 bonus points awarded');
  assert.strictEqual(party.highestTeamScore, 12);
  assert.strictEqual(party.bestTeamName, 'Red Dragons');
});

// TEST 9: Snapshot Preservation - historical stats immune to future franchise renames
runTest('Completed tournament records use immutable franchisesSnapshot', () => {
  const stats = statisticsService.getStatistics();
  const tourn = stats.tournamentHistory.find(t => t.id === 'tourn-s1-cup');
  assert.ok(tourn, 'Tournament history found');
  assert.ok(tourn.franchisesSnapshot, 'Snapshot exists');
  assert.strictEqual(tourn.franchisesSnapshot.length, 3);
  assert.strictEqual(tourn.franchisesSnapshot[0].name, 'Nishanth');
});

console.log(`\n📊 RESULTS: ${passCount} / ${totalCount} tests passed.`);
if (passCount === totalCount) {
  console.log('🎉 ALL PLAYZONE STATISTICS TESTS PASSED CLEANLY!\n');
  process.exit(0);
} else {
  console.error('⚠️ SOME TESTS FAILED!\n');
  process.exit(1);
}
