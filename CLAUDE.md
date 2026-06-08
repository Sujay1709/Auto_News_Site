# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**AutoHub** — a pure **Vite + React single-page app** (an automotive information portal). There is **no backend server**: car data is bundled in `src/data/cars.js`, imagery loads from external URLs (Wikimedia Commons / Unsplash), and 3D models load via `<model-viewer>` from GLB URLs. The whole app is built by Vite into static files.

The app is **deployed publicly on Google Cloud Run** (service `autohub`, region `us-central1`) as a static site served by nginx — https://autohub-xhgcy2euza-uc.a.run.app

## Common commands

### Run the app (browser = http://localhost:5175)
```bash
npm install
npm run dev          # http://localhost:5175  ← the app (Vite dev server)
npm run build        # production build → dist/
npm run preview      # preview the production build
```

### Lint
```bash
npx eslint .                      # uses eslint.config.js (flat config)
```

There is no test suite and no backend to run. Validation is done by hitting routes in the browser.

## Architecture

- **Single-page app** — `index.html` mounts `src/main.jsx` → a React app using React Router. Page components live in `src/pages/` (`Home`, `CarDetail`, `News`, `Info`, `Compare`, `Help`). Shared UI is in `src/components/`.
- **Data** — all 24 vehicles are defined in `src/data/cars.js` (specs, external image URLs, GLB model URLs). The AI-assistant chat copy lives in `src/data/carChat.js`. There is no database and no server-side data loading.
- **Images** — sourced from external URLs in `cars.js` (Wikimedia Commons lead images, Unsplash). The SPA does not depend on any local `static/` files.
- **3D models** — `<model-viewer>` (loaded from CDN in `index.html`) renders GLB files referenced by URL in `cars.js`.
- **News page** (`src/pages/News.jsx`) — fetches live NewsAPI headlines through the Vite dev proxy `/newsapi` (see `vite.config.js`), which only exists during `npm run dev`. In a deployed static build the proxy is absent, the request fails, and the page falls back to the cached `FALLBACK` headlines, showing a "Cached Feed" badge.
- **AI agent** (`agent/`) — a *separate* Python service (Google ADK + Gemini, FastAPI `POST /chat`) deployed independently to Cloud Run (`autohub-agent`). The SPA's `ChatAssistant` calls it via `src/data/carAgent.js` (dev: `/agent` Vite proxy → `:8000`; prod: `VITE_AGENT_URL`). If the agent is unreachable, the chat falls back to the local `carChat.js` engine and shows a "Local" badge. The agent's catalog (`agent/car_data.json`) is generated from `src/data/cars.js` by `scripts/export-cars.mjs` (run in `npm run build`'s `prebuild`).

## Deployment (Google Cloud Run, static)

The `Dockerfile` is a two-stage build: a Node stage runs `npm run build`, then an `nginx` stage serves `dist/` on the port Cloud Run injects (`$PORT`). `nginx.conf` provides SPA routing (`try_files … /index.html`) so React Router client routes resolve on direct loads/refresh.

```bash
gcloud run deploy autohub \
  --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 256Mi --timeout 90
```

`public/robots.txt` and `public/sitemap.xml` are copied into `dist/` at build time for SEO; update the URLs in them if the deployed domain changes.

## Conventions

- **Slug = `{make}-{model}` lowercased, spaces → dashes** — used in routes (`/cars/:slug`) and any optional local asset filenames.
- **Adding a new car** = append a record to `src/data/cars.js` (include an `image` URL and a GLB model URL). No other files are required.
- **No backend** — this is a static SPA; do not add Flask/Python server code. Anything needing server-side logic (e.g. a production NewsAPI proxy) must be a separate serverless function or an nginx proxy in `nginx.conf`.

> Legacy note: the `scripts/` directory contains an optional AI 3D-model generation pipeline (Tripo / InstantMesh) that previously drove a Flask `/api/generate-3d` endpoint. That Flask backend has been removed, so those scripts are non-functional unless reworked to run standalone.
