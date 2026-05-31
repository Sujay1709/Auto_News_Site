# Branded Car GLBs — Attribution

This directory contains real, brand-named 3D car models in glTF binary
(`.glb`) format used to give specific cars in `cars_data` a recognisable
model instead of the generic-silhouette fallbacks in `../community/`.

## Source

All files in this directory (except the CC0 concept car) were imported
from the public GitHub collection:

  https://github.com/Vivekkk-1/3D-Models

That repository is published under the **Boost Software License 1.0**,
a permissive license compatible with redistribution. The repository's
README explicitly notes that the assets originate from creators on
**Sketchfab** but does not preserve individual creator attributions or
the original per-asset licenses.

## What this means in practice

- The collection itself is permissively licensed and we redistribute
  it here in good faith.
- We can't pass through the original Sketchfab creators' names because
  they were not preserved upstream. If you discover the original
  creator of any model in this directory, please open an issue or PR
  to add a proper credit line.
- For commercial use, audit each file independently — the upstream
  license per asset is unverified.

## Files

| File | Used for | Notes |
|---|---|---|
| `tesla_roadster_2020.glb` | Tesla Model 3, Model S Plaid, Model X | Real Tesla, wrong specific model — closest brand match available |
| `BMW_2018.glb` | BMW 3 Series | Real BMW sedan |
| `2020_bmw_m8.glb` | BMW i7 | Real BMW luxury — closest match to i7 |
| `ferrari_599.glb` | Ferrari 296 GTB | Real Ferrari, wrong specific model |
| `ford_gt40.glb` | Ford Mustang Dark Horse | Real Ford, iconic but wrong specific model |
| `toyota_supra_mk4_a80.glb` | Toyota Camry | Real Toyota, wrong category (sports car for sedan) |
| `free_concept_car_037_-_public_domain_cc0.glb` | Lucid Air Pure, Hyundai Ioniq 6 | CC0, generic futuristic EV |

The other 13 cars in `cars_data` still use the silhouette models in
`../community/` because no brand-matched GLB was available.

## Upgrading a single car

To swap a generic silhouette for a real brand-accurate model later:

1. Download a CC-BY (or CC0) GLB of the specific car from Sketchfab,
   Polyhaven, or similar.
2. Drop it at `static/models/<make>/<slug>.glb`.
3. Edit `data/car_3d_catalog.json`: change the matching entry's
   `url`, `display_name`, `license`, and set `is_placeholder: false`.

No code changes required — `app.py`'s `resolve_3d_model()` picks it up
on the next page load.
