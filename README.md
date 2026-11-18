# BIDBATTLE — Esports Local Multiplayer Auction Game

A complete, high-octane local multiplayer auction game inspired by IPL mega auctions. Built for friends to sit around a single laptop, bid in real time with esports-broadcast visuals, manage franchise budgets, and build championship squads.

---

## ⚡ Features

- **Local Pass-and-Play Multiplayer**: Designed for 2–4 players on ONE physical laptop, ONE browser window, and ONE shared screen.
- **Fixed Four Franchises**:
  - 👑 **Nishanth** (Electric Purple — `#9147FF`)
  - ⚡ **Ajmal** (Neon Cyan — `#00D9FF`)
  - 🔥 **Praneeth** (Vibrant Orange — `#FF8A35`)
  - 🛡️ **Nagulan** (Neon Green — `#B7F34A`)
- **Configurable Budgets**: Default starting purse of ₹100 Cr per franchise, with full customization support before tournament launch.
- **Live Broadcast Auction Arena**:
  - Real-time countdown timer with 5-second urgency warning pulse.
  - Automatic progressive bid increments based on highest bid:
    - `< ₹5 Cr`: +₹0.50 Cr
    - `₹5 Cr to < ₹10 Cr`: +₹1.00 Cr
    - `₹10 Cr to < ₹25 Cr`: +₹2.00 Cr
    - `₹25 Cr to < ₹50 Cr`: +₹5.00 Cr
    - `≥ ₹50 Cr`: +₹10.00 Cr
  - Anti-self bidding protection.
  - Team purse health indicators (Healthy / Moderate / Critical).
  - Sound effects for bids, gavel strikes, timeouts, and victories.
- **Tournament Presets & Custom Import**:
  - Curated tournaments (Tamil Cinema Heroes, Queens, Directors, Comedy Icons, etc.).
  - Custom Tournament JSON import and export engine.
- **100% Offline & Private**: Zero cloud backend, database, or API requirements. All game state and custom tournaments persist safely in browser `localStorage`.

---

## 📋 System Requirements

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **Modern Web Browser**: Google Chrome, Microsoft Edge, Brave, or Mozilla Firefox.

---

## 🚀 Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Nishanth1247/<REPO_NAME>.git
cd auction
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173/
```

### 4. Production Build (Optional)
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
auction/
├── src/
│   ├── components/
│   │   ├── auction/          # Live auction arena, hammer controls, bidder spotlight
│   │   ├── common/           # Navigation, sound toggles, currency formatting
│   │   ├── landing/          # Home screen, tournament cards, launch modal
│   │   ├── party/            # Party Arena games and lobby
│   │   ├── setup/            # Custom tournament creation & budget wizard
│   │   └── ui/               # Reusable buttons, badges, cards, modals
│   ├── context/
│   │   ├── AuctionContext.jsx    # Core auction state, timer, bidding logic
│   │   └── PartyGameContext.jsx  # Party Arena multiplayer session manager
│   ├── services/
│   │   ├── auctionEngine.js      # Fixed paise math, progressive increments, bid rules
│   │   ├── presets.js            # Ready-to-play curated tournament rosters
│   │   ├── soundService.js       # Web Audio API procedural sound generation
│   │   └── storageService.js     # Safe localStorage persistence layer
│   ├── App.jsx               # Main application routing & view switcher
│   ├── main.jsx              # Vite entry point
│   └── index.css             # Tailwind CSS & esports theme styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 💾 Tournament Import & Storage

- **Custom Tournament Import**:
  - Navigate to **"CUSTOM TOURNAMENTS"** on the home page.
  - Click **"Import Tournament JSON"** to upload a tournament file.
  - The import only saves the tournament to your library; it does not launch immediately, letting you configure team budgets before playing.
- **LocalStorage Persistence**:
  - All tournaments, squad history, and custom rosters are stored under the `bidbattle_*` keys in browser LocalStorage.
  - To reset data, use the in-app Reset controls or clear local site storage in developer tools.

---

## ⚙️ Environment Variables

No `.env` file or API key is required to play. The entire auction system runs completely offline.

An optional `.env.example` is provided if you wish to configure optional AI generation features:
```bash
# Optional: Only needed if using AI-assisted content generation
VITE_GEMINI_API_KEY=your_optional_api_key_here
```

---

## 🎮 How to Play

1. **Launch a Tournament**: Pick a curated preset from the home screen or import your custom roster.
2. **Set Franchise Budgets**: Review or edit starting budgets for Nishanth, Ajmal, Praneeth, and Nagulan.
3. **Select Arena Pace**: Choose Standard (20s), Blitz (10s), Marathon (35s), or Sudden Death.
4. **Enter Live Arena**: Bidders sit together around the laptop and click their franchise bid button to outbid opponents.
5. **Sold & Podium**: When the countdown runs out, the hammer strikes and the lot is sold. Review final squad rosters and team ratings on the Tournament Podium!
