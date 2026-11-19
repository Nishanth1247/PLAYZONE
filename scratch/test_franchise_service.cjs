const assert = require('assert');

// Mock localStorage for Node.js
const mockStorage = {};
global.window = {
  localStorage: {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  },
  dispatchEvent: () => {}
};

async function runTests() {
  console.log('=== PLAYZONE FRANCHISE SERVICE TEST SUITE ===\n');

  // Dynamic import of ESM module
  const { 
    franchiseService, 
    DEFAULT_FRANCHISES, 
    isValidHexColor, 
    getContrastTextColor, 
    generateInitialsLogo 
  } = await import('../src/services/franchiseService.js');

  // 1. Initial State & Default Franchises
  const allDefaults = franchiseService.getAllFranchises();
  assert.strictEqual(allDefaults.length, 4, 'Should initialize with 4 default franchises');
  assert.strictEqual(allDefaults[0].name, 'Nishanth');
  assert.strictEqual(allDefaults[1].name, 'Ajmal');
  assert.strictEqual(allDefaults[2].name, 'Praneeth');
  assert.strictEqual(allDefaults[3].name, 'Nagulan');
  console.log('✓ PASS: Initial 4 default franchises initialized');

  // 2. Validation & Contrast
  assert.strictEqual(isValidHexColor('#8875A8'), true);
  assert.strictEqual(isValidHexColor('#FFF'), true);
  assert.strictEqual(isValidHexColor('invalid'), false);
  assert.strictEqual(isValidHexColor('123456'), false);
  console.log('✓ PASS: HEX color validator');

  assert.strictEqual(getContrastTextColor('#FFFFFF'), '#111827');
  assert.strictEqual(getContrastTextColor('#000000'), '#F5F3EE');
  console.log('✓ PASS: Contrast color computation');

  assert.strictEqual(generateInitialsLogo('Chennai Super Kings'), 'CSK');
  assert.strictEqual(generateInitialsLogo('Mumbai'), 'MU');
  console.log('✓ PASS: Initials generator');

  // 3. Create Franchise
  const created = franchiseService.createFranchise({
    name: 'Royal Titans',
    shortName: 'RT',
    color: '#D4B879',
    description: 'A champion squad of heavy hitters.'
  });
  assert.strictEqual(created.name, 'Royal Titans');
  assert.strictEqual(created.shortName, 'RT');
  assert.strictEqual(created.color, '#D4B879');
  assert.strictEqual(franchiseService.getAllFranchises().length, 5);
  console.log('✓ PASS: Create new franchise');

  // 4. Duplicate Name Validation
  assert.throws(() => {
    franchiseService.createFranchise({
      name: 'royal titans', // case-insensitive duplicate
      shortName: 'RT2',
      color: '#123456'
    });
  }, /already exists/);
  console.log('✓ PASS: Duplicate name rejection');

  // 5. Update Franchise
  const updated = franchiseService.updateFranchise(created.id, {
    name: 'Royal Titans X',
    shortName: 'RTX',
    color: '#91A98B',
    description: 'Upgraded titan squad.'
  });
  assert.strictEqual(updated.name, 'Royal Titans X');
  assert.strictEqual(updated.shortName, 'RTX');
  assert.strictEqual(updated.color, '#91A98B');
  console.log('✓ PASS: Update franchise');

  // 6. Duplicate Franchise Action
  const copy = franchiseService.duplicateFranchise(created.id);
  assert.strictEqual(copy.name, 'Royal Titans X Copy');
  assert.strictEqual(franchiseService.getAllFranchises().length, 6);
  console.log('✓ PASS: Duplicate franchise action');

  // 7. Archive & Unarchive
  const archived = franchiseService.archiveFranchise(copy.id);
  assert.strictEqual(archived.isArchived, true);
  assert.strictEqual(franchiseService.getActiveFranchises().length, 5);
  assert.strictEqual(franchiseService.getAllFranchises().length, 6);

  franchiseService.unarchiveFranchise(copy.id);
  assert.strictEqual(franchiseService.getActiveFranchises().length, 6);
  console.log('✓ PASS: Archive and unarchive functionality');

  // 8. Delete Franchise
  franchiseService.deleteFranchise(copy.id);
  assert.strictEqual(franchiseService.getAllFranchises().length, 5);
  console.log('✓ PASS: Delete unused franchise');

  // 9. Independent Selection (Auction vs Battle)
  franchiseService.saveSelectedFranchiseIds('auction', ['team-nishanth', 'team-ajmal', created.id]);
  franchiseService.saveSelectedFranchiseIds('battle', ['team-praneeth', 'team-nagulan']);

  const auctionSelected = franchiseService.getSelectedFranchiseIds('auction');
  const battleSelected = franchiseService.getSelectedFranchiseIds('battle');

  assert.strictEqual(auctionSelected.length, 3);
  assert.strictEqual(battleSelected.length, 2);
  assert.notDeepStrictEqual(auctionSelected, battleSelected);
  console.log('✓ PASS: Independent game selection persistence');

  // 10. Export & Import
  const exported = franchiseService.exportFranchises();
  assert.strictEqual(typeof exported, 'string');
  const importRes = franchiseService.importFranchises(exported);
  assert.strictEqual(importRes.updatedCount >= 1, true);
  console.log('✓ PASS: Export and import JSON');

  console.log('\n=======================================');
  console.log('RESULTS: All Franchise Service Tests Passed!');
  console.log('=======================================\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
