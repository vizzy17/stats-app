/* dashboard.js — TNF Dashboard Page Logic
   Requires: common.js (for loadData, normalizeName, keyName, etc.)
*/

(async function(){

  // --- State ---
  let players = [];
  let weeks = {};
  let currentSort = localStorage.getItem('tnf_leaderboard_sort') || 'goals';
  let showFullLeaderboard = false;

  //////////////////////////////
  // Render Header
  //////////////////////////////
  function renderHeader() {
    try {
      const keys = Object.keys(weeks).sort((a, b) => {
        const na = Number(a.replace(/\D/g, '')) || 0;
        const nb = Number(b.replace(/\D/g, '')) || 0;
        return na - nb;
      });

      const latest = keys.length ? keys[keys.length - 1] : 'WEEK-LATEST';
      const latestObj = weeks[latest] || {};

      const totalGoals = (latestObj.players || []).reduce(
        (s, p) => s + Number(p.goals || 0) + Number(p.assists || 0),
        0
      );

      const el = document.querySelector('#headerWeek');
      if (el) el.textContent = `${latest} • ${totalGoals} goals`;

    } catch (err) {
      console.error('renderHeader error', err);
    }
  }

  //////////////////////////////
  // Render Hero Totals
  //////////////////////////////
  function renderHero() {
    try {
      const totals = Object.values(weeks).reduce(
        (acc, w) => {
          (w.players || []).forEach(p => {
            acc.goals += Number(p.goals || 0);
            acc.assists += Number(p.assists || 0);
          });
          return acc;
        },
        { goals: 0, assists: 0 }
      );

      document.querySelector('#heroGoals').textContent = totals.goals;
      document.querySelector('#heroAssists').textContent = totals.assists;
      document.querySelector('#heroTotal').textContent =
        totals.goals + totals.assists;

    } catch (err) {
      console.error('renderHero error', err);
    }
  }

  //////////////////////////////
  // Render Top 3 Scorers & Assists
  //////////////////////////////
  function renderTopPlayers() {
    try {
      const byGoals = [...players]
        .sort((a, b) => (b.goals || 0) - (a.goals || 0))
        .slice(0, 3);

      const byAssists = [...players]
        .sort((a, b) => (b.assists || 0) - (a.assists || 0))
        .slice(0, 3);

      const topScorers = document.querySelector('#topScorers');
      const topAssists = document.querySelector('#topAssists');

      if (topScorers) {
        topScorers.innerHTML = '';
        byGoals.forEach((p, i) => {
          const d = document.createElement('div');
          d.className = 'flex';
          d.style.alignItems = 'center';
          d.style.gap = '8px';

          d.innerHTML = `
            <div style="font-weight:700">${i + 1}</div>
            <img src="photos/${encodeURIComponent(p.name)}.jpg"
                 class="player-photo"
                 onerror="this.style.display='none'">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div class="muted" style="font-size:12px">G: ${p.goals || 0}</div>
            </div>
          `;

          d.addEventListener('click', () => openModal(p));
          topScorers.appendChild(d);
        });
      }

      if (topAssists) {
        topAssists.innerHTML = '';
        byAssists.forEach((p, i) => {
          const d = document.createElement('div');
          d.className = 'flex';
          d.style.alignItems = 'center';
          d.style.gap = '8px';

          d.innerHTML = `
            <div style="font-weight:700">${i + 1}</div>
            <img src="photos/${encodeURIComponent(p.name)}.jpg"
                 class="player-photo"
                 onerror="this.style.display='none'">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div class="muted" style="font-size:12px">A: ${p.assists || 0}</div>
            </div>
          `;

          d.addEventListener('click', () => openModal(p));
          topAssists.appendChild(d);
        });
      }

    } catch (err) {
      console.error('renderTopPlayers error', err);
    }
  }

  //////////////////////////////
  // Update Sort Buttons
  //////////////////////////////
  function updateSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === currentSort);
    });

    const sub = document.querySelector('#leaderboardSubtitle');
    if (sub) sub.textContent = `Sorted by ${currentSort}`;
  }

  //////////////////////////////
  // Render Leaderboard (with FLIP animation)
  //////////////////////////////
  function renderLeaderboard() {
    try {
      const tbody = document.querySelector('#leaderboardBody');
      if (!tbody) return;

      players.forEach(p => {
        p.total = (Number(p.goals) || 0) + (Number(p.assists) || 0);
      });

      let sorted = [...players].sort(
        (a, b) => (b[currentSort] || 0) - (a[currentSort] || 0)
      );

      if (currentSort === 'total') {
        sorted = sorted.sort((a, b) => {
          const d = (b.total || 0) - (a.total || 0);
          return d !== 0 ? d : (b.goals || 0) - (a.goals || 0);
        });
      }

      const oldRects = Array.from(tbody.children).reduce((m, row) => {
        if (row.dataset && row.dataset.name) {
          m[row.dataset.name] = row.getBoundingClientRect();
        }
        return m;
      }, {});

      const frag = document.createDocumentFragment();
      const limit = showFullLeaderboard
        ? sorted.length
        : Math.max(8, Math.ceil(sorted.length / 2));

      sorted.slice(0, limit).forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.dataset.name = p.name;
        tr.className = 'leaderboard-row';

        tr.innerHTML = `
          <td>${i + 1}</td>
          <td style="display:flex;align-items:center;gap:8px">
            <img src="photos/${encodeURIComponent(p.name)}.jpg"
                 class="small-photo"
                 onerror="this.style.display='none'">
            <div>${p.name}</div>
          </td>
          <td style="text-align:right">${p.goals || 0}</td>
          <td style="text-align:right">${p.assists || 0}</td>
          <td style="text-align:right;font-weight:700">${p.total || 0}</td>
        `;

        tr.querySelector('td')?.addEventListener?.('click', () => openModal(p));
        frag.appendChild(tr);
      });

      tbody.innerHTML = '';
      tbody.appendChild(frag);

      const newRects = Array.from(tbody.children).reduce((m, row) => {
        m[row.dataset.name] = row.getBoundingClientRect();
        return m;
      }, {});

      Object.keys(newRects).forEach(name => {
        const row = tbody.querySelector(`tr[data-name="${CSS.escape(name)}"]`);
        const oldRect = oldRects[name];
        const newRect = newRects[name];

        if (oldRect && row) {
          const dy = oldRect.top - newRect.top;
          if (dy) {
            row.style.transform = `translateY(${dy}px)`;
            row.style.opacity = '0.98';

            requestAnimationFrame(() => {
              row.style.transition =
                'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 200ms ease';
              row.style.transform = '';
              row.style.opacity = '';

              row.addEventListener('transitionend', function te() {
                row.style.transition = '';
                row.removeEventListener('transitionend', te);
              });
            });
          }
        } else if (row) {
          row.style.opacity = '0';
          requestAnimationFrame(() => (row.style.opacity = ''));
        }
      });

      updateSortButtons();

    } catch (err) {
      console.error('renderLeaderboard error', err);
    }
  }

  //////////////////////////////
  // Modal (shared with players page)
  //////////////////////////////
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

  //////////////////////////////
  // Sort Controls
  //////////////////////////////
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSort = btn.dataset.sort || 'goals';
      localStorage.setItem('tnf_leaderboard_sort', currentSort);
      renderLeaderboard();
    });
  });

  const showBtn = document.querySelector('#showAllLeaderboard');
  if (showBtn) {
    showBtn.addEventListener('click', () => {
      showFullLeaderboard = !showFullLeaderboard;
      showBtn.textContent = showFullLeaderboard
        ? 'Show condensed'
        : 'Show full leaderboard';
      renderLeaderboard();
    });
  }

  //////////////////////////////
  // Theme Toggle
  //////////////////////////////
  const themeToggle = document.querySelector('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () =>
      document.documentElement.classList.toggle('dark')
    );
  }

  //////////////////////////////
  // Boot
  //////////////////////////////
  try {
    const data = await loadData(); // from common.js
    players = data.players;
    weeks = data.weeks;

    renderHeader();
    renderHero();
    renderTopPlayers();
    renderLeaderboard();

    console.info('Dashboard loaded.');
  } catch (err) {
    console.error('Dashboard boot error', err);
  }

})();
