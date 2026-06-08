# AutoHub AI Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace AutoHub's rule-based chat with a Google ADK + Gemini agent (specs Q&A, compare, recommend, site guidance, web search) running as a separate Cloud Run service, with the existing UI falling back to the local engine when the agent is unreachable.

**Architecture:** A new `agent/` Python service exposes a thin FastAPI `POST /chat` wrapping the ADK `Runner` (stateless — history sent per request). Catalog tools read `agent/car_data.json`, generated from `src/data/*` by `scripts/export-cars.mjs`. Web search is a `google_search` sub-agent surfaced to the root agent via `AgentTool`. The static SPA calls the agent via a `/agent` Vite dev proxy (dev) or `VITE_AGENT_URL` (prod); `ChatAssistant.jsx` falls back to `carChat.js` on any failure.

**Tech Stack:** Python 3.11, google-adk, FastAPI, uvicorn, pytest; Vite/React frontend; Gemini 2.5 Flash via Google AI Studio API key; Cloud Run.

**Reference spec:** `docs/superpowers/specs/2026-06-06-autohub-ai-agent-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/export-cars.mjs` | Node script: read `src/data/cars.js` + `carChat.js`, write `agent/car_data.json` |
| `agent/car_data.json` | Generated catalog the agent reads (flattened `getCarFacts` + `id`) |
| `agent/car_agent/catalog.py` | Load `car_data.json`; lookup/filter helpers |
| `agent/car_agent/tools.py` | `list_cars`, `get_car_facts`, `search_cars`, `compare_cars` |
| `agent/car_agent/search_agent.py` | `LlmAgent` with only the built-in `google_search` tool |
| `agent/car_agent/agent.py` | `root_agent`: model + instruction + catalog tools + `AgentTool(search_agent)` |
| `agent/car_agent/__init__.py` | Package marker, exports `root_agent` |
| `agent/main.py` | FastAPI app: `GET /health`, `POST /chat`, CORS, stateless `Runner` |
| `agent/requirements.txt` | Python deps |
| `agent/Dockerfile` | Cloud Run container |
| `agent/.env.example` | `GOOGLE_API_KEY`, `GOOGLE_GENAI_USE_VERTEXAI=FALSE` |
| `agent/.gitignore` | Ignore `.env`, `__pycache__`, venv |
| `agent/README.md` | Run/deploy/cost docs |
| `agent/tests/test_tools.py` | pytest over the pure tool functions |
| `src/data/carAgent.js` | `askAgent({message, history, carIds})` → POST; throws on failure |
| `src/components/ChatAssistant.jsx` | Async `send()` → agent, fallback to `carChat.js` + "Local" badge |
| `vite.config.js` | Add `/agent` dev proxy → `http://localhost:8000` |
| `package.json` | `prebuild` hook runs the export script |

---

## Task 1: Catalog export script

**Files:**
- Create: `scripts/export-cars.mjs`
- Create (generated): `agent/car_data.json`
- Modify: `package.json` (add `prebuild` + `export:cars` scripts)

- [ ] **Step 1: Write the export script**

Create `scripts/export-cars.mjs`:

```js
// Generates agent/car_data.json from the frontend's single source of truth
// (src/data/cars.js + carChat.js) so the Python agent never hand-maintains a
// duplicate catalog. Run automatically before `npm run build` (prebuild hook).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const { CARS_DATA } = await import(resolve(root, 'src/data/cars.js'));
const { getCarFacts } = await import(resolve(root, 'src/data/carChat.js'));

// Parse a price string like "$26,420" into an integer (26420); null if absent.
const priceNum = (p) => {
  if (!p) return null;
  const n = parseInt(String(p).replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
};

const cars = CARS_DATA.map((car) => ({
  id: car.id,
  ...getCarFacts(car),
  priceNum: priceNum(car.price),
}));

const outPath = resolve(root, 'agent/car_data.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(cars, null, 2) + '\n');
console.log(`Wrote ${cars.length} cars to agent/car_data.json`);
```

- [ ] **Step 2: Add npm scripts**

In `package.json`, add to `"scripts"`:

```json
    "export:cars": "node scripts/export-cars.mjs",
    "prebuild": "node scripts/export-cars.mjs"
```

(Keep existing `dev`, `build`, `preview`.)

- [ ] **Step 3: Run the script and verify output**

Run: `npm run export:cars`
Expected: `Wrote 24 cars to agent/car_data.json`

- [ ] **Step 4: Sanity-check the JSON**

Run: `node -e "const c=require('./agent/car_data.json'); console.log(c.length, c[0].id, c[0].priceNum, typeof c[0].engine)"`
Expected: `24 toyota-camry 26420 string`

- [ ] **Step 5: Commit**

```bash
git add scripts/export-cars.mjs package.json agent/car_data.json
git commit -m "feat(agent): generate car_data.json from cars.js"
```

---

## Task 2: Catalog loader + tools (TDD)

**Files:**
- Create: `agent/requirements.txt`
- Create: `agent/car_agent/__init__.py` (empty for now)
- Create: `agent/car_agent/catalog.py`
- Create: `agent/car_agent/tools.py`
- Test: `agent/tests/test_tools.py`

- [ ] **Step 1: Write requirements.txt**

Create `agent/requirements.txt`:

```
google-adk>=0.2.0
fastapi>=0.110
uvicorn[standard]>=0.29
python-dotenv>=1.0
pytest>=8.0
```

- [ ] **Step 2: Create empty package marker**

Create `agent/car_agent/__init__.py` (empty file for now; updated in Task 4).

- [ ] **Step 3: Write the failing test**

Create `agent/tests/test_tools.py`:

```python
from car_agent import tools


def test_list_cars_returns_all_minimal_records():
    cars = tools.list_cars()
    assert len(cars) == 24
    first = cars[0]
    assert set(first.keys()) == {"id", "make", "model", "year", "price", "fuel"}
    assert first["id"] == "toyota-camry"


def test_get_car_facts_known_car():
    facts = tools.get_car_facts("tesla-model-3")
    assert facts["make"] == "Tesla"
    assert facts["fuel"] == "Battery electric"
    assert "engine" in facts


def test_get_car_facts_unknown_car_returns_error():
    facts = tools.get_car_facts("does-not-exist")
    assert "error" in facts


def test_search_cars_by_fuel():
    results = tools.search_cars(fuel="electric")
    assert len(results) > 0
    assert all("electric" in c["fuel"].lower() for c in results)


def test_search_cars_by_max_price():
    results = tools.search_cars(max_price=30000)
    assert all(c["priceNum"] is not None and c["priceNum"] <= 30000 for c in results)


def test_search_cars_by_min_seats():
    results = tools.search_cars(min_seats=5)
    assert all(c["passengers"] >= 5 for c in results)


def test_compare_cars_returns_each_requested():
    result = tools.compare_cars(["tesla-model-3", "hyundai-ioniq-6"])
    assert set(result["cars"].keys()) == {"tesla-model-3", "hyundai-ioniq-6"}
    assert result["cars"]["tesla-model-3"]["make"] == "Tesla"


def test_compare_cars_flags_unknown_ids():
    result = tools.compare_cars(["tesla-model-3", "nope"])
    assert "nope" in result["unknown"]
```

- [ ] **Step 4: Run the test to verify it fails**

Run:
```bash
cd agent && python -m pytest tests/test_tools.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'car_agent.tools'` (or import error).

- [ ] **Step 5: Write the catalog loader**

Create `agent/car_agent/catalog.py`:

```python
"""Loads the generated car catalog and provides lookup/filter helpers."""
import json
from pathlib import Path

_DATA_PATH = Path(__file__).resolve().parent.parent / "car_data.json"

with _DATA_PATH.open(encoding="utf-8") as fh:
    CARS: list[dict] = json.load(fh)

_BY_ID = {c["id"]: c for c in CARS}


def all_cars() -> list[dict]:
    return CARS


def by_id(car_id: str) -> dict | None:
    return _BY_ID.get(car_id)
```

- [ ] **Step 6: Write the tools**

Create `agent/car_agent/tools.py`:

```python
"""Plain-function tools the agent calls over the local car catalog.

Docstrings matter: ADK passes them to Gemini as the tool descriptions.
"""
from . import catalog

_MINIMAL_KEYS = ("id", "make", "model", "year", "price", "fuel")


def list_cars() -> list[dict]:
    """List every car in the AutoHub catalog with minimal fields
    (id, make, model, year, price, fuel). Use this to map a car name the
    user typed to its catalog id before calling other tools."""
    return [{k: c.get(k) for k in _MINIMAL_KEYS} for c in catalog.all_cars()]


def get_car_facts(car_id: str) -> dict:
    """Return the full spec sheet for one car by its catalog id (e.g.
    'tesla-model-3'). Includes engine, transmission, drivetrain, tyres, fuel,
    range, brakes, power, 0-60, top speed, price, seats, boot space, ADAS.
    Returns {'error': ...} if the id is unknown."""
    car = catalog.by_id(car_id)
    if car is None:
        return {"error": f"No car with id '{car_id}'. Call list_cars first."}
    return car


def search_cars(
    fuel: str | None = None,
    max_price: int | None = None,
    min_seats: int | None = None,
) -> list[dict]:
    """Find catalog cars matching optional filters, for recommendations.
    - fuel: case-insensitive substring of the fuel type (e.g. 'electric', 'hybrid').
    - max_price: only cars at or below this USD price.
    - min_seats: only cars seating at least this many passengers.
    Returns minimal records (id, make, model, year, price, fuel, priceNum,
    passengers). Returns all cars if no filters are given."""
    results = []
    for c in catalog.all_cars():
        if fuel and fuel.lower() not in str(c.get("fuel", "")).lower():
            continue
        if max_price is not None:
            pn = c.get("priceNum")
            if pn is None or pn > max_price:
                continue
        if min_seats is not None and (c.get("passengers") or 0) < min_seats:
            continue
        results.append(
            {
                **{k: c.get(k) for k in _MINIMAL_KEYS},
                "priceNum": c.get("priceNum"),
                "passengers": c.get("passengers"),
            }
        )
    return results


def compare_cars(car_ids: list[str]) -> dict:
    """Compare two or more catalog cars side by side by their ids.
    Returns {'cars': {id: full_facts, ...}, 'unknown': [ids not found]}."""
    cars, unknown = {}, []
    for cid in car_ids:
        car = catalog.by_id(cid)
        if car is None:
            unknown.append(cid)
        else:
            cars[cid] = car
    return {"cars": cars, "unknown": unknown}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run:
```bash
cd agent && python -m pytest tests/test_tools.py -v
```
Expected: PASS (8 passed). If `car_data.json` is missing, run `npm run export:cars` from the repo root first.

- [ ] **Step 8: Commit**

```bash
git add agent/requirements.txt agent/car_agent/__init__.py agent/car_agent/catalog.py agent/car_agent/tools.py agent/tests/test_tools.py
git commit -m "feat(agent): catalog loader and car tools with tests"
```

---

## Task 3: Search sub-agent + root agent

**Files:**
- Create: `agent/car_agent/search_agent.py`
- Create: `agent/car_agent/agent.py`
- Modify: `agent/car_agent/__init__.py`

- [ ] **Step 1: Write the search sub-agent**

Create `agent/car_agent/search_agent.py`:

```python
"""A dedicated sub-agent whose only tool is Google Search grounding.

ADK does not allow a built-in tool (google_search) to coexist with custom
function tools in the same agent, so search is isolated here and exposed to
the root agent via AgentTool (see agent.py)."""
from google.adk.agents import LlmAgent
from google.adk.tools import google_search

MODEL = "gemini-2.5-flash"

search_agent = LlmAgent(
    name="web_search",
    model=MODEL,
    description="Searches the web for current, real-world automotive information.",
    instruction=(
        "You are a web research helper. Use Google Search to answer the query "
        "with current, factual information: reviews, real-world pricing, recent "
        "news, newer model years, or cars not in the AutoHub catalog. "
        "Return a concise, factual summary and mention it came from the web."
    ),
    tools=[google_search],
)
```

- [ ] **Step 2: Write the root agent**

Create `agent/car_agent/agent.py`:

```python
"""The AutoHub root agent: catalog tools + a web-search sub-agent."""
from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from .search_agent import search_agent
from .tools import list_cars, get_car_facts, search_cars, compare_cars

MODEL = "gemini-2.5-flash"

INSTRUCTION = """\
You are the AutoHub assistant, a friendly expert on cars and on using the \
AutoHub website. AutoHub is a car information portal with a catalog of 24 \
vehicles.

TOOLS
- list_cars: list catalog cars (use to map a typed name to a car id).
- get_car_facts: full spec sheet for one car id.
- search_cars: filter the catalog by fuel / max_price / min_seats (recommendations).
- compare_cars: side-by-side specs for two or more car ids.
- web_search: live Google Search for current, real-world info.

GROUNDING RULES
- The catalog tools are AUTHORITATIVE for the 24 AutoHub cars. Never invent a \
hard spec; if it is not in the catalog, look it up with web_search or say you \
don't have it.
- You may blend freely: use web_search to enrich answers (reviews, real-world \
context, news, newer years, non-catalog cars) even for catalog cars.
- TIE-BREAKER: if a web hard-spec contradicts the catalog, prefer the catalog \
value and note the discrepancy.
- When an answer draws on the web, briefly say so, so the user knows which \
facts are AutoHub data vs the internet.

SITE GUIDE (answer navigation questions directly, no tool needed)
- Home: browse all cars as cards.
- Car detail page: full specs, photos, an interactive 3D model (model-viewer), \
and this AI assistant.
- News: latest automotive headlines.
- Compare: put cars side by side.
- Info: about AutoHub and general guidance.
- Help: support and this assistant.

STYLE
- Be concise and conversational. Use the car's full name. If the user is \
currently viewing a car (provided as context), assume questions are about it \
unless they say otherwise.
"""

root_agent = LlmAgent(
    name="autohub_assistant",
    model=MODEL,
    description="AutoHub's car expert and site guide.",
    instruction=INSTRUCTION,
    tools=[
        list_cars,
        get_car_facts,
        search_cars,
        compare_cars,
        AgentTool(agent=search_agent),
    ],
)
```

- [ ] **Step 3: Export root_agent from the package**

Replace `agent/car_agent/__init__.py` with:

```python
from .agent import root_agent

__all__ = ["root_agent"]
```

- [ ] **Step 4: Verify the agent imports cleanly**

Run:
```bash
cd agent && python -c "from car_agent import root_agent; print(root_agent.name, len(root_agent.tools))"
```
Expected: `autohub_assistant 5` (no import errors). This needs deps installed: `pip install -r requirements.txt`. It does not call Gemini, so no API key is required for this check.

- [ ] **Step 5: Commit**

```bash
git add agent/car_agent/search_agent.py agent/car_agent/agent.py agent/car_agent/__init__.py
git commit -m "feat(agent): root agent with catalog tools and web-search sub-agent"
```

---

## Task 4: FastAPI /chat service (stateless)

**Files:**
- Create: `agent/main.py`

- [ ] **Step 1: Write the FastAPI app**

Create `agent/main.py`:

```python
"""FastAPI wrapper exposing the AutoHub agent as a stateless POST /chat.

History is sent by the client each request and folded into a single composed
prompt, so the service holds no per-conversation state and survives Cloud Run
scale-to-zero and multiple instances. The frontend falls back to its local
engine if this service is unreachable."""
import os
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from car_agent import root_agent

load_dotenv()

if not os.getenv("GOOGLE_API_KEY"):
    raise RuntimeError(
        "GOOGLE_API_KEY is not set. Copy .env.example to .env and add your "
        "Google AI Studio API key."
    )

APP_NAME = "autohub"
_session_service = InMemorySessionService()
_runner = Runner(agent=root_agent, app_name=APP_NAME, session_service=_session_service)

app = FastAPI(title="AutoHub Agent")

# Allow the static SPA origins to call this service from the browser.
_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


class Turn(BaseModel):
    role: str  # "user" | "bot"
    text: str


class ChatRequest(BaseModel):
    message: str
    history: list[Turn] = []
    carIds: list[str] = []


class ChatResponse(BaseModel):
    reply: str


def _compose(req: ChatRequest) -> str:
    """Fold recent history + current car context into one prompt string."""
    parts = []
    if req.carIds:
        parts.append(f"[Context] The user is currently viewing car id(s): {', '.join(req.carIds)}.")
    recent = req.history[-10:]
    if recent:
        lines = "\n".join(
            f"{'User' if t.role == 'user' else 'Assistant'}: {t.text}" for t in recent
        )
        parts.append("[Conversation so far]\n" + lines)
    parts.append(f"[New message]\n{req.message}")
    return "\n\n".join(parts)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = uuid.uuid4().hex
    await _session_service.create_session(
        app_name=APP_NAME, user_id="web", session_id=session_id
    )
    content = types.Content(role="user", parts=[types.Part(text=_compose(req))])

    reply = ""
    async for event in _runner.run_async(
        user_id="web", session_id=session_id, new_message=content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            reply = event.content.parts[0].text or reply

    return ChatResponse(reply=reply or "Sorry, I couldn't generate a response.")
```

- [ ] **Step 2: Create .env from example and add your key**

(The `.env.example` is created in Task 5; for local testing now, create `agent/.env` with `GOOGLE_API_KEY=...` and `GOOGLE_GENAI_USE_VERTEXAI=FALSE`.)

- [ ] **Step 3: Start the server**

Run:
```bash
cd agent && uvicorn main:app --port 8000
```
Expected: Uvicorn starts on `http://127.0.0.1:8000` with no startup error. (If `GOOGLE_API_KEY` is unset it should exit with the clear RuntimeError message.)

- [ ] **Step 4: Smoke-test /health and /chat**

In another terminal:
```bash
curl -s localhost:8000/health
curl -s -X POST localhost:8000/chat -H 'Content-Type: application/json' \
  -d '{"message":"What engine does the Tesla Model 3 have?","carIds":["tesla-model-3"]}'
```
Expected: `{"status":"ok"}` then a JSON `{"reply": "..."}` describing the Model 3's motor/drivetrain. Stop the server with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add agent/main.py
git commit -m "feat(agent): stateless FastAPI /chat endpoint over ADK Runner"
```

---

## Task 5: Containerization + docs

**Files:**
- Create: `agent/Dockerfile`
- Create: `agent/.dockerignore`
- Create: `agent/.env.example`
- Create: `agent/.gitignore`
- Create: `agent/README.md`

- [ ] **Step 1: Write the Dockerfile**

Create `agent/Dockerfile`:

```dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Cloud Run injects $PORT (defaults to 8080).
ENV PORT=8080
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
```

- [ ] **Step 2: Write .dockerignore**

Create `agent/.dockerignore`:

```
.env
__pycache__/
*.pyc
.pytest_cache/
tests/
```

- [ ] **Step 3: Write .env.example**

Create `agent/.env.example`:

```
# Google AI Studio API key (https://aistudio.google.com/apikey)
GOOGLE_API_KEY=your-key-here
# Use AI Studio (not Vertex AI)
GOOGLE_GENAI_USE_VERTEXAI=FALSE
# Comma-separated allowed CORS origins for the browser SPA.
# Dev uses the Vite proxy so "*" is fine locally; tighten in production.
ALLOWED_ORIGINS=*
```

- [ ] **Step 4: Write .gitignore**

Create `agent/.gitignore`:

```
.env
__pycache__/
*.pyc
.pytest_cache/
.venv/
venv/
```

- [ ] **Step 5: Write the README**

Create `agent/README.md`:

```markdown
# AutoHub Agent

Google ADK + Gemini agent for AutoHub. Stateless FastAPI `POST /chat`.
Tools: catalog lookup/compare/recommend + Google Search grounding.

## Local dev

```bash
cd agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add your GOOGLE_API_KEY
# car_data.json is generated from the frontend:
( cd .. && npm run export:cars )
uvicorn main:app --port 8000 --reload
```

`POST /chat` body: `{ "message": str, "history": [{role, text}], "carIds": [str] }`
→ `{ "reply": str }`. `GET /health` → `{ "status": "ok" }`.

Run tests: `python -m pytest tests -v`

## Deploy (Cloud Run)

```bash
gcloud run deploy autohub-agent \
  --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 512Mi --timeout 120 \
  --set-env-vars GOOGLE_API_KEY=<key>,GOOGLE_GENAI_USE_VERTEXAI=FALSE,ALLOWED_ORIGINS=https://<spa-domain>
```

## Cost

Each turn is a Gemini 2.5 Flash call; web-grounded turns add Google Search
grounding cost and latency. `--min-instances 0` scales to zero when idle.
Regenerate `car_data.json` whenever `src/data/cars.js` changes.
```

- [ ] **Step 6: Verify the container builds and serves (optional if Docker present)**

Run:
```bash
cd agent && docker build -t autohub-agent . && \
docker run --rm -p 8080:8080 -e GOOGLE_API_KEY=$GOOGLE_API_KEY autohub-agent &
sleep 5 && curl -s localhost:8080/health
```
Expected: `{"status":"ok"}`. Stop the container afterward.

- [ ] **Step 7: Commit**

```bash
git add agent/Dockerfile agent/.dockerignore agent/.env.example agent/.gitignore agent/README.md
git commit -m "chore(agent): containerization, env example, and README"
```

---

## Task 6: Frontend agent client

**Files:**
- Create: `src/data/carAgent.js`

- [ ] **Step 1: Write the agent client**

Create `src/data/carAgent.js`:

```js
// Client for the AutoHub agent service. In dev, requests go to `/agent` (the
// Vite proxy → http://localhost:8000). In a production build, set
// VITE_AGENT_URL to the deployed agent base URL. Throws on any failure so the
// caller can fall back to the local rule-based engine.

const BASE = import.meta.env.VITE_AGENT_URL || '/agent';
const TIMEOUT_MS = 20000;

// Ask the agent a question.
//   message: string
//   history: [{ role: 'user' | 'bot', text: string }]
//   carIds:  string[]  (currently viewed car ids)
// Returns the reply string; throws on network error, timeout, or non-2xx.
export async function askAgent({ message, history = [], carIds = [] }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, carIds }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Agent HTTP ${res.status}`);
    const data = await res.json();
    if (!data.reply) throw new Error('Empty agent reply');
    return data.reply;
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 2: Verify lint passes**

Run: `npx eslint src/data/carAgent.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/carAgent.js
git commit -m "feat: frontend client for the AutoHub agent"
```

---

## Task 7: Wire ChatAssistant to the agent with fallback

**Files:**
- Modify: `src/components/ChatAssistant.jsx`

- [ ] **Step 1: Add imports and local-mode state**

In `src/components/ChatAssistant.jsx`, add the agent import after the `carChat` import (line 6):

```jsx
import { answerQuestion, SUGGESTED_QUESTIONS } from '../data/carChat';
import { askAgent } from '../data/carAgent';
```

Add a `localMode` state alongside the others (after line 21, the `loading` state):

```jsx
  const [localMode, setLocalMode] = useState(false);
```

- [ ] **Step 2: Replace the `send` function with an async agent-first version**

Replace the entire `send` function (currently lines 40-52) with:

```jsx
  const send = async (text) => {
    const q = (text ?? query).trim();
    if (!q || loading) return;
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: 'user', text: q, time: stamp() }]);
    setQuery('');
    setLoading(true);
    try {
      const reply = await askAgent({ message: q, history, carIds: [car.id] });
      setLocalMode(false);
      setMessages((m) => [...m, { role: 'bot', text: reply, time: stamp() }]);
    } catch {
      // Agent unreachable (e.g. static-only deploy or offline) — fall back to
      // the local rule-based engine, mirroring the News "Cached Feed" pattern.
      setLocalMode(true);
      const reply = answerQuestion(car, q);
      setMessages((m) => [...m, { role: 'bot', text: reply, time: stamp() }]);
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 3: Show a "Local" badge in the header when in fallback mode**

In the header block, replace the car make/model line (currently lines 69-71):

```jsx
          <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest truncate">
            {car.make} {car.model}
          </p>
```

with:

```jsx
          <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest truncate">
            {car.make} {car.model}
            {localMode && (
              <span className="ml-2 text-amber-400/80" title="Agent offline — answering from local data">
                · Local
              </span>
            )}
          </p>
```

- [ ] **Step 4: Run the app and verify the real agent answers**

Start the agent (`cd agent && uvicorn main:app --port 8000`) and the SPA (`npm run dev`), then in the browser open a car detail page and ask a free-form question (e.g. "Is this a good family car and how does it compare to the RAV4?").
Expected: a conversational answer that goes beyond the old fixed intents; no "Local" badge.

- [ ] **Step 5: Verify the fallback**

Stop the agent server (Ctrl-C) and ask another question in the same chat.
Expected: after ~the timeout (or immediately on connection refused), a rule-based answer appears and the header shows "· Local".

- [ ] **Step 6: Lint and commit**

Run: `npx eslint src/components/ChatAssistant.jsx`
Expected: no errors.

```bash
git add src/components/ChatAssistant.jsx
git commit -m "feat: route ChatAssistant to the agent with local fallback"
```

---

## Task 8: Vite dev proxy

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Add the /agent proxy**

In `vite.config.js`, add an `/agent` entry to the existing `server.proxy` object, after the `/newsapi` block:

```js
      '/agent': {
        // Routes the SPA's agent calls to the local ADK service during
        // `npm run dev`. In production set VITE_AGENT_URL to the deployed
        // agent URL instead (this proxy is absent in a static build, and the
        // chat falls back to the local engine if the agent is unreachable).
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agent/, ''),
      },
```

- [ ] **Step 2: Verify the proxy works end to end**

Restart `npm run dev` (proxy changes require a restart). With the agent running on :8000, confirm in the browser Network tab that `POST /agent/chat` returns 200 and the chat shows agent answers (no "Local" badge).

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "feat: proxy /agent to the local ADK service in dev"
```

---

## Task 9: Final validation + docs

**Files:**
- Modify: `CLAUDE.md` (document the agent service)

- [ ] **Step 1: Update CLAUDE.md**

In `CLAUDE.md`, under the "Architecture" section, add a bullet documenting the agent (place after the "News page" bullet):

```markdown
- **AI agent** (`agent/`) — a *separate* Python service (Google ADK + Gemini,
  FastAPI `POST /chat`) deployed independently to Cloud Run (`autohub-agent`).
  The SPA's `ChatAssistant` calls it via `src/data/carAgent.js` (dev: `/agent`
  Vite proxy → `:8000`; prod: `VITE_AGENT_URL`). If the agent is unreachable,
  the chat falls back to the local `carChat.js` engine and shows a "Local"
  badge. The agent's catalog (`agent/car_data.json`) is generated from
  `src/data/cars.js` by `scripts/export-cars.mjs` (run in `npm run build`'s
  `prebuild`).
```

- [ ] **Step 2: Run the full agent test suite**

Run:
```bash
cd agent && python -m pytest tests -v
```
Expected: all tests pass.

- [ ] **Step 3: Run the production build (exercises the prebuild export)**

Run (from repo root): `npm run build`
Expected: `Wrote 24 cars to agent/car_data.json` then a successful Vite build into `dist/`.

- [ ] **Step 4: Lint the whole frontend**

Run: `npx eslint .`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document the AutoHub agent service in CLAUDE.md"
```

---

## Deployment (after all tasks pass)

Not a code task — run when ready to publish:

```bash
# 1. Deploy the agent
cd agent
gcloud run deploy autohub-agent \
  --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 \
  --memory 512Mi --timeout 120 \
  --set-env-vars GOOGLE_API_KEY=<key>,GOOGLE_GENAI_USE_VERTEXAI=FALSE,ALLOWED_ORIGINS=https://autohub-xhgcy2euza-uc.a.run.app

# 2. Note the deployed agent URL, then rebuild + redeploy the SPA with it
cd ..
VITE_AGENT_URL=<autohub-agent-url> npm run build
gcloud run deploy autohub --source . --region us-central1 --platform managed \
  --allow-unauthenticated --min-instances 0 --max-instances 10 --memory 256Mi --timeout 90
```

After deploy: tighten `ALLOWED_ORIGINS` on the agent to the SPA's exact origin.
