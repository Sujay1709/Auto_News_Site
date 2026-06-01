#!/usr/bin/env python3
"""
Download CC-licensed car photos from Wikimedia Commons into
static/images/source/<slug>.jpg — ready for instantmesh_generate.py.

Searches the Commons API for each car, downloads the highest-resolution
hit. Run on YOUR machine (Wikimedia is unreachable from the Claude
container — only GitHub is allowed).

Usage
-----
  # Batch: download photos for every car in cars_data without a
  # brand-matched 3D model yet
  python3 scripts/wm_fetch.py

  # Single car (uses default search query)
  python3 scripts/wm_fetch.py honda-accord

  # Single car with custom search query (overrides default)
  python3 scripts/wm_fetch.py honda-accord "2024 Honda Accord Touring Hybrid front"

How it works
------------
Two Commons API calls per car:

  1. SEARCH:  list=search&srsearch=<query>&srnamespace=6 (File:)
              Returns up to 20 candidate File: pages.
  2. INFO:    For each candidate, query imageinfo&iiprop=url|size
              to get dimensions + direct upload.wikimedia.org URL.

Picks the highest-resolution image >= 1024px on the short side
(InstantMesh's required minimum). If nothing qualifies, prints SKIP.

License caveat
--------------
Most Commons images are CC-BY or CC-BY-SA — attribution required.
The script prints the License + Author for each download. Keep that
info somewhere if you publish the site.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path


# Cars currently using silhouette fallbacks (no brand-matched GLB yet).
# Slug → default search query. Override per-car via CLI arg if a query
# returns wrong results.
MISSING_CARS = {
    "honda-accord":          "2024 Honda Accord sedan",
    "mercedes-benz-c-class": "Mercedes-Benz C-Class W206 sedan",
    "hyundai-sonata":        "Hyundai Sonata 2023 sedan",
    "kia-k5":                "Kia K5 sedan",
    "nissan-altima":         "Nissan Altima 2023 sedan",
    "audi-a4":               "Audi A4 B9 sedan",
    "lexus-es":              "Lexus ES 2023 sedan",
    "genesis-g70":           "Genesis G70 sedan",
    "toyota-rav4":           "Toyota RAV4 XA50 SUV",
    "ford-explorer":         "Ford Explorer 2023 SUV",
    "porsche-cayenne":       "Porsche Cayenne 2023 SUV",
    "porsche-911-carrera":   "Porsche 911 992 Carrera",
    "chevrolet-corvette-c8": "Chevrolet Corvette C8 Stingray",
    "rivian-r1t":            "Rivian R1T pickup truck",
}

OUT_DIR    = Path("static/images/source")
API_URL    = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AutoNewsSite/1.0 (https://github.com/Sujay1709/Auto_News_Site)"
MIN_SHORT_SIDE = 1024     # InstantMesh's effective minimum input dimension


def api_get(params: dict) -> dict:
    qs = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"{API_URL}?{qs}",
                                 headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.load(resp)


def search_files(query: str, limit: int = 20) -> list[str]:
    """Search the File: namespace. Returns filenames (sans 'File:' prefix)."""
    data = api_get({
        "action":     "query",
        "list":       "search",
        "srsearch":   f"{query} filemime:image/jpeg|image/png",
        "srnamespace": "6",        # File:
        "srlimit":    str(limit),
        "format":     "json",
    })
    hits = data.get("query", {}).get("search", [])
    out = []
    for h in hits:
        title = h["title"]  # "File:Foo_bar.jpg"
        if title.startswith("File:"):
            out.append(title[5:])
    return out


def imageinfo(filenames: list[str]) -> list[dict]:
    """Bulk imageinfo: width, height, size, url, license, author."""
    if not filenames:
        return []
    # Up to 50 per query
    titles = "|".join(f"File:{n}" for n in filenames[:50])
    data = api_get({
        "action":  "query",
        "titles":  titles,
        "prop":    "imageinfo",
        "iiprop":  "url|size|extmetadata",
        "format":  "json",
    })
    pages = data.get("query", {}).get("pages", {})
    results = []
    for p in pages.values():
        if "missing" in p or "imageinfo" not in p:
            continue
        info = p["imageinfo"][0]
        ext = info.get("extmetadata", {}) or {}
        results.append({
            "title":   p["title"],          # "File:Foo.jpg"
            "url":     info.get("url"),
            "width":   info.get("width", 0),
            "height":  info.get("height", 0),
            "size":    info.get("size", 0),
            "license": (ext.get("LicenseShortName") or {}).get("value", "Unknown"),
            "author":  (ext.get("Artist") or {}).get("value", "Unknown")
                       .replace("<p>", "").replace("</p>", "")[:80],
        })
    return results


def pick_best(candidates: list[dict]) -> dict | None:
    """Highest-resolution image where short side >= MIN_SHORT_SIDE."""
    viable = [c for c in candidates
              if min(c["width"], c["height"]) >= MIN_SHORT_SIDE]
    if not viable:
        return None
    return max(viable, key=lambda c: c["width"] * c["height"])


def download_url(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(req, timeout=60) as resp, dest.open("wb") as out:
        out.write(resp.read())


def fetch_one(slug: str, query: str) -> None:
    print(f"\n→ {slug}")
    print(f"   query: {query!r}")
    filenames = search_files(query)
    if not filenames:
        print(f"   SKIP — no search hits")
        return
    candidates = imageinfo(filenames)
    best = pick_best(candidates)
    if not best:
        print(f"   SKIP — no candidate ≥ {MIN_SHORT_SIDE}px short side "
              f"(found {len(candidates)} smaller ones)")
        return

    ext = Path(best["url"]).suffix.lower() or ".jpg"
    dest = OUT_DIR / f"{slug}{ext}"
    print(f"   pick:  {best['title']}")
    print(f"          {best['width']}×{best['height']}  "
          f"({best['size']/1024/1024:.1f} MB)  {best['license']}")
    print(f"          credit: {best['author']}")
    print(f"   download → {dest}")
    download_url(best["url"], dest)
    print(f"   ✔ saved")


def main() -> int:
    if len(sys.argv) == 1:
        # Batch: skip any car that already has a source image
        for slug, query in MISSING_CARS.items():
            existing = list(OUT_DIR.glob(f"{slug}.*"))
            if existing:
                print(f"\n→ {slug} — already have {existing[0].name}, skipping")
                continue
            fetch_one(slug, query)
        print("\nDone.")
        return 0

    if len(sys.argv) == 2:
        slug = sys.argv[1]
        query = MISSING_CARS.get(slug, slug.replace("-", " ") + " 2023")
        fetch_one(slug, query)
        return 0

    if len(sys.argv) == 3:
        fetch_one(sys.argv[1], sys.argv[2])
        return 0

    print("Usage:", file=sys.stderr)
    print("  python3 scripts/wm_fetch.py                       # batch all missing cars",
          file=sys.stderr)
    print("  python3 scripts/wm_fetch.py <slug>                # one car, default query",
          file=sys.stderr)
    print("  python3 scripts/wm_fetch.py <slug> <query>        # custom search",
          file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
