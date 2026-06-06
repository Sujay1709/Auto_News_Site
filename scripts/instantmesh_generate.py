#!/usr/bin/env python3
"""
Generate a 3D car model GLB from a single image using the InstantMesh
HuggingFace Space (TencentARC/InstantMesh).

How it works
------------
HuggingFace Spaces are Gradio web apps hosted on free CPU/GPU. They
expose every function in their UI as a callable HTTP endpoint, and the
`gradio_client` Python library wraps those endpoints with type-aware
auto-generated functions.

For InstantMesh, the public Space exposes three endpoints we chain:
  1. /preprocess     : Strip background → clean PNG
  2. /generate_mvs   : Diffuse 6 multi-view images from the clean PNG
  3. /make3d         : Reconstruct a textured triangle mesh → .glb / .obj

The Space queues requests when busy; expect 30 sec – 5 min per car.

Usage
-----
  # one car
  python3 scripts/instantmesh_generate.py toyota-camry

  # custom input image (default: static/images/source/<slug>.{jpg,png,webp})
  python3 scripts/instantmesh_generate.py toyota-camry \\
    --input ~/Downloads/some-camry-photo.jpg

  # with HF token for higher queue priority (optional)
  HF_TOKEN=hf_xxx python3 scripts/instantmesh_generate.py toyota-camry

Output
------
GLB written to:  static/models/generated/<slug>.glb
Catalog snippet printed at end; paste into data/car_3d_catalog.json
under the matching key to enable it for /cars.

Prereqs
-------
  pip install gradio_client
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import time
from pathlib import Path

try:
    from gradio_client import Client, file as gr_file
except ImportError:
    sys.stderr.write(
        "ERROR: gradio_client not installed.\n"
        "  pip install gradio_client\n"
    )
    sys.exit(1)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SPACE_ID         = "TencentARC/InstantMesh"
INPUT_DIR        = Path("static/images/source")
OUTPUT_DIR       = Path("static/models/generated")
INPUT_EXTS       = (".jpg", ".jpeg", ".png", ".webp")
DEFAULT_STEPS    = 75       # diffusion steps for multi-view generation
DEFAULT_SEED     = 42


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def find_input_image(slug: str, override: Path | None) -> Path:
    """Locate input image: explicit override OR INPUT_DIR/<slug>.<ext>."""
    if override:
        if not override.exists():
            raise FileNotFoundError(f"--input file not found: {override}")
        return override

    for ext in INPUT_EXTS:
        candidate = INPUT_DIR / f"{slug}{ext}"
        if candidate.exists():
            return candidate

    raise FileNotFoundError(
        f"No input image for slug '{slug}'. Looked in {INPUT_DIR}/ for "
        f"{slug}.{{jpg,jpeg,png,webp}}.\n"
        f"Drop a 3/4-front car photo there, or pass --input <path>."
    )


def connect_space() -> Client:
    """Open a gradio_client connection. HF_TOKEN improves queue priority."""
    token = os.environ.get("HF_TOKEN", "").strip() or None
    print(f"→ Connecting to HuggingFace Space: {SPACE_ID}"
          f"{' (with token)' if token else ' (anonymous)'}")
    try:
        return Client(SPACE_ID, hf_token=token)
    except Exception as exc:
        sys.stderr.write(
            f"ERROR: failed to connect to {SPACE_ID}.\n"
            f"  Cause: {exc}\n"
            f"  Check: https://huggingface.co/spaces/{SPACE_ID} (Space may be sleeping or down)\n"
        )
        sys.exit(2)


def run_pipeline(client: Client, image_path: Path,
                 sample_steps: int, sample_seed: int) -> Path:
    """
    Chain preprocess → generate_mvs → make3d. Returns the GLB path
    that the Space wrote to its temp directory.

    Note: Gradio Space function signatures evolve. If this script breaks
    after a Space update, inspect the current API with:
        from gradio_client import Client
        Client("TencentARC/InstantMesh").view_api()
    """
    t0 = time.time()

    # 1. Preprocess: background removal + crop
    print("→ [1/3] Preprocessing image (background removal)…")
    processed = client.predict(
        gr_file(str(image_path)),
        True,                      # do_remove_background
        api_name="/preprocess",
    )
    print(f"  done in {time.time()-t0:.1f}s")

    # 2. Generate multi-view (the slow step — diffusion)
    print(f"→ [2/3] Generating 6 multi-views ({sample_steps} diffusion steps)…")
    t1 = time.time()
    mvs = client.predict(
        processed,
        sample_steps,
        sample_seed,
        api_name="/generate_mvs",
    )
    print(f"  done in {time.time()-t1:.1f}s")

    # 3. Make 3D mesh
    print("→ [3/3] Reconstructing 3D mesh…")
    t2 = time.time()
    result = client.predict(api_name="/make3d")
    print(f"  done in {time.time()-t2:.1f}s")

    # /make3d returns (obj_path, glb_path) on the current Space.
    glb_path: str | None = None
    if isinstance(result, (list, tuple)):
        for item in result:
            if isinstance(item, str) and item.endswith(".glb"):
                glb_path = item
                break
    elif isinstance(result, str) and result.endswith(".glb"):
        glb_path = result

    if not glb_path:
        raise RuntimeError(
            f"Could not find .glb in /make3d response. Got: {result!r}.\n"
            "The Space may have changed its return shape — inspect with:\n"
            f"  Client('{SPACE_ID}').view_api()"
        )

    print(f"✔  Pipeline finished in {time.time()-t0:.1f}s total")
    return Path(glb_path)


def save_glb(temp_glb: Path, slug: str) -> Path:
    """Copy the Space's temp GLB into our repo's models/generated/."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    dest = OUTPUT_DIR / f"{slug}.glb"
    shutil.copy(temp_glb, dest)
    size_mb = dest.stat().st_size / (1024 * 1024)
    print(f"✔  Saved: {dest} ({size_mb:.1f} MB)")
    return dest


def print_catalog_snippet(slug: str, glb_path: Path) -> None:
    """Print the JSON entry the user should paste into car_3d_catalog.json."""
    # Convert slug back to make|model for the catalog key
    # Slug rule (from app.py _car_slug): "{make}-{model}".lower(), no dashes
    # We can't reverse perfectly (mercedes-benz-c-class is ambiguous), so we
    # just show a template the user can adjust.
    web_path = f"/{glb_path}"
    snippet = {
        "url": web_path,
        "display_name": f"InstantMesh-generated ({slug})",
        "license": "Generated via TencentARC/InstantMesh on HuggingFace Space",
        "is_placeholder": False,
    }
    print("\n" + "─" * 70)
    print("Paste this into data/car_3d_catalog.json under the right key")
    print(f"(probably:  \"<make>|<model>|default|default\"):\n")
    print(json.dumps(snippet, indent=2))
    print("─" * 70)
    print("\nThen refresh http://localhost:5173/cars to see the model.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug", help="Car slug, e.g. 'toyota-camry'")
    parser.add_argument("--input", type=Path, default=None,
                        help=f"Override input image path (default: {INPUT_DIR}/<slug>.<ext>)")
    parser.add_argument("--steps", type=int, default=DEFAULT_STEPS,
                        help=f"Diffusion steps for multi-view (default {DEFAULT_STEPS})")
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED,
                        help=f"Random seed (default {DEFAULT_SEED})")
    args = parser.parse_args()

    try:
        image_path = find_input_image(args.slug, args.input)
    except FileNotFoundError as exc:
        sys.stderr.write(f"ERROR: {exc}\n")
        return 1

    print(f"Input image:  {image_path}")
    print(f"Output slug:  {args.slug}")

    client = connect_space()

    try:
        temp_glb = run_pipeline(client, image_path, args.steps, args.seed)
    except Exception as exc:
        sys.stderr.write(f"\nERROR during pipeline: {exc}\n")
        return 3

    dest = save_glb(temp_glb, args.slug)
    print_catalog_snippet(args.slug, dest)
    return 0


if __name__ == "__main__":
    sys.exit(main())