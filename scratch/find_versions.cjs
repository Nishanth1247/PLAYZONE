const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(path.resolve(__dirname, '../src/components'));
const regex = /(BIDBATTLE\s+[0-9]\.[0-9]|\b8\.[0-9]\b|\b7\.[0-9]\b)/g;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // ignore code comments
    if (line.trim().startsWith('*') || line.trim().startsWith('//')) return;
    if (regex.test(line)) {
      console.log(`${path.basename(f)}:${idx + 1}: ${line.trim()}`);
    }
  });
}
