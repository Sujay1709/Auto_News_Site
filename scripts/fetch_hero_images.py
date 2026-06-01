#!/usr/bin/env python3
"""
Download CC-licensed car photos from Wikimedia Commons, convert them to
web-optimized WebP, and write them to static/images/cars/<slug>.webp —
the per-car hero images that app.py:cars() auto-detects.

Unlike scripts/wm_fetch.py (which feeds full-res JPGs to the 3D-model
generator), this script targets the *hero banner* slot: all 24 cars,
resized to <= 1920px wide and saved as WebP at ~150-300 KB.

Run on YOUR machine. Wikimedia is unreachable from the Claude container
(only GitHub is whitelisted), so the network calls must run locally.

Usage
-----
  # Preview what WOULD be downloaded — no files written, no network
  # downloads, just the search picks + license info for every car:
  python3 scripts/fetch_hero_images.py --dry-run

  # Real run: download + convert + write every car that has no hero yet
  python3 scripts/fetch_hero_images.py

  # Overwrite even cars that already have a hero image
  python3 scripts/fetch_hero_images.py --force

  # One car only (default or custom search query)
  python3 scripts/fetch_hero_images.py tesla-model-3
  python3 scripts/fetch_hero_images.py tesla-model-3 "Tesla Model 3 Highland front"

How it works
------------
Two Commons API calls per car (same as wm_fetch.py):
  1. SEARCH:  list=search&srsearch=<query>&srnamespace=6 (File:)
  2. INFO:    imageinfo&iiprop=url|size|extmetadata for dimensions,
              direct URL, license + author.
Picks the highest-resolution landscape-ish hit >= MIN_WIDTH, downloads
it, then Pillow resizes to <= TARGET_WIDTH and encodes WebP.

License caveat
--------------
Most Commons images are CC-BY / CC-BY-SA — attribution required. Each
download's License + Author is appended to static/images/cars/CREDITS.md.
Keep that file if you publish the site.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")


# Slug → default Commons search query. Tuned per car: chassis codes /
# generation names give cleaner hits than bare make+model. Override any
# of these from the CLI if the pick looks wrong.
CARS: dict[str, str] = {
    "toyota-camry":            "Toyota Camry XV70 sedan",
    "honda-accord":            "2024 Honda Accord sedan",
    "bmw-3-series":            "BMW 3 Series G20 sedan",
    "mercedes-benz-c-class":   "Mercedes-Benz C-Class W206 sedan",
    "hyundai-sonata":          "Hyundai Sonata DN8 sedan",
    "kia-k5":                  "Kia K5 sedan",
    "nissan-altima":           "Nissan Altima 2023 sedan",
    "audi-a4":                 "Audi A4 B9 sedan",
    "lexus-es":                "Lexus ES 2023 sedan",
    "genesis-g70":             "Genesis G70 sedan",
    "toyota-rav4":             "Toyota RAV4 XA50 SUV",
    "ford-explorer":           "Ford Explorer 2023 SUV",
    "tesla-model-x":           "Tesla Model X SUV",
    "porsche-cayenne":         "Porsche Cayenne 2023 SUV",
    "porsche-911-carrera":     "Porsche 911 992 Carrera",
    "chevrolet-corvette-c8":   "Chevrolet Corvette C8 Stingray",
    "ferrari-296-gtb":         "Ferrari 296 GTB",
    "ford-mustang-dark-horse": "Ford Mustang Dark Horse S650",
    "tesla-model-3":           "Tesla Model 3 sedan",
    "tesla-model-s-plaid":     "Tesla Model S sedan",
    "lucid-air-pure":          "Lucid Air sedan",
    "rivian-r1t":              "Rivian R1T pickup truck",
    "hyundai-ioniq-6":         "Hyundai Ioniq 6 sedan",
    "bmw-i7":                  "BMW i7 sedan",
}

OUT_DIR        = Path("static/images/cars")
CREDITS_PATH   = OUT_DIR / "CREDITS.md"
API_URL        = "https://commons.wikimedia.org/w/api.php"
USER_AGENT     = "AutoNewsSite/1.0 (https://github.com/Sujay1709/Auto_News_Site)"
MIN_WIDTH      = 1280     # reject anything narrower — hero displays wide
TARGET_WIDTH   = 1920     # downscale larger images to this before WebP
WEBP_QUALITY   = 80       # ~150-300 KB at 1920px wide for typical photos


def api_get(params: dict) -> dict:
    qs = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"{API_URL}?{qs}",
                                 headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp)


def search_files(query: str, limit: int = 20) -> list[str]:
    """Search the File: namespace. Returns filenames (sans 'File:' prefix)."""
    data = api_get({
        "action":      "query",
        "list":        "search",
        "srsearch":    f"{query} filemime:image/jpeg|image/png",
        "srnamespace": "6",          # File:
        "srlimit":     str(limit),
        "format":      "json",
    })
    hits = data.get("query", {}).get("search", [])
    return [h["title"][5:] for h in hits if h["title"].startswith("File:")]


def imageinfo(filenames: list[str]) -> list[dict]:
    """Bulk imageinfo: width, height, size, url, license, author."""
    if not filenames:
        return []
    titles = "|".join(f"File:{n}" for n in filenames[:50])
    data = api_get({
        "action": "query",
        "titles": titles,
        "prop":   "imageinfo",
        "iiprop": "url|size|extmetadata",
        "format": "json",
    })
    pages = data.get("query", {}).get("pages", {})
    results = []
    for p in pages.values():
        if "missing" in p or "imageinfo" not in p:
            continue
        info = p["imageinfo"][0]
        ext = info.get("extmetadata", {}) or {}
        author = (ext.get("Artist") or {}).get("value", "Unknown")
        # extmetadata Artist is often HTML — strip the most common tags
        for tag in ("<p>", "</p>", "<span>", "</span>", "<bdi>", "</bdi>"):
            author = author.replace(tag, "")
        results.append({
            "title":   p["title"],          # "File:Foo.jpg"
            "url":     info.get("url"),
            "width":   info.get("width", 0),
            "height":  info.get("height", 0),
            "size":    info.get("size", 0),
            "license": (ext.get("LicenseShortName") or {}).get("value", "Unknown"),
            "author":  author[:80],
        })
    return results


def pick_best(candidates: list[dict]) -> dict | None:
    """Highest-resolution landscape-ish image with width >= MIN_WIDTH."""
    viable = [c for c in candidates
              if c["width"] >= MIN_WIDTH and c["width"] >= c["height"]]
    if not viable:
        # fall back to any orientation that meets the width floor
        viable = [c for c in candidates if c["width"] >= MIN_WIDTH]
    if not viable:
        return None
    return max(viable, key=lambda c: c["width"] * c["height"])


def download_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def to_webp(raw: bytes, dest: Path) -> int:
    """Decode, downscale to <= TARGET_WIDTH, encode WebP. Returns bytes written."""
    from io import BytesIO
    img = Image.open(BytesIO(raw))
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    if img.width > TARGET_WIDTH:
        h = round(img.height * TARGET_WIDTH / img.width)
        img = img.resize((TARGET_WIDTH, h), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
    return dest.stat().st_size


def append_credit(slug: str, best: dict) -> None:
    if not CREDITS_PATH.exists():
        CREDITS_PATH.write_text(
            "# Hero image credits\n\n"
            "Auto-generated by `scripts/fetch_hero_images.py`. "
            "Most Wikimedia Commons images are CC-BY / CC-BY-SA — keep this "
            "attribution if the site is published.\n\n"
            "| Slug | Source file | License | Author |\n"
            "|---|---|---|---|\n",
            encoding="utf-8",
        )
    row = (f"| `{slug}` | {best['title']} | {best['license']} | "
           f"{best['author']} |\n")
    with CREDITS_PATH.open("a", encoding="utf-8") as f:
        f.write(row)


def fetch_one(slug: str, query: str, dry_run: bool) -> bool:
    print(f"\n→ {slug}")
    print(f"   query: {query!r}")
    try:
        filenames = search_files(query)
    except Exception as exc:                       # noqa: BLE001
        print(f"   ERROR — search failed: {exc}")
        return False
    if not filenames:
        print("   SKIP — no search hits")
        return False
    candidates = imageinfo(filenames)
    best = pick_best(candidates)
    if not best:
        print(f"   SKIP — no candidate >= {MIN_WIDTH}px wide "
              f"(found {len(candidates)} smaller ones)")
        return False

    print(f"   pick:  {best['title']}")
    print(f"          {best['width']}x{best['height']}  "
          f"({best['size'] / 1024 / 1024:.1f} MB)  {best['license']}")
    print(f"          credit: {best['author']}")

    if dry_run:
        print("   (dry-run — not downloaded)")
        return True

    dest = OUT_DIR / f"{slug}.webp"
    try:
        raw = download_bytes(best["url"])
        written = to_webp(raw, dest)
    except Exception as exc:                        # noqa: BLE001
        print(f"   ERROR — download/convert failed: {exc}")
        return False
    append_credit(slug, best)
    print(f"   OK saved {dest}  ({written / 1024:.0f} KB)")
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?", help="single car slug (default: all)")
    ap.add_argument("query", nargs="?", help="custom search query for that slug")
    ap.add_argument("--dry-run", action="store_true",
                    help="show picks without downloading or writing files")
    ap.add_argument("--force", action="store_true",
                    help="overwrite cars that already have a hero image")
    args = ap.parse_args()

    # Single-car mode
    if args.slug:
        query = args.query or CARS.get(args.slug,
                                       args.slug.replace("-", " ") + " car")
        ok = fetch_one(args.slug, query, args.dry_run)
        return 0 if ok else 1

    # Batch mode
    done = skipped = failed = 0
    for slug, query in CARS.items():
        if not args.force and (OUT_DIR / f"{slug}.webp").exists():
            print(f"\n→ {slug} — already have {slug}.webp, skipping")
            skipped += 1
            continue
        if fetch_one(slug, query, args.dry_run):
            done += 1
        else:
            failed += 1

    print(f"\nDone. {done} fetched, {skipped} already present, {failed} "
          f"failed/skipped.")
    if failed:
        print("Re-run failed ones individually with a custom query, e.g.:")
        print("  python3 scripts/fetch_hero_images.py <slug> "
              "\"<better search terms>\"")
    return 0


if __name__ == "__main__":
    sys.exit(main())
