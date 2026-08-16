/* common.js — Auto‑path‑detecting version */

//////////////////////////////
// Utility Helpers
//////////////////////////////

const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

function normalizeName(raw) {
  if (!raw && raw !== '') return '';
  return String(raw)
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}

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
    ]
  },
  "WEEK-PRIOR": {
    date: "2026-05-01",
    players: [
      { name:"Hassan", goals:2, assists:1 },
      { name:"Goke", goals:1, assists:0 }
    ]
  }
};

//////////////////////////////
// Auto‑detect correct base path
//////////////////////////////

function detectBasePath() {
  const path = window.location.pathname;

  // If your site is served from /stats-app/
  if (path.includes('/stats-app/')) return '/stats-app';

  // If your site is served from root /
  return '';
}

//////////////////////////////
// Data Loader
//////////////////////////////

async function loadData() {

  const base = detectBasePath();
  const version = Date.now(); // cache‑buster

  const playersURL = `${base}/data/players-data.json?v=${version}`;
  const weeksURL   = `${base}/data/weeks.json?v=${version}`;

  const [p, w] = await Promise.all([
    safeLoadJSON(playersURL),
    safeLoadJSON(weeksURL)
  ]);

  const playersSource = Array.isArray(p) ? p : fallbackPlayers;
  const weeksSource = (w && typeof w === 'object') ? w : fallbackWeeks;

  let weeks = {};

  // Merge duplicates
  for (const [wk, obj] of Object.entries(weeksSource)) {
    const merged = {};

    (obj.players || []).forEach(r => {
      const name = normalizeName(r.name || '');
      if (!name) return;

      const k = keyName(name);
      if (!merged[k]) merged[k] = { name, goals: 0, assists: 0 };

      merged[k].goals += Number(r.goals || 0);
      merged[k].assists += Number(r.assists || 0);
    });

    weeks[wk] = { ...obj, players: Object.values(merged) };
  }

  // Build roster
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

  // Compute totals
  const totals = {};

  Object.values(weeks).forEach(wk => {
    (wk.players || []).forEach(p => {
      const n = normalizeName(p.name || '');
      if (!n) return;

      const k = keyName(n);
      if (!totals[k]) totals[k] = { name: n, goals: 0, assists: 0 };

      totals[k].goals += Number(p.goals || 0);
      totals[k].assists += Number(p.assists || 0);
    });
  });

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

  return { players, weeks };
}

//////////////////////////////
// Load Reports.json
//////////////////////////////

async function loadReports() {
  const base = detectBasePath();
  const version = Date.now(); // cache-buster
  return await safeLoadJSON(`${base}/data/reports.json?v=${version}`);
}

//////////////////////////////
// Download JSON Helper
//////////////////////////////

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

//////////////////////////////
// Export
//////////////////////////////

window.normalizeName = normalizeName;
window.keyName = keyName;
window.safeLoadJSON = safeLoadJSON;
window.loadData = loadData;
window.loadReports = loadReports;
window.downloadJSON = downloadJSON;
