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
