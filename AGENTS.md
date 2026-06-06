# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this project is

**AutoHub** (formerly "Auto Industry Hub") — a Flask + React fullstack automotive information portal. The Flask backend (`app.py`) serves Jinja2-rendered pages for news, car specs, and industry info; the React/Vite frontend in `src/` is a separate SPA that also renders the gallery. Both share a `cars_data` table (24 vehicles across sedan / SUV / sports / electric categories) and look up per-car imagery from `static/images/cars/<slug>.jpg` with Wikimedia as the fallback.

The app is **deployed publicly on Render.com** under the service name `autohub` (free tier, see `DEPLOY.md`).

## Common commands

### Run the Flask backend (primary)
```bash
# Activate existing venv
.venv/bin/python app.py           # serves on http://localhost:8080

# Or fresh setup
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

### Run the React/Vite frontend (secondary SPA at root `/`)
```bash
npm install
npm run dev          # dev server with HMR
npm run build        # production build to dist/
npm run preview      # preview the build
```

### Docker (alternative)
```bash
docker compose up --build        # builds via Dockerfile, exposes 8080
```

### Lint JS/JSX
```bash
npx eslint .                      # uses eslint.config.js (flat config)
```

### Regenerate 3D models for cars (optional pipeline)
- `scripts/instantmesh_generate.py <slug>` — free image→GLB via HuggingFace InstantMesh (drop source photo at `static/images/source/<slug>.jpg` first)
- `scripts/trigger_all_3d.sh` — batch-submit paid Tripo text→3D jobs (needs `TRIPO_API_KEY` in env)
- See `scripts/README.md` for full details

There is no test suite. There is no `pytest` configuration. Validation is done by hitting routes in a browser.

## Big-picture architecture

### Request flow
- `app.py` is a single-file Flask app. `cars_data` is an in-memory list of 24 dicts at module scope. There is **no database** — every page render either reads from this list or from JSON files in `data/`.
- `data/cars_details.json` — per-car editorial copy (overview, drives_like, features, pros, cons, awards, expert_quote, best_for, competitors). Loaded lazily by `load_cars_details()`. The keys here are the **slugs** defined by `_car_slug(car)`.
- `data/car_3d_catalog.json` — slug → GLB model path. Edited by the AI generation scripts as jobs complete.
- `data/generated_jobs.json` — the Tripo / InstantMesh job queue status (regenerated, ephemeral).

### Routes
- `GET /` — React SPA (Vite builds `index.html` → `<div id="root">` mount)
- `GET /news` — fetches NewsAPI (key in `app.py:21`); renders `news.html` with article cards
- `GET /info` — static industry page from `info.html`
- `GET /cars` — listing + filter (`?type=sedan|suv|sports|electric`) + selection (`?slug=...` or `?make=...&model=...`)
- `GET /cars/<slug>` — full per-car detail page with pros/cons, awards, expert quote, and a competitor compare strip

### Image resolution (`get_car_image_url`, `app.py:64`)
1. Looks in `static/images/cars/<slug>.<ext>` and `static/images/source/<slug>.<ext>` (extensions: `.webp`, `.jpg`, `.jpeg`, `.png`)
2. Falls back to the `FALLBACK_IMAGES` dict mapping slug → Wikimedia URL
3. Final fallback: a generic Unsplash car photo

**To add a new car**: append to `cars_data` in `app.py` AND add a matching entry in both `data/cars_details.json` AND `FALLBACK_IMAGES`. Slug = lowercase `{make}-{model}` with spaces → dashes (see `_car_slug`).

### 3D model resolution
The `static/models/` directory has three subtrees:
- `community-cars/` — committed branded GLBs (Ferrari 599, BMW M8, Tesla Roadster, etc.) — survive restarts
- `community/` — generic free CC0 GLBs
- `generated/` — AI-generated GLBs (Tripo / InstantMesh output) — **ephemeral on Render free tier**, gets wiped on restart

### Frontend coexistence
The repo contains **two frontends**:
1. **Jinja2 templates** in `templates/` — what Flask renders for `/news`, `/cars`, `/cars/<slug>`, `/info`. Uses `static/styles.css`.
2. **React SPA** in `src/` + `index.html` — what the browser sees at `/`. Uses Vite + Tailwind + Framer Motion + `<model-viewer>` (loaded from CDN) for the 3D viewer.

Both share the Flask-rendered `templates/base.html` and the React-rendered `index.html` have separate `model-viewer` setups. They are not bridged — Flask serves the React bundle as static files, and the React app fetches data from Flask's JSON-less routes (the `cars_data` is duplicated in `src/data/cars.js`).

### Environment variables
- `NEWS_API_KEY` (or hardcoded in `app.py:21`) — used by `/news`
- `TRIPO_API_KEY` — paid 3D generation; absence just disables the routes that need it
- `HF_TOKEN` — optional priority queue for InstantMesh free tier
- `PORT` — set by Render; defaults to 8080
- `FLASK_DEBUG=0` in production (per `render.yaml`)

## Conventions

- **Slug = `{make}-{model}` lowercased, spaces → dashes** — used in URLs, filenames, and as keys in `data/*.json`. Adding a new car = add slug to `cars_data`, `cars_details.json`, `FALLBACK_IMAGES`, and (if you have a photo) drop a `static/images/cars/<slug>.jpg`.
- **Drop-in asset pattern** — `static/images/cars/<slug>.webp` and `static/images/source/<slug>.jpg` are picked up automatically with no code changes. README files in those directories (`static/images/cars/README.md`, `static/images/source/README.md`) document the slug rules and recommended dimensions.
- **`gunicorn` for production, Flask dev server for local** — `Procfile` and `Dockerfile` both use gunicorn with the same args: `app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 90`.
- **No build step for the Flask app** — only the React SPA builds. `npm run build` outputs to `dist/`, which is served by Flask as static.
- **Image sourcing from Wikimedia is now rate-limited** — the hardcoded `FALLBACK_IMAGES` URLs in `app.py` use a thumbnail size that Wikimedia may reject with HTTP 400. If images stop loading, either re-resolve via the Wikipedia REST API (see `static/images/cars/*.jpg` for files that already work locally) or update `app.py:FALLBACK_IMAGES` to use the `originalimage` URL returned by `/api/rest_v1/page/summary/<title>`.
