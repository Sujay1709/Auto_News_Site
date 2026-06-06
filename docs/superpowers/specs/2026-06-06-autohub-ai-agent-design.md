# AutoHub AI Agent — Design Spec

**Date:** 2026-06-06
**Status:** Approved design, pending implementation plan
**Author:** brainstormed with Claude

## Summary

Replace AutoHub's rule-based chat assistant with a genuine **AI agent** built on
the **Google Agent Development Kit (ADK)** backed by **Gemini**. The agent answers
free-form questions about cars, compares models, recommends cars, guides users
around the site, and can **search the internet** to enrich answers.

The agent runs as a **separate Python service on Cloud Run** (`autohub-agent`).
The existing pure-static Vite/React SPA stays static and calls the agent over
HTTP. The existing `ChatAssistant.jsx` UI is reused; if the agent is unreachable,
the UI **falls back** to today's local `carChat.js` rule-based engine (mirroring
the News page's "Cached Feed" fallback).

## Goals

1. Free-form Q&A about a selected car, grounded in `cars.js` data.
2. Compare two or more cars.
3. Recommend cars from the 24-car catalog based on described needs.
4. Guide/navigate the site (where to find 3D models, news, compare, etc.).
5. Enrich answers with live **Google Search grounding** (reviews, current
   pricing, recent news, newer model years, cars outside the catalog).
6. Keep the SPA a pure static build — no backend code bundled into it.

## Non-Goals

- No server-side conversation persistence (stateless; history sent per request).
- No Vertex AI for now (AI Studio API key path; Vertex is a future migration).
- No replacement of the existing chat UI — reuse `ChatAssistant.jsx`.
- No new frontend test framework (manual browser validation per CLAUDE.md).

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Intelligence | Real LLM — Google ADK + Gemini |
| Capabilities | Specs Q&A, compare, recommend, site guidance, **web search** |
| Gemini access | Google AI Studio API key (`GOOGLE_API_KEY`) |
| UI integration | Reuse `ChatAssistant.jsx`; fall back to `carChat.js` when agent down |
| Service shape | Thin FastAPI `/chat` wrapper around the ADK `Runner` (stateless) |
| Model | `gemini-2.5-flash` |
| Web search policy | **Blend freely** — may web-search even for catalog cars to enrich; catalog wins on hard-spec conflicts |

## Architecture

A new `agent/` Python service, deployed independently to Cloud Run.

```
agent/                          # NEW Python ADK service
  car_agent/
    __init__.py
    agent.py        # root_agent: LlmAgent(gemini-2.5-flash, instruction, tools)
    search_agent.py # LlmAgent whose only tool is built-in google_search
    tools.py        # get_car_facts, list_cars, search_cars, compare_cars
    catalog.py      # loads car_data.json + lookup helpers
  car_data.json     # GENERATED from cars.js (not hand-maintained)
  main.py           # FastAPI: POST /chat, GET /health, CORS
  requirements.txt  # google-adk, fastapi, uvicorn[standard]
  Dockerfile        # Cloud Run
  .env.example      # GOOGLE_API_KEY, GOOGLE_GENAI_USE_VERTEXAI=FALSE
  README.md
  tests/
    test_tools.py   # pytest over the pure tool functions

scripts/export-cars.mjs         # NEW: reads src/data/*, writes agent/car_data.json
src/data/carAgent.js            # NEW: askAgent({message, history, carIds}) -> POST
src/components/ChatAssistant.jsx # MODIFIED: async send() -> agent, fallback + "Local" badge
vite.config.js                  # MODIFIED: add '/agent' dev proxy -> http://localhost:8000
```

### The agent

- **Model:** `gemini-2.5-flash`.
- **Root agent tools:** `list_cars`, `get_car_facts`, `search_cars`,
  `compare_cars`, and `search_web` (an `AgentTool` wrapping `search_agent`).
- **Why a sub-agent for search:** ADK does not allow a built-in tool
  (`google_search`) to coexist with custom function tools in the same agent.
  The documented workaround is a dedicated `search_agent` exposed to the root
  agent via `AgentTool`.
- **Instruction (persona + guardrails):**
  - Persona: the "AutoHub assistant."
  - Catalog tools are **authoritative** for the 24 cars; never invent specs —
    if a hard spec isn't in the catalog, say so or look it up.
  - **Blend freely**: may use `search_web` to enrich answers (reviews, real-world
    context, news, newer years, non-catalog cars) even for catalog cars.
  - **Tie-breaker:** when a web hard-spec contradicts the catalog, prefer the
    catalog value and note the discrepancy.
  - When an answer draws on the web, add light attribution so the user knows
    which facts are AutoHub data vs the internet.
  - Embeds static **site-guide** knowledge (Home, CarDetail w/ 3D `<model-viewer>`,
    News, Compare, Info, Help) so navigation questions need no tool call.

### Tools (pure Python over `car_data.json`)

| Tool | Signature | Purpose |
|---|---|---|
| `list_cars` | `() -> list[{id, make, model, year, price, fuel}]` | map names → ids |
| `get_car_facts` | `(car_id: str) -> dict` | full specs for one car (the `getCarFacts` shape) |
| `search_cars` | `(fuel?, max_price?, min_seats?, body?, ...) -> list` | recommend candidates |
| `compare_cars` | `(car_ids: list[str]) -> dict` | side-by-side spec dict |
| `search_web` | `AgentTool(search_agent)` | live Google Search grounding |

### Data source of truth

`src/data/cars.js` (`CARS_DATA`) + `src/data/carChat.js` (`CAR_EXTRA`) stay the
single source of truth. `scripts/export-cars.mjs` imports them and writes
`agent/car_data.json` (flattened, the `getCarFacts` shape). The agent loads that
JSON. This avoids a hand-maintained duplicate catalog and prevents drift.

## Data Flow (one turn)

1. `ChatAssistant.send()` builds `{ message, history: last ~10 turns, carIds: [current car id] }`.
2. `POST` to the agent — dev: `/agent/chat` (Vite proxy → `:8000`); prod: `${VITE_AGENT_URL}/chat`.
3. `/chat` creates an **ephemeral** ADK session, replays the history, injects a
   short note ("the user is currently viewing <car>"), runs the `Runner`. The
   agent may call catalog tools and/or `search_web`. Returns the final text.
   Stateless → survives Cloud Run scale-to-zero and multiple instances.
4. `{ reply }` renders as a bot bubble.

## Error Handling / Fallback

- **Frontend:** ~20s fetch timeout. Any failure (network, 5xx, timeout) →
  fall back to `answerQuestion(car, q)` from `carChat.js` and show a small
  **"Local"** badge in the chat header (transparent, like "Cached Feed"). The
  static-only preview and an offline agent both still produce useful answers.
- **Agent:** missing `GOOGLE_API_KEY` fails fast at startup with a clear log;
  tool errors are caught and the agent apologizes gracefully; `/chat` wraps
  unexpected errors → HTTP 500. `GET /health` for Cloud Run health checks.
- **CORS:** the agent allows the `autohub` SPA origin. Dev avoids CORS via the
  Vite proxy.

## Testing / Validation

- **Agent:** `pytest` (`agent/tests/test_tools.py`) over the pure tool functions
  (`get_car_facts`, `list_cars`, `search_cars`, `compare_cars`) against
  `car_data.json`. One optional integration smoke test (requires `GOOGLE_API_KEY`).
- **Frontend:** manual browser validation per CLAUDE.md — real answers with the
  service up; fallback + "Local" badge with it down. `npx eslint .` stays green.

## Deployment

```bash
# Agent service
gcloud run deploy autohub-agent \
  --source ./agent --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 512Mi --timeout 120 \
  --set-env-vars GOOGLE_API_KEY=<key>,GOOGLE_GENAI_USE_VERTEXAI=FALSE

# SPA: rebuild with the agent URL, then redeploy autohub
VITE_AGENT_URL=<autohub-agent URL> npm run build
gcloud run deploy autohub --source . --region us-central1 ...
```

**Local dev:**
- Terminal 1: `cd agent && uvicorn main:app --port 8000 --reload` (with `.env` `GOOGLE_API_KEY`).
- Terminal 2: `npm run dev` (port 5175). Vite proxies `/agent` → `:8000`.

**Cost note:** Gemini Flash calls and Google Search grounding cost money per
call; `min-instances 0` scales the service to zero when idle. Documented in
`agent/README.md`.

## Risks / Open Items

- Google Search grounding adds latency/cost per grounded call; acceptable with
  scale-to-zero, noted for the operator.
- In-request history is capped (~10 turns) to bound prompt size; long
  conversations lose older context. Acceptable for this assistant.
- `car_data.json` must be regenerated when `cars.js` changes
  (`scripts/export-cars.mjs`); wire into the build or document as a manual step.
