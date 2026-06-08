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
