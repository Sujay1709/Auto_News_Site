# AutoHub — Premium Automotive Intelligence

> **The smartest car research platform on the web.** Live news, deep specs on 24 vehicles, AI-powered chat, side-by-side comparison, interactive 3D models, and a sleek React SPA — all in one place.

🌐 **Live at:** [autohub-xhgcy2euza-uc.a.run.app](https://autohub-xhgcy2euza-uc.a.run.app)

---

## What Makes AutoHub Different

Most car sites are static brochures. AutoHub is a **living, intelligent platform** — ask it anything, compare any two cars head-to-head, spin a 3D model, and catch breaking industry news, all without leaving the page. It's a **pure front-end app** with no backend to run.

---

## Features

### 🤖 AI Car Assistant (Chat)
A persistent floating chat assistant that knows the entire AutoHub vehicle catalog.
- Ask natural questions: *"Which SUV has the best range?"*, *"Compare the Porsche 911 to the Corvette C8"*, *"What's the 0–60 on the Tesla Model S Plaid?"*
- Maintains conversation history across your session with per-message timestamps
- Pulsing online indicator so you always know it's ready
- One-click clear to start a fresh conversation
- Fully accessible with ARIA labels

### ⚖️ Side-by-Side Car Comparison
Pick any two of the 24 vehicles and get an instant, data-driven comparison across four spec groups:
- **Powertrain & Performance** — engine type, transmission, drivetrain, BHP, 0–60, top speed
- **Wheels & Chassis** — tyre size, brake type
- **Features & Practicality** — price, fuel type, range, boot space, passenger count, doors, headlights
- **Safety & Driver Assistance** — ADAS suite, autonomy level, key capabilities

Winner highlighting marks the stronger value in every measurable row. A **"Spec Edge"** badge crowns the overall winner with a running tally — so you always know which car wins on paper.

### 🚗 Deep Car Specs (24 Vehicles)
Every car gets a full editorial page: overview, drives-like description, standout features, pros & cons, industry awards, expert quote, best-for summary, and a competitor comparison strip.

**Sedans** — Toyota Camry, Honda Accord, BMW 3 Series, Mercedes-Benz C-Class, Tesla Model 3, Hyundai Ioniq 6
**SUVs** — Toyota RAV4, Ford Explorer, Tesla Model X, Porsche Cayenne, Rivian R1T
**Sports** — Porsche 911, Chevrolet Corvette C8, Ferrari 296 GTB, Ford Mustang Dark Horse
**Electric** — Tesla Model S Plaid, Lucid Air, and more

### 🔄 Interactive 3D Models
Select cars come with real GLB models you can drag, spin, and zoom directly in the browser via `<model-viewer>` (loaded from CDN). Model URLs are defined per car in `src/data/cars.js`.

### 📰 Live Automotive News
Real-time headlines from **GNews.io** covering EV breakthroughs, autonomous driving, new model reveals, and global market trends — live in **both** local dev and production. Requests go through a same-origin `/newsproxy` (the Vite dev server locally, nginx on Cloud Run) that appends the API key server-side, so it never ships in the bundle. If the feed is ever unreachable the page gracefully falls back to a curated set of cached headlines.

### 🏭 Industry Intelligence
A reference-grade industry overview page: automotive history timeline from 1886 to present, current global market statistics, key industry segment breakdowns, and major market overviews by region.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **App** | React 18 + Vite + Tailwind CSS + Framer Motion |
| **Routing** | React Router (client-side SPA) |
| **3D Viewer** | `<model-viewer>` via CDN |
| **News** | GNews.io (via same-origin `/newsproxy`: Vite in dev, nginx in prod; cached fallback) |
| **Hosting** | Google Cloud Run — static `dist/` served by nginx |
| **Build/Container** | Multi-stage Docker (Node build → nginx) |

There is **no backend server** — all car data is bundled in `src/data/cars.js`.

---

## Project Structure

```
Auto_News_Site/
├── index.html                # Vite entry — mounts the React app
├── src/                      # React SPA
│   ├── main.jsx              # App bootstrap + router
│   ├── pages/
│   │   ├── Home.jsx          # Landing / gallery
│   │   ├── Compare.jsx       # Side-by-side comparison page
│   │   ├── CarDetail.jsx     # Per-car detail page
│   │   ├── News.jsx          # Live news feed (GNews via /newsproxy)
│   │   ├── Info.jsx          # Industry overview
│   │   └── Help.jsx          # Help / about
│   ├── components/
│   │   ├── ChatAssistant.jsx # AI chat popup
│   │   ├── Navbar.jsx        # Nav with Compare link
│   │   └── …                 # 3D viewer, layout, etc.
│   └── data/
│       ├── cars.js           # The 24-vehicle catalog (specs, images, GLB URLs)
│       └── carChat.js        # AI assistant copy
├── public/                   # Copied verbatim into dist/ (robots.txt, sitemap.xml)
├── vite.config.js            # Dev server (port 5175) + /newsproxy & /agent proxies
├── Dockerfile                # Node build → nginx static serve
├── nginx.conf                # SPA routing for Cloud Run
└── scripts/                  # Legacy AI 3D-generation pipeline (see note below)
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+

### Run it

```bash
git clone https://github.com/Sujay1709/Auto_News_Site.git
cd Auto_News_Site
npm install
cp .env.example .env   # add a free GNews key (https://gnews.io/) for the live News feed
npm run dev        # → http://localhost:5175
```

That's the whole app — there's nothing else to start. Without a `GNEWS_API_KEY` in `.env`, the News page simply shows cached headlines. `npm run build` produces the static `dist/`, and `npm run preview` serves that build locally.

---

## Deployment

AutoHub is deployed to **Google Cloud Run** as a static site (nginx serving the Vite `dist/`). See [DEPLOY.md](DEPLOY.md) for the full guide. The short version:

```bash
gcloud run deploy autohub \
  --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 256Mi --timeout 90 \
  --set-env-vars GNEWS_API_KEY=YOUR_GNEWS_KEY
```

`GNEWS_API_KEY` powers the nginx `/newsproxy` live-news feed (omit it and the News page falls back to cached headlines). The `Dockerfile` builds the SPA and serves it with nginx on the port Cloud Run injects; `nginx.conf` rewrites unknown paths to `index.html` so React Router routes work on refresh.

---

## Routes

| URL | Description |
|---|---|
| `/` | Home, gallery, 3D viewer |
| `/compare` | Side-by-side car comparison |
| `/cars/:slug` | Per-car detail page |
| `/news` | Automotive news |
| `/info` | Industry overview & history |

---

## Legacy: AI 3D-model generation

The `scripts/` directory contains an optional pipeline (HuggingFace InstantMesh + Tripo) that previously generated GLB models through a Flask `/api/generate-3d` endpoint. The Flask backend has since been removed in favour of a pure static SPA, so those scripts are **non-functional** unless reworked to run standalone. The 3D models currently shown come from GLB URLs in `src/data/cars.js`.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT — use it, fork it, ship it.
