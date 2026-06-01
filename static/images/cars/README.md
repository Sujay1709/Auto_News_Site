# Per-car hero images

Every car has a generated **`<slug>.svg`** hero banner in this folder —
a brand-coloured, body-type silhouette banner produced offline by
`scripts/generate_hero_images.py`. These render above each car's detail
page (`/cars/<slug>`).

`app.py`'s `resolve_hero_url()` checks these extensions **in priority
order**: `.webp → .jpg → .jpeg → .png → .svg`. So to replace a generated
banner with a **real photo**, just drop a `<slug>.webp` (or `.jpg`) into
this folder — it automatically wins over the `.svg`, no code change
needed.

## Why SVG banners instead of photos?

The build/CI environment can only reach GitHub (manufacturer press kits,
Wikimedia, Pexels, etc. are all blocked), so real marketing photos can't
be fetched automatically. The generated banners give every car a clean,
intentional hero immediately; swap in real photos any time using the
override above.

## Regenerating the banners

```bash
python3 scripts/generate_hero_images.py     # rewrites all <slug>.svg
```
Brand colours and silhouettes live in that script.

## Slug rules

Slug = `{make}-{model}` lowercased, with spaces → dashes, special
characters removed. Examples:

| Car | Slug | Expected file |
|---|---|---|
| Toyota Camry | `toyota-camry` | `toyota-camry.webp` |
| BMW 3 Series | `bmw-3-series` | `bmw-3-series.webp` |
| Mercedes-Benz C-Class | `mercedes-benz-c-class` | `mercedes-benz-c-class.webp` |
| Ferrari 296 GTB | `ferrari-296-gtb` | `ferrari-296-gtb.webp` |
| Tesla Model S Plaid | `tesla-model-s-plaid` | `tesla-model-s-plaid.webp` |

## Sizing (for real-photo replacements)

Source images should be at least 1920px wide. The template displays them
at up to ~520px height with `object-fit: cover`, so wider/taller images
get center-cropped. WebP recommended for size (~150-300 KB target).

## Where to source real photos

Free/CC-licensed marketing shots:
- https://www.pexels.com (free, no attribution required)
- https://unsplash.com (free, attribution appreciated)
- Manufacturer press kits (usually editorial-use OK)

## What's currently here

- `<slug>.svg` — generated brand banners, one per car (24 total).
- `_hero-bugatti.webp` — Bugatti Chiron at Goodwood, kept as a sample
  reference. Filename starts with `_` so it won't match any slug.
