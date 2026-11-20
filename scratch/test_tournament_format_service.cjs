// scratch/test_tournament_format_service.cjs
// Automated Unit Tests for tournamentFormatService.js

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Load tournamentFormatService dynamically
const servicePath = path.join(__dirname, '..', 'src', 'services', 'tournamentFormatService.js');
let code = fs.readFileSync(servicePath, 'utf8');

// Strip ES module syntax
code = code.replace(/export\s+const\s+(\w+)\s*=/g, 'const $1 =');
code = code.replace(/export\s+function\s+(\w+)/g, 'function $1');
code = code.replace(/export\s+default\s+\w+;/g, '');
code += '\nmodule.exports = { tournamentFormatService, FORMAT_TYPES, estimateMatchCount, generateTournamentBracket, advanceMatchResult, seedFranchises };';

const moduleObj = { exports: {} };
const fn = new Function('module', 'exports', 'console', code);
fn(moduleObj, moduleObj.exports, console);
const { tournamentFormatService, FORMAT_TYPES, estimateMatchCount, generateTournamentBracket, advanceMatchResult } = moduleObj.exports;

console.log('🧪 Starting PLAYZONE Tournament Format & Championship Bracket Engine Test Suite...\n');

let passCount = 0;
let totalCount = 0;

function runTest(name, testFn) {
  totalCount++;
  try {
    testFn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}\n   Stack: ${err.stack}`);
  }
}

// Prepare sample franchises
const createFranchises = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `team_${i + 1}`,
    name: `Team ${String.fromCharCode(65 + i)}`,
    color: ['#D4B879', '#00D9FF', '#FF8A35', '#9147FF', '#B7F34A', '#E5C158', '#71999B', '#8875A8'][i % 8],
    logo: ['👑', '⚡', '🔥', '🛡️', '🎬', '🏏', '⚽', '🎮'][i % 8],
  }));
};

// TEST 1: League / Round Robin with 4 teams
runTest('Round Robin (4 teams) generates exactly 6 matches (4*(4-1)/2)', () => {
  const franchises = createFranchises(4);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_rr_4',
    format: FORMAT_TYPES.ROUND_ROBIN,
    franchises,
    config: { roundRobinType: 'single' },
  });

  assert.strictEqual(bracket.stages.length, 1);
  const matches = bracket.stages[0].matches;
  assert.strictEqual(matches.length, 6, '4 teams single round robin must have 6 matches');
  assert.strictEqual(bracket.standings.length, 4);

  // Each team must appear in exactly 3 matches
  const appearances = {};
  matches.forEach((m) => {
    appearances[m.teamAId] = (appearances[m.teamAId] || 0) + 1;
    appearances[m.teamBId] = (appearances[m.teamBId] || 0) + 1;
  });
  franchises.forEach((f) => {
    assert.strictEqual(appearances[f.id], 3, `${f.name} should play exactly 3 matches`);
  });
});

// TEST 2: League / Round Robin with ODD teams (5 teams) with fair byes
runTest('Round Robin (5 teams, odd count) generates fair schedule with byes', () => {
  const franchises = createFranchises(5);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_rr_5',
    format: FORMAT_TYPES.ROUND_ROBIN,
    franchises,
    config: { roundRobinType: 'single' },
  });

  const matches = bracket.stages[0].matches;
  // 5 * 4 / 2 = 10 matches
  assert.strictEqual(matches.length, 10, '5 teams single round robin must have 10 matches');

  // Each team must play exactly 4 matches (1 bye per round)
  const appearances = {};
  matches.forEach((m) => {
    appearances[m.teamAId] = (appearances[m.teamAId] || 0) + 1;
    appearances[m.teamBId] = (appearances[m.teamBId] || 0) + 1;
  });
  franchises.forEach((f) => {
    assert.strictEqual(appearances[f.id], 4, `${f.name} should play exactly 4 matches in 5-team league`);
  });
});

// TEST 3: Round Robin Match Progression & Standings Calculation (3-1-0 points)
runTest('Round Robin match progression calculates 3-1-0 standings accurately', () => {
  const franchises = createFranchises(3);
  let bracket = generateTournamentBracket({
    tournamentId: 'tourn_rr_3',
    format: FORMAT_TYPES.ROUND_ROBIN,
    franchises,
    config: { pointsWin: 3, pointsDraw: 1, pointsLoss: 0 },
  });

  // Match 1: Team 1 (A) vs Team 2 (B) -> Team 1 wins 85 - 80
  const m1 = bracket.stages[0].matches[0];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: m1.id,
    result: {
      winnerId: m1.teamAId,
      loserId: m1.teamBId,
      isDraw: false,
      teamAScore: 85,
      teamBScore: 80,
    },
    allFranchises: franchises,
  });

  const standA = bracket.standings.find((s) => s.id === m1.teamAId);
  const standB = bracket.standings.find((s) => s.id === m1.teamBId);
  assert.strictEqual(standA.points, 3, 'Winner should get 3 pts');
  assert.strictEqual(standA.won, 1);
  assert.strictEqual(standB.points, 0, 'Loser should get 0 pts');
  assert.strictEqual(standB.lost, 1);

  // Match 2: Draw between Team 2 and Team 3 -> 75 - 75
  const m2 = bracket.stages[0].matches[1];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: m2.id,
    result: {
      winnerId: null,
      isDraw: true,
      teamAScore: 75,
      teamBScore: 75,
    },
    allFranchises: franchises,
  });

  const stand2 = bracket.standings.find((s) => s.id === m2.teamAId);
  const stand3 = bracket.standings.find((s) => s.id === m2.teamBId);
  assert.ok(stand2.drawn >= 1);
  assert.ok(stand3.drawn >= 1);
  assert.strictEqual(stand3.points, 1, 'Draw awards 1 pt');
});

// TEST 4: Single Elimination (8 teams power of 2)
runTest('Single Elimination (8 teams) generates Quarter Finals, Semi Finals, and Final', () => {
  const franchises = createFranchises(8);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_se_8',
    format: FORMAT_TYPES.SINGLE_ELIMINATION,
    franchises,
    config: { thirdPlacePlayoff: true },
  });

  // Stages: QF (4 matches), SF (2 matches), Final (1 match), 3rd Place (1 match) = 8 matches total
  assert.strictEqual(bracket.stages.length, 4);
  assert.strictEqual(bracket.stages[0].name, 'Quarter Finals');
  assert.strictEqual(bracket.stages[0].matches.length, 4);
  assert.strictEqual(bracket.stages[1].name, 'Semi Finals');
  assert.strictEqual(bracket.stages[1].matches.length, 2);
  assert.strictEqual(bracket.stages[2].name, 'Championship Final');
  assert.strictEqual(bracket.stages[2].matches.length, 1);
  assert.strictEqual(bracket.stages[3].name, '3rd Place Playoff');
  assert.strictEqual(bracket.stages[3].matches.length, 1);
});

// TEST 5: Single Elimination with NON-POWER OF TWO (6 teams) with fair byes
runTest('Single Elimination (6 teams) gives fair byes to top 2 seeds into Semi-Finals', () => {
  const franchises = createFranchises(6);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_se_6',
    format: FORMAT_TYPES.SINGLE_ELIMINATION,
    franchises,
    config: { thirdPlacePlayoff: false },
  });

  // 6 teams: nearest power of 2 is 8. Byes = 2.
  assert.strictEqual(bracket.formatConfig.byesCount, 2);
  const r1Matches = bracket.stages[0].matches;
  assert.strictEqual(r1Matches.length, 4);

  // Exactly 2 matches have autoBye = true
  const byeMatches = r1Matches.filter((m) => m.autoBye);
  assert.strictEqual(byeMatches.length, 2, 'Top 2 seeds receive automatic byes');

  // Playable round 1 matches
  const playableR1 = r1Matches.filter((m) => !m.autoBye);
  assert.strictEqual(playableR1.length, 2, 'Remaining 4 teams battle in 2 matches');
  playableR1.forEach((m) => {
    assert.strictEqual(m.status, 'ready', 'Playable R1 matches should be ready');
  });
});

// TEST 6: Single Elimination Winner Progression from Round 1 to Champion
runTest('Single Elimination progresses winners to Semi-Finals and Final to crown Champion', () => {
  const franchises = createFranchises(4);
  let bracket = generateTournamentBracket({
    tournamentId: 'tourn_se_4',
    format: FORMAT_TYPES.SINGLE_ELIMINATION,
    franchises,
    config: { thirdPlacePlayoff: true },
  });

  // Semi-Final 1: Team 1 vs Team 4 -> Team 1 wins
  const sf1 = bracket.stages[0].matches[0];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: sf1.id,
    result: { winnerId: 'team_1', loserId: 'team_4', teamAScore: 90, teamBScore: 82 },
    allFranchises: franchises,
  });

  // Semi-Final 2: Team 2 vs Team 3 -> Team 2 wins
  const sf2 = bracket.stages[0].matches[1];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: sf2.id,
    result: { winnerId: 'team_2', loserId: 'team_3', teamAScore: 88, teamBScore: 85 },
    allFranchises: franchises,
  });

  // Final match should now be ready with Team 1 vs Team 2
  const finalMatch = bracket.stages[1].matches[0];
  assert.strictEqual(finalMatch.status, 'ready', 'Final match must be ready');
  assert.strictEqual(finalMatch.teamAId, 'team_1');
  assert.strictEqual(finalMatch.teamBId, 'team_2');

  // 3rd Place match should be ready with Team 4 vs Team 3
  const thirdMatch = bracket.stages[2].matches[0];
  assert.strictEqual(thirdMatch.status, 'ready', '3rd place playoff must be ready');
  assert.strictEqual(thirdMatch.teamAId, 'team_4');
  assert.strictEqual(thirdMatch.teamBId, 'team_3');

  // Final: Team 1 beats Team 2 -> Team 1 is Champion!
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: finalMatch.id,
    result: { winnerId: 'team_1', loserId: 'team_2', teamAScore: 95, teamBScore: 89 },
    allFranchises: franchises,
  });

  assert.strictEqual(bracket.championId, 'team_1');
  assert.strictEqual(bracket.runnerUpId, 'team_2');
});

// TEST 7: Double Elimination Winners and Losers Bracket Structure (4 teams)
runTest('Double Elimination (4 teams) generates WB, LB, and Grand Final with reset option', () => {
  const franchises = createFranchises(4);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_de_4',
    format: FORMAT_TYPES.DOUBLE_ELIMINATION,
    franchises,
    config: { resetFinal: true },
  });

  // Stages: WB R1, WB Final, LB R1, LB Final, Grand Final
  const stageTypes = bracket.stages.map((s) => s.type);
  assert.ok(stageTypes.includes('winners_knockout'));
  assert.ok(stageTypes.includes('losers_knockout'));
  assert.ok(stageTypes.includes('grand_final'));

  // Initial WB R1 matches must be ready
  const wbR1 = bracket.stages.find((s) => s.id === 'stage_de_wb_r1');
  assert.strictEqual(wbR1.matches.length, 2);
  assert.strictEqual(wbR1.matches[0].status, 'ready');
  assert.strictEqual(wbR1.matches[1].status, 'ready');
});

// TEST 8: Double Elimination Progression & Grand Final Reset Rule
runTest('Double Elimination drops first loss to Losers Bracket and triggers Grand Final Reset when LB wins', () => {
  const franchises = createFranchises(4);
  let bracket = generateTournamentBracket({
    tournamentId: 'tourn_de_4',
    format: FORMAT_TYPES.DOUBLE_ELIMINATION,
    franchises,
    config: { resetFinal: true },
  });

  // WB R1: Match 1: Team 1 vs Team 4 -> Team 1 wins, Team 4 drops to LB
  const wbR1_m1 = bracket.stages[0].matches[0];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: wbR1_m1.id,
    result: { winnerId: 'team_1', loserId: 'team_4', teamAScore: 90, teamBScore: 80 },
    allFranchises: franchises,
  });

  // WB R1: Match 2: Team 2 vs Team 3 -> Team 2 wins, Team 3 drops to LB
  const wbR1_m2 = bracket.stages[0].matches[1];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: wbR1_m2.id,
    result: { winnerId: 'team_2', loserId: 'team_3', teamAScore: 85, teamBScore: 78 },
    allFranchises: franchises,
  });

  // Losers Bracket R1 should now have Team 4 vs Team 3!
  const lbStage = bracket.stages.find((s) => s.id.includes('lb_r1'));
  const lbMatch = lbStage.matches[0];
  assert.strictEqual(lbMatch.teamAId, 'team_4');
  assert.strictEqual(lbMatch.teamBId, 'team_3');
  assert.strictEqual(lbMatch.status, 'ready');

  // LB R1: Team 4 beats Team 3 (Team 3 gets 2nd loss -> eliminated!)
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: lbMatch.id,
    result: { winnerId: 'team_4', loserId: 'team_3', teamAScore: 82, teamBScore: 79 },
    allFranchises: franchises,
  });
  assert.ok(bracket.eliminatedTeamIds.includes('team_3'), 'Team 3 eliminated after 2nd defeat');

  // WB Final: Team 1 beats Team 2 -> Team 1 advances to Grand Final (0 losses), Team 2 drops to LB Final (1 loss)
  const wbFinalStage = bracket.stages.find((s) => s.id === 'stage_de_wb_r2');
  const wbFinal = wbFinalStage.matches[0];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: wbFinal.id,
    result: { winnerId: 'team_1', loserId: 'team_2', teamAScore: 94, teamBScore: 88 },
    allFranchises: franchises,
  });

  // LB Final: Team 4 vs Team 2 -> Team 4 wins! (Team 2 eliminated, Team 4 advances to Grand Final with 1 loss)
  const lbFinalStage = bracket.stages.find((s) => s.id === 'stage_de_lb_r2');
  const lbFinal = lbFinalStage.matches[0];
  assert.strictEqual(lbFinal.status, 'ready');
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: lbFinal.id,
    result: { winnerId: 'team_4', loserId: 'team_2', teamAScore: 89, teamBScore: 85 },
    allFranchises: franchises,
  });
  assert.ok(bracket.eliminatedTeamIds.includes('team_2'));

  // Grand Final: Team 1 (WB champ, 0 losses) vs Team 4 (LB champ, 1 loss)
  const gfStage = bracket.stages.find((s) => s.id === 'stage_de_grand_final');
  const gfMatch = gfStage.matches[0];
  assert.strictEqual(gfMatch.teamAId, 'team_1');
  assert.strictEqual(gfMatch.teamBId, 'team_4');
  assert.strictEqual(gfMatch.status, 'ready');

  // Team 4 (from LB) WINS the Grand Final! Because Team 1 had 0 losses, Team 1 now has 1 loss.
  // This MUST trigger the Grand Final Reset match!
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: gfMatch.id,
    result: { winnerId: 'team_4', loserId: 'team_1', teamAScore: 80, teamBScore: 85 },
    allFranchises: franchises,
  });

  const updatedGfStage = bracket.stages.find((s) => s.id === 'stage_de_grand_final');
  const resetMatch = updatedGfStage.matches[1];
  assert.ok(resetMatch, 'Grand Final Reset match must exist');
  assert.strictEqual(resetMatch.status, 'ready', 'Grand Final Reset match must be triggered and READY');

  // Play Grand Final Reset: Team 1 wins the sudden death -> Team 1 is Champion!
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: resetMatch.id,
    result: { winnerId: 'team_1', loserId: 'team_4', teamAScore: 98, teamBScore: 92 },
    allFranchises: franchises,
  });

  assert.strictEqual(bracket.championId, 'team_1');
  assert.strictEqual(bracket.runnerUpId, 'team_4');
});

// TEST 9: Group Stage + Knockout (8 teams, 2 groups of 4, top 2 qualify to Semi-Finals)
runTest('Group Stage + Knockout generates 2 groups and advances top 2 into knockout bracket', () => {
  const franchises = createFranchises(8);
  let bracket = generateTournamentBracket({
    tournamentId: 'tourn_gsk_8',
    format: FORMAT_TYPES.GROUP_STAGE_KNOCKOUT,
    franchises,
    config: { groupCount: 2, qualifyCountPerGroup: 2, thirdPlacePlayoff: true },
  });

  assert.ok(bracket.groups.A);
  assert.ok(bracket.groups.B);
  assert.strictEqual(bracket.groups.A.teams.length, 4);
  assert.strictEqual(bracket.groups.B.teams.length, 4);

  // Play all group matches to conclude group stage
  const groupMatches = bracket.stages.filter((s) => s.type === 'group_stage').flatMap((s) => s.matches);
  assert.strictEqual(groupMatches.length, 12, '4 teams per group = 6 matches * 2 groups = 12 matches');

  // Settle all group matches
  groupMatches.forEach((m, idx) => {
    bracket = advanceMatchResult({
      bracketData: bracket,
      matchId: m.id,
      result: {
        winnerId: m.teamAId,
        loserId: m.teamBId,
        isDraw: false,
        teamAScore: 80 + idx,
        teamBScore: 70 + idx,
      },
      allFranchises: franchises,
    });
  });

  // Verify Knockout Semi-Finals are unlocked
  const sfStage = bracket.stages.find((s) => s.id === 'stage_knockout_sf');
  assert.ok(sfStage, 'Knockout Semi-Finals stage exists');
  const sfMatches = sfStage.matches;
  assert.strictEqual(sfMatches.length, 2);
  assert.strictEqual(sfMatches[0].status, 'ready', 'SF 1 should be ready with qualified teams');
  assert.strictEqual(sfMatches[1].status, 'ready', 'SF 2 should be ready with qualified teams');
});

// TEST 10: Anti-Duplicate Settlement & Prerequisite Validation
runTest('Anti-duplicate protection prevents repeated settlement of completed matches', () => {
  const franchises = createFranchises(4);
  let bracket = generateTournamentBracket({
    tournamentId: 'tourn_se_anti_dup',
    format: FORMAT_TYPES.SINGLE_ELIMINATION,
    franchises,
  });

  const m1 = bracket.stages[0].matches[0];
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: m1.id,
    result: { winnerId: 'team_1', loserId: 'team_4', teamAScore: 80, teamBScore: 70 },
    allFranchises: franchises,
  });

  assert.strictEqual(bracket.completedMatchesCount, 1);

  // Re-advancing same match with different winner must be ignored
  bracket = advanceMatchResult({
    bracketData: bracket,
    matchId: m1.id,
    result: { winnerId: 'team_4', loserId: 'team_1', teamAScore: 99, teamBScore: 10 },
    allFranchises: franchises,
  });

  assert.strictEqual(bracket.completedMatchesCount, 1);
  const m1Checked = bracket.stages[0].matches[0];
  assert.strictEqual(m1Checked.winnerId, 'team_1', 'Original winner must be preserved');
});

// TEST 11: 2-team head-to-head format
runTest('Round Robin (2 teams) generates single head-to-head clash', () => {
  const franchises = createFranchises(2);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_rr_2',
    format: FORMAT_TYPES.ROUND_ROBIN,
    franchises,
    config: { roundRobinType: 'single' },
  });
  assert.strictEqual(bracket.stages[0].matches.length, 1);
  assert.strictEqual(bracket.stages[0].matches[0].teamAId, 'team_1');
  assert.strictEqual(bracket.stages[0].matches[0].teamBId, 'team_2');
});

// TEST 12: 10-team league format
runTest('Round Robin (10 teams) generates exactly 45 matches (10*9/2)', () => {
  const franchises = createFranchises(10);
  const bracket = generateTournamentBracket({
    tournamentId: 'tourn_rr_10',
    format: FORMAT_TYPES.ROUND_ROBIN,
    franchises,
    config: { roundRobinType: 'single' },
  });
  assert.strictEqual(bracket.stages[0].matches.length, 45);
});

console.log(`\n📊 RESULTS: ${passCount} / ${totalCount} tests passed.`);
if (passCount === totalCount) {
  console.log('🎉 ALL TOURNAMENT FORMAT & BRACKET ENGINE TESTS PASSED CLEANLY!\n');
  process.exit(0);
} else {
  console.error('⚠️ SOME TESTS FAILED!\n');
  process.exit(1);
}
