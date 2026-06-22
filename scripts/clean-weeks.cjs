// clean-weeks.cjs


const fs = require("fs");

function titleCase(s) {
  return s.trim().replace(/\s+/g, " ")
    .split(" ")
    .map(w => w[0] ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)
    .join(" ");
}

const weeksPath = "./data/weeks.json";
const outPath = "./data/weeks.json";

let weeks = JSON.parse(fs.readFileSync(weeksPath, "utf8"));
const cleaned = {};

for (const [wk, obj] of Object.entries(weeks)) {
  const merged = {};
  (obj.players || []).forEach(r => {
    const name = titleCase(r.name);
    if (!merged[name]) merged[name] = { name, goals: 0, assists: 0 };
    merged[name].goals += Number(r.goals || 0);
    merged[name].assists += Number(r.assists || 0);
  });
  cleaned[wk] = { ...obj, players: Object.values(merged) };
}

fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2), "utf8");
console.log("Weeks.json cleaned and updated.");
