#!/usr/bin/env python3
"""
Generate per-car hero images with a HuggingFace text-to-image model and
write them to static/images/cars/<slug>.webp — the hero banners that
app.py:cars() auto-detects.

Uses the HuggingFace Inference API (huggingface_hub.InferenceClient) with
a text-to-image model (default: FLUX.1-schnell). For each of the 24 cars
it builds a press-photo-style prompt from the car's year/make/model/
category, generates a landscape image, downscales to <= 1920px wide, and
encodes WebP at ~150-300 KB.

ACCURACY CAVEAT
---------------
Text-to-image models render a *plausible* car, not an accurate one. Badges,
body lines, and brand-specific details are frequently wrong or invented
(a generated "Ferrari 296 GTB" is a generic supercar silhouette). For
brand-accurate banners, source real photos via scripts/fetch_hero_images.py
instead. This script trades accuracy for not needing to source anything.

Prereqs
-------
  pip install huggingface_hub Pillow
  export HF_TOKEN=hf_xxx        # free at huggingface.co/settings/tokens

Usage
-----
  # Preview every prompt — no token or network needed:
  python3 scripts/generate_hero_images.py --dry-run

  # Generate all 24 (skips cars that already have a hero):
  python3 scripts/generate_hero_images.py

  # Overwrite everything
  python3 scripts/generate_hero_images.py --force

  # One car, or a different model
  python3 scripts/generate_hero_images.py ferrari-296-gtb
  python3 scripts/generate_hero_images.py --model stabilityai/stable-diffusion-xl-base-1.0
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")


# slug -> (year, make, model, category). Mirrors cars_data in app.py so
# prompts name the exact vehicle. Keep in sync if cars_data changes.
CARS: dict[str, tuple[str, str, str, str]] = {
    "toyota-camry":            ("2024", "Toyota", "Camry", "midsize sedan"),
    "honda-accord":            ("2024", "Honda", "Accord", "midsize sedan"),
    "bmw-3-series":            ("2024", "BMW", "3 Series", "luxury sedan"),
    "mercedes-benz-c-class":   ("2024", "Mercedes-Benz", "C-Class", "luxury sedan"),
    "hyundai-sonata":          ("2024", "Hyundai", "Sonata", "midsize sedan"),
    "kia-k5":                  ("2024", "Kia", "K5", "midsize sedan"),
    "nissan-altima":           ("2024", "Nissan", "Altima", "midsize sedan"),
    "audi-a4":                 ("2024", "Audi", "A4", "luxury sedan"),
    "lexus-es":                ("2024", "Lexus", "ES", "luxury sedan"),
    "genesis-g70":             ("2024", "Genesis", "G70", "luxury sport sedan"),
    "toyota-rav4":             ("2024", "Toyota", "RAV4", "compact SUV"),
    "ford-explorer":           ("2024", "Ford", "Explorer", "midsize SUV"),
    "tesla-model-x":           ("2024", "Tesla", "Model X", "electric luxury SUV"),
    "porsche-cayenne":         ("2024", "Porsche", "Cayenne", "luxury SUV"),
    "porsche-911-carrera":     ("2024", "Porsche", "911 Carrera", "sports car"),
    "chevrolet-corvette-c8":   ("2024", "Chevrolet", "Corvette C8 Stingray", "sports car"),
    "ferrari-296-gtb":         ("2024", "Ferrari", "296 GTB", "supercar"),
    "ford-mustang-dark-horse": ("2024", "Ford", "Mustang Dark Horse", "muscle sports car"),
    "tesla-model-3":           ("2024", "Tesla", "Model 3", "electric sedan"),
    "tesla-model-s-plaid":     ("2024", "Tesla", "Model S Plaid", "electric luxury sedan"),
    "lucid-air-pure":          ("2024", "Lucid", "Air Pure", "electric luxury sedan"),
    "rivian-r1t":              ("2024", "Rivian", "R1T", "electric pickup truck"),
    "hyundai-ioniq-6":         ("2024", "Hyundai", "Ioniq 6", "electric sedan"),
    "bmw-i7":                  ("2024", "BMW", "i7", "electric luxury sedan"),
}

OUT_DIR       = Path("static/images/cars")
DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell"
GEN_WIDTH     = 1344      # landscape, ~7:4 — suits the wide hero crop
GEN_HEIGHT    = 768
TARGET_WIDTH  = 1920      # final WebP width ceiling
WEBP_QUALITY  = 82

NEGATIVE = ("cartoon, illustration, drawing, render, cgi, low quality, "
            "blurry, distorted, deformed, watermark, text, logo overlay, "
            "people, cropped, duplicate, multiple cars")


def build_prompt(year: str, make: str, model: str, category: str) -> str:
    return (
        f"professional automotive advertising photograph of a {year} "
        f"{make} {model}, a {category}, front three-quarter view, parked, "
        f"glossy factory paint, dramatic studio lighting, clean neutral "
        f"gradient background, full vehicle in frame, ultra detailed, "
        f"sharp focus, 35mm, high resolution, photorealistic, commercial "
        f"car photography"
    )


def to_webp(img: "Image.Image", dest: Path) -> int:
    """Downscale to <= TARGET_WIDTH and encode WebP. Returns bytes written."""
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    if img.width > TARGET_WIDTH:
        h = round(img.height * TARGET_WIDTH / img.width)
        img = img.resize((TARGET_WIDTH, h), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    return dest.stat().st_size


def make_client(model: str):
    """Build an InferenceClient, exiting with a clear message if unusable."""
    try:
        from huggingface_hub import InferenceClient
    except ImportError:
        sys.exit("huggingface_hub is required: pip install huggingface_hub")
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACEHUB_API_TOKEN")
    if not token:
        sys.exit("Set HF_TOKEN (free at huggingface.co/settings/tokens) "
                 "before generating.")
    return InferenceClient(model=model, token=token)


def generate(client, model: str, prompt: str) -> "Image.Image":
    """Call text_to_image, passing optional kwargs only where supported."""
    kwargs: dict = {"width": GEN_WIDTH, "height": GEN_HEIGHT}
    # FLUX (guidance-distilled) ignores/rejects negative_prompt; SDXL uses it.
    if "flux" not in model.lower():
        kwargs["negative_prompt"] = NEGATIVE
    try:
        return client.text_to_image(prompt, **kwargs)
    except TypeError:
        # Older/newer client signature — retry with prompt only.
        return client.text_to_image(prompt)


def run_one(client, model: str, slug: str, spec: tuple, dry_run: bool) -> bool:
    year, make, model_name, category = spec
    prompt = build_prompt(year, make, model_name, category)
    print(f"\n→ {slug}")
    print(f"   prompt: {prompt}")
    if dry_run:
        print("   (dry-run — not generated)")
        return True
    dest = OUT_DIR / f"{slug}.webp"
    try:
        img = generate(client, model, prompt)
        written = to_webp(img, dest)
    except Exception as exc:                        # noqa: BLE001
        print(f"   ERROR — generation failed: {exc}")
        return False
    print(f"   OK saved {dest}  ({written / 1024:.0f} KB)")
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?", help="single car slug (default: all)")
    ap.add_argument("--model", default=DEFAULT_MODEL,
                    help=f"HF text-to-image model (default: {DEFAULT_MODEL})")
    ap.add_argument("--dry-run", action="store_true",
                    help="print prompts only — no token or network needed")
    ap.add_argument("--force", action="store_true",
                    help="overwrite cars that already have a hero image")
    ap.add_argument("--sleep", type=float, default=2.0,
                    help="seconds to pause between cars (rate-limit friendly)")
    args = ap.parse_args()

    # Validate single-slug early
    if args.slug and args.slug not in CARS:
        sys.exit(f"Unknown slug {args.slug!r}. Known: {', '.join(CARS)}")

    client = None if args.dry_run else make_client(args.model)

    targets = ({args.slug: CARS[args.slug]} if args.slug else CARS)
    done = skipped = failed = 0
    for slug, spec in targets.items():
        if not args.force and (OUT_DIR / f"{slug}.webp").exists():
            print(f"\n→ {slug} — already have {slug}.webp, skipping")
            skipped += 1
            continue
        if run_one(client, args.model, slug, spec, args.dry_run):
            done += 1
        else:
            failed += 1
        if not args.dry_run and args.sleep:
            time.sleep(args.sleep)

    print(f"\nDone. {done} generated, {skipped} already present, {failed} failed.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
