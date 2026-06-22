# TNF League – Web Dashboard

A modular, multi‑page web application for managing the **Thursday Night Football (TNF)** community league.  
The platform provides real‑time stats, weekly highlights, player profiles, admin tools, and automated totals.

This system is built for **zero‑backend deployment** using GitHub Pages, with all data sourced from JSON files.

---

## 🚀 Features

### **Public Pages**
- **Dashboard**  
  - Total goals, assists, contributions  
  - Top 3 scorers & assist leaders  
  - Leaderboard with FLIP animation  
  - Sort by goals / assists / total  
  - Theme toggle  

- **Highlights**  
  - Weekly match cards  
  - Goalscorers & assists  
  - Full‑match video links  
  - Auto‑sorted newest → oldest  

- **Players**  
  - Full roster grid  
  - Player modal with stats  
  - Auto‑generated from JSON + weekly data  

### **Admin Panel**
- Upload receipts (demo simulation)  
- Payments log  
- Slot release (locked after Wednesday 12:00 UK)  
- Publish selected teams (Top 32 + reserves)  
- Auto‑recompute totals  

---

## 🧱 Tech Stack

- **HTML5** (multi‑page structure)  
- **CSS (inline)** for pixel‑perfect preservation  
- **Vanilla JavaScript** (modular ES scripts)  
- **JSON** for data storage  
- **GitHub Pages** for hosting  

No frameworks. No backend. No dependencies.

---

## 📁 Folder Structure

tnf-league/
│
├── dashboard.html
├── highlights.html
├── players.html
├── admin.html
│
├── scripts/
│   ├── common.js
│   ├── dashboard.js
│   ├── highlights.js
│   ├── players.js
│   └── admin.js
│
├── data/
│   ├── players.json
│   └── weeks.json
│
├── photos/
│   └── <player>.jpg
│
└── README.md

Code

---

## 📊 Data Model

### **players.json**
[
{ "name": "Hassan" },
{ "name": "Goke" },
...
]

Code

### **weeks.json**
{
"WEEK-12": {
"date": "2026-06-10",
"players": [
{ "name": "Hassan", "goals": 2, "assists": 1 },
{ "name": "Goke", "goals": 1, "assists": 0 }
],
"fullVideoUrl": "https://youtube.com/..."
}
}

Code

### **Automatic merging**
- Duplicate names inside a week are merged  
- Names are normalised (capitalisation, spacing)  
- Totals are recalculated from scratch on every load  

---

## 🔄 Updating Data

### **Add a new week**
1. Open `data/weeks.json`
2. Add a new entry:
"WEEK-13": {
"date": "2026-06-17",
"players": [
{ "name": "Okky", "goals": 1, "assists": 0 },
{ "name": "Hebro", "goals": 0, "assists": 2 }
],
"fullVideoUrl": ""
}

Code
3. Commit & push  
4. GitHub Pages updates automatically  

### **Add a new player**
1. Add to `players.json`  
2. Or simply include them in a week — the system auto‑adds missing players  

---

## 🛠 Admin Workflow

### **Upload Receipt**
- Enter player name  
- Enter amount  
- Choose file  
- Upload  
- Appears in payments log (demo only)

### **Release Slot**
- Only first 32 players  
- Only before **Wednesday 12:00 UK**  
- Auto‑recomputes totals  

### **Publish Teams**
- Generates:
  - Top 32  
  - Next 10 reserves  

---

## 🌐 Deployment (GitHub Pages)

### **1. Push your repo to GitHub**

### **2. Enable GitHub Pages**
- Go to **Settings → Pages**
- Select:
  - **Source:** `main`
  - **Folder:** `/root` (or `/docs` if you move files)
- Save

### **3. Your site becomes available at:**
https://<username>.github.io/<repo>/

Code

### **4. Ensure correct paths**
All pages use **relative paths**, so GitHub Pages works automatically.

---

## 🧪 Local Development

Just open any page in your browser:

dashboard.html
highlights.html
players.html
admin.html

Code

No server required.

If testing locally with Chrome, you may need:

chrome.exe --allow-file-access-from-files

Code

(because JSON fetches are blocked by default)

---

## 👤 Credits

Built for the **TNF Community League**.  
Designed and engineered by **Adeogun**.

---

## 📬 Support

For issues or feature requests, open a GitHub Issue.
