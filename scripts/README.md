# scripts/

Helper scripts for managing 3D-model generation. Two paths are
supported: paid (Tripo / 3D AI Studio) and free (HuggingFace
InstantMesh Space). Use whichever fits your needs.

## `instantmesh_generate.py` — free image-to-3D (recommended)

Generates a GLB for one car using the public TencentARC/InstantMesh
HuggingFace Space. No API key, no credit cost. Input: a single 3/4-front
photo of the car. Output: `static/models/generated/<slug>.glb`.

```bash
pip install gradio_client                          # one-time
# Drop a photo at static/images/source/honda-accord.jpg
python3 scripts/instantmesh_generate.py honda-accord
```

What it does, step by step:
1. Connects to the InstantMesh Space (`huggingface.co/spaces/TencentARC/InstantMesh`)
2. Sends your image through `/preprocess` → background-removed PNG
3. `/generate_mvs` → diffuses 6 synthetic views of the car (the slow step)
4. `/make3d` → reconstructs a triangle mesh + texture, returns a `.glb`
5. Copies the GLB to `static/models/generated/<slug>.glb`
6. Prints a JSON catalog snippet for you to paste into
   `data/car_3d_catalog.json` under the right `make|model|default|default` key

Time: ~1-3 min per car (most of it queueing). Free tier is capacity-limited
— if the Space is busy you'll wait longer. Set `HF_TOKEN` (free at
huggingface.co/settings/tokens) for priority.

See `static/images/source/README.md` for guidance on what makes a good
input photo and where to source free press images.

### Generating for many cars

There's no batch script — InstantMesh's free Space throttles aggressively
and parallel calls just queue. Loop sequentially:

```bash
for slug in honda-accord mercedes-benz-c-class hyundai-sonata kia-k5 \
            nissan-altima audi-a4 lexus-es genesis-g70 \
            toyota-rav4 ford-explorer porsche-cayenne \
            porsche-911-carrera chevrolet-corvette-c8 rivian-r1t; do
  python3 scripts/instantmesh_generate.py "$slug"
done
```

(That list = the 14 cars currently using silhouette fallbacks. Skip any
where you don't have a source image yet.)

---

## `trigger_all_3d.sh` — paid text-to-3D (Tripo)

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

