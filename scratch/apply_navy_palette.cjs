const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/battle/TacticalDraftBoard.jsx',
  'src/components/battle/BattleArenaMatch.jsx',
  'src/components/battle/BattleResultsScreen.jsx',
  'src/components/results/ResultsScreen.jsx',
  'src/components/battle/BattleAuctionStage.jsx',
  'src/components/auction/LiveAuction.jsx',
];

const replacements = [
  { from: /#090909/g, to: '#111827' },
  { from: /#111111/g, to: '#2C394C' },
  { from: /#191919/g, to: '#222F43' },
  { from: /#222222/g, to: '#2C394C' },
  { from: /#303030/g, to: '#39465A' },
  { from: /#3A3A3A/g, to: '#39465A' },
  { from: /#444444/g, to: '#39465A' },
  { from: /#555555/g, to: '#4E5D73' },
  { from: /#F2F2F0/g, to: '#F5F3EE' },
  { from: /#A3A3A3/g, to: '#AEB9CC' },
  { from: /#737373/g, to: '#AEB9CC' },
  { from: /bg-\[#F2F2F0\]\s+text-\[#090909\]/g, to: 'bg-[#D97858] text-[#F5F3EE]' },
  { from: /bg-\[#F5F3EE\]\s+text-\[#111827\]/g, to: 'bg-[#D97858] text-[#F5F3EE]' },
  { from: /hover:bg-white\s+text-\[#090909\]/g, to: 'hover:bg-[#E08A6C] text-[#F5F3EE]' },
];

for (const relPath of filesToUpdate) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = content;
    for (const r of replacements) {
      updated = updated.replace(r.from, r.to);
    }
    if (updated !== content) {
      fs.writeFileSync(fullPath, updated, 'utf8');
      console.log(`Updated ${relPath}`);
    } else {
      console.log(`No changes needed in ${relPath}`);
    }
  } else {
    console.warn(`File not found: ${relPath}`);
  }
}
