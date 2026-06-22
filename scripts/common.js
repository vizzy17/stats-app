/* common.js — Shared TNF Utilities & Data Loader
   Used by: dashboard.js, highlights.js, players.js, admin.js
*/

//////////////////////////////
// Utility Helpers
//////////////////////////////

// Query helpers
const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

// Normalise display name (capitalisation, spacing)
function normalizeName(raw) {
  if (!raw && raw !== '') return '';
  return String(raw)
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

// Normalised key for lookup (lowercase, trimmed)
function keyName(raw) {
  return String(raw || '').trim().toLowerCase();
}

//////////////////////////////
// Safe JSON Loader
//////////////////////////////

async function safeLoadJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('safeLoadJSON failed for', url, err);
    return null;
  }
}

//////////////////////////////
// Fallback Data
//////////////////////////////

const fallbackPlayers = [
  { name: "MUYI" },{ name: "Okky" },{ name: "Hassan" },{ name: "Hebro" },
  { name: "Abeey" },{ name: "Oreke" },{ name: "Pappy" },{ name: "Cattano" },{ name: "Goke" }
];

const fallbackWeeks = {
  "WEEK-LATEST": {
    date: new Date().toISOString().split('T')[0],
    players: [
      { name: "MUYI", goals:1, assists:0 },
      { name: "Okky", goals:1, assists:0 },
      { name: "Hassan", goals:1, assists:0 },
      { name: "Hebro", goals:1, assists:1 },
      { name: "Abeey", goals:0, assists:1 },
      { name: "Oreke", goals:1, assists:0 },
      { name: "Pappy", goals:0, assists:1 },
      { name: "Cattano", goals:1, assists:0 },
      { name: "Goke", goals:1, assists:0 }
    ],
    videoUrl: "",
    fullVideoUrl: ""
  },
  "WEEK-PRIOR": {
    date: "2026-05-01",
    players: [
      { name:"Hassan", goals:2, assists:1 },
      { name:"Goke", goals:1, assists:0 }
    ],
    videoUrl: "",
    fullVideoUrl: ""
  }
};

//////////////////////////////
// Data Loader (Core Engine)
//////////////////////////////

async function loadData() {
  // Load JSON files
  const [p, w] = await Promise.all([
    safeLoadJSON('data/players.json'),
    safeLoadJSON('data/weeks.json')
  ]);

  const playersSource = Array.isArray(p) ? p : fallbackPlayers;
  const weeksSource = (w && typeof w === 'object') ? w : fallbackWeeks;

  let weeks = {};

  //////////////////////////////
  // Merge duplicates inside each week
  //////////////////////////////
  for (const [wk, obj] of Object.entries(weeksSource)) {
    const merged = {};

    (obj.players || []).forEach(r => {
      const name = normalizeName(r.name || '');
      if (!name) return;

      const k = keyName(name);
      if (!merged[k]) {
        merged[k] = { name, goals: 0, assists: 0 };
      }

      merged[k].goals += Number(r.goals || 0);
      merged[k].assists += Number(r.assists || 0);
    });

    weeks[wk] = { ...obj, players: Object.values(merged) };
  }

  //////////////////////////////
  // Build roster (players.json + auto-add from weeks)
  //////////////////////////////
  const roster = new Map();

  playersSource.forEach(p => {
    const n = normalizeName(p.name || p || '');
    if (!n) return;
    roster.set(keyName(n), { name: n, goals: 0, assists: 0, total: 0 });
  });

  Object.values(weeks).forEach(wk => {
    (wk.players || []).forEach(p => {
      const n = normalizeName(p.name || '');
      if (!n) return;

      const k = keyName(n);
      if (!roster.has(k)) {
        roster.set(k, { name: n, goals: 0, assists: 0, total: 0 });
      }
    });
  });

  //////////////////////////////
  // Compute authoritative totals
  //////////////////////////////
  const totals = {};

  Object.values(weeks).forEach(wk => {
    (wk.players || []).forEach(p => {
      const n = normalizeName(p.name || '');
      if (!n) return;

      const k = keyName(n);
      if (!totals[k]) {
        totals[k] = { name: n, goals: 0, assists: 0 };
      }

      totals[k].goals += Number(p.goals || 0);
      totals[k].assists += Number(p.assists || 0);
    });
  });

  //////////////////////////////
  // Apply totals to roster
  //////////////////////////////
  const players = Array.from(roster.values()).map(rec => {
    const k = keyName(rec.name);
    const t = totals[k] || { goals: 0, assists: 0 };

    return {
      name: rec.name,
      goals: t.goals,
      assists: t.assists,
      total: t.goals + t.assists
    };
  });

  //////////////////////////////
  // Return shared state
  //////////////////////////////
  return {
    players,
    weeks
  };
}

//////////////////////////////
// Export to global scope
//////////////////////////////

window.normalizeName = normalizeName;
window.keyName = keyName;
window.safeLoadJSON = safeLoadJSON;
window.loadData = loadData;
