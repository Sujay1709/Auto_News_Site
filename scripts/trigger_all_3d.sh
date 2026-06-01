#!/usr/bin/env bash
# Fire a Tripo text-to-3D job for every car in cars_data, via the
# /api/generate-3d endpoint of a locally running app.py.
#
# Prereqs:
#   - export TRIPO_API_KEY=... (the Flask process must see it)
#   - python3 app.py (or .venv/bin/python3 app.py)
#   - the Flask server listening on http://localhost:8080
#
# What it does:
#   - POSTs one job per car_slug. The server queues each one to Tripo,
#     and the background poller (started by app.py) downloads each
#     GLB to static/models/generated/<job_id>.glb when ready and
#     upserts data/car_3d_catalog.json.
#   - You don't have to leave this script running while jobs complete;
#     the poller lives in the Flask process.
#
# Cost: every successful job consumes Tripo credits (roughly $0.50–$2
# each at the time of writing). 23 jobs ≈ $10–$50. Check your balance
# at 3daistudio.com before running.
#
# Time: ~3–10 minutes per car, but jobs run in parallel server-side.
# All 23 typically finish within ~30 minutes.

set -euo pipefail

HOST="${HOST:-http://localhost:8080}"

slugs=(
  toyota-camry honda-accord bmw-3-series mercedes-benz-c-class
  hyundai-sonata kia-k5 nissan-altima audi-a4 lexus-es genesis-g70
  toyota-rav4 ford-explorer tesla-model-x porsche-cayenne
  porsche-911-carrera chevrolet-corvette-c8 ferrari-296-gtb ford-mustang-dark-horse
  tesla-model-3 tesla-model-s-plaid lucid-air-pure rivian-r1t hyundai-ioniq-6 bmw-i7
)

echo "Submitting ${#slugs[@]} jobs to $HOST/api/generate-3d ..."
echo

for s in "${slugs[@]}"; do
  printf "  %-28s -> " "$s"
  response=$(curl -fsS -X POST "$HOST/api/generate-3d" \
    -H 'Content-Type: application/json' \
    -d "{\"car_slug\":\"$s\"}" 2>&1 || echo "REQUEST_FAILED")
  echo "$response" | python3 -c "
import json, sys
raw = sys.stdin.read()
try:
    d = json.loads(raw)
    if d.get('ok'):
        print(f\"queued (job_id={d.get('job_id','?')[:8]}...)\")
    else:
        print(f\"FAILED: {d.get('message','unknown error')}\")
except Exception:
    print(f\"PARSE_ERROR: {raw[:120]}\")
"
  sleep 1
done

echo
echo "Done submitting. Monitor progress with:"
echo "  curl -s $HOST/api/jobs | python3 -m json.tool"
echo
echo "Or just refresh /cars in your browser — each model appears as its job completes."