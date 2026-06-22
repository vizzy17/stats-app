/* players.js — TNF Players Page Logic
   Requires: common.js (for loadData, normalizeName, keyName, etc.)
*/

(async function(){

  // --- State ---
  let players = [];
  let weeks = {};

  // --- Render Players Grid ---
  function renderPlayersGrid() {
    try {
      const grid = document.querySelector('#playersGrid');
      if (!grid) return;

      grid.innerHTML = '';

      players.forEach(p => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.background = 'rgba(0,0,0,0.06)';
        div.style.cursor = 'pointer';

        div.innerHTML = `
          <div style="display:flex;gap:10px;align-items:center">
            <img src="photos/${encodeURIComponent(p.name)}.jpg"
                 class="small-photo"
                 onerror="this.style.display='none'">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div class="muted" style="font-size:13px">
                G:${p.goals || 0} • A:${p.assists || 0}
              </div>
            </div>
          </div>
        `;

        div.addEventListener('click', () => openModal(p));
        grid.appendChild(div);
      });

      const countEl = document.querySelector('#playersCount');
      if (countEl) countEl.textContent = players.length;

    } catch (err) {
      console.error('renderPlayersGrid error', err);
    }
  }

  // --- Modal ---
  function openModal(p) {
    try {
      document.querySelector('#modalName').textContent = p.name;
      document.querySelector('#modalGoals').textContent = p.goals || 0;
      document.querySelector('#modalAssists').textContent = p.assists || 0;
      document.querySelector('#modalTotal').textContent = p.total || 0;

      const mp = document.querySelector('#modalPhoto');
      if (mp) mp.src = `photos/${encodeURIComponent(p.name)}.jpg`;

      const modal = document.querySelector('#playerModal');
      if (modal) modal.style.display = 'flex';

    } catch (err) {
      console.error('openModal error', err);
    }
  }

  const closeBtn = document.querySelector('#modalClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const m = document.querySelector('#playerModal');
      if (m) m.style.display = 'none';
    });
  }

  // --- Compute Totals (from weeks) ---
  function computeTotals() {
    const lookup = {};

    players.forEach(p => {
      lookup[keyName(p.name)] = {
        name: normalizeName(p.name),
        goals: 0,
        assists: 0
      };
    });

    Object.values(weeks).forEach(w => {
      (w.players || []).forEach(r => {
        const name = normalizeName(r.name || '');
        if (!name) return;

        const k = keyName(name);
        if (!lookup[k]) {
          lookup[k] = { name, goals: 0, assists: 0 };
        }

        lookup[k].goals += Number(r.goals || 0);
        lookup[k].assists += Number(r.assists || 0);
      });
    });

    players = Object.keys(lookup).map(k => {
      const p = lookup[k];
      return {
        name: p.name,
        goals: p.goals,
        assists: p.assists,
        total: p.goals + p.assists
      };
    });
  }

  // --- Boot ---
  try {
    const data = await loadData();   // from common.js
    players = data.players;
    weeks = data.weeks;

    computeTotals();
    renderPlayersGrid();

    console.info('Players page loaded.');
  } catch (err) {
    console.error('Players boot error', err);
  }

})();
