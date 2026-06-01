# Source images for InstantMesh generation

Input photos for `scripts/instantmesh_generate.py`. One image per car,
named after the car's slug.

## Naming

Same slug rule as `static/images/cars/` — `{make}-{model}` lowercased,
spaces → dashes. Examples:

| Car | Filename |
|---|---|
| Honda Accord | `honda-accord.jpg` |
| Mercedes-Benz C-Class | `mercedes-benz-c-class.jpg` |
| Porsche 911 Carrera | `porsche-911-carrera.jpg` |
| Hyundai Sonata | `hyundai-sonata.webp` |

Any of `.jpg`, `.jpeg`, `.png`, `.webp` works.

## What makes a good source image

InstantMesh works best with:
- **3/4 front view** (driver-side front quarter showing front grille, hood, and side)
- **Plain or simple background** (the script auto-removes background but
  cleaner inputs give cleaner output)
- **Centered, full car visible** (no cropped wheels or roof)
- **Even lighting** (avoid harsh shadows that obscure body lines)
- **At least 1024×1024px** (smaller images produce muddy meshes)

A studio-style press photo against a white/grey background is ideal.
A blurry candid phone shot at night will produce nothing usable.

## Where to source

All free for non-commercial use; verify license before publishing:

- **Manufacturer press kits** (e.g., `https://newsroom.toyota.com`,
  `https://media.tesla.com`) — best image quality, usually editorial-use OK
- **Wikimedia Commons** (`commons.wikimedia.org`) — pre-filtered for
  permissive licenses
- **Pexels / Unsplash** — free, generally OK for any use

## Cost & time

- Free via the public TencentARC/InstantMesh Space on HuggingFace
- ~1-3 min per car (most of it queueing)
- Optional: set `HF_TOKEN` env var (from huggingface.co/settings/tokens —
  also free) to get priority in the queue