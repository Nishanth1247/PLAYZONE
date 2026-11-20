/**
 * Test Suite for Dumb Charades Early Guess Bonus & Scoring Integrity
 */

const assert = require('assert');

// Mock localStorage for Node.js environment
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

async function runTests() {
  console.log('=== DUMB CHARADES EARLY GUESS BONUS TEST SUITE ===\n');

  const { 
    createDumbCharadesTournament, 
    assignNextPromptAndConsume, 
    recordDumbCharadesTurnOutcome,
    undoLastTurnOutcome,
    isEarlyGuessEligible,
    getEarlyGuessThreshold
  } = await import('../src/services/party/dumbCharadesEngine.js');

  const mockPrompts = [
    { id: 'p1', title: 'Baahubali' },
    { id: 'p2', title: 'Vikram' },
    { id: 'p3', title: 'Leo' },
    { id: 'p4', title: 'Jailer' },
    { id: 'p5', title: 'Master' },
    { id: 'p6', title: 'Kaithi' },
    { id: 'p7', title: 'Mankatha' },
  ];

  const mockTeams = [
    { id: 't1', name: 'Team Alpha', color: '#8875A8', avatar: '👑' },
    { id: 't2', name: 'Team Beta', color: '#D97858', avatar: '🦁' },
  ];

  // Test 1: Threshold calculation
  assert.strictEqual(getEarlyGuessThreshold(60), 30);
  assert.strictEqual(getEarlyGuessThreshold(90), 45);
  assert.strictEqual(getEarlyGuessThreshold(45), 22.5);
  console.log('✓ PASS: Accurately calculates 50% threshold for variable round durations');

  // Test 2: Correct answer within first 50% (e.g. 15s elapsed out of 60s)
  let state = createDumbCharadesTournament({
    prompts: mockPrompts,
    selectedTeams: mockTeams,
    timerDuration: 60,
    scoringConfig: { basePoints: 1, streakBonusEnabled: false }
  });
  state = assignNextPromptAndConsume(state);
  // Guess at 15s (well under 30s)
  state = recordDumbCharadesTurnOutcome(state, 'found', 15);
  const outcome1 = state.lastTurnOutcome;
  assert.strictEqual(outcome1.isEarlyGuess, true, 'Should be flagged as early guess');
  assert.strictEqual(outcome1.earlyBonus, 1, 'Early bonus should be 1');
  assert.strictEqual(outcome1.points, 2, 'Total points should be 2 (1 base + 1 early)');
  assert.strictEqual(state.teamStats['t1'].score, 2, 'Team score should be 2');
  assert.strictEqual(state.teamStats['t1'].earlyGuesses, 1, 'Early guess count should be 1');
  console.log('✓ PASS: Awards +1 early-guess bonus when solved within first 50% of time (15s/60s)');

  // Test 3: Correct answer at EXACT 50% threshold (e.g. 30s elapsed out of 60s)
  state = assignNextPromptAndConsume(state); // Now Team Beta
  state = recordDumbCharadesTurnOutcome(state, 'found', 30);
  const outcome2 = state.lastTurnOutcome;
  assert.strictEqual(outcome2.isEarlyGuess, true, 'Exact 50% threshold must qualify');
  assert.strictEqual(outcome2.earlyBonus, 1, 'Early bonus should be 1');
  assert.strictEqual(outcome2.points, 2, 'Total points should be 2');
  assert.strictEqual(state.teamStats['t2'].score, 2, 'Team Beta score should be 2');
  console.log('✓ PASS: Awards bonus at exact 50% threshold (30s/60s)');

  // Test 4: Correct answer AFTER 50% threshold (e.g. 31s elapsed out of 60s)
  state = assignNextPromptAndConsume(state); // Team Alpha
  state = recordDumbCharadesTurnOutcome(state, 'found', 31);
  const outcome3 = state.lastTurnOutcome;
  assert.strictEqual(outcome3.isEarlyGuess, false, '31s/60s is after threshold, should not qualify');
  assert.strictEqual(outcome3.earlyBonus, 0, 'Early bonus should be 0');
  assert.strictEqual(outcome3.points, 1, 'Total points should be base only (1 pt)');
  assert.strictEqual(state.teamStats['t1'].score, 3, 'Team Alpha total score should be 3 (2 from turn 1 + 1 from turn 3)');
  console.log('✓ PASS: No early bonus awarded after 50% threshold (31s/60s)');

  // Test 5: Timeout → No early bonus
  state = assignNextPromptAndConsume(state); // Team Beta
  state = recordDumbCharadesTurnOutcome(state, 'timeout', 60);
  const outcome4 = state.lastTurnOutcome;
  assert.strictEqual(outcome4.isEarlyGuess, false);
  assert.strictEqual(outcome4.earlyBonus, 0);
  assert.strictEqual(outcome4.points, 0);
  console.log('✓ PASS: Timeout receives no early bonus');

  // Test 6: Skip / Not Found → No early bonus
  state = assignNextPromptAndConsume(state); // Team Alpha
  state = recordDumbCharadesTurnOutcome(state, 'not_found', 10);
  const outcome5 = state.lastTurnOutcome;
  assert.strictEqual(outcome5.isEarlyGuess, false);
  assert.strictEqual(outcome5.earlyBonus, 0);
  assert.strictEqual(outcome5.points, 0);
  console.log('✓ PASS: Skipped prompt within 10s receives no early bonus');

  // Test 7: Early Guess PLUS Streak Bonus
  let streakState = createDumbCharadesTournament({
    prompts: mockPrompts,
    selectedTeams: [mockTeams[0]], // Single team for streak testing
    timerDuration: 60,
    scoringConfig: { basePoints: 1, streakBonusEnabled: true }
  });
  // Turn 1: Correct (streak 1)
  streakState = assignNextPromptAndConsume(streakState);
  streakState = recordDumbCharadesTurnOutcome(streakState, 'found', 40); // normal
  // Turn 2: Correct (streak 2)
  streakState = assignNextPromptAndConsume(streakState);
  streakState = recordDumbCharadesTurnOutcome(streakState, 'found', 40); // normal
  // Turn 3: Correct + Early Guess + 3-streak bonus! (+1 base, +1 early, +2 streak = 4 pts)
  streakState = assignNextPromptAndConsume(streakState);
  streakState = recordDumbCharadesTurnOutcome(streakState, 'found', 12);
  const streakOutcome = streakState.lastTurnOutcome;
  assert.strictEqual(streakOutcome.isEarlyGuess, true);
  assert.strictEqual(streakOutcome.earlyBonus, 1);
  assert.strictEqual(streakOutcome.streakBonus, 2);
  assert.strictEqual(streakOutcome.points, 4, '1 base + 1 early + 2 streak = 4 pts');
  console.log('✓ PASS: Combined early guess (+1) and streak bonus (+2) correctly awards 4 total pts');

  // Test 8: Anti-Duplicate Settlement (re-calling settlement with no active prompt)
  const frozenState = { ...streakState, activePrompt: null };
  const doubleSettled = recordDumbCharadesTurnOutcome(frozenState, 'found', 10);
  assert.strictEqual(doubleSettled, frozenState, 'Duplicate settlement must be rejected safely');
  console.log('✓ PASS: Anti-duplicate settlement prevents repeated calls without active prompt');

  // Test 9: Undo reverses early bonus exactly
  const beforeUndoScore = streakState.teamStats['t1'].score;
  const beforeUndoEarlyGuesses = streakState.teamStats['t1'].earlyGuesses;
  const revertedState = undoLastTurnOutcome(streakState);
  assert.strictEqual(revertedState.teamStats['t1'].score, beforeUndoScore - 4, 'Score reverted by 4 pts');
  assert.strictEqual(revertedState.teamStats['t1'].earlyGuesses, beforeUndoEarlyGuesses - 1, 'Early guesses count decremented');
  console.log('✓ PASS: Undo cleanly reverses points and early bonus tracking');

  // Test 10: Variable timer duration (30s round → 15s threshold)
  let shortTimerState = createDumbCharadesTournament({
    prompts: mockPrompts,
    selectedTeams: mockTeams,
    timerDuration: 30,
    scoringConfig: { basePoints: 1 }
  });
  shortTimerState = assignNextPromptAndConsume(shortTimerState);
  // Guess at 14s (under 15s threshold of 30s)
  shortTimerState = recordDumbCharadesTurnOutcome(shortTimerState, 'found', 14);
  assert.strictEqual(shortTimerState.lastTurnOutcome.isEarlyGuess, true, '14s in a 30s round qualifies');
  // Guess at 16s (over 15s threshold of 30s)
  shortTimerState = assignNextPromptAndConsume(shortTimerState);
  shortTimerState = recordDumbCharadesTurnOutcome(shortTimerState, 'found', 16);
  assert.strictEqual(shortTimerState.lastTurnOutcome.isEarlyGuess, false, '16s in a 30s round does NOT qualify');
  console.log('✓ PASS: Variable round durations properly calculate custom threshold (30s round → 15s threshold)');

  console.log('\n=======================================');
  console.log('TEST SUMMARY: 10 Passed, 0 Failed');
  console.log('=======================================');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
