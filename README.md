# SafeRoute 🛣️ — Drive Smart, Arrive Safe

A professional, elegant static web application for road safety and route risk analysis. Plan your journey by comparing **safe**, **moderate**, and **risky** routes between any two destinations, check destination weather conditions, and learn key driving safety tips — all guided by **Officer Riley**, your friendly animated traffic police mascot.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-HTML%2BCSS%2BJS-brightgreen)
![Map](https://img.shields.io/badge/map-Leaflet-green)

---

## ✨ Features

### 🗺️ Route Risk Analyzer
- Enter any **origin** and **destination** to get up to **3 alternative routes**
- Routes are **color-coded** by risk level:
  - 🟢 **Safe** (green) — highways, low congestion, well-lit
  - 🟡 **Moderate** (yellow) — mixed roads, moderate traffic
  - 🔴 **Risky** (red) — narrow roads, sharp turns, or congestion
- Interactive **Leaflet map** with real-time route drawing
- Route distance (km) and estimated duration (minutes) shown for each path

### 🌦️ Destination Weather
- Automatically fetches **live weather** at your destination after planning a route
- Displays temperature, humidity, wind speed, and weather condition
- Shows **hazard warnings** for dangerous driving conditions (rain, snow, storms, fog, high winds)

### 🚦 Safety Tips
- 6 essential road safety tips presented as interactive cards
- Topics: Traffic signals, phone usage, rain driving, seatbelts, rest stops, drunk driving

### 👮 Officer Riley — Animated Mascot
- Cute animated traffic police character waving in the hero section
- Speech bubble with welcoming safety message
- Hover effects on tip cards for engaging interaction

### 🎨 Design
- **Navy Trust** color palette — professional, authoritative, trustworthy
- **Space Grotesk** headings + **DM Sans** body typography
- Fully **responsive** — works on desktop, tablet, and mobile
- Smooth CSS animations (wave, pop, slide-up, hover transforms)
- Sticky glass-morphism navigation bar

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Structure | HTML5 (semantic) |
| Styling | CSS3 (custom properties, grid, flexbox, animations) |
| Logic | Vanilla JavaScript (ES6+, async/await) |
| Maps | [Leaflet](https://leafletjs.com/) 1.9.4 |
| Tiles | OpenStreetMap |
| Fonts | Google Fonts (Space Grotesk, DM Sans) |

---

## 🔌 External APIs Used (All Free, No API Key Required)

| Service | Purpose | Endpoint |
|---------|---------|----------|
| **Nominatim** (OpenStreetMap) | Geocoding — convert place names to lat/lon | `nominatim.openstreetmap.org` |
| **OSRM** | Route calculation — driving directions with alternatives | `router.project-osrm.org` |
| **Open-Meteo** | Weather forecast — current conditions at destination | `api.open-meteo.com` |

> **Note:** These are public free-tier APIs. For production use, consider adding rate-limiting headers and caching.

---

## 📁 File Structure

```
saferoute/
├── index.html              # Main landing page (all sections)
├── styles.css              # Complete stylesheet with CSS variables
├── script.js               # App logic: map, routing, weather, UI
├── assets/
│   ├── traffic-police.png       # Officer Riley mascot (hero section)
│   └── traffic-police-point.png # Mascot avatar (pointing pose)
├── .gitignore
└── README.md               # This file
```

---

## 🚀 How It Works

### 1. Route Planning Flow
```
User enters From/To → Nominatim geocodes both places
                        ↓
              OSRM fetches alternative driving routes
                        ↓
         Routes sorted by duration (shortest = safest baseline)
                        ↓
    Each route classified as Safe / Moderate / Risky
                        ↓
      Routes drawn on Leaflet map with color-coded polylines
                        ↓
      Weather fetched at destination + hazard check
```

### 2. Risk Classification Logic
Routes are sorted by **duration** (shortest first). The heuristic labels are:
- **Safe**: Fastest route → assumed highways, better roads
- **Moderate**: Middle route → mixed conditions
- **Risky**: Slowest route → assumed narrow/congested roads

> This is a heuristic based on OSRM's default driving profile. For real-world risk scoring, you could integrate traffic data, accident history APIs, or road condition databases.

### 3. Weather Hazard Detection
Driving warnings trigger when:
- Precipitation > 0.5 mm
- Wind speed > 40 km/h
- Weather code indicates: heavy snow (75), violent showers (82), or thunderstorms (95, 96, 99)

---

## 🏁 Quick Start

### Option A: Open Directly
Simply open `index.html` in any modern browser:
```bash
cd saferoute
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

### Option B: Use a Local Server (recommended for CORS)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```
Then visit `http://localhost:8000`

---

## 📱 Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| > 900px | Full desktop: sidebar planner + wide map |
| 640–900px | Stacked layout, hero centered |
| < 640px | Mobile: nav links hidden, single column, mascot repositions |

---

## 🎨 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0f1b3d` | Primary text, buttons, headings |
| Navy-2 | `#1e3a5f` | Secondary backgrounds |
| Blue | `#3b6fa0` | Accents, highlights |
| Background | `#f5f7fb` | Page background |
| Card | `#ffffff` | Card surfaces |
| Safe | `#16a34a` | Safe route / success |
| Moderate | `#f59e0b` | Moderate route / warning |
| Risky | `#dc2626` | Risky route / danger |
| Muted | `#5b6b85` | Body text, descriptions |

---

## 🔮 Future Enhancements

- [ ] **AI Chatbot** — Add a rule-based or LLM-powered chatbot for road safety Q&A
- [ ] **Real Traffic Data** — Integrate Google Maps Traffic or TomTom Traffic API
- [ ] **Accident Hotspots** — Overlay historical accident data on the map
- [ ] **Voice Alerts** — Add text-to-speech for route warnings
- [ ] **PWA Support** — Service worker for offline caching
- [ ] **Multi-language** — i18n support for regional languages
- [ ] **User Accounts** — Save favorite routes and trip history

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Leaflet](https://leafletjs.com/) — Beautiful, lightweight maps
- [OpenStreetMap](https://www.openstreetmap.org/) — Free world map data
- [OSRM](http://project-osrm.org/) — Fast open-source routing engine
- [Open-Meteo](https://open-meteo.com/) — Free weather API
- Officer Riley mascot — AI-generated traffic police character

---

<p align="center">Made with ❤️ for safer roads everywhere.</p>
<p align="center"><strong>Drive Smart · Arrive Safe</strong></p>
