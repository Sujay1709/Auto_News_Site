from flask import Flask, render_template, request, jsonify
import requests
import json
import re
import os
import threading
import time
import logging
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime
import uuid

# ---------------------------------------------------------------------------
# Paths & storage constants
# ---------------------------------------------------------------------------
CATALOG_PATH = Path("data/car_3d_catalog.json")
GENERATED_JOBS_PATH = Path("data/generated_jobs.json")
GENERATED_MODELS_DIR = Path("static/models/generated")
MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

# ---------------------------------------------------------------------------
# Tripo / 3D AI Studio API config
# Read TRIPO_API_KEY from environment — never hard-code secrets.
# Set it with:  export TRIPO_API_KEY="your_key_here"   (or Docker env section)
# ---------------------------------------------------------------------------
TRIPO_API_BASE = "https://api.3daistudio.com"
TRIPO_API_KEY  = os.environ.get("TRIPO_API_KEY", "")   # empty = generation disabled

# Background poller settings
POLL_INTERVAL_SECONDS = 6      # how often the background thread wakes up
POLL_MAX_ATTEMPTS     = 60     # ~6 min total before a job is marked timed-out

# Thread-safety lock for jobs list
_jobs_lock = threading.Lock()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)

API_KEY = '7120175e997a4aae8edc62c5167858bf'
NEWS_URL = f'https://newsapi.org/v2/everything?q=automobile+industry&apiKey={API_KEY}&pageSize=10'

cars_data = [
    # Sedans
    {
        'make': 'Toyota',
        'model': 'Camry',
        'year': 2024,
        'category': 'Midsize Sedan',
        'type': 'sedan',
        'engine': '2.5L 4-Cylinder',
        'horsepower': '203 hp',
        'acceleration': '7.5 sec',
        'top_speed': '135 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'FWD',
        'fuel_economy': '28/39 mpg',
        'seating': '5 passengers',
        'price': '$26,420',
        'new': False
    },
    {
        'make': 'Honda',
        'model': 'Accord',
        'year': 2024,
        'category': 'Midsize Sedan',
        'type': 'sedan',
        'engine': '1.5L Turbo 4-Cylinder',
        'horsepower': '192 hp',
        'acceleration': '7.3 sec',
        'top_speed': '132 mph',
        'transmission': 'CVT',
        'drivetrain': 'FWD',
        'fuel_economy': '30/38 mpg',
        'seating': '5 passengers',
        'price': '$27,895',
        'new': False
    },
    {
        'make': 'BMW',
        'model': '3 Series',
        'year': 2024,
        'category': 'Luxury Sedan',
        'type': 'sedan',
        'engine': '2.0L Turbo 4-Cylinder',
        'horsepower': '255 hp',
        'acceleration': '5.6 sec',
        'top_speed': '155 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'RWD/AWD',
        'fuel_economy': '26/36 mpg',
        'seating': '5 passengers',
        'price': '$43,700',
        'new': False
    },
    {
        'make': 'Mercedes-Benz',
        'model': 'C-Class',
        'year': 2024,
        'category': 'Luxury Sedan',
        'type': 'sedan',
        'engine': '1.5L Turbo + Mild Hybrid',
        'horsepower': '255 hp',
        'acceleration': '6.0 sec',
        'top_speed': '155 mph',
        'transmission': '9-Speed Automatic',
        'drivetrain': 'RWD/AWD',
        'fuel_economy': '27/37 mpg',
        'seating': '5 passengers',
        'price': '$46,750',
        'new': True
    },
    {
        'make': 'Hyundai',
        'model': 'Sonata',
        'year': 2024,
        'category': 'Midsize Sedan',
        'type': 'sedan',
        'engine': '2.5L 4-Cylinder',
        'horsepower': '191 hp',
        'acceleration': '8.0 sec',
        'top_speed': '130 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'FWD',
        'fuel_economy': '28/38 mpg',
        'seating': '5 passengers',
        'price': '$26,800',
        'new': False
    },
    {
        'make': 'Kia',
        'model': 'K5',
        'year': 2024,
        'category': 'Midsize Sedan',
        'type': 'sedan',
        'engine': '2.5L 4-Cylinder',
        'horsepower': '191 hp',
        'acceleration': '7.8 sec',
        'top_speed': '128 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'FWD',
        'fuel_economy': '29/39 mpg',
        'seating': '5 passengers',
        'price': '$27,900',
        'new': False
    },
    {
        'make': 'Nissan',
        'model': 'Altima',
        'year': 2024,
        'category': 'Midsize Sedan',
        'type': 'sedan',
        'engine': '2.5L 4-Cylinder',
        'horsepower': '188 hp',
        'acceleration': '8.0 sec',
        'top_speed': '125 mph',
        'transmission': 'CVT',
        'drivetrain': 'FWD/AWD',
        'fuel_economy': '27/39 mpg',
        'seating': '5 passengers',
        'price': '$26,300',
        'new': False
    },
    {
        'make': 'Audi',
        'model': 'A4',
        'year': 2024,
        'category': 'Luxury Sedan',
        'type': 'sedan',
        'engine': '2.0L Turbo 4-Cylinder',
        'horsepower': '261 hp',
        'acceleration': '5.6 sec',
        'top_speed': '150 mph',
        'transmission': '7-Speed Dual Clutch',
        'drivetrain': 'AWD',
        'fuel_economy': '27/35 mpg',
        'seating': '5 passengers',
        'price': '$43,500',
        'new': False
    },
    {
        'make': 'Lexus',
        'model': 'ES',
        'year': 2024,
        'category': 'Luxury Sedan',
        'type': 'sedan',
        'engine': '2.5L 4-Cylinder',
        'horsepower': '203 hp',
        'acceleration': '8.1 sec',
        'top_speed': '131 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'FWD',
        'fuel_economy': '26/36 mpg',
        'seating': '5 passengers',
        'price': '$43,100',
        'new': False
    },
    {
        'make': 'Genesis',
        'model': 'G70',
        'year': 2024,
        'category': 'Luxury Sport Sedan',
        'type': 'sedan',
        'engine': '2.5L Turbo 4-Cylinder',
        'horsepower': '300 hp',
        'acceleration': '5.1 sec',
        'top_speed': '149 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'AWD',
        'fuel_economy': '21/30 mpg',
        'seating': '5 passengers',
        'price': '$42,950',
        'new': True
    },

    # SUVs
    {
        'make': 'Toyota',
        'model': 'RAV4',
        'year': 2024,
        'category': 'Compact SUV',
        'type': 'suv',
        'engine': '2.5L 4-Cylinder',
        'horsepower': '203 hp',
        'acceleration': '8.0 sec',
        'top_speed': '125 mph',
        'transmission': '8-Speed Automatic',
        'drivetrain': 'FWD/AWD',
        'fuel_economy': '27/35 mpg',
        'seating': '5 passengers',
        'price': '$28,675',
        'new': False
    },
    {
        'make': 'Ford',
        'model': 'Explorer',
        'year': 2024,
        'category': 'Midsize SUV',
        'type': 'suv',
        'engine': '2.3L Turbo 4-Cylinder',
        'horsepower': '300 hp',
        'acceleration': '6.8 sec',
        'top_speed': '130 mph',
        'transmission': '10-Speed Automatic',
        'drivetrain': 'RWD/4WD',
        'fuel_economy': '21/28 mpg',
        'seating': '7 passengers',
        'price': '$36,860',
        'new': False
    },
    {
        'make': 'Tesla',
        'model': 'Model X',
        'year': 2024,
        'category': 'Electric Luxury SUV',
        'type': 'suv',
        'engine': 'Dual Motor Electric',
        'horsepower': '670 hp',
        'acceleration': '3.5 sec',
        'top_speed': '163 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'AWD',
        'fuel_economy': '105 MPGe',
        'seating': '7 passengers',
        'price': '$89,990',
        'new': True
    },
    {
        'make': 'Porsche',
        'model': 'Cayenne',
        'year': 2024,
        'category': 'Luxury SUV',
        'type': 'suv',
        'engine': '3.0L V6 Turbo',
        'horsepower': '335 hp',
        'acceleration': '6.0 sec',
        'top_speed': '152 mph',
        'transmission': '8-Speed Tiptronic',
        'drivetrain': 'AWD',
        'fuel_economy': '19/23 mpg',
        'seating': '5 passengers',
        'price': '$77,800',
        'new': False
    },

    # Sports Cars
    {
        'make': 'Porsche',
        'model': '911 Carrera',
        'year': 2024,
        'category': 'Sports Car',
        'type': 'sports',
        'engine': '3.0L Twin-Turbo Flat-6',
        'horsepower': '379 hp',
        'acceleration': '4.0 sec',
        'top_speed': '182 mph',
        'transmission': '8-Speed PDK',
        'drivetrain': 'RWD',
        'fuel_economy': '18/25 mpg',
        'seating': '4 passengers',
        'price': '$122,400',
        'new': False
    },
    {
        'make': 'Chevrolet',
        'model': 'Corvette C8',
        'year': 2024,
        'category': 'Sports Car',
        'type': 'sports',
        'engine': '6.2L V8',
        'horsepower': '495 hp',
        'acceleration': '2.9 sec',
        'top_speed': '194 mph',
        'transmission': '8-Speed Dual Clutch',
        'drivetrain': 'RWD',
        'fuel_economy': '16/24 mpg',
        'seating': '2 passengers',
        'price': '$67,495',
        'new': False
    },
    {
        'make': 'Ferrari',
        'model': '296 GTB',
        'year': 2024,
        'category': 'Supercar',
        'type': 'sports',
        'engine': '3.0L V6 Twin-Turbo Hybrid',
        'horsepower': '819 hp',
        'acceleration': '2.9 sec',
        'top_speed': '205 mph',
        'transmission': '8-Speed DCT',
        'drivetrain': 'RWD',
        'fuel_economy': '18/24 mpg',
        'seating': '2 passengers',
        'price': '$334,778',
        'new': True
    },
    {
        'make': 'Ford',
        'model': 'Mustang Dark Horse',
        'year': 2024,
        'category': 'Sports Car',
        'type': 'sports',
        'engine': '5.0L V8',
        'horsepower': '500 hp',
        'acceleration': '3.7 sec',
        'top_speed': '168 mph',
        'transmission': '6-Speed Manual',
        'drivetrain': 'RWD',
        'fuel_economy': '15/24 mpg',
        'seating': '4 passengers',
        'price': '$59,270',
        'new': True
    },

    # Electric Vehicles
    {
        'make': 'Tesla',
        'model': 'Model 3',
        'year': 2024,
        'category': 'Electric Sedan',
        'type': 'electric',
        'engine': 'Single Motor Electric',
        'horsepower': '271 hp',
        'acceleration': '5.8 sec',
        'top_speed': '140 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'RWD',
        'fuel_economy': '138/126 MPGe',
        'seating': '5 passengers',
        'price': '$38,990',
        'new': False
    },
    {
        'make': 'Tesla',
        'model': 'Model S Plaid',
        'year': 2024,
        'category': 'Electric Luxury Sedan',
        'type': 'electric',
        'engine': 'Tri Motor Electric',
        'horsepower': '1,020 hp',
        'acceleration': '1.99 sec',
        'top_speed': '200 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'AWD',
        'fuel_economy': '119/112 MPGe',
        'seating': '5 passengers',
        'price': '$89,990',
        'new': False
    },
    {
        'make': 'Lucid',
        'model': 'Air Pure',
        'year': 2024,
        'category': 'Electric Luxury Sedan',
        'type': 'electric',
        'engine': 'Single Motor Electric',
        'horsepower': '430 hp',
        'acceleration': '4.5 sec',
        'top_speed': '140 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'RWD',
        'fuel_economy': '131/132 MPGe',
        'seating': '5 passengers',
        'price': '$77,400',
        'new': True
    },
    {
        'make': 'Rivian',
        'model': 'R1T',
        'year': 2024,
        'category': 'Electric Pickup',
        'type': 'electric',
        'engine': 'Quad Motor Electric',
        'horsepower': '835 hp',
        'acceleration': '3.0 sec',
        'top_speed': '115 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'AWD',
        'fuel_economy': '74/66 MPGe',
        'seating': '5 passengers',
        'price': '$73,000',
        'new': False
    },
    {
        'make': 'Hyundai',
        'model': 'Ioniq 6',
        'year': 2024,
        'category': 'Electric Sedan',
        'type': 'electric',
        'engine': 'Single Motor Electric',
        'horsepower': '225 hp',
        'acceleration': '7.4 sec',
        'top_speed': '115 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'RWD',
        'fuel_economy': '140/127 MPGe',
        'seating': '5 passengers',
        'price': '$42,650',
        'new': True
    },
    {
        'make': 'BMW',
        'model': 'i7',
        'year': 2024,
        'category': 'Electric Luxury Sedan',
        'type': 'electric',
        'engine': 'Dual Motor Electric',
        'horsepower': '536 hp',
        'acceleration': '4.5 sec',
        'top_speed': '149 mph',
        'transmission': 'Single Speed',
        'drivetrain': 'AWD',
        'fuel_economy': '87/95 MPGe',
        'seating': '5 passengers',
        'price': '$105,700',
        'new': False
    }
]


def normalize_token(value: str) -> str:
    if value is None:
        return "default"
    text = str(value).strip().lower()
    text = text.replace("-", " ")
    text = re.sub(r"\s+", " ", text)

    aliases = {
        "rav 4": "rav4",
        "x l e": "xle"
    }
    return aliases.get(text, text) if text else "default"


def load_3d_catalog():
    with CATALOG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def normalize_catalog_entry(entry):
    if isinstance(entry, str):
        return {
            "url": entry,
            "display_name": "3D vehicle model",
            "license": "Unknown",
            "is_placeholder": False,
            "requires_local_asset": False,
        }

    return {
        "url": entry.get("url"),
        "display_name": entry.get("display_name", "3D vehicle model"),
        "license": entry.get("license", "Unknown"),
        "is_placeholder": bool(entry.get("is_placeholder", False)),
        "requires_local_asset": bool(entry.get("requires_local_asset", False)),
    }


def static_asset_exists(model_url):
    if not model_url or not model_url.startswith("/static/"):
        return bool(model_url)

    static_relative_path = model_url.removeprefix("/static/").lstrip("/")
    return (Path(app.static_folder) / static_relative_path).exists()


def build_key(make, model, year, trim):
    make_n = normalize_token(make)
    model_n = normalize_token(model)
    year_n = str(year).strip() if year else "default"
    trim_n = normalize_token(trim)
    return f"{make_n}|{model_n}|{year_n}|{trim_n}"


def resolve_3d_model(catalog, make, model, year=None, trim=None):
    make_n = normalize_token(make)
    model_n = normalize_token(model)
    year_n = str(year).strip() if year else "default"
    trim_n = normalize_token(trim)

    candidates = [
        (f"{make_n}|{model_n}|{year_n}|{trim_n}", "exact"),
        (f"{make_n}|{model_n}|{year_n}|default", "year_default"),
        (f"{make_n}|{model_n}|default|default", "model_default")
    ]

    for key, source in candidates:
        if key in catalog:
            entry = normalize_catalog_entry(catalog[key])
            model_available = static_asset_exists(entry["url"])

            if entry["requires_local_asset"] and not model_available:
                entry["missing_asset_path"] = entry["url"]
                entry["url"] = None

            entry["model_available"] = model_available
            return entry, source, key

    fallback = normalize_catalog_entry(catalog.get("__global_fallback__", "/static/models/common/car_fallback.glb"))
    fallback["model_available"] = static_asset_exists(fallback["url"])
    return fallback, "global_fallback", "__global_fallback__"


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/news')
def news():
    try:
        response = requests.get(NEWS_URL, timeout=10)
        data = response.json()
        articles = data.get('articles', [])
    except Exception:
        articles = []
    return render_template('news.html', articles=articles)


@app.route('/info')
def info():
    return render_template('info.html')


def _car_slug(car):
    raw = f"{car['make']}-{car['model']}".lower()
    return raw.replace(' ', '-').replace('/', '-')


@app.route('/cars')
def cars():
    car_type = request.args.get('type')
    selected_slug_qs = request.args.get('slug')
    # Also support selecting via make+model for convenience
    selected_make = request.args.get('make')
    selected_model = request.args.get('model')

    if car_type:
        source = [car for car in cars_data if car['type'] == car_type]
    else:
        source = cars_data

    catalog = load_3d_catalog()
    enriched_cars = []

    for car in source:
        model_entry, model_3d_source, matched_key = resolve_3d_model(
            catalog=catalog,
            make=car.get('make'),
            model=car.get('model'),
            year=car.get('year'),
            trim=car.get('trim', 'default')
        )

        enriched_cars.append({
            **car,
            'slug': _car_slug(car),
            'model_3d_url': model_entry["url"],
            'model_3d_source': model_3d_source,
            'matched_catalog_key': matched_key,
            'model_3d_available': model_entry["model_available"],
            'model_display_name': model_entry["display_name"],
            'model_license': model_entry["license"],
            'model_is_placeholder': model_entry["is_placeholder"],
            'missing_asset_path': model_entry.get("missing_asset_path"),
        })

    # Resolve selected slug from querystring
    selected_slug = None
    if selected_slug_qs:
        selected_slug = selected_slug_qs.strip().lower()
    elif selected_make and selected_model:
        selected_slug = _car_slug({'make': selected_make, 'model': selected_model})

    selected_car = None
    if selected_slug:
        selected_car = next((car for car in enriched_cars if car['slug'] == selected_slug), None)
    if selected_car is None and enriched_cars:
        selected_car = enriched_cars[0]

    default_model_url = '/static/models/carconcept/CarConcept.gltf'
    return render_template(
        'cars.html',
        cars=enriched_cars,
        model_url=default_model_url,
        selected_slug=selected_slug,
        selected_car=selected_car
    )


@app.route('/api/car-details')
def car_details():
    make = request.args.get('make')
    model = request.args.get('model')
    year = request.args.get('year')
    trim = request.args.get('trim')

    catalog = load_3d_catalog()
    model_entry, model_3d_source, matched_key = resolve_3d_model(
        catalog=catalog,
        make=make,
        model=model,
        year=year,
        trim=trim
    )

    response = {
        "make": make,
        "model": model,
        "year": year,
        "trim": trim,
        "model_3d_url": model_entry["url"],
        "model_3d_source": model_3d_source,
        "matched_catalog_key": matched_key,
        "model_3d_available": model_entry["model_available"],
        "model_display_name": model_entry["display_name"],
        "model_license": model_entry["license"],
        "model_is_placeholder": model_entry["is_placeholder"],
        "missing_asset_path": model_entry.get("missing_asset_path"),
    }
    return jsonify(response)
# ===========================================================================
# Storage helpers
# ===========================================================================

def ensure_generation_storage():
    GENERATED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_JOBS_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not GENERATED_JOBS_PATH.exists():
        GENERATED_JOBS_PATH.write_text("[]", encoding="utf-8")


def load_generated_jobs():
    ensure_generation_storage()
    try:
        return json.loads(GENERATED_JOBS_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_generated_jobs(jobs):
    ensure_generation_storage()
    GENERATED_JOBS_PATH.write_text(json.dumps(jobs, indent=2), encoding="utf-8")


def _find_and_update_job(job_id: str, updates: dict):
    """Thread-safe in-place update of a single job record."""
    with _jobs_lock:
        jobs = load_generated_jobs()
        for job in jobs:
            if job.get("job_id") == job_id:
                job.update(updates)
                break
        save_generated_jobs(jobs)


# ===========================================================================
# URL / image validation helpers (kept from original patch)
# ===========================================================================

def is_valid_http_url(value: str) -> bool:
    if not value:
        return False
    try:
        parsed = urlparse(value)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    except Exception:
        return False


def inspect_remote_image(image_url: str):
    """Validate a remote image URL. Returns (ok, message, metadata)."""
    if not is_valid_http_url(image_url):
        return False, "Invalid URL. Use a full http/https image URL.", {}
    try:
        resp = requests.get(image_url, stream=True, timeout=12,
                            headers={"User-Agent": "AutoHub/1.0 (+image-validator)"})
    except Exception:
        return False, "Unable to reach image URL.", {}
    if resp.status_code != 200:
        return False, f"Image URL returned status {resp.status_code}.", {}
    ct = (resp.headers.get("Content-Type") or "").split(";")[0].strip().lower()
    if ct not in ALLOWED_IMAGE_TYPES:
        return False, f"Unsupported content type: {ct or 'unknown'}.", {}
    size = None
    raw_len = resp.headers.get("Content-Length")
    if raw_len and raw_len.isdigit():
        size = int(raw_len)
        if size > MAX_IMAGE_BYTES:
            return False, f"Image too large (>{MAX_IMAGE_BYTES // (1024*1024)} MB).", {}
    if size is None:
        total = 0
        for chunk in resp.iter_content(chunk_size=8192):
            total += len(chunk or b"")
            if total > MAX_IMAGE_BYTES:
                return False, f"Image too large (>{MAX_IMAGE_BYTES // (1024*1024)} MB).", {}
        size = total
    return True, "Image URL validated.", {"content_type": ct, "size_bytes": size}


# ===========================================================================
# Tripo AI — prompt builder
# ===========================================================================

def build_car_prompt(car: dict) -> str:
    """
    Turn a car spec dict into a rich, descriptive text prompt for Tripo.
    The more specific the prompt, the better the geometry and textures.
    """
    make       = car.get("make", "")
    model      = car.get("model", "")
    year       = car.get("year", "")
    category   = car.get("category", "")
    car_type   = car.get("type", "car")

    # Map category/type to visual style hints
    style_map = {
        "sedan":   "sleek sedan body, four doors, low profile",
        "suv":     "tall SUV body, four doors, high ground clearance, boxy roof",
        "sports":  "low-slung sports car, wide stance, aerodynamic body kit",
        "electric": "futuristic electric vehicle, smooth aerodynamic panels",
    }
    style = style_map.get(car_type, "modern automobile")

    prompt = (
        f"{year} {make} {model} {category}, "
        f"{style}, "
        f"photorealistic exterior 3D model, "
        f"premium metallic paint, realistic materials, "
        f"studio lighting, clean white background, "
        f"high detail wheels and tyres, "
        f"accurate proportions, production-ready mesh"
    )
    return prompt[:1024]  # Tripo max prompt length


# ===========================================================================
# Tripo AI — API calls
# ===========================================================================

def _tripo_headers() -> dict:
    return {
        "Authorization": f"Bearer {TRIPO_API_KEY}",
        "Content-Type": "application/json",
    }


def tripo_submit_text_to_3d(prompt: str) -> tuple[bool, str, str]:
    """
    Submit a text-to-3D job to Tripo v3.1.
    Returns: (ok: bool, task_id_or_error: str, raw_response: str)
    """
    if not TRIPO_API_KEY:
        return False, "TRIPO_API_KEY not configured.", ""

    payload = {
        "prompt": prompt,
        "texture": True,
        "pbr": True,
        "texture_quality": "standard",   # 20 credits surcharge — use "detailed" for premium
        "geometry_quality": "standard",
    }
    try:
        resp = requests.post(
            f"{TRIPO_API_BASE}/v1/3d-models/tripo/text-to-3d/3.1/",
            headers=_tripo_headers(),
            json=payload,
            timeout=30,
        )
        body = resp.json()
    except Exception as exc:
        return False, f"Network error: {exc}", ""

    if resp.status_code == 402:
        return False, "Insufficient Tripo credits — top up at 3daistudio.com.", str(body)
    if resp.status_code == 401:
        return False, "Invalid TRIPO_API_KEY.", str(body)
    if resp.status_code != 200:
        msg = body.get("detail") or body.get("message") or f"HTTP {resp.status_code}"
        return False, msg, str(body)

    task_id = body.get("task_id")
    if not task_id:
        return False, "No task_id in Tripo response.", str(body)

    return True, task_id, str(body)


def tripo_poll_status(task_id: str) -> tuple[str, str | None]:
    """
    Poll a Tripo job.
    Returns: (status: str, glb_url_or_None: str|None)
    Possible statuses: PENDING, PROCESSING, FINISHED, FAILED, UNKNOWN
    """
    try:
        resp = requests.get(
            f"{TRIPO_API_BASE}/v1/generation-request/{task_id}/status/",
            headers=_tripo_headers(),
            timeout=20,
        )
        if resp.status_code != 200:
            return "UNKNOWN", None
        body = resp.json()
    except Exception:
        return "UNKNOWN", None

    status = body.get("status", "UNKNOWN").upper()
    glb_url = None

    if status == "FINISHED":
        results = body.get("results", [])
        for r in results:
            if r.get("asset_type") == "3D_MODEL":
                glb_url = r.get("asset")
                break

    return status, glb_url


def tripo_download_glb(glb_url: str, job_id: str) -> str | None:
    """
    Download a GLB from Tripo storage and save it locally.
    Returns the local static path (e.g. /static/models/generated/<job_id>.glb)
    or None on failure.
    """
    try:
        resp = requests.get(glb_url, timeout=120, stream=True)
        if resp.status_code != 200:
            return None
        dest = GENERATED_MODELS_DIR / f"{job_id}.glb"
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as fh:
            for chunk in resp.iter_content(chunk_size=65536):
                if chunk:
                    fh.write(chunk)
        return f"/static/models/generated/{job_id}.glb"
    except Exception as exc:
        log.error("GLB download failed for job %s: %s", job_id, exc)
        return None


def catalog_upsert_model(make: str, model: str, year, local_url: str, display_name: str):
    """
    Write or overwrite a car's entry in car_3d_catalog.json so the /cars
    viewer picks it up immediately after generation completes.
    """
    try:
        if CATALOG_PATH.exists():
            catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
        else:
            catalog = {}

        key = f"{normalize_token(make)}|{normalize_token(model)}|{str(year).strip()}|default"
        catalog[key] = {
            "url": local_url,
            "display_name": display_name,
            "license": "AI-Generated via Tripo",
            "is_placeholder": False,
            "requires_local_asset": True,
        }
        CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        CATALOG_PATH.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
        log.info("Catalog updated: %s → %s", key, local_url)
    except Exception as exc:
        log.error("catalog_upsert_model failed: %s", exc)


# ===========================================================================
# Background polling thread
# ===========================================================================

def _poll_pending_jobs():
    """
    Daemon thread: wakes every POLL_INTERVAL_SECONDS and advances any
    PENDING / PROCESSING jobs through to completion or failure.
    """
    log.info("Tripo background poller started (interval=%ds).", POLL_INTERVAL_SECONDS)
    while True:
        time.sleep(POLL_INTERVAL_SECONDS)
        try:
            with _jobs_lock:
                jobs = load_generated_jobs()

            active = [j for j in jobs if j.get("status") in ("queued", "processing")]
            if not active:
                continue

            for job in active:
                job_id   = job["job_id"]
                task_id  = job.get("tripo_task_id")
                attempts = job.get("poll_attempts", 0)

                if not task_id:
                    _find_and_update_job(job_id, {"status": "failed",
                                                   "error": "No tripo_task_id recorded."})
                    continue

                if attempts >= POLL_MAX_ATTEMPTS:
                    _find_and_update_job(job_id, {"status": "failed",
                                                   "error": "Timed out after max poll attempts."})
                    log.warning("Job %s timed out.", job_id)
                    continue

                status, glb_url = tripo_poll_status(task_id)
                _find_and_update_job(job_id, {
                    "status": status.lower() if status not in ("FINISHED", "FAILED") else job.get("status"),
                    "poll_attempts": attempts + 1,
                    "last_polled_at": datetime.utcnow().isoformat(),
                })

                if status == "FINISHED" and glb_url:
                    log.info("Job %s finished, downloading GLB…", job_id)
                    local_url = tripo_download_glb(glb_url, job_id)
                    if local_url:
                        catalog_upsert_model(
                            make=job.get("make", ""),
                            model=job.get("model_name", ""),
                            year=job.get("year"),
                            local_url=local_url,
                            display_name=job.get("car_label", "AI-generated model"),
                        )
                        _find_and_update_job(job_id, {
                            "status": "completed",
                            "model_url": local_url,
                            "glb_remote_url": glb_url,
                            "completed_at": datetime.utcnow().isoformat(),
                        })
                        log.info("Job %s → %s", job_id, local_url)
                    else:
                        _find_and_update_job(job_id, {"status": "failed",
                                                       "error": "GLB download failed."})

                elif status == "FAILED":
                    _find_and_update_job(job_id, {"status": "failed",
                                                   "error": "Tripo generation failed."})
                    log.warning("Job %s reported FAILED by Tripo.", job_id)

        except Exception as exc:
            log.error("Poller error: %s", exc)


# Start the daemon thread once at import time
_poller_thread = threading.Thread(target=_poll_pending_jobs, daemon=True, name="tripo-poller")
_poller_thread.start()


# ===========================================================================
# Studio page route
# ===========================================================================

@app.route('/studio')
def studio():
    jobs = load_generated_jobs()
    jobs = sorted(jobs, key=lambda x: x.get("created_at", ""), reverse=True)
    api_configured = bool(TRIPO_API_KEY)
    return render_template('studio.html', jobs=jobs, api_configured=api_configured,
                           cars=cars_data)


# ===========================================================================
# API — validate remote image URL
# ===========================================================================

@app.route('/api/import-image', methods=['POST'])
def api_import_image():
    data = request.get_json(silent=True) or {}
    image_url = (data.get("image_url") or "").strip()
    ok, message, metadata = inspect_remote_image(image_url)
    status_code = 200 if ok else 400
    return jsonify({"ok": ok, "message": message,
                    "image_url": image_url, "metadata": metadata}), status_code


# ===========================================================================
# API — submit a 3D generation job
# ===========================================================================

@app.route('/api/generate-3d', methods=['POST'])
def api_generate_3d():
    """
    Submit a text-to-3D generation job for a car.

    Body (JSON):
      car_slug   – slug matching a car in cars_data (preferred)
      OR
      make, model_name, year, category, type  – manual fields

    Optional:
      image_url  – if provided, adds image reference hint to the prompt
                   (image-to-3D upgrade path — currently blends into text prompt)
    """
    if not TRIPO_API_KEY:
        return jsonify({"ok": False,
                        "message": "TRIPO_API_KEY is not configured on this server. "
                                   "Set the environment variable and restart."}), 503

    data = request.get_json(silent=True) or {}

    # ── Resolve car from slug or manual fields ──────────────────────────────
    slug = (data.get("car_slug") or "").strip().lower()
    car_rec = next((c for c in cars_data if _car_slug(c) == slug), None)

    if car_rec:
        make        = car_rec["make"]
        model_name  = car_rec["model"]
        year        = car_rec.get("year", "")
        category    = car_rec.get("category", "")
        car_type    = car_rec.get("type", "car")
        car_label   = f"{year} {make} {model_name}"
    else:
        make        = (data.get("make") or "").strip()
        model_name  = (data.get("model_name") or "").strip()
        year        = data.get("year", "")
        category    = (data.get("category") or "").strip()
        car_type    = (data.get("type") or "car").strip()
        car_label   = (data.get("car_label") or f"{year} {make} {model_name}").strip()
        car_rec     = {"make": make, "model": model_name, "year": year,
                       "category": category, "type": car_type}

    if not make or not model_name:
        return jsonify({"ok": False, "message": "car_slug or make+model_name required."}), 400

    # ── Build prompt ────────────────────────────────────────────────────────
    prompt = build_car_prompt(car_rec)
    log.info("Submitting job for '%s' | prompt: %s", car_label, prompt[:80])

    # ── Call Tripo ──────────────────────────────────────────────────────────
    ok, task_id_or_err, raw = tripo_submit_text_to_3d(prompt)
    if not ok:
        return jsonify({"ok": False, "message": task_id_or_err}), 502

    # ── Persist job record ──────────────────────────────────────────────────
    job_id = str(uuid.uuid4())
    job = {
        "job_id":         job_id,
        "tripo_task_id":  task_id_or_err,
        "car_label":      car_label,
        "car_slug":       slug or _car_slug({"make": make, "model": model_name}),
        "make":           make,
        "model_name":     model_name,
        "year":           year,
        "category":       category,
        "type":           car_type,
        "prompt":         prompt,
        "status":         "queued",
        "model_url":      None,
        "poll_attempts":  0,
        "created_at":     datetime.utcnow().isoformat(),
        "completed_at":   None,
        "error":          None,
    }

    with _jobs_lock:
        jobs = load_generated_jobs()
        jobs.append(job)
        save_generated_jobs(jobs)

    return jsonify({
        "ok":          True,
        "message":     "Generation job submitted to Tripo.",
        "job_id":      job_id,
        "tripo_task_id": task_id_or_err,
        "car_label":   car_label,
        "prompt":      prompt,
        "status":      "queued",
    }), 202


# ===========================================================================
# API — job status (frontend polls this for live updates)
# ===========================================================================

@app.route('/api/job-status/<job_id>')
def api_job_status(job_id: str):
    jobs = load_generated_jobs()
    job  = next((j for j in jobs if j.get("job_id") == job_id), None)
    if not job:
        return jsonify({"ok": False, "message": "Job not found."}), 404
    return jsonify({"ok": True, "job": job})


# ===========================================================================
# API — list all jobs (studio dashboard)
# ===========================================================================

@app.route('/api/jobs')
def api_jobs():
    jobs = load_generated_jobs()
    jobs = sorted(jobs, key=lambda x: x.get("created_at", ""), reverse=True)
    return jsonify({"ok": True, "jobs": jobs, "total": len(jobs)})


# ===========================================================================
# Run
# ===========================================================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
