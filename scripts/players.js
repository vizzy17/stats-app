/* players.js — TNF Players Page */

(async function() {

  let players = [];

  try {
    const data = await loadData();
    players = data.players;
  } catch (err) {
    console.error("Players page load error", err);
  }

  const modal = document.querySelector("#reportModal");
  const openBtn = document.querySelector("#openReportModal");
  const closeBtn = document.querySelector("#closeReportModal");

  const confirmModal = document.querySelector("#confirmModal");
  const openConfirmBtn = document.querySelector("#openConfirmModal");
  const closeConfirmBtn = document.querySelector("#closeConfirmModal");

  openBtn.addEventListener("click", () => {
    const playerName = sessionStorage.getItem("selectedPlayer") || players[0]?.name || "";
    document.querySelector("#reportPlayerName").value = playerName;
    populateConfirmingPlayers(playerName);
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  function populateConfirmingPlayers(excludeName) {
    const select = document.querySelector("#reportConfirmBy");
    select.innerHTML = "";

    players.forEach(p => {
      if (p.name !== excludeName) {
        const opt = document.createElement("option");
        opt.value = p.name;
        opt.textContent = p.name;
        select.appendChild(opt);
      }
    });
  }

  document.querySelector("#submitReportBtn").addEventListener("click", async () => {
    const player = document.querySelector("#reportPlayerName").value;
    const goals = Number(document.querySelector("#reportGoals").value);
    const assists = Number(document.querySelector("#reportAssists").value);
    const confirmBy = document.querySelector("#reportConfirmBy").value;
    const pin = document.querySelector("#reportPIN").value;

    const reports = await loadReports();
    const playerRecord = players.find(p => p.name === player);

    if (!playerRecord || playerRecord.pin !== pin) {
      alert("Incorrect PIN");
      return;
    }

    const newReport = {
      week: "WEEK-LATEST", // you can replace with actual current week key
      player,
      team: playerRecord.team || "A",
      goals,
      assists,
      confirmedBy: confirmBy,
      status: "pending",
      timestamp: new Date().toISOString()
    };

    reports.pending.push(newReport);
    downloadJSON(reports, "reports.json");

    alert("Report submitted. Admin will review it.");
    modal.style.display = "none";
  });

  openConfirmBtn.addEventListener("click", async () => {
    const playerName = sessionStorage.getItem("selectedPlayer") || players[0]?.name || "";
    await loadConfirmations(playerName);
    confirmModal.style.display = "flex";
  });

  closeConfirmBtn.addEventListener("click", () => {
    confirmModal.style.display = "none";
  });

  async function loadConfirmations(playerName) {
    const reports = await loadReports();
    const area = document.querySelector("#confirmList");

    const pendingForPlayer = reports.pending.filter(
      r => r.confirmedBy === playerName
    );

    if (!pendingForPlayer.length) {
      area.innerHTML = "<div>No reports awaiting your confirmation.</div>";
      return;
    }

    area.innerHTML = pendingForPlayer
      .map((r, i) => `
        <div>
          <strong>${r.player}</strong> reported:
          <br>Goals: ${r.goals}, Assists: ${r.assists}
          <br><small>${r.timestamp.split("T")[0]}</small>
          <br>
          <button class="confirmActionBtn confirmYes" onclick="confirmReport(${i}, '${playerName}')">Confirm</button>
          <button class="confirmActionBtn confirmNo" onclick="rejectReport(${i}, '${playerName}')">Reject</button>
        </div>
      `)
      .join("");
  }

  window.confirmReport = async function(index, playerName) {
    const reports = await loadReports();
    const pendingForPlayer = reports.pending.filter(
      r => r.confirmedBy === playerName
    );

    const report = pendingForPlayer[index];

    report.status = "confirmed";
    reports.confirmed.push(report);

    const originalIndex = reports.pending.findIndex(
      r => r.timestamp === report.timestamp
    );
    reports.pending.splice(originalIndex, 1);

    downloadJSON(reports, "reports.json");
    alert("Report confirmed. Admin will review it.");

    loadConfirmations(playerName);
  };

  window.rejectReport = async function(index, playerName) {
    const reports = await loadReports();
    const pendingForPlayer = reports.pending.filter(
      r => r.confirmedBy === playerName
    );

    const report = pendingForPlayer[index];

    report.status = "rejected";
    reports.rejected = reports.rejected || [];
    reports.rejected.push(report);

    const originalIndex = reports.pending.findIndex(
      r => r.timestamp === report.timestamp
    );
    reports.pending.splice(originalIndex, 1);

    downloadJSON(reports, "reports.json");
    alert("Report rejected.");

    loadConfirmations(playerName);
  };

})();
