/* highlights.js — TNF Weekly Highlights Page Logic
   Requires: common.js (for loadData, normalizeName, keyName, etc.)
*/

(async function(){

  // --- State ---
  let weeks = {};
  let showAllWeeks = true;   // Highlights page always shows all weeks

  // --- Render Weeks ---
  function renderWeeks() {
    try {
      const container = document.querySelector('#weeksSection');
      if (!container) return;

      container.innerHTML = '';

      // Sort weeks: newest first
      const keys = Object.keys(weeks).sort((a, b) => {
        const na = Number(a.replace(/\D/g, '')) || 0;
        const nb = Number(b.replace(/\D/g, '')) || 0;
        return nb - na;
      });

      keys.forEach(k => {
        const w = weeks[k];

        const total = (w.players || []).reduce(
          (s, p) => s + Number(p.goals || 0) + Number(p.assists || 0),
          0
        );

        const card = document.createElement('div');
        card.className = 'card';

        // Goalscorers
        const goalsHtml = (w.players || [])
          .filter(p => Number(p.goals || 0) > 0)
          .sort((a, b) => b.goals - a.goals)
          .map(p => `
            <div style="display:flex;gap:8px;align-items:center">
              <img src="photos/${encodeURIComponent(p.name)}.jpg"
                   class="small-photo"
                   onerror="this.style.display='none'">
              <div>
                <strong>${p.name}</strong>
                <div class="muted" style="font-size:12px">G: ${p.goals || 0}</div>
              </div>
            </div>
          `)
          .join('');

        // Assists
        const assistsHtml = (w.players || [])
          .filter(p => Number(p.assists || 0) > 0)
          .sort((a, b) => b.assists - a.assists)
          .map(p => `
            <div style="display:flex;gap:8px;align-items:center">
              <img src="photos/${encodeURIComponent(p.name)}.jpg"
                   class="small-photo"
                   onerror="this.style.display='none'">
              <div>
                <strong>${p.name}</strong>
                <div class="muted" style="font-size:12px">A: ${p.assists || 0}</div>
              </div>
            </div>
          `)
          .join('');

        // Video link (no iframe)
        const videoLink = w.fullVideoUrl
          ? `
            <div style="margin-top:8px" class="muted">
              Full match:
              <a href="${w.fullVideoUrl}"
                 target="_blank"
                 rel="noopener"
                 style="color:var(--accent)">
                ${w.fullVideoUrl}
              </a>
            </div>
          `
          : '';

        // Build card
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong>${k}</strong>
              <div class="muted" style="font-size:12px">${w.date || ''}</div>
              <div class="muted" style="font-size:12px;margin-top:6px">
                Total contributions:
                <span style="
                  display:inline-block;
                  background:linear-gradient(90deg,var(--green),var(--neon));
                  color:#001;
                  padding:6px 10px;
                  border-radius:999px;
                  font-weight:700">
                  ${total}
                </span>
              </div>
            </div>
            <div class="muted" style="font-size:12px">Highlights</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
            <div>
              <div style="font-weight:600">Goalscorers</div>
              <div style="margin-top:8px">
                ${goalsHtml || '<div class="muted">No goals</div>'}
              </div>
            </div>

            <div>
              <div style="font-weight:600">Assists</div>
              <div style="margin-top:8px">
                ${assistsHtml || '<div class="muted">No assists</div>'}
              </div>
            </div>
          </div>

          ${videoLink}
        `;

        container.appendChild(card);
      });

    } catch (err) {
      console.error('renderWeeks error', err);
    }
  }

  // --- Boot ---
  try {
    const data = await loadData();   // from common.js
    weeks = data.weeks;

    renderWeeks();

    console.info('Highlights page loaded.');
  } catch (err) {
    console.error('Highlights boot error', err);
  }

})();
