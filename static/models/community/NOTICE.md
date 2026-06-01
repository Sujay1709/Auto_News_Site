# Third-party 3D models — attribution

This directory contains 3D vehicle models sourced from public CC-licensed
sample collections on GitHub. They are used by the `/cars` page to provide
real 3D previews per car type. Each file's license, source, and authorship
are documented below — required by their respective licenses.

---

## ferrari.glb

- **License:** CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/
- **Source:** https://github.com/mrdoob/three.js/blob/master/examples/models/gltf/ferrari.glb
- **Original model:** "Ferrari 458 Italia" by vicente betoret ferrero, on Sketchfab
- **Used as:** sports-car silhouette (Porsche 911, Corvette C8, Ferrari 296 GTB, Mustang Dark Horse).

## toy_car.glb

- **License:** CC0 1.0 Universal — https://creativecommons.org/publicdomain/zero/1.0/
- **Source:** https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ToyCar
- **Authors:** Guido Odendahl (initial model), Eric Chadwick (extensions and scene)
- **Used as:** sedan / EV silhouette (Camry, Accord, 3 Series, C-Class, Sonata, K5, Altima, A4, ES, G70, Model 3, Model S Plaid, Air Pure, Ioniq 6, i7).

## milk_truck.glb

- **License:** CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
- **Source:** https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CesiumMilkTruck
- **Author:** Cesium (Cesium Milk Truck sample)
- **Used as:** SUV / pickup silhouette (RAV4, Explorer, Model X, Cayenne, R1T).

---

## Replacing a model with a branded one

The procedural Three.js viewer (`static/js/procedural_car.js`) is the
fallback whenever a car has no GLB. To replace any car with a
brand-specific 3D model (e.g. a real Tesla Model S GLB downloaded from
Sketchfab):

1. Drop the file at `static/models/<make>/<slug>.glb`.
2. In `data/car_3d_catalog.json`, add or edit the entry under the car's
   key (`"<make>|<model>|default|default"`) to point at the new file
   and update `display_name` / `license` accordingly.

No code change in `app.py` is required.