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


class Action(BaseModel):
    """A UI directive the SPA can act on, derived from the agent's tool use.

    Currently only emitted for comparisons: when the agent calls the
    `compare_cars` tool, we surface the (validated catalog) ids so the SPA can
    deep-link to its /compare page."""
    type: str  # "navigate"
    target: str  # "compare"
    carIds: list[str] = []


class ChatResponse(BaseModel):
    reply: str
    action: Action | None = None


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
    compare_ids: list[str] = []
    async for event in _runner.run_async(
        user_id="web", session_id=session_id, new_message=content
    ):
        if not (event.content and event.content.parts):
            continue
        # Watch for a compare_cars tool call: its car_ids are validated catalog
        # ids, so they double as a reliable "open the comparison" signal.
        for part in event.content.parts:
            fc = getattr(part, "function_call", None)
            if fc and fc.name == "compare_cars":
                ids = (fc.args or {}).get("car_ids") or []
                if isinstance(ids, list):
                    compare_ids = [str(i) for i in ids]
        if event.is_final_response():
            reply = event.content.parts[0].text or reply

    action = None
    if len(compare_ids) >= 2:
        action = Action(type="navigate", target="compare", carIds=compare_ids[:2])

    return ChatResponse(
        reply=reply or "Sorry, I couldn't generate a response.", action=action
    )
