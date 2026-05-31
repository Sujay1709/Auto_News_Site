# Per-car hero images

Drop a `.webp` (or `.jpg`) named after a car's slug into this folder and
it will automatically appear as a hero image above that car's spec
panel on `/cars`. No code changes needed — `app.py:cars()` checks for
`static/images/cars/<slug>.webp` on each request and exposes
`hero_image_url` to the template when found.

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

## Sizing

Source images should be at least 1920px wide. The template displays them
at ~600px height with `object-fit: cover`, so wider/taller images get
center-cropped. WebP recommended for size (~150-300 KB target).

## Where to source

Free/CC-licensed marketing shots:
- https://www.pexels.com (free, no attribution required)
- https://unsplash.com (free, attribution appreciated)
- Manufacturer press kits (usually editorial-use OK)

## What's currently here

- `_hero-bugatti.webp` — Bugatti Chiron at Goodwood, kept as a sample
  reference. Filename starts with `_` so it won't match any slug.
