let players = [];
let weeks = {};
let goalsChartInstance = null;
let assistsChartInstance = null;

async function loadData() {
    players = await fetch("data/players.json").then(r => r.json());
    weeks = await fetch("data/weeks.json").then(r => r.json());
    buildLeaderboard();
    buildWeeklyHistory();
    initSearch();
    initTheme();
    initAdmin();
    initModalClose();
}

function buildLeaderboard(filter = "") {
    const tbody = document.querySelector("#leaderboardTable tbody");
    tbody.innerHTML = "";

    const enriched = players
        .map(p => ({ ...p, total: p.goals + p.assists }))
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => b.total - a.total);

    enriched.forEach((p, index) => {
        const row = document.createElement("tr");
        const medal = index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : "";
        row.innerHTML = `
            <td class="playerName" data-name="${p.name}">${medal}${p.name}</td>
            <td>${p.goals}</td>
            <td>${p.assists}</td>
            <td>${p.total}</td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll(".playerName").forEach(el => {
        el.addEventListener("click", () => openPlayerModal(el.dataset.name));
    });
}

function buildWeeklyHistory() {
    const container = document.getElementById("weeksContainer");
    container.innerHTML = "";

    Object.keys(weeks).sort().forEach(week => {
        const block = document.createElement("div");
        block.className = "week-block";

        const header = document.createElement("div");
        header.className = "week-header";
        header.innerHTML = `<span>${week.toUpperCase()}</span><span>▼</span>`;

        const body = document.createElement("div");
        body.className = "week-body";

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Goals</th>
                    <th>Assists</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(weeks[week]).map(name => `
                    <tr>
                        <td>${name}</td>
                        <td>${weeks[week][name].goals}</td>
                        <td>${weeks[week][name].assists}</td>
                    </tr>
                `).join("")}
            </tbody>
        `;
        body.appendChild(table);

        header.addEventListener("click", () => {
            const visible = body.style.display !== "none";
            body.style.display = visible ? "none" : "block";
            header.querySelector("span:last-child").textContent = visible ? "▶" : "▼";
        });

        block.appendChild(header);
        block.appendChild(body);
        container.appendChild(block);
    });
}

function openPlayerModal(name) {
    const modal = document.getElementById("playerModal");
    modal.style.display = "flex";

    document.getElementById("modalName").innerText = name;

    const photoPath = `photos/${name}.jpg`;
    const img = document.getElementById("modalPhoto");
    img.src = photoPath;
    img.style.display = "block";

    const labels = [];
    const goals = [];
    const assists = [];

    Object.keys(weeks).sort().forEach(week => {
        labels.push(week);
        goals.push(weeks[week][name]?.goals || 0);
        assists.push(weeks[week][name]?.assists || 0);
    });

    const bestIndex = goals.reduce((best, val, idx) => val > goals[best] ? idx : best, 0);
    const worstIndex = goals.reduce((worst, val, idx) => val < goals[worst] ? idx : worst, 0);

    document.getElementById("bestWeek").innerText =
        `Best Week: ${labels[bestIndex]} (${goals[bestIndex]} goals)`;
    document.getElementById("worstWeek").innerText =
        `Worst Week: ${labels[worstIndex]} (${goals[worstIndex]} goals)`;

    const goalsCtx = document.getElementById("goalsChart").getContext("2d");
    const assistsCtx = document.getElementById("assistsChart").getContext("2d");

    if (goalsChartInstance) goalsChartInstance.destroy();
    if (assistsChartInstance) assistsChartInstance.destroy();

    goalsChartInstance = new Chart(goalsCtx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Goals",
                data: goals,
                borderColor: "#007bff",
                backgroundColor: "rgba(0,123,255,0.1)",
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    assistsChartInstance = new Chart(assistsCtx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Assists",
                data: assists,
                borderColor: "#28a745",
                backgroundColor: "rgba(40,167,69,0.1)",
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initModalClose() {
    const modal = document.getElementById("playerModal");
    const closeBtn = document.querySelector(".close");
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };
}

function initSearch() {
    const input = document.getElementById("searchInput");
    input.addEventListener("input", () => {
        buildLeaderboard(input.value);
    });
}

function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const saved = localStorage.getItem("theme") || "light";
    if (saved === "dark") {
        document.body.classList.add("dark");
        toggle.textContent = "☀️";
    }

    toggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark");
        toggle.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

function initAdmin() {
    const unlockBtn = document.getElementById("unlockAdmin");
    const pwdInput = document.getElementById("adminPassword");
    const adminContent = document.getElementById("adminContent");
    const adminJSON = document.getElementById("adminJSON");
    const saveBtn = document.getElementById("saveAdmin");

    unlockBtn.addEventListener("click", () => {
        if (pwdInput.value === "admin123") {
            adminContent.style.display = "block";
            adminJSON.value = JSON.stringify(weeks, null, 2);
        } else {
            alert("Incorrect password.");
        }
    });

    saveBtn.addEventListener("click", async () => {
        try {
            const parsed = JSON.parse(adminJSON.value);
            weeks = parsed;
            buildWeeklyHistory();
            await navigator.clipboard.writeText(adminJSON.value);
            alert("Updated JSON copied to clipboard. Paste into data/weeks.json in your repo.");
        } catch (e) {
            alert("Invalid JSON. Please fix and try again.");
        }
    });
}

loadData();
