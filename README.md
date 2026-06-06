# AutoHub-render.com — Premium Automotive Intelligence

> **The smartest car research platform on the web.** Live news, deep specs on 24 vehicles, AI-powered chat, side-by-side comparison, interactive 3D models, and a sleek React SPA — all in one place.

🌐 **Live at:** [autohub.onrender.com](https://autohub.onrender.com)

---

## What Makes AutoHub Different

Most car sites are static brochures. AutoHub is a **living, intelligent platform** — ask it anything, compare any two cars head-to-head, spin a 3D model, and catch breaking industry news, all without leaving the page.

---

## Features

### 🤖 AI Car Assistant (Chat)
A persistent floating chat assistant powered by AI that knows the entire AutoHub vehicle catalog.
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
Select cars come with real GLB models you can drag, spin, and zoom directly in the browser via `<model-viewer>`. The model pipeline supports:
- Committed branded GLBs (Ferrari 599, BMW M8, Tesla Roadster) that survive restarts
- AI-generated models via HuggingFace InstantMesh (free) and Tripo (paid)

### 📰 Live Automotive News
Real-time news fetched from NewsAPI on every page load. Covers:
- Electric vehicle breakthroughs
- Autonomous driving developments
- New model reveals and launches
- Global automotive market trends

### 🏭 Industry Intelligence
A reference-grade industry overview page:
- Automotive history timeline from 1886 to present
- Current global market statistics
- Key industry segment breakdowns
- Major automotive market overviews by region

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend SPA** | React 18 + Vite + Tailwind CSS + Framer Motion |
| **Backend** | Flask (Python) + Gunicorn |
| **3D Viewer** | `<model-viewer>` via CDN |
| **AI Chat** | Integrated AI assistant API |
| **News** | NewsAPI |
| **Deployment** | Render.com (auto-deploy from `main`) |
| **Containerisation** | Docker + Docker Compose |

---

## Project Structure

```
Auto_News_Site/
├── app.py                    # Flask backend — routes, image resolution, NewsAPI
├── src/                      # React SPA (Vite)
│   ├── pages/
│   │   ├── Home.jsx          # Landing / gallery
│   │   ├── Compare.jsx       # ← Side-by-side comparison page
│   │   ├── Cars.jsx          # Car listing & detail
│   │   └── News.jsx          # News feed
│   ├── components/
│   │   ├── ChatAssistant.jsx # ← AI chat popup
│   │   ├── Navbar.jsx        # Nav with Compare link
│   │   └── CarViewer.jsx     # 3D model viewer
│   └── data/cars.js          # Client-side car catalog
├── templates/                # Jinja2 templates (Flask-rendered routes)
├── data/
│   ├── cars_details.json     # Editorial copy per car
│   └── car_3d_catalog.json   # slug → GLB model path
├── static/
│   ├── images/cars/          # Local car images (slug.jpg/webp)
│   └── models/               # GLB model files
├── scripts/                  # 3D generation pipeline
├── render.yaml               # Render.com one-click deploy config
└── Dockerfile / compose.yaml
```

---

## Getting Started Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1 — Clone & install

```bash
git clone https://github.com/Sujay1709/Auto_News_Site.git
cd Auto_News_Site

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

npm install
```

### 2 — Set environment variables (optional but recommended)

```bash
export NEWS_API_KEY=your_newsapi_key      # free at newsapi.org
export TRIPO_API_KEY=your_tripo_key       # only needed for AI 3D generation
```

### 3 — Start both servers

**Terminal 1 — Flask backend (internal API):**
```bash
.venv/bin/python app.py
```

**Terminal 2 — Vite dev server (the browser):**
```bash
npm run dev
```

### 4 — Open the app

```
http://localhost:5173
```

> The Vite dev server proxies `/api` and `/static` calls to Flask automatically. Never open `:8080` directly — that's the internal backend.

---

## Docker (one command)

```bash
docker compose up --build
```

Access at `http://localhost:5173`

---

## Deployment

AutoHub deploys automatically to Render.com on every push to `main`.

**First-time setup:**
1. Go to [render.com](https://render.com) → **New → Blueprint**
2. Connect the `Sujay1709/Auto_News_Site` repo
3. Render detects `render.yaml` and provisions the `autohub` service automatically
4. Set `NEWS_API_KEY` in the Environment tab
5. Wait ~3-5 minutes → live at **`https://autohub.onrender.com`**

Subsequent deploys: just `git push origin main`.

---

## Routes

| URL | Description |
|---|---|
| `/` | React SPA — home, gallery, 3D viewer |
| `/compare` | Side-by-side car comparison |
| `/cars` | Full car listing with type filter |
| `/cars/<slug>` | Per-car detail page |
| `/news` | Live automotive news |
| `/info` | Industry overview & history |

**Filter by category:**
```
/cars?type=sedan
/cars?type=suv
/cars?type=sports
/cars?type=electric
```

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
