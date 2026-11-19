/**
 * Unit test for Battle Schedule & Multi-Team Validation
 */
const { generateBattleSchedule, validateSchedule } = require('../src/services/battleEngine.js');

function createMockTeams(count) {
  const teams = [];
  for (let i = 0; i < count; i++) {
    teams.push({
      id: `team_${i + 1}`,
      name: `Team ${i + 1}`,
      color: '#00D9FF',
      logo: '🛡️',
    });
  }
  return teams;
}

const testCases = [
  { teams: 2, squadSize: 3 },
  { teams: 2, squadSize: 5 },
  { teams: 3, squadSize: 3 },
  { teams: 3, squadSize: 5 },
  { teams: 4, squadSize: 3 },
  { teams: 4, squadSize: 6 },
  { teams: 5, squadSize: 5 },
  { teams: 6, squadSize: 3 },
  { teams: 6, squadSize: 5 },
  { teams: 8, squadSize: 4 },
  { teams: 8, squadSize: 7 },
  { teams: 10, squadSize: 5 },
  { teams: 10, squadSize: 9 },
];

let allPassed = true;

testCases.forEach(({ teams, squadSize }) => {
  const mockTeams = createMockTeams(teams);
  const schedule = generateBattleSchedule(mockTeams, squadSize);
  const result = validateSchedule(schedule, mockTeams, squadSize);

  if (result.valid) {
    console.log(`[PASS] ${teams} Teams, Squad ${squadSize}: ${result.totalMatches} matches total, ${result.matchesPerTeam} per team`);
  } else {
    allPassed = false;
    console.error(`[FAIL] ${teams} Teams, Squad ${squadSize}:`, result);
  }
});

if (allPassed) {
  console.log('\nAll Multi-Team Battle Schedule test cases PASSED!');
  process.exit(0);
} else {
  console.error('\nSome test cases FAILED!');
  process.exit(1);
}
