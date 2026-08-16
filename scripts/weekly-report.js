/* weekly-report.js — TNF Weekly Match Report Generator */

(async function() {

  let players = [];
  let weeks = {};

  try {
    const data = await loadData();
    players = data.players;
    weeks = data.weeks;

    populateWeekDropdown();
  } catch (err) {
    console.error("Weekly report load error", err);
  }

  function populateWeekDropdown() {
    const select = document.querySelector("#weekSelect");
    select.innerHTML = "";

    Object.keys(weeks).forEach(weekKey => {
      const opt = document.createElement("option");
      opt.value = weekKey;
      opt.textContent = `${weekKey} — ${weeks[weekKey].date}`;
      select.appendChild(opt);
    });
  }

  document.querySelector("#generateReportBtn").addEventListener("click", () => {
    const weekKey = document.querySelector("#weekSelect").value;
    generateWeeklyReport(weekKey);
  });

  function generateWeeklyReport(weekKey) {
    const week = weeks[weekKey];
    const area = document.querySelector("#weeklyReportOutput");

    if (!week || !week.players || !week.players.length) {
      area.innerHTML = "<div>No data available for this week.</div>";
      return;
    }

    const scorers = week.players.filter(p => p.goals > 0);
    const assisters = week.players.filter(p => p.assists > 0);

    const teamStats = {
      A: { goals: 0, points: 0 },
      B: { goals: 0, points: 0 },
      C: { goals: 0, points: 0 },
      D: { goals: 0, points: 0 }
    };

    week.players.forEach(p => {
      if (!p.team) return;
      teamStats[p.team].goals += p.goals;
    });

    const matches = [
      { time: "9:05 – 9:20", home: "A", away: "B" },
      { time: "9:22 – 9:37", home: "C", away: "D" },
      { time: "9:39 – 9:54", home: "A", away: "C" },
      { time: "9:56 – 10:11", home: "B", away: "D" },
      { time: "10:13 – 10:28", home: "A", away: "D" },
      { time: "10:30 – 10:45", home: "B", away: "C" }
    ];

    let matchHTML = "<h4>Match Schedule & Scorelines</h4><ul>";

    matches.forEach(m => {
      const homeGoals = teamStats[m.home].goals;
      const awayGoals = teamStats[m.away].goals;

      if (homeGoals > awayGoals) teamStats[m.home].points += 3;
      else if (awayGoals > homeGoals) teamStats[m.away].points += 3;
      else {
        teamStats[m.home].points += 1;
        teamStats[m.away].points += 1;
      }

      matchHTML += `
        <li>
          ${m.time} — Team ${m.home} ${homeGoals} 🆚 ${awayGoals} Team ${m.away}
        </li>
      `;
    });

    matchHTML += "</ul>";

    const sortedTeams = Object.entries(teamStats)
      .sort((a, b) => b[1].points - a[1].points);

    const finalist1 = sortedTeams[0][0];
    const finalist2 = sortedTeams[1][0];

    const finalScore = `
      <h4>Final Match</h4>
      <div>
        Team ${finalist1} (${teamStats[finalist1].goals}) 🆚 
        Team ${finalist2} (${teamStats[finalist2].goals})
      </div>
    `;

    let html = `
      <h4>Match Date</h4>
      <div>${week.date}</div>

      <h4>Attendance</h4>
      <div>${week.players.length} players</div>

      ${matchHTML}

      <h4>Team Points Table</h4>
      <ul>
        ${Object.entries(teamStats)
          .map(([team, stats]) => `
            <li>Team ${team}: ${stats.points} pts (Goals: ${stats.goals})</li>
          `)
          .join("")}
      </ul>

      ${finalScore}

      <h4>Goals</h4>
      <ul>
        ${scorers.length
          ? scorers.map(s => `<li>${s.name} — ${s.goals} goals</li>`).join("")
          : "<li>No goals recorded</li>"
        }
      </ul>

      <h4>Assists</h4>
      <ul>
        ${assisters.length
          ? assisters.map(a => `<li>${a.name} — ${a.assists} assists</li>`).join("")
          : "<li>No assists recorded</li>"
        }
      </ul>

      <h4>Full Player List</h4>
      <ul>
        ${week.players.map(p => `
          <li>${p.name} — Team ${p.team} — G:${p.goals} A:${p.assists}</li>
        `).join("")}
      </ul>
    `;

    area.innerHTML = html;
  }

})();
