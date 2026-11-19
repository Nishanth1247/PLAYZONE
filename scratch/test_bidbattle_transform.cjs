const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== BIDBATTLE UI/UX TRANSFORMATION & RULEBOOK TEST SUITE ===\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${description}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

// 1. Verify Tailwind and Palette config
test('Tailwind configuration includes Midnight Navy, Slate, Terracotta Coral, Sage, Champagne', () => {
  const twConfig = fs.readFileSync(path.resolve(__dirname, '../tailwind.config.js'), 'utf8');
  assert(twConfig.includes('#111827'), 'Contains #111827 Midnight Navy');
  assert(twConfig.includes('#222F43'), 'Contains #222F43 Deep Slate');
  assert(twConfig.includes('#2C394C'), 'Contains #2C394C Slate Surface');
  assert(twConfig.includes('#D97858'), 'Contains #D97858 Terracotta Coral');
  assert(twConfig.includes('#91A98B'), 'Contains #91A98B Sage');
  assert(twConfig.includes('#D4B879'), 'Contains #D4B879 Champagne');
  assert(twConfig.includes('#39465A'), 'Contains #39465A Muted Slate border');
  assert(twConfig.includes('Outfit'), 'Contains Outfit font');
  assert(twConfig.includes('Barlow Condensed'), 'Contains Barlow Condensed font');
  assert(twConfig.includes('DM Sans'), 'Contains DM Sans font');
  assert(twConfig.includes('IBM Plex Mono'), 'Contains IBM Plex Mono font');
});

// 2. Verify GameRules component exists and covers all 4 games
test('GameRules.jsx covers Auction Arena, Battle Arena, Dumb Charades, and Who Am I?', () => {
  const rulesPath = path.resolve(__dirname, '../src/components/rules/GameRules.jsx');
  assert(fs.existsSync(rulesPath), 'GameRules.jsx exists');
  const content = fs.readFileSync(rulesPath, 'utf8');

  // Check 4 tabs
  assert(content.includes("'auction'"), 'Includes auction tab');
  assert(content.includes("'battle'"), 'Includes battle tab');
  assert(content.includes("'charades'"), 'Includes charades tab');
  assert(content.includes("'whoami'"), 'Includes whoami tab');

  // Auction rules details
  assert(content.includes('AUCTION ARENA RULES'), 'Contains Auction Rules Header');
  assert(content.includes('Objective & Team Setup'), 'Contains Auction Objective');
  assert(content.includes('Strict Rating Concealment'), 'Contains Rating Concealment');
  assert(content.includes('Bidding & Increments'), 'Contains Increments');
  assert(content.includes('Mandatory Last-Bidder Settlement'), 'Contains Mandatory Settlement');
  assert(content.includes('THE PURSE PRESERVATION RULE'), 'Contains Purse Preservation Rule');
  assert(content.includes('Unsold Pool & Recalls'), 'Contains Unsold Pool');
  assert(content.includes('6-Tier Tiebreaker'), 'Contains 6-Tier Tiebreaker');

  // Battle rules details
  assert(content.includes('BATTLE ARENA RULES'), 'Contains Battle Rules Header');
  assert(content.includes('Round 1: Fighter Auction Stage'), 'Contains Round 1 Auction');
  assert(content.includes('Round 2: Secret Tactical Draft'), 'Contains Round 2 Tactical Draft');
  assert(content.includes('PASS-THE-LAPTOP PRIVACY SHIELD'), 'Contains Privacy Shield');
  assert(content.includes('Sequential Bout Reveals & Combat'), 'Contains Sequential Reveals');
  assert(content.includes('Scoring System & Championship'), 'Contains Scoring');
  assert(content.includes('3 PTS'), 'Contains 3 points for win');
  assert(content.includes('1 PT'), 'Contains 1 point for draw');
  assert(content.includes('0 PTS'), 'Contains 0 points for loss');

  // Charades rules details
  assert(content.includes('DUMB CHARADES RULES'), 'Contains Charades Rules Header');
  assert(content.includes('Pass-the-Screen Secrecy'), 'Contains Pass the Screen');
  assert(content.includes('STRICT SILENCE CODE'), 'Contains Silence Code');
  assert(content.includes('Gameplay Action Controls'), 'Contains Controls (Correct, Skip, Timeout)');
  assert(content.includes('Streaks & Dynamic Bonuses'), 'Contains Streaks & Bonuses');

  // Who Am I rules details
  assert(content.includes('WHO AM I? RULES'), 'Contains Who Am I Rules Header');
  assert(content.includes('FACING AWAY FROM SCREEN'), 'Contains Guesser Position');
  assert(content.includes('Binary Questioning Format'), 'Contains Binary Questioning');
  assert(content.includes('Audience Response Controls'), 'Contains Audience Response');
  assert(content.includes('Hints, Limits & Scoring'), 'Contains Hints & Scoring');
});

// 3. Verify App.jsx wires rules mode and custom event listener
test('App.jsx supports rules platformMode and event listener', () => {
  const appContent = fs.readFileSync(path.resolve(__dirname, '../src/App.jsx'), 'utf8');
  assert(appContent.includes("platformMode === 'rules'"), 'Supports platformMode rules');
  assert(appContent.includes('bidbattle_open_rules'), 'Listens for bidbattle_open_rules custom event');
  assert(appContent.includes('<GameRules'), 'Renders GameRules');
});

// 4. Verify Navbar.jsx has RULES tab
test('Navbar.jsx includes RULES navigation button', () => {
  const navContent = fs.readFileSync(path.resolve(__dirname, '../src/components/common/Navbar.jsx'), 'utf8');
  assert(navContent.includes("onClick={() => setPlatformMode('rules')}"), 'Navbar sets platformMode to rules');
  assert(navContent.includes('RULES'), 'Navbar displays RULES text');
});

// 5. Verify Home.jsx has Rulebook button
test('Home.jsx includes Rulebook trigger', () => {
  const homeContent = fs.readFileSync(path.resolve(__dirname, '../src/components/landing/Home.jsx'), 'utf8');
  assert(homeContent.includes("openGameRules('auction')"), 'Home opens auction rules');
});

// 6. Verify PartyArenaHome.jsx has Rulebook triggers
test('PartyArenaHome.jsx includes Party Rulebook triggers', () => {
  const partyContent = fs.readFileSync(path.resolve(__dirname, '../src/components/party/PartyArenaHome.jsx'), 'utf8');
  assert(partyContent.includes("openGameRules('charades')"), 'Party Arena opens charades rules');
  assert(partyContent.includes("openGameRules(isDumbCharades ? 'charades' : 'whoami')"), 'Party game cards trigger individual rules');
});

// 7. Verify BattleArenaHome.jsx has Rulebook triggers
test('BattleArenaHome.jsx includes Battle Arena Rulebook trigger', () => {
  const battleContent = fs.readFileSync(path.resolve(__dirname, '../src/components/battle/BattleArenaHome.jsx'), 'utf8');
  assert(battleContent.includes("openGameRules('battle')"), 'Battle Arena opens battle rules');
});

// 8. Verify SetupWizard.jsx has Rulebook triggers
test('SetupWizard.jsx includes Auction Rulebook trigger', () => {
  const setupContent = fs.readFileSync(path.resolve(__dirname, '../src/components/setup/SetupWizard.jsx'), 'utf8');
  assert(setupContent.includes("openGameRules('auction')"), 'SetupWizard opens auction rules');
});

console.log(`\n=======================================`);
console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
console.log(`=======================================`);
if (failed > 0) process.exit(1);
