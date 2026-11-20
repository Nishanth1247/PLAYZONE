/**
 * Comprehensive Unit Test for tournamentHubService
 */

// Mock browser localStorage
const memoryStore = {};
global.localStorage = {
  getItem: (key) => memoryStore[key] || null,
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
};

async function runTests() {
  console.log('=== TOURNAMENT HUB SERVICE TEST SUITE ===\n');
  const { tournamentHubService } = await import('../src/services/tournamentHubService.js');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Initial Load & Seed
  const initial = tournamentHubService.getAllTournaments();
  assert(initial.length === 3, 'Loads 3 default sample tournaments');

  // 2. Overview Telemetry
  const stats = tournamentHubService.getOverviewStats();
  assert(stats.totalCount === 3, 'Overview stats total count is 3');
  assert(stats.activeCount === 1, 'Overview stats active count is 1');
  assert(stats.completedCount === 1, 'Overview stats completed count is 1');
  assert(stats.upcomingCount === 1, 'Overview stats upcoming count is 1');
  assert(stats.latestChampion?.teamName === 'Nishanth', 'Latest champion matches completed tournament');

  // 3. Validation Rules
  const invalid1 = tournamentHubService.validateTournament({ name: 'ab' });
  assert(!invalid1.isValid && invalid1.errors.name, 'Rejects short tournament name (<3 chars)');

  const invalid2 = tournamentHubService.validateTournament({ name: 'Valid Name', franchiseIds: ['team-1'] });
  assert(!invalid2.isValid && invalid2.errors.franchises, 'Requires at least 2 franchises');

  const invalid3 = tournamentHubService.validateTournament({ name: 'Valid Name', franchiseIds: ['team-1', 'team-2'], gameModes: [] });
  assert(!invalid3.isValid && invalid3.errors.gameModes, 'Requires at least 1 game mode');

  // 4. Create Tournament
  const created = tournamentHubService.createTournament({
    name: 'Champions Trophy 2026',
    description: 'Elite showdown',
    category: 'Cricket',
    franchiseIds: ['team-nishanth', 'team-ajmal', 'team-praneeth'],
    gameModes: ['auction'],
    status: 'upcoming',
  });
  assert(created.id && created.name === 'Champions Trophy 2026', 'Successfully created tournament');
  assert(created.franchisesSnapshot.length === 3, 'Snapshots participating franchises');

  // Duplicate name rejection
  let threwDuplicate = false;
  try {
    tournamentHubService.createTournament({
      name: 'Champions Trophy 2026',
      franchiseIds: ['team-nishanth', 'team-ajmal'],
      gameModes: ['auction'],
    });
  } catch (e) {
    threwDuplicate = true;
  }
  assert(threwDuplicate, 'Rejects duplicate tournament name');

  // 5. Update Tournament
  const updated = tournamentHubService.updateTournament(created.id, {
    description: 'Updated description for champions',
  });
  assert(updated.description === 'Updated description for champions', 'Successfully updated tournament');

  // 6. Duplicate Tournament
  const cloned = tournamentHubService.duplicateTournament(created.id);
  assert(cloned.name === 'Champions Trophy 2026 (Copy)', 'Cloned tournament with (Copy) suffix');
  assert(cloned.status === 'upcoming', 'Cloned tournament reset to upcoming status');

  // 7. Status Transitions
  const activated = tournamentHubService.setTournamentStatus(created.id, 'active');
  assert(activated.status === 'active', 'Transitioned status to active');
  assert(activated.historyLog.length >= 2, 'History log tracks status transition');

  // 8. Archive & Restore
  const archived = tournamentHubService.archiveTournament(created.id);
  assert(archived.status === 'archived', 'Archived tournament');
  const restored = tournamentHubService.restoreTournament(created.id);
  assert(restored.status === 'upcoming', 'Restored tournament');

  // 9. Sync Arena State & Progress
  const synced = tournamentHubService.syncArenaState(created.id, 'auction', {
    items: [
      { id: '1', status: 'sold' },
      { id: '2', status: 'sold' },
      { id: '3', status: 'pending' },
      { id: '4', status: 'pending' },
    ],
  });
  assert(synced.progress.percentage === 50, 'Calculates progress percentage from arena lots (50%)');

  // 10. Record Outcome & Completion
  const completed = tournamentHubService.recordTournamentResults(created.id, {
    championTeamId: 'team-ajmal',
    championTeamName: 'Ajmal',
    championColor: '#71999B',
  });
  assert(completed.status === 'completed', 'Completed status recorded');
  assert(completed.results.championTeamName === 'Ajmal', 'Champion recorded in tournament results');

  // 11. Delete
  const deleted = tournamentHubService.deleteTournament(cloned.id);
  assert(deleted === true, 'Successfully deleted cloned tournament');
  assert(tournamentHubService.getTournamentById(cloned.id) === null, 'Deleted tournament is no longer retrievable');

  // 12. Export & Import
  const exportedJSON = tournamentHubService.exportTournaments();
  assert(typeof exportedJSON === 'string' && exportedJSON.includes('Champions Trophy 2026'), 'Export JSON contains tournaments');
  const importResult = tournamentHubService.importTournaments(exportedJSON);
  assert(importResult.totalCount >= 4, 'Import JSON successfully restores tournaments');

  console.log(`\n=======================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`=======================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(e => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});
