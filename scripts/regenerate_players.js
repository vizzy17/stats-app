// scripts/regenerate_players.js
const fs = require('fs');
const path = require('path');

const WEEKS_FILE = path.join(__dirname, '..', 'data', 'weeks.json');
const PLAYERS_FILE = path.join(__dirname, '..', 'data', 'players.json');

function normalizeName(n) {
  return (n || '').trim();
}
function keyName(n) {
  return normalizeName(n).toLowerCase();
}
function loadJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (err) { console.error('Failed to read/parse', file, err.message); process.exit(1); }
}
function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
  console.log('Wrote', file);
}

function main() {
  const weeks = loadJson(WEEKS_FILE);
  const totals = {};
  for (const [weekId, week] of Object.entries(weeks)) {
    const players = Array.isArray(week.players) ? week.players : [];
    const seen = new Set();
    players.forEach(p => {
      const name = normalizeName(p.name);
      if (!name) return;
      const key = keyName(name);
      if (seen.has(key)) console.warn(`Duplicate entry for "${name}" in ${weekId}`);
      seen.add(key);
      const goals = Number(p.goals || 0);
      const assists = Number(p.assists || 0);
      if (!totals[key]) totals[key] = { name, goals: 0, assists: 0 };
      totals[key].goals += goals;
      totals[key].assists += assists;
    });
  }
  const playersArr = Object.values(totals).sort((a,b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return b.assists - a.assists;
  });
  writeJson(PLAYERS_FILE, playersArr);
  console.log('Regenerated players.json with', playersArr.length, 'players');
}

main();
