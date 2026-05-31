# scripts/

Helper scripts for managing 3D-model generation.

## `trigger_all_3d.sh`

Batch-submits a Tripo text-to-3D job for every car in `cars_data`. Run
this once your Flask server is up and `TRIPO_API_KEY` is set in the
server's environment.

```bash
export TRIPO_API_KEY=tsk_...           # your Tripo key
.venv/bin/python3 app.py &              # start Flask in background
sleep 2                                 # give it a second to bind
bash scripts/trigger_all_3d.sh          # fire 23 jobs
```

The script POSTs one job per car. The background poller in `app.py`
(started automatically at boot) downloads each GLB and updates
`data/car_3d_catalog.json` as jobs complete — no restart needed.

### Check progress

```bash
curl -s localhost:8080/api/jobs | python3 -m json.tool
```

Or refresh `http://localhost:8080/cars` in the browser — each car
swaps from its CC-licensed silhouette to its AI-generated model as
soon as Tripo finishes that car.

### Re-running

The script always submits new jobs; it doesn't dedupe against
already-generated cars. If you want to regenerate one car (e.g. you
didn't like the result), use:

```bash
curl -X POST localhost:8080/api/generate-3d \
  -H 'Content-Type: application/json' \
  -d '{"car_slug":"tesla-model-3"}'
```

### Cost & time

- ~$0.50–$2 of Tripo credits per car, so the full batch is roughly
  $10–$50. Check your balance at 3daistudio.com first.
- ~3–10 minutes per car, but jobs run in parallel on Tripo's side.
  The full batch typically completes within ~30 minutes.
