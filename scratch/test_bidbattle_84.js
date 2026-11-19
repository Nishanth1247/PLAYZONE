import { 
  generateBattleSchedule, 
  validateSchedule, 
  evaluateBattleMatch, 
  calculateLeaderboard,
  getTeamMatchSlotIndex
} from '../src/services/battleEngine.js';
import { FIXED_TEAMS } from '../src/services/presets.js';

console.log('=== BIDBATTLE 8.4 VERIFICATION SUITE ===');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    testsFailed++;
  }
}

// -------------------------------------------------------------
// TEST 1: Schedule Generation & Slot Indexing (2 Teams)
// -------------------------------------------------------------
const twoTeams = [FIXED_TEAMS[0], FIXED_TEAMS[1]]; // Nishanth vs Ajmal
const squadSize = 3;
const schedule2 = generateBattleSchedule(twoTeams, squadSize);

assert(schedule2.length === squadSize, `2 Teams should generate exactly ${squadSize} matches (got ${schedule2.length})`);
assert(schedule2[0].teamAId === twoTeams[0].id, 'Match 1 Team A is Nishanth');
assert(schedule2[0].teamBId === twoTeams[1].id, 'Match 1 Team B is Ajmal');

// Check slot index calculation
for (let i = 0; i < schedule2.length; i++) {
  const slotA = getTeamMatchSlotIndex(schedule2, i, twoTeams[0].id);
  const slotB = getTeamMatchSlotIndex(schedule2, i, twoTeams[1].id);
  assert(slotA === i, `Match ${i + 1} Slot A index is ${i}`);
  assert(slotB === i, `Match ${i + 1} Slot B index is ${i}`);
}

// -------------------------------------------------------------
// TEST 2: Tactical Lineups Evaluation & Standings (3-1-0 Rule)
// -------------------------------------------------------------
const mockSquadA = [
  { id: 'f_a1', name: 'Commander A1', rating: 92 },
  { id: 'f_a2', name: 'Soldier A2', rating: 75 },
  { id: 'f_a3', name: 'Tactician A3', rating: 85 },
];
const mockSquadB = [
  { id: 'f_b1', name: 'Titan B1', rating: 88 },
  { id: 'f_b2', name: 'Striker B2', rating: 82 },
  { id: 'f_b3', name: 'Defender B3', rating: 70 },
];

// Tactical order:
// Nishanth: f_a1, f_a2, f_a3
// Ajmal: f_b3, f_b1, f_b2
const lineupA = ['f_a1', 'f_a2', 'f_a3'];
const lineupB = ['f_b3', 'f_b1', 'f_b2'];

// Match 1: f_a1 (92) vs f_b3 (70) -> Team A should win
const match1Eval = evaluateBattleMatch(mockSquadA[0], mockSquadB[2]);
assert(match1Eval.winner === 'A', 'Match 1: Commander A1 (92) beats Defender B3 (70)');

// Match 2: f_a2 (75) vs f_b1 (88) -> Team B should win
const match2Eval = evaluateBattleMatch(mockSquadA[1], mockSquadB[0]);
assert(match2Eval.winner === 'B', 'Match 2: Titan B1 (88) beats Soldier A2 (75)');

// Match 3: f_a3 (85) vs f_b2 (82)
const match3Eval = evaluateBattleMatch(mockSquadA[2], mockSquadB[1]);
assert(match3Eval.winner === 'A' || match3Eval.winner === 'B' || match3Eval.winner === 'draw', 'Match 3 evaluated successfully');

// Leaderboard calculation
const completedMatches = [
  {
    ...schedule2[0],
    teamAPlayer: mockSquadA[0],
    teamBPlayer: mockSquadB[2],
    winnerId: twoTeams[0].id,
    isDraw: false,
    scoreDiff: match1Eval.diff,
  },
  {
    ...schedule2[1],
    teamAPlayer: mockSquadA[1],
    teamBPlayer: mockSquadB[0],
    winnerId: twoTeams[1].id,
    isDraw: false,
    scoreDiff: match2Eval.diff,
  },
];

const leaderboard = calculateLeaderboard(twoTeams, completedMatches);
assert(leaderboard.length === 2, 'Leaderboard has 2 teams');
const teamALeader = leaderboard.find(e => e.team.id === twoTeams[0].id);
const teamBLeader = leaderboard.find(e => e.team.id === twoTeams[1].id);
assert(teamALeader.points === 3, `Team A has 3 points for 1 win (got ${teamALeader.points})`);
assert(teamBLeader.points === 3, `Team B has 3 points for 1 win (got ${teamBLeader.points})`);
assert(teamALeader.won === 1 && teamALeader.lost === 1, 'Team A record is 1W-1L');
assert(teamBLeader.won === 1 && teamBLeader.lost === 1, 'Team B record is 1W-1L');

// -------------------------------------------------------------
// TEST 3: Multi-Team Schedule (4 Teams)
// -------------------------------------------------------------
const fourTeams = FIXED_TEAMS;
const schedule4 = generateBattleSchedule(fourTeams, 3);
const valid4 = validateSchedule(schedule4, fourTeams, 3);
assert(valid4.valid, '4 Teams schedule is valid and balanced');

// Check slot index consistency for 4 teams
for (const team of fourTeams) {
  const matchesForTeam = schedule4.filter(m => m.teamAId === team.id || m.teamBId === team.id);
  assert(matchesForTeam.length === 3, `Team ${team.name} plays exactly 3 matches`);
  for (let slot = 0; slot < matchesForTeam.length; slot++) {
    const matchIndex = schedule4.indexOf(matchesForTeam[slot]);
    const computedSlot = getTeamMatchSlotIndex(schedule4, matchIndex, team.id);
    assert(computedSlot === slot, `Team ${team.name} Match at index ${matchIndex} has slot index ${slot}`);
  }
}

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=======================================');
console.log(`RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('=======================================');

if (testsFailed > 0) {
  process.exit(1);
}
