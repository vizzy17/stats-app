# Player Stats Dashboard

A lightweight, mobile‑friendly web application for tracking weekly football player performance.  
The dashboard displays goals, assists, total contributions, weekly history, player trend charts, and an admin panel for updating stats.

---

## 🚀 Features

### 🏆 Leaderboard
- Auto‑sorted by total contributions (Goals + Assists)
- Gold/Silver/Bronze highlights for top 3
- Search bar for quick filtering
- Click any player to open their profile modal

### 📅 Weekly History
- Collapsible week‑by‑week tables
- Automatically generated from `weeks.json`
- Supports unlimited weeks

### 👤 Player Profile


stats-app/
│
├── index.html
├── style.css
├── app.js
│
├── data/
│   ├── players.json
│   └── weeks.json
│
└── photos/
└── (optional player images)

Code

---

## 🛠 How to Update Weekly Stats

1. Open `data/weeks.json`
2. Add a new week block:

"week2": {
"Hassan": { "goals": 2, "assists": 1 },
"Gbemmy": { "goals": 1, "assists": 0 },
...
}

Code

3. Commit and push  
4. Netlify auto‑deploys

---

## 🌐 Deployment

This project is fully static — no backend required.

### Deploy on Netlify:
- Add new site → Import from GitHub
- Build command: _none_
- Publish directory: `/`

---

## 📸 Player Photos (Optional)

Add images to:

photos/PlayerName.jpg

Code

If a photo is missing, the modal hides the image automatically.

---

## 🔑 Admin Password

Default password: `admin123`  
(You can change this inside `app.js`.)

---

## 📄 License

This project is private unless you choose to add a license.
