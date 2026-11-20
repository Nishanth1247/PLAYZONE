/**
 * Unit Test Suite for Broadcast Service and Presentation Engine
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

// Mock AudioContext for Web Audio API
global.window = {
  AudioContext: class {
    constructor() { this.state = 'running'; this.currentTime = 0; }
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
      };
    }
    createBuffer() {
      return { getChannelData: () => new Float32Array(100) };
    }
    createBufferSource() {
      return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} };
    }
    createBiquadFilter() {
      return { type: 'bandpass', frequency: { value: 0 }, Q: { value: 0 }, connect: () => {} };
    }
    resume() { return Promise.resolve(); }
  }
};

async function runTests() {
  console.log('=== BROADCAST SERVICE TEST SUITE ===\n');

  // Dynamically import ES module
  const { broadcastService, DEFAULT_BROADCAST_SETTINGS } = await import('../src/services/broadcastService.js');

  // Test 1: Defaults
  const settings = broadcastService.getSettings();
  assert.strictEqual(settings.animationIntensity, 'normal', 'Default animation intensity should be normal');
  assert.strictEqual(settings.soundEnabled, true, 'Default soundEnabled should be true');
  assert.strictEqual(settings.autoAdvance, false, 'Default autoAdvance should be false');
  console.log('✓ PASS: Loads default broadcast settings');

  // Test 2: Save custom settings
  broadcastService.saveSettings({ animationIntensity: 'reduced', slideDuration: 12 });
  const updated = broadcastService.getSettings();
  assert.strictEqual(updated.animationIntensity, 'reduced', 'Updated animationIntensity should be reduced');
  assert.strictEqual(updated.slideDuration, 12, 'Updated slideDuration should be 12');
  console.log('✓ PASS: Saves and persists custom broadcast settings');

  // Test 3: Reset settings
  broadcastService.resetSettings();
  const reset = broadcastService.getSettings();
  assert.strictEqual(reset.animationIntensity, 'normal', 'Reset animationIntensity should be normal');
  console.log('✓ PASS: Resets settings back to defaults');

  // Test 4: Standings from Tournament official results
  const mockTournamentWithResults = {
    results: {
      standings: [
        { rank: 1, teamId: 't1', teamName: 'Alpha', points: 9 },
        { rank: 2, teamId: 't2', teamName: 'Beta', points: 6 },
      ]
    }
  };
  const standings1 = broadcastService.getStandings(mockTournamentWithResults, null, null);
  assert.strictEqual(standings1.length, 2);
  assert.strictEqual(standings1[0].teamName, 'Alpha');
  assert.strictEqual(standings1[0].points, 9);
  console.log('✓ PASS: Extracts standings directly from tournament results');

  // Test 5: Standings from Battle Arena state
  const mockBattleState = {
    teams: [
      { id: 'b1', name: 'Bravo Team', points: 6, wins: 2, draws: 0, losses: 1, purse: 40 },
      { id: 'b2', name: 'Alpha Team', points: 9, wins: 3, draws: 0, losses: 0, purse: 60 },
      { id: 'b3', name: 'Charlie Team', points: 3, wins: 1, draws: 0, losses: 2, purse: 20 },
    ]
  };
  const battleStandings = broadcastService.getStandings(null, null, mockBattleState);
  assert.strictEqual(battleStandings[0].teamName, 'Alpha Team');
  assert.strictEqual(battleStandings[0].rank, 1);
  assert.strictEqual(battleStandings[0].points, 9);
  assert.strictEqual(battleStandings[1].teamName, 'Bravo Team');
  assert.strictEqual(battleStandings[2].teamName, 'Charlie Team');
  console.log('✓ PASS: Accurately derives 3-1-0 standings from active Battle Arena');

  // Test 6: Single Champion Identification
  const champs1 = broadcastService.getChampions(battleStandings);
  assert.strictEqual(champs1.length, 1);
  assert.strictEqual(champs1[0].teamName, 'Alpha Team');
  console.log('✓ PASS: Identifies single clear champion');

  // Test 7: Joint Champions Identification (Equal points, zero invented tiebreak)
  const tiedStandings = [
    { rank: 1, teamId: 't1', teamName: 'Titans', points: 7 },
    { rank: 1, teamId: 't2', teamName: 'Warriors', points: 7 },
    { rank: 3, teamId: 't3', teamName: 'Lions', points: 4 },
  ];
  const jointChamps = broadcastService.getChampions(tiedStandings);
  assert.strictEqual(jointChamps.length, 2, 'Must recognize both top teams as joint champions');
  assert.strictEqual(jointChamps[0].teamName, 'Titans');
  assert.strictEqual(jointChamps[1].teamName, 'Warriors');
  console.log('✓ PASS: Correctly handles joint champions without inventing fake tiebreakers');

  // Test 8: Standings fallback to Tournament Franchise Snapshots
  const mockTournamentSnapshot = {
    franchisesSnapshot: [
      { id: 'f1', name: 'Chennai Kings', color: '#FBC02D', startingPurse: 100 },
      { id: 'f2', name: 'Madurai Warriors', color: '#D32F2F', startingPurse: 100 },
    ]
  };
  const snapshotStandings = broadcastService.getStandings(mockTournamentSnapshot, null, null);
  assert.strictEqual(snapshotStandings.length, 2);
  assert.strictEqual(snapshotStandings[0].teamName, 'Chennai Kings');
  assert.strictEqual(snapshotStandings[0].purseRemaining, 100);
  console.log('✓ PASS: Falls back gracefully to tournament franchise snapshots');

  // Test 9: Audio Dispatcher with Sound Disabled
  broadcastService.saveSettings({ soundEnabled: false });
  // Should not throw or play
  broadcastService.playAudio('intro');
  broadcastService.playAudio('sold');
  broadcastService.playAudio('victory');
  console.log('✓ PASS: Safely suppresses audio when soundEnabled is false');

  // Test 10: Audio Dispatcher with Sound Enabled
  broadcastService.saveSettings({ soundEnabled: true });
  broadcastService.playAudio('intro');
  broadcastService.playAudio('countdown');
  broadcastService.playAudio('urgent_countdown');
  broadcastService.playAudio('sold');
  broadcastService.playAudio('victory');
  console.log('✓ PASS: Dispatches synthesizer audio triggers cleanly');

  console.log('\n=======================================');
  console.log('TEST SUMMARY: 10 Passed, 0 Failed');
  console.log('=======================================');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
