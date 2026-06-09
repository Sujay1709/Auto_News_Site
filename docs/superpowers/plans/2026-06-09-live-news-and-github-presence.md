# Live News in Production + GitHub Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the News page show a real, live automotive feed on the deployed site (not "Live Feed Unavailable"), then give the GitHub repo a proper About description/topics, watch it, and publish a tagged release.

**Architecture:** Replace the localhost-only NewsAPI call with **GNews.io**, reached **same-origin through an nginx reverse proxy** (`/newsproxy/*`) that injects the API key server-side from a Cloud Run env var — mirroring the existing `/agent` proxy pattern. The Vite dev server gets a matching `/newsproxy` proxy so dev still works. The article-mapping logic is extracted into a small, unit-tested pure module. The GitHub tasks are operational (`gh` CLI) and run after the feature is merged.

**Tech Stack:** Vite 5 + React 18, nginx (Cloud Run static), GNews.io REST API, Vitest (new dev dependency for the one piece of real branching logic), `gh` CLI for GitHub.

**Why this approach (decided up front):**
- NewsAPI's free Developer plan only accepts requests from `localhost`, so it can never work on the deployed Cloud Run site. GNews.io's free tier (~100 requests/day, up to 10 articles/request) **does** allow server-side production calls.
- The key is appended by nginx, so it never ships in the client bundle.
- No new backend service — the existing nginx container already proxies `/agent`; we add one more `location`.

---

## File Structure

| File | Responsibility | Action |
| --- | --- | --- |
| `src/data/newsFeed.js` | Pure helpers: map one GNews article → UI shape; turn a raw GNews response into `{articles, live}` with fallback. | Create |
| `src/data/newsFeed.test.js` | Vitest unit tests for the helpers. | Create |
| `src/pages/News.jsx` | News page UI. Switch the fetch URL to `/newsproxy/...` and use `normalizeFeed`. | Modify |
| `vite.config.js` | Add a `/newsproxy` dev proxy that appends the dev API key. | Modify |
| `nginx.conf` | Add a `/newsproxy/` reverse proxy that appends `${GNEWS_API_KEY}`. | Modify |
| `package.json` | Add `vitest` dev dep + `test` script; bump version to `1.5.0`. | Modify |
| `.env.example` | Document the `GNEWS_API_KEY` dev variable (real `.env` is gitignored). | Create |
| `CLAUDE.md` | Update the News-page description to reflect the live GNews proxy. | Modify |
| `README.md` | Add a short project blurb + live-news/setup note. | Modify |
| `.claude/.../memory/production-readiness-roadmap.md` | Tick off the live-news slice. | Modify |

---

## Prerequisites (do once, before Task 1)

- [ ] **P1: Get a free GNews API key**

Sign up at https://gnews.io/ → copy the API key from the dashboard. Keep it handy; it's used in `.env` (dev), the Docker local test, and the Cloud Run env var (prod).

- [ ] **P2: Create the working branch**

```bash
cd /Users/sujaygopal/Auto_News_Site
git checkout main
git pull
git checkout -b feat/live-news-prod
```

- [ ] **P3: Put the key in a local, gitignored `.env`**

`.env` is already in `.gitignore` (line 16). Create it (replace the placeholder with your real key):

```bash
printf 'GNEWS_API_KEY=your_real_gnews_key_here\n' > .env
```

---

## Task 1: Article-normalization helpers (TDD)

This is the only branching logic worth a unit test: GNews returns `image` where the UI expects `urlToImage`, and an empty result must fall back to cached headlines with `live=false`.

**Files:**
- Create: `src/data/newsFeed.js`
- Test: `src/data/newsFeed.test.js`
- Modify: `package.json` (add vitest + `test` script)

- [ ] **Step 1: Add Vitest and a test script**

Run:

```bash
npm install --save-dev vitest@^2.1.8
```

Then edit `package.json` — add a `test` script to the `"scripts"` block so it reads:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "export:cars": "node scripts/export-cars.mjs",
    "prebuild": "node scripts/export-cars.mjs"
  },
```

- [ ] **Step 2: Write the failing test**

Create `src/data/newsFeed.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { mapArticle, normalizeFeed } from './newsFeed';

const FALLBACK = [{ source: { name: 'Cached' }, title: 'Cached story', urlToImage: null }];

describe('mapArticle', () => {
  it('maps GNews `image` to `urlToImage` and keeps the source name', () => {
    const out = mapArticle({
      title: 'New EV launches',
      description: 'desc',
      url: 'https://example.com/a',
      image: 'https://example.com/a.jpg',
      publishedAt: '2026-06-09T10:00:00Z',
      source: { name: 'DriveTech' },
    });
    expect(out).toEqual({
      source: { name: 'DriveTech' },
      title: 'New EV launches',
      description: 'desc',
      url: 'https://example.com/a',
      urlToImage: 'https://example.com/a.jpg',
      publishedAt: '2026-06-09T10:00:00Z',
    });
  });

  it('defaults a missing image to null and a missing source to "Auto News"', () => {
    const out = mapArticle({ title: 'x', url: 'u' });
    expect(out.urlToImage).toBeNull();
    expect(out.source.name).toBe('Auto News');
  });
});

describe('normalizeFeed', () => {
  it('returns live, mapped articles when the response has stories', () => {
    const data = { articles: [{ title: 'A', image: 'i.jpg', source: { name: 'S' } }] };
    const result = normalizeFeed(data, FALLBACK);
    expect(result.live).toBe(true);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].urlToImage).toBe('i.jpg');
  });

  it('drops empty/placeholder titles', () => {
    const data = { articles: [{ title: '' }, { title: '[Removed]' }, { title: 'Keep', source: {} }] };
    const result = normalizeFeed(data, FALLBACK);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].title).toBe('Keep');
  });

  it('falls back to cached headlines (live=false) when there are no articles', () => {
    expect(normalizeFeed({ articles: [] }, FALLBACK)).toEqual({ articles: FALLBACK, live: false });
  });

  it('falls back when the response is malformed', () => {
    expect(normalizeFeed(null, FALLBACK)).toEqual({ articles: FALLBACK, live: false });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./newsFeed"` (the module doesn't exist yet).

- [ ] **Step 4: Write the minimal implementation**

Create `src/data/newsFeed.js`:

```js
// Helpers that adapt the GNews.io API response to the shape the News page
// renders. GNews returns `image` where the UI expects `urlToImage`; otherwise
// the fields line up with what News.jsx already consumed from NewsAPI.

// Map a single GNews article to the UI's article shape.
export function mapArticle(a) {
  return {
    source: { name: a.source?.name || 'Auto News' },
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.image || null,
    publishedAt: a.publishedAt || '',
  };
}

// Turn a raw GNews response into the feed the page shows. Returns the live
// articles when present, otherwise the supplied fallback with live=false.
export function normalizeFeed(data, fallback) {
  const list = (data?.articles || [])
    .filter((a) => a && a.title && a.title !== '[Removed]')
    .map(mapArticle);
  if (list.length) return { articles: list, live: true };
  return { articles: fallback, live: false };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — 6 tests passing.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/data/newsFeed.js src/data/newsFeed.test.js
git commit -m "feat(news): add GNews article-normalization helpers with tests"
```

---

## Task 2: Point the News page at the GNews proxy

**Files:**
- Modify: `src/pages/News.jsx`

- [ ] **Step 1: Replace the API key / TOPICS / fetch block**

In `src/pages/News.jsx`, replace lines 8–22 (the `NEWS_API_KEY` comment+const and the `TOPICS` array) with this. The key is gone from the client entirely (nginx adds it); the queries are trimmed to GNews-friendly lengths:

```js
// Live automotive headlines come from GNews.io, reached same-origin through the
// `/newsproxy` reverse proxy (nginx in production, the Vite dev proxy locally).
// The proxy injects the GNEWS_API_KEY server-side, so no key ships in this
// bundle. If the proxy/feed is unreachable the page falls back to the cached
// FALLBACK headlines below and shows a "Cached Feed" badge.

// Each topic maps to a GNews search query for real-time, global results.
const TOPICS = [
  { label: 'All', q: 'car OR automotive OR EV OR vehicle' },
  { label: 'Electric Vehicles', q: 'electric vehicle OR EV OR "battery car"' },
  { label: 'New Models', q: '"new car" OR "car launch" OR "car reveal"' },
  { label: 'Autonomous Tech', q: '"self-driving" OR "autonomous driving" OR ADAS' },
  { label: 'Industry Trends', q: '"automotive industry" OR "car manufacturer"' },
];
```

- [ ] **Step 2: Add the import for the helper**

At the top of `src/pages/News.jsx`, just below the `SafeIcon` import (line 4), add:

```js
import { normalizeFeed } from '../data/newsFeed';
```

- [ ] **Step 3: Replace the `useEffect` fetch body**

Replace the whole `useEffect` block (currently lines 40–69) with:

```js
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = encodeURIComponent(TOPICS[topicIdx].q);
    // Same-origin GNews call via the /newsproxy reverse proxy (it appends the
    // API key). max=10 keeps us inside the free tier's per-request cap.
    const url = `/newsproxy/api/v4/search?q=${q}&lang=en&max=10&sortby=publishedAt`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const { articles, live } = normalizeFeed(data, FALLBACK);
        setArticles(articles);
        setLive(live);
      })
      .catch(() => {
        if (cancelled) return;
        setArticles(FALLBACK);
        setLive(false);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [topicIdx]);
```

(The `FALLBACK` array, the JSX, and the `live`/`loading` state are unchanged — they already read `urlToImage`, `source.name`, `title`, etc., which `normalizeFeed` produces.)

- [ ] **Step 4: Verify the helper test still passes and the app builds**

Run: `npm test && npm run build`
Expected: tests PASS; build completes with `dist/` output and no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/News.jsx
git commit -m "feat(news): fetch live headlines from GNews via /newsproxy"
```

---

## Task 3: Vite dev proxy for `/newsproxy`

So `npm run dev` shows the live feed locally, using the key from `.env`.

**Files:**
- Modify: `vite.config.js`
- Create: `.env.example`

- [ ] **Step 1: Replace `vite.config.js` with the env-aware config**

GNews needs the key appended server-side; the dev proxy reads it from `.env` via Vite's `loadEnv`. Replace the entire `vite.config.js` with:

```js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// AutoHub is a pure Vite/React single-page app — there is no backend server.
// `npm run dev` serves the whole application on http://localhost:5175.
export default defineConfig(({ mode }) => {
  // Load .env so the dev News proxy can inject GNEWS_API_KEY server-side
  // (the '' prefix loads all vars, not just VITE_-prefixed ones).
  const env = loadEnv(mode, process.cwd(), '')
  const gnewsKey = env.GNEWS_API_KEY || ''

  return {
    plugins: [react()],
    server: {
      port: 5175,
      strictPort: true,
      proxy: {
        // Live automotive news. The browser calls /newsproxy/... and this dev
        // proxy forwards to GNews.io with the API key appended, so the key
        // never reaches the client. In production an nginx /newsproxy block
        // does the same thing (see nginx.conf). If absent, the News page
        // falls back to cached headlines (see src/data/newsFeed.js).
        '/newsproxy': {
          target: 'https://gnews.io',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const rest = path.replace(/^\/newsproxy/, '')
            const sep = rest.includes('?') ? '&' : '?'
            return `${rest}${sep}apikey=${gnewsKey}`
          },
        },
        '/agent': {
          // Routes the SPA's agent calls to the local ADK service during
          // `npm run dev`. In production set VITE_AGENT_URL to the deployed
          // agent URL instead (this proxy is absent in a static build, and the
          // chat falls back to the local engine if the agent is unreachable).
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/agent/, ''),
        },
      },
    },
  }
})
```

- [ ] **Step 2: Create `.env.example`**

```bash
printf '# Free key from https://gnews.io/ — used by the /newsproxy dev proxy\nGNEWS_API_KEY=\n' > .env.example
```

- [ ] **Step 3: Verify live news works in dev**

Run (in one terminal): `npm run dev`
Then open http://localhost:5175/news in a browser.
Expected: the header badge reads **"Live Feed"** (pulsing red dot), real current automotive stories load, and there is **no** "Live feed unavailable" amber banner. Click a topic chip (e.g. "Electric Vehicles") and confirm the cards change.

Quick non-browser check (separate terminal, dev server running):

```bash
curl -s "http://localhost:5175/newsproxy/api/v4/search?q=car&lang=en&max=2" | head -c 300
```

Expected: JSON starting with `{"totalArticles":` and an `"articles"` array (not an `errors`/`401` body). If you see an auth error, the `.env` key is missing or wrong.

- [ ] **Step 4: Commit**

```bash
git add vite.config.js .env.example
git commit -m "feat(news): add /newsproxy Vite dev proxy with GNews key injection"
```

---

## Task 4: Production nginx `/newsproxy` reverse proxy

**Files:**
- Modify: `nginx.conf`

- [ ] **Step 1: Add the `/newsproxy` location**

In `nginx.conf`, add this block immediately after the `/agent/` block (after line 25, before the `# SPA fallback` comment). It appends the key from the `GNEWS_API_KEY` env var, which the nginx-alpine entrypoint expands via `envsubst` at container start (the same mechanism that expands `${PORT}`):

```nginx
    # Reverse-proxy live automotive news to GNews.io, appending the API key
    # server-side so it never reaches the browser. ${GNEWS_API_KEY} is expanded
    # from the container env by the nginx-alpine envsubst entrypoint at startup
    # (same mechanism as ${PORT}). $1/$args are nginx runtime vars, untouched
    # by envsubst because they are not environment variables.
    location ~ ^/newsproxy/(.*)$ {
        resolver 8.8.8.8 1.1.1.1 valid=300s ipv6=off;
        proxy_ssl_server_name on;
        proxy_set_header Host gnews.io;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_read_timeout 30s;
        proxy_pass https://gnews.io/$1?$args&apikey=${GNEWS_API_KEY};
    }
```

- [ ] **Step 2: Build and run the container locally to validate nginx config + proxy**

This catches nginx syntax errors and confirms the key injection works before deploying. Replace `YOUR_KEY` with your real GNews key:

```bash
docker build -t autohub-local .
docker run --rm -d -p 8080:8080 -e PORT=8080 -e GNEWS_API_KEY=YOUR_KEY --name autohub-local autohub-local
sleep 3
curl -s "http://localhost:8080/newsproxy/api/v4/search?q=car&lang=en&max=2" | head -c 300
```

Expected: JSON starting with `{"totalArticles":` and an `"articles"` array (proves nginx forwarded the request and appended a valid key). If `docker run` exits immediately, run `docker logs autohub-local` — an nginx config error prints here.

Also confirm the SPA itself still serves:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/news
```

Expected: `200`.

Tear down:

```bash
docker stop autohub-local
```

- [ ] **Step 3: Commit**

```bash
git add nginx.conf
git commit -m "feat(news): add nginx /newsproxy reverse proxy for GNews in production"
```

---

## Task 5: Update documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `/Users/sujaygopal/.claude/projects/-Users-sujaygopal-Auto-News-Site/memory/production-readiness-roadmap.md`

- [ ] **Step 1: Update the News-page description in `CLAUDE.md`**

In `CLAUDE.md`, find the bullet that currently begins:

```
- **News page** (`src/pages/News.jsx`) — fetches live NewsAPI headlines through the Vite dev proxy `/newsapi` (see `vite.config.js`), which only exists during `npm run dev`. In a deployed static build the proxy is absent, the request fails, and the page falls back to the cached `FALLBACK` headlines, showing a "Cached Feed" badge.
```

Replace it with:

```
- **News page** (`src/pages/News.jsx`) — fetches live automotive headlines from **GNews.io** through the `/newsproxy` reverse proxy, which appends the `GNEWS_API_KEY` server-side so it never ships in the bundle. The proxy exists both in dev (Vite, key from `.env`, see `vite.config.js`) and in production (nginx, key from the Cloud Run `GNEWS_API_KEY` env var, see `nginx.conf`). Response mapping/fallback lives in `src/data/newsFeed.js` (unit-tested). If the feed is unreachable the page falls back to the cached `FALLBACK` headlines and shows a "Cached Feed" badge.
```

- [ ] **Step 2: Note the env var in the deploy section of `CLAUDE.md`**

In `CLAUDE.md`, find the `gcloud run deploy autohub` command block in the Deployment section and replace it with the version that sets the key:

````
```bash
gcloud run deploy autohub \
  --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 256Mi --timeout 90 \
  --set-env-vars GNEWS_API_KEY=YOUR_GNEWS_KEY
```
````

- [ ] **Step 3: Add a project blurb to `README.md`**

Read the current `README.md` first (`cat README.md`). At the top, under the main title, ensure there is a one-paragraph description (add it if missing):

```markdown
**AutoHub** is a Vite + React single-page automotive portal: browse 24 vehicles with specs and interactive 3D models, compare cars side by side, chat with an AI assistant, and read a live global automotive news feed. It's a static SPA deployed on Google Cloud Run — no application server.

**Live news setup:** the News page pulls real headlines from [GNews.io](https://gnews.io/). For local dev, put a free key in `.env` as `GNEWS_API_KEY=...` (see `.env.example`). In production the key is supplied to Cloud Run via `--set-env-vars GNEWS_API_KEY=...`.
```

- [ ] **Step 4: Tick the live-news slice in the memory roadmap**

In `/Users/sujaygopal/.claude/projects/-Users-sujaygopal-Auto-News-Site/memory/production-readiness-roadmap.md`, mark the live-news/News-feed item as done (change its checkbox/status to completed and add a short note: "Live in prod via GNews + nginx /newsproxy, 2026-06-09"). Keep the file's existing structure; only update the relevant line.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: document the GNews live-news proxy and deploy env var"
```

(The memory file lives outside the repo and is not committed.)

---

## Task 6: Deploy to Cloud Run and verify the live feed

**Files:** none (deploy + verify)

- [ ] **Step 1: Merge the feature to `main`**

```bash
git checkout main
git pull
git merge --no-ff feat/live-news-prod -m "feat: live automotive news in production via GNews proxy"
git push origin main
```

- [ ] **Step 2: Deploy with the GNews key set**

Replace `YOUR_GNEWS_KEY` with your real key:

```bash
gcloud run deploy autohub \
  --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 256Mi --timeout 90 \
  --set-env-vars GNEWS_API_KEY=YOUR_GNEWS_KEY
```

Expected: deploy succeeds and prints the service URL (`https://autohub-xhgcy2euza-uc.a.run.app`).

- [ ] **Step 3: Verify the proxy in production**

```bash
curl -s "https://autohub-xhgcy2euza-uc.a.run.app/newsproxy/api/v4/search?q=car&lang=en&max=2" | head -c 300
```

Expected: JSON `{"totalArticles": ...,"articles":[...]}` — not an error body.

- [ ] **Step 4: Verify in the browser**

Open https://autohub-xhgcy2euza-uc.a.run.app/news
Expected: **"Live Feed"** badge, current real headlines, **no** "Live feed unavailable" banner. Switch topics and confirm the cards refresh.

> If it still shows "Cached Feed": check `gcloud run services describe autohub --region us-central1 --format='value(spec.template.spec.containers[0].env)'` to confirm `GNEWS_API_KEY` is set, and check that your GNews daily quota (100 req/day free) isn't exhausted.

---

## Task 7: GitHub repo "About" — description, homepage, topics

This fills the empty "About" panel ("No description, website, or topics provided").

**Files:** none (`gh` CLI)

- [ ] **Step 1: Confirm `gh` is authenticated**

Run: `gh auth status`
Expected: logged in to github.com as `Sujay1709`. If not: `gh auth login`.

- [ ] **Step 2: Set description, homepage, and topics**

```bash
gh repo edit Sujay1709/Auto_News_Site \
  --description "AutoHub — a Vite + React automotive portal: 24 cars with specs & interactive 3D models, side-by-side compare, an AI assistant, and a live global news feed. Static SPA on Google Cloud Run." \
  --homepage "https://autohub-xhgcy2euza-uc.a.run.app" \
  --add-topic react \
  --add-topic vite \
  --add-topic tailwindcss \
  --add-topic automotive \
  --add-topic single-page-app \
  --add-topic google-cloud-run \
  --add-topic model-viewer \
  --add-topic ai-assistant \
  --add-topic gemini \
  --add-topic gnews
```

- [ ] **Step 3: Verify**

```bash
gh repo view Sujay1709/Auto_News_Site --json description,homepageUrl,repositoryTopics
```

Expected: the description, the Cloud Run homepage URL, and all ten topics are present. Reload the GitHub repo page — the "About" panel now shows the description, the site link, and topic chips.

---

## Task 8: Watch the repo

You can only change **your own** watch subscription via the API (you can't force other accounts to watch). This subscribes you to all activity, which is the only programmatic lever on the watcher count.

**Files:** none (`gh` CLI)

- [ ] **Step 1: Subscribe (watch all activity)**

```bash
gh api -X PUT /repos/Sujay1709/Auto_News_Site/subscription -f subscribed=true -f ignored=false
```

Expected: JSON response with `"subscribed": true`.

- [ ] **Step 2: Verify**

```bash
gh api /repos/Sujay1709/Auto_News_Site/subscription --jq '.subscribed'
```

Expected: `true`. The repo's "watching" count reflects watchers; growing it beyond yourself requires others to watch (share the repo, add collaborators) — there is no API to add watchers on someone's behalf.

---

## Task 9: Publish a tagged release (v1.5.0)

Do this **after** Task 6 (feature merged + deployed), so the release reflects shipped code.

**Files:**
- Modify: `package.json` (version bump)

- [ ] **Step 1: Bump the version**

In `package.json`, change `"version": "1.4.0"` to `"version": "1.5.0"`, then:

```bash
git add package.json
git commit -m "chore: bump version to 1.5.0"
git push origin main
```

- [ ] **Step 2: Tag and push**

```bash
git tag -a v1.5.0 -m "AutoHub v1.5.0 — live news in production"
git push origin v1.5.0
```

- [ ] **Step 3: Create the GitHub release**

```bash
gh release create v1.5.0 \
  --repo Sujay1709/Auto_News_Site \
  --title "AutoHub v1.5.0 — Live news, AI assistant & 3D models" \
  --notes "$(cat <<'EOF'
## Highlights
- **Live automotive news in production** — the News page now streams real global headlines from GNews.io through a same-origin nginx reverse proxy (`/newsproxy`) that injects the API key server-side. Replaces the previous localhost-only NewsAPI path that showed "Live Feed Unavailable" on the deployed site.
- **AI assistant** — chat powered by the AutoHub agent (Google ADK + Gemini) with a local fallback engine.
- **Interactive 3D car models** — `<model-viewer>` GLB models for all 24 vehicles.
- **Side-by-side compare** and a searchable catalog with full specs.

## Tech
Vite + React SPA, Tailwind CSS, deployed static on Google Cloud Run behind nginx.

## Live site
https://autohub-xhgcy2euza-uc.a.run.app
EOF
)"
```

- [ ] **Step 4: Verify**

```bash
gh release view v1.5.0 --repo Sujay1709/Auto_News_Site
```

Expected: the release shows on the repo page; the "Releases" panel changes from "No releases published" to **v1.5.0** (Latest).

---

## Self-Review

**Spec coverage:**
- "Make live news work / stop showing Live Feed Unavailable" → Tasks 1–4 (GNews + proxies) and Task 6 (deploy + verify). ✅
- "Give context about the project on the GitHub repo page" → Task 7 (About description, homepage, topics) + Task 5 Step 3 (README blurb). ✅
- "Increase the watching" → Task 8 (subscribe; honestly notes others can't be forced). ✅
- "Publish new releases" → Task 9 (v1.5.0 tag + GitHub release). ✅

**Type consistency:** `normalizeFeed(data, fallback)` and `mapArticle(a)` are defined in Task 1 and consumed with those exact names/signatures in Task 2. The UI shape (`source.name`, `title`, `description`, `url`, `urlToImage`, `publishedAt`) matches the existing JSX and `FALLBACK` entries in `News.jsx`. The env var name `GNEWS_API_KEY` is identical across `.env`, `vite.config.js`, `nginx.conf`, the Docker run, and the `gcloud` deploy.

**Placeholder scan:** No "TBD"/"add error handling"/"similar to Task N" placeholders — every code and command step is concrete. The only intentional user-supplied values are the real GNews key (`YOUR_KEY`/`YOUR_GNEWS_KEY`) and `gh` auth, which are credentials, not code gaps.

**Known constraints called out:** GNews free tier is ~100 req/day / 10 articles per request (hence `max=10`); nginx variable `proxy_pass` requires the `resolver` directive (included); watcher count can only be self-incremented via API.
