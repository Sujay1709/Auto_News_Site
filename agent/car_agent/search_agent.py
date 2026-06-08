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
