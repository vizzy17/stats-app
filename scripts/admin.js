/* admin.js — TNF Admin Page Logic */

(async function(){

  // --- State ---
  let players = [];
  let weeks = [];
  let payments = [];
  let selectedTeamsPublished = false;

  //////////////////////////////
  // Admin Authentication
  //////////////////////////////
  const ADMIN_PASSWORD = "AdeogunSecret2026"; // change this to your secret

  document.querySelector("#adminLoginBtn").addEventListener("click", () => {
    const input = document.querySelector("#adminPasscode").value.trim();
    const status = document.querySelector("#adminLoginStatus");

    if (input === ADMIN_PASSWORD) {
      document.querySelector("#adminLoginScreen").style.display = "none";
      document.querySelector("#adminContent").style.display = "block";
    } else {
      status.textContent = "Incorrect passcode.";
    }
  });

  //////////////////////////////
  // Render Payments Log
  //////////////////////////////
  function renderPaymentsLog() {
    const el = document.querySelector('#paymentsLog');
    if (!el) return;

    if (!payments.length) {
      el.innerHTML = '<div class="muted">No receipts uploaded yet.</div>';
      return;
    }

    el.innerHTML = payments
      .map(
        p => `
        <div>
          ${p.timestamp.split('T')[0]} — ${p.name} — £${p.amount} —
          <strong>${p.status}</strong>
        </div>`
      )
      .join('');
  }

  //////////////////////////////
  // Receipt Upload
  //////////////////////////////
  const chooseFileBtn = document.querySelector('#chooseFileBtn');
  const receiptFile = document.querySelector('#receiptFile');
  const uploadReceiptBtn = document.querySelector('#uploadReceiptBtn');

  if (chooseFileBtn && receiptFile) {
    chooseFileBtn.addEventListener('click', () => receiptFile.click());
  }

  if (receiptFile) {
    receiptFile.addEventListener('change', e => {
      const f = e.target.files[0];
      const status = document.querySelector('#receiptStatus');
      if (status) status.textContent = f ? `Selected: ${f.name}` : '';
    });
  }

  if (uploadReceiptBtn) {
    uploadReceiptBtn.addEventListener('click', () => {
      const name =
        (document.querySelector('#receiptPlayer')?.value.trim()) || '';
      const amount =
        Number(document.querySelector('#receiptAmount')?.value) || 0;

      if (!name || amount <= 0 || !receiptFile || !receiptFile.files[0]) {
        alert('Enter player, amount and choose a file');
        return;
      }

      payments.push({
        name,
        amount,
        fileName: receiptFile.files[0].name,
        timestamp: new Date().toISOString(),
        status: 'Pending'
      });

      const status = document.querySelector('#receiptStatus');
      if (status) status.textContent = 'Receipt uploaded (pending verification)';

      document.querySelector('#receiptPlayer').value = '';
      document.querySelector('#receiptAmount').value = '';
      receiptFile.value = '';

      renderPaymentsLog();
    });
  }

  //////////////////////////////
  // Slot Release
  //////////////////////////////
  const releaseBtn = document.querySelector('#releaseBtn');

  if (releaseBtn) {
    releaseBtn.addEventListener('click', () => {
      const name =
        (document.querySelector('#releasePlayer')?.value.trim()) || '';
      const status = document.querySelector('#releaseStatus');

      if (!name) {
        alert('Enter player name to release');
        return;
      }

      if (!isBeforeWednesdayNoonUK()) {
        if (status)
          status.textContent =
            'Release window closed (after Wednesday 12:00 UK).';
        return;
      }

      const idx = players.findIndex(
        p => p.name.toLowerCase() === name.toLowerCase()
      );

      if (idx === -1) {
        if (status) status.textContent = 'Player not found in first 32.';
        return;
      }

      players.splice(idx, 1);
      computeTotals();
      renderSelectedTeamsPreview();

      if (status) status.textContent = `${name} released successfully.`;
      document.querySelector('#releasePlayer').value = '';
    });
  }

  //////////////////////////////
  // Publish Selected Teams
  //////////////////////////////
  const publishBtn = document.querySelector('#publishSelectedBtn');

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      selectedTeamsPublished = !selectedTeamsPublished;
      renderSelectedTeamsPreview();
    });
  }

  function renderSelectedTeamsPreview() {
    const area = document.querySelector('#selectedTeamsPreview');
    if (!area) return;

    if (!selectedTeamsPublished) {
      area.textContent = 'No teams published';
      return;
    }

    const sorted = [...players].sort(
      (a, b) => (b.total || 0) - (a.total || 0)
    );

    const selected = sorted.slice(0, 32);
    const reserves = sorted.slice(32, 42);

    area.innerHTML = `
      <div style="font-size:13px">
        <strong>Selected (32)</strong>: ${selected
          .map(p => p.name)
          .join(', ')}
      </div>
      <div style="font-size:13px;margin-top:6px">
        <strong>Reserves</strong>: ${reserves.map(p => p.name).join(', ')}
      </div>
    `;
  }

  //////////////////////////////
  // Wednesday 12:00 UK Rule
  //////////////////////////////
  function isBeforeWednesdayNoonUK() {
    try {
      const now = new Date();
      const london = new Date(
        now.toLocaleString('en-GB', { timeZone: 'Europe/London' })
      );

      const day = london.getDay(); // 0 Sun .. 6 Sat
      const wednesday = new Date(london);

      const diff = (3 - day + 7) % 7;
      wednesday.setDate(london.getDate() + diff);
      wednesday.setHours(12, 0, 0, 0);

      return london.getTime() < wednesday.getTime();
    } catch (e) {
      return false;
    }
  }

  //////////////////////////////
  // Compute Totals (from weeks)
  //////////////////////////////
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

  //////////////////////////////
  // Automatic PIN Generation
  //////////////////////////////

  function generatePIN() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  function assignPinsToPlayers() {
    if (!players || !players.length) {
      alert("Players not loaded yet.");
      return;
    }

    players.forEach(p => {
      if (!p.pin) {
        p.pin = generatePIN();
      }
    });

    downloadJSON(players, "players.json");
    alert("PINs generated and players.json downloaded. Upload it back via Admin.");
  }

  const generatePinsBtn = document.querySelector("#generatePinsBtn");

  if (generatePinsBtn) {
    generatePinsBtn.addEventListener("click", () => {
      assignPinsToPlayers();
    });
  }

  //////////////////////////////
  // Admin: Render Pending Reports
  //////////////////////////////

  async function renderAdminReports() {
    const reports = await loadReports();
    const area = document.querySelector("#adminReportsArea");

    if (!area) return;

    if (!reports.confirmed.length) {
      area.innerHTML = "<div>No confirmed reports awaiting approval.</div>";
      return;
    }

    area.innerHTML = reports.confirmed
      .map((r, i) => `
        <div>
          <input type="radio" name="adminReportSelect" value="${i}">
          <strong>${r.player}</strong> — Goals: ${r.goals}, Assists: ${r.assists}
          <br>Confirmed by: ${r.confirmedBy}
          <br><small>${r.timestamp.split("T")[0]}</small>
        </div>
      `)
      .join("");
  }

  //////////////////////////////
  // Admin: Approve Report
  //////////////////////////////

  document.querySelector("#approveReportBtn")?.addEventListener("click", async () => {
    const reports = await loadReports();
    const index = Number(document.querySelector("input[name='adminReportSelect']:checked")?.value);

    if (isNaN(index)) {
      alert("Select a report first");
      return;
    }

    const report = reports.confirmed[index];

    weeks[report.week].players.push({
      name: report.player,
      team: report.team || "A",
      goals: report.goals,
      assists: report.assists
    });

    const p = players.find(x => x.name === report.player);
    if (p) {
      p.goals += report.goals;
      p.assists += report.assists;
    }

    report.status = "approved";
    reports.approved.push(report);
    reports.confirmed.splice(index, 1);

    downloadJSON(weeks, "weeks.json");
    downloadJSON(players, "players.json");
    downloadJSON(reports, "reports.json");

    alert("Report approved. Upload updated files.");
    renderAdminReports();
  });

  //////////////////////////////
  // Admin: Reject Report
  //////////////////////////////

  document.querySelector("#rejectReportBtn")?.addEventListener("click", async () => {
    const reports = await loadReports();
    const index = Number(document.querySelector("input[name='adminReportSelect']:checked")?.value);

    if (isNaN(index)) {
      alert("Select a report first");
      return;
    }

    const report = reports.confirmed[index];

    report.status = "rejected";
    reports.rejected.push(report);
    reports.confirmed.splice(index, 1);

    downloadJSON(reports, "reports.json");

    alert("Report rejected.");
    renderAdminReports();
  });

  //////////////////////////////
  // Boot
  //////////////////////////////
  try {
    const data = await loadData();
    players = data.players;
    weeks = data.weeks;

    computeTotals();
    renderPaymentsLog();
    renderSelectedTeamsPreview();
    renderAdminReports();

    console.info('Admin page loaded.');
  } catch (err) {
    console.error('Admin boot error', err);
  }

})();
