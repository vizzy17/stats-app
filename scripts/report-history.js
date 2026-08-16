/* report-history.js — TNF Reporting History Page */

(async function() {

  let players = [];
  let reports = {};

  try {
    const data = await loadData();
    players = data.players;
    reports = await loadReports();

    populatePlayerDropdown();
  } catch (err) {
    console.error("History page load error", err);
  }

  function populatePlayerDropdown() {
    const select = document.querySelector("#historyPlayerSelect");
    select.innerHTML = "";

    players.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.name;
      opt.textContent = p.name;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      renderHistory(select.value);
    });

    if (players.length) {
      renderHistory(players[0].name);
    }
  }

  function renderHistory(playerName) {
    renderSection("historyPending", reports.pending.filter(r => r.player === playerName));
    renderSection("historyConfirmed", reports.confirmed.filter(r => r.player === playerName));
    renderSection("historyApproved", reports.approved.filter(r => r.player === playerName));
    renderSection("historyRejected", reports.rejected.filter(r => r.player === playerName));
  }

  function renderSection(elementId, list) {
    const area = document.querySelector(`#${elementId}`);

    if (!list.length) {
      area.innerHTML = "<div>No records.</div>";
      return;
    }

    area.innerHTML = list
      .map(r => `
        <div>
          <strong>${r.player}</strong>
          <br>Goals: ${r.goals}, Assists: ${r.assists}
          <br>Confirmed by: ${r.confirmedBy}
          <br>Status: ${r.status}
          <br><small>${r.timestamp.split("T")[0]}</small>
        </div>
      `)
      .join("");
  }

})();
