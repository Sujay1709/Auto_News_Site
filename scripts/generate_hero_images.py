#!/usr/bin/env python3
"""
Generate a designed hero banner (SVG) for every car in cars_data.

Why SVG instead of photos: this repo's build environment can only reach
GitHub (no Wikimedia/Pexels/manufacturer press kits), so real marketing
photos can't be fetched here. Instead we generate a clean, brand-colored
studio-style banner per car — a gradient backdrop in the marque's colour,
a body-type silhouette, the model name, and a few key stats. It's crisp
at any resolution and looks intentional rather than like a missing image.

Output: static/images/cars/<slug>.svg

These are picked up automatically by app.py's resolve_hero_url(). If you
later drop a real photo at static/images/cars/<slug>.webp (or .jpg), it
takes priority over the generated .svg — no code change needed.

Run:  python3 scripts/generate_hero_images.py
"""
from __future__ import annotations

import ast
import html
import re
from pathlib import Path

OUT_DIR = Path("static/images/cars")
APP_FILE = Path("app.py")

W, H = 1600, 600  # canvas


# ---------------------------------------------------------------------------
# Brand palette: slug-make -> (primary, deep, accent)
# Colours approximate each marque's identity. accent is used for the
# underline + body-type chip.
# ---------------------------------------------------------------------------
BRAND_COLORS = {
    "Toyota":        ("#1f2937", "#0b0f17", "#eb0a1e"),
    "Honda":         ("#1a2433", "#0a0e16", "#e40521"),
    "BMW":           ("#0d2c4d", "#06121f", "#4ea3e0"),
    "Mercedes-Benz": ("#22272b", "#0c0e10", "#9fb2c2"),
    "Hyundai":       ("#002c5f", "#001226", "#7ea4cf"),
    "Kia":           ("#1b1f24", "#0a0c0e", "#bb162b"),
    "Nissan":        ("#1c1c1c", "#0a0a0a", "#c3002f"),
    "Audi":          ("#15171a", "#070809", "#bb0a30"),
    "Lexus":         ("#1a1d21", "#08090b", "#8a8d8f"),
    "Genesis":       ("#1c1a17", "#0b0a08", "#b59410"),
    "Ford":          ("#00274e", "#001022", "#1f7ad1"),
    "Tesla":         ("#1a1d22", "#0a0b0e", "#cc0000"),
    "Porsche":       ("#1c1410", "#0c0806", "#c8a24a"),
    "Chevrolet":     ("#14171c", "#070809", "#d1a93f"),
    "Ferrari":       ("#7d0c0c", "#3a0606", "#ffd200"),
    "Lucid":         ("#1b2a4a", "#0a1322", "#9db4d8"),
    "Rivian":        ("#2b3a3a", "#121b1b", "#fedb00"),
}
DEFAULT_COLORS = ("#1f2937", "#0b0f17", "#6b7cff")


# ---------------------------------------------------------------------------
# Body-type silhouettes. Each returns SVG markup drawn in a ~1000x360 local
# space (ground line ≈ y=300). Fill uses url(#carBody) / url(#carGlass).
# Wheels are drawn as layered circles for a clean flat-illustration look.
# ---------------------------------------------------------------------------
def _wheels(positions, r=56):
    out = []
    for cx in positions:
        out.append(
            f'<circle cx="{cx}" cy="300" r="{r}" fill="rgba(0,0,0,.55)"/>'
            f'<circle cx="{cx}" cy="300" r="{r-18}" fill="rgba(255,255,255,.18)"/>'
            f'<circle cx="{cx}" cy="300" r="{int(r*0.28)}" fill="rgba(0,0,0,.5)"/>'
        )
    return "".join(out)


def sil_sedan():
    body = ('<path d="M60,300 L60,252 Q62,240 86,237 L210,232 L300,178 '
            'L470,168 L640,170 L740,232 L880,240 Q930,246 936,276 L936,300 Z" '
            'fill="url(#carBody)"/>')
    glass = ('<path d="M322,182 L470,176 L632,178 L716,228 L360,230 Z" '
             'fill="url(#carGlass)"/>')
    return _wheels((250, 760)) + body + glass


def sil_suv():
    body = ('<path d="M52,300 L52,236 Q54,221 80,219 L150,215 L214,150 '
            'L300,120 L660,118 L742,150 L824,216 L906,224 Q944,230 948,262 '
            'L948,300 Z" fill="url(#carBody)"/>')
    glass = ('<path d="M250,150 L300,128 L656,126 L724,152 L300,156 Z" '
             'fill="url(#carGlass)"/>')
    return _wheels((238, 772), r=60) + body + glass


def sil_sports():
    body = ('<path d="M40,300 L46,264 L150,246 L300,212 L470,156 L640,152 '
            'L770,206 L932,234 Q960,240 960,268 L960,300 Z" '
            'fill="url(#carBody)"/>')
    glass = ('<path d="M462,160 L520,152 L636,154 L700,200 L474,202 Z" '
             'fill="url(#carGlass)"/>')
    return _wheels((252, 772), r=58) + body + glass


def sil_pickup():
    body = ('<path d="M48,300 L48,238 L150,234 L250,162 L440,154 L590,156 '
            'L620,212 L975,214 Q990,216 990,242 L990,300 Z" '
            'fill="url(#carBody)"/>')
    glass = ('<path d="M272,166 L440,158 L575,160 L600,206 L300,208 Z" '
             'fill="url(#carGlass)"/>')
    return _wheels((252, 802), r=60) + body + glass


def sil_electric():
    # sleek fastback
    body = ('<path d="M55,300 L55,250 Q58,238 82,236 L150,232 '
            'Q262,196 360,176 Q520,150 700,168 Q832,180 906,220 '
            'Q940,232 940,272 L940,300 Z" fill="url(#carBody)"/>')
    glass = ('<path d="M342,184 Q520,162 690,180 L760,214 L372,214 Z" '
             'fill="url(#carGlass)"/>')
    return _wheels((250, 772)) + body + glass


SILHOUETTE = {
    "sedan": sil_sedan,
    "suv": sil_suv,
    "sports": sil_sports,
    "electric": sil_electric,
    "pickup": sil_pickup,
}


def silhouette_for(slug: str, ctype: str) -> str:
    # Rivian R1T is classed "electric" in data but is a pickup visually.
    if slug == "rivian-r1t":
        return SILHOUETTE["pickup"]()
    return SILHOUETTE.get(ctype, SILHOUETTE["sedan"])()


# ---------------------------------------------------------------------------
def car_slug(make: str, model: str) -> str:
    raw = f"{make}-{model}".lower()
    return raw.replace(" ", "-").replace("/", "-")


def load_cars():
    tree = ast.parse(APP_FILE.read_text())
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == "cars_data":
                    return ast.literal_eval(node.value)
    raise RuntimeError("cars_data not found in app.py")


def build_svg(car: dict) -> str:
    make = car["make"]
    model = car["model"]
    ctype = car.get("type", "sedan")
    year = car.get("year", "")
    slug = car_slug(make, model)
    primary, deep, accent = BRAND_COLORS.get(make, DEFAULT_COLORS)

    type_label = {
        "sedan": "SEDAN", "suv": "SUV",
        "sports": "SPORTS", "electric": "ELECTRIC",
    }.get(ctype, "CAR")
    if slug == "rivian-r1t":
        type_label = "ELECTRIC PICKUP"

    e = lambda s: html.escape(str(s))
    chips = []
    for label in (car.get("horsepower"), car.get("acceleration"), car.get("price")):
        if label:
            chips.append(e(label))
    chip_text = "   •   ".join(chips)

    car_group = silhouette_for(slug, ctype)

    # Adaptive model font size so long names don't run into the car art.
    n = len(model)
    model_fs = 94 if n <= 8 else 78 if n <= 12 else 64 if n <= 16 else 52

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{e(year)} {e(make)} {e(model)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{primary}"/>
      <stop offset="1" stop-color="{deep}"/>
    </linearGradient>
    <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".97"/>
      <stop offset="1" stop-color="#cfd6de" stop-opacity=".92"/>
    </linearGradient>
    <linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{accent}" stop-opacity=".45"/>
      <stop offset="1" stop-color="#0b0f17" stop-opacity=".55"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.35" r="0.8">
      <stop offset="0" stop-color="{accent}" stop-opacity=".22"/>
      <stop offset="1" stop-color="{accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>

  <!-- decorative speed stripes -->
  <g opacity="0.07" fill="#ffffff">
    <polygon points="-200,600 200,0 320,0 -80,600"/>
    <polygon points="60,600 460,0 520,0 120,600"/>
  </g>
  <circle cx="1230" cy="150" r="240" fill="#ffffff" opacity="0.04"/>

  <!-- accent ground line -->
  <rect x="0" y="520" width="{W}" height="4" fill="{accent}" opacity="0.55"/>

  <!-- car -->
  <g transform="translate(540,150) scale(1.0)">
    <ellipse cx="500" cy="372" rx="430" ry="26" fill="rgba(0,0,0,.35)"/>
    {car_group}
  </g>

  <!-- text block -->
  <text x="90" y="150" fill="{accent}" font-family="'Helvetica Neue',Arial,sans-serif"
        font-size="34" font-weight="700" letter-spacing="8">{e(make).upper()}</text>
  <text x="86" y="250" fill="#ffffff" font-family="'Helvetica Neue',Arial,sans-serif"
        font-size="{model_fs}" font-weight="800" letter-spacing="-2">{e(model)}</text>
  <rect x="92" y="276" width="120" height="6" fill="{accent}"/>
  <g transform="translate(92,318)">
    <rect x="0" y="-26" rx="6" ry="6" width="{max(120, 30 + len(type_label)*15)}" height="40"
          fill="rgba(255,255,255,.10)" stroke="{accent}" stroke-opacity=".6"/>
    <text x="18" y="1" fill="#ffffff" font-family="'Helvetica Neue',Arial,sans-serif"
          font-size="20" font-weight="700" letter-spacing="3">{type_label}</text>
  </g>
  <text x="94" y="400" fill="#ffffff" fill-opacity=".82"
        font-family="'Helvetica Neue',Arial,sans-serif" font-size="26"
        font-weight="600" letter-spacing="1">{chip_text}</text>

  <!-- watermark -->
  <text x="{W-40}" y="{H-34}" text-anchor="end" fill="#ffffff" fill-opacity=".28"
        font-family="'Helvetica Neue',Arial,sans-serif" font-size="22"
        font-weight="800" letter-spacing="4">AUTOHUB</text>
</svg>
'''


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cars = load_cars()
    written = 0
    for car in cars:
        slug = car_slug(car["make"], car["model"])
        svg = build_svg(car)
        (OUT_DIR / f"{slug}.svg").write_text(svg, encoding="utf-8")
        written += 1
        print(f"  ✔ {slug}.svg")
    print(f"\nGenerated {written} hero banners in {OUT_DIR}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
