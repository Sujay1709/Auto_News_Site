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
# Config
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)
# Prefer NEWS_API_KEY from the environment; fall back to the bundled demo key for local runs.
API_KEY = os.environ.get('NEWS_API_KEY', '7120175e997a4aae8edc62c5167858bf')
NEWS_URL = f'https://newsapi.org/v2/everything?q=automobile+industry&apiKey={API_KEY}&pageSize=10'

cars_data = [
    {'make': 'Toyota', 'model': 'Camry', 'year': 2024, 'category': 'Midsize Sedan', 'type': 'sedan', 'engine': '2.5L 4-Cylinder', 'horsepower': '203 hp', 'acceleration': '7.5 sec', 'top_speed': '135 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'FWD', 'fuel_economy': '28/39 mpg', 'seating': '5 passengers', 'price': '$26,420', 'new': False},
    {'make': 'Honda', 'model': 'Accord', 'year': 2024, 'category': 'Midsize Sedan', 'type': 'sedan', 'engine': '1.5L Turbo 4-Cylinder', 'horsepower': '192 hp', 'acceleration': '7.3 sec', 'top_speed': '132 mph', 'transmission': 'CVT', 'drivetrain': 'FWD', 'fuel_economy': '30/38 mpg', 'seating': '5 passengers', 'price': '$27,895', 'new': False},
    {'make': 'BMW', 'model': '3 Series', 'year': 2024, 'category': 'Luxury Sedan', 'type': 'sedan', 'engine': '2.0L Turbo 4-Cylinder', 'horsepower': '255 hp', 'acceleration': '5.6 sec', 'top_speed': '155 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'RWD/AWD', 'fuel_economy': '26/36 mpg', 'seating': '5 passengers', 'price': '$43,700', 'new': False},
    {'make': 'Mercedes-Benz', 'model': 'C-Class', 'year': 2024, 'category': 'Luxury Sedan', 'type': 'sedan', 'engine': '1.5L Turbo + Mild Hybrid', 'horsepower': '255 hp', 'acceleration': '6.0 sec', 'top_speed': '155 mph', 'transmission': '9-Speed Automatic', 'drivetrain': 'RWD/AWD', 'fuel_economy': '27/37 mpg', 'seating': '5 passengers', 'price': '$46,750', 'new': True},
    {'make': 'Hyundai', 'model': 'Sonata', 'year': 2024, 'category': 'Midsize Sedan', 'type': 'sedan', 'engine': '2.5L 4-Cylinder', 'horsepower': '191 hp', 'acceleration': '8.0 sec', 'top_speed': '130 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'FWD', 'fuel_economy': '28/38 mpg', 'seating': '5 passengers', 'price': '$26,800', 'new': False},
    {'make': 'Kia', 'model': 'K5', 'year': 2024, 'category': 'Midsize Sedan', 'type': 'sedan', 'engine': '2.5L 4-Cylinder', 'horsepower': '191 hp', 'acceleration': '7.8 sec', 'top_speed': '128 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'FWD', 'fuel_economy': '29/39 mpg', 'seating': '5 passengers', 'price': '$27,900', 'new': False},
    {'make': 'Nissan', 'model': 'Altima', 'year': 2024, 'category': 'Midsize Sedan', 'type': 'sedan', 'engine': '2.5L 4-Cylinder', 'horsepower': '188 hp', 'acceleration': '8.0 sec', 'top_speed': '125 mph', 'transmission': 'CVT', 'drivetrain': 'FWD/AWD', 'fuel_economy': '27/39 mpg', 'seating': '5 passengers', 'price': '$26,300', 'new': False},
    {'make': 'Audi', 'model': 'A4', 'year': 2024, 'category': 'Luxury Sedan', 'type': 'sedan', 'engine': '2.0L Turbo 4-Cylinder', 'horsepower': '261 hp', 'acceleration': '5.6 sec', 'top_speed': '150 mph', 'transmission': '7-Speed Dual Clutch', 'drivetrain': 'AWD', 'fuel_economy': '27/35 mpg', 'seating': '5 passengers', 'price': '$43,500', 'new': False},
    {'make': 'Lexus', 'model': 'ES', 'year': 2024, 'category': 'Luxury Sedan', 'type': 'sedan', 'engine': '2.5L 4-Cylinder', 'horsepower': '203 hp', 'acceleration': '8.1 sec', 'top_speed': '131 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'FWD', 'fuel_economy': '26/36 mpg', 'seating': '5 passengers', 'price': '$43,100', 'new': False},
    {'make': 'Genesis', 'model': 'G70', 'year': 2024, 'category': 'Luxury Sport Sedan', 'type': 'sedan', 'engine': '2.5L Turbo 4-Cylinder', 'horsepower': '300 hp', 'acceleration': '5.1 sec', 'top_speed': '149 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'AWD', 'fuel_economy': '21/30 mpg', 'seating': '5 passengers', 'price': '$42,950', 'new': True},
    {'make': 'Toyota', 'model': 'RAV4', 'year': 2024, 'category': 'Compact SUV', 'type': 'suv', 'engine': '2.5L 4-Cylinder', 'horsepower': '203 hp', 'acceleration': '8.0 sec', 'top_speed': '125 mph', 'transmission': '8-Speed Automatic', 'drivetrain': 'FWD/AWD', 'fuel_economy': '27/35 mpg', 'seating': '5 passengers', 'price': '$28,675', 'new': False},
    {'make': 'Ford', 'model': 'Explorer', 'year': 2024, 'category': 'Midsize SUV', 'type': 'suv', 'engine': '2.3L Turbo 4-Cylinder', 'horsepower': '300 hp', 'acceleration': '6.8 sec', 'top_speed': '130 mph', 'transmission': '10-Speed Automatic', 'drivetrain': 'RWD/4WD', 'fuel_economy': '21/28 mpg', 'seating': '7 passengers', 'price': '$36,860', 'new': False},
    {'make': 'Tesla', 'model': 'Model X', 'year': 2024, 'category': 'Electric Luxury SUV', 'type': 'suv', 'engine': 'Dual Motor Electric', 'horsepower': '670 hp', 'acceleration': '3.5 sec', 'top_speed': '163 mph', 'transmission': 'Single Speed', 'drivetrain': 'AWD', 'fuel_economy': '105 MPGe', 'seating': '7 passengers', 'price': '$89,990', 'new': True},
    {'make': 'Porsche', 'model': 'Cayenne', 'year': 2024, 'category': 'Luxury SUV', 'type': 'suv', 'engine': '3.0L V6 Turbo', 'horsepower': '335 hp', 'acceleration': '6.0 sec', 'top_speed': '152 mph', 'transmission': '8-Speed Tiptronic', 'drivetrain': 'AWD', 'fuel_economy': '19/23 mpg', 'seating': '5 passengers', 'price': '$77,800', 'new': False},
    {'make': 'Porsche', 'model': '911 Carrera', 'year': 2024, 'category': 'Sports Car', 'type': 'sports', 'engine': '3.0L Twin-Turbo Flat-6', 'horsepower': '379 hp', 'acceleration': '4.0 sec', 'top_speed': '182 mph', 'transmission': '8-Speed PDK', 'drivetrain': 'RWD', 'fuel_economy': '18/25 mpg', 'seating': '4 passengers', 'price': '$122,400', 'new': False},
    {'make': 'Chevrolet', 'model': 'Corvette C8', 'year': 2024, 'category': 'Sports Car', 'type': 'sports', 'engine': '6.2L V8', 'horsepower': '495 hp', 'acceleration': '2.9 sec', 'top_speed': '194 mph', 'transmission': '8-Speed Dual Clutch', 'drivetrain': 'RWD', 'fuel_economy': '16/24 mpg', 'seating': '2 passengers', 'price': '$67,495', 'new': False},
    {'make': 'Ferrari', 'model': '296 GTB', 'year': 2024, 'category': 'Supercar', 'type': 'sports', 'engine': '3.0L V6 Twin-Turbo Hybrid', 'horsepower': '819 hp', 'acceleration': '2.9 sec', 'top_speed': '205 mph', 'transmission': '8-Speed DCT', 'drivetrain': 'RWD', 'fuel_economy': '18/24 mpg', 'seating': '2 passengers', 'price': '$334,778', 'new': True},
    {'make': 'Ford', 'model': 'Mustang Dark Horse', 'year': 2024, 'category': 'Sports Car', 'type': 'sports', 'engine': '5.0L V8', 'horsepower': '500 hp', 'acceleration': '3.7 sec', 'top_speed': '168 mph', 'transmission': '6-Speed Manual', 'drivetrain': 'RWD', 'fuel_economy': '15/24 mpg', 'seating': '4 passengers', 'price': '$59,270', 'new': True},
    {'make': 'Tesla', 'model': 'Model 3', 'year': 2024, 'category': 'Electric Sedan', 'type': 'electric', 'engine': 'Single Motor Electric', 'horsepower': '271 hp', 'acceleration': '5.8 sec', 'top_speed': '140 mph', 'transmission': 'Single Speed', 'drivetrain': 'RWD', 'fuel_economy': '138/126 MPGe', 'seating': '5 passengers', 'price': '$38,990', 'new': False},
    {'make': 'Tesla', 'model': 'Model S Plaid', 'year': 2024, 'category': 'Electric Luxury Sedan', 'type': 'electric', 'engine': 'Tri Motor Electric', 'horsepower': '1,020 hp', 'acceleration': '1.99 sec', 'top_speed': '200 mph', 'transmission': 'Single Speed', 'drivetrain': 'AWD', 'fuel_economy': '119/112 MPGe', 'seating': '5 passengers', 'price': '$89,990', 'new': False},
    {'make': 'Lucid', 'model': 'Air Pure', 'year': 2024, 'category': 'Electric Luxury Sedan', 'type': 'electric', 'engine': 'Single Motor Electric', 'horsepower': '430 hp', 'acceleration': '4.5 sec', 'top_speed': '140 mph', 'transmission': 'Single Speed', 'drivetrain': 'RWD', 'fuel_economy': '131/132 MPGe', 'seating': '5 passengers', 'price': '$77,400', 'new': True},
    {'make': 'Rivian', 'model': 'R1T', 'year': 2024, 'category': 'Electric Pickup', 'type': 'electric', 'engine': 'Quad Motor Electric', 'horsepower': '835 hp', 'acceleration': '3.0 sec', 'top_speed': '115 mph', 'transmission': 'Single Speed', 'drivetrain': 'AWD', 'fuel_economy': '74/66 MPGe', 'seating': '5 passengers', 'price': '$73,000', 'new': False},
    {'make': 'Hyundai', 'model': 'Ioniq 6', 'year': 2024, 'category': 'Electric Sedan', 'type': 'electric', 'engine': 'Single Motor Electric', 'horsepower': '225 hp', 'acceleration': '7.4 sec', 'top_speed': '115 mph', 'transmission': 'Single Speed', 'drivetrain': 'RWD', 'fuel_economy': '140/127 MPGe', 'seating': '5 passengers', 'price': '$42,650', 'new': True},
    {'make': 'BMW', 'model': 'i7', 'year': 2024, 'category': 'Electric Luxury Sedan', 'type': 'electric', 'engine': 'Dual Motor Electric', 'horsepower': '536 hp', 'acceleration': '4.5 sec', 'top_speed': '149 mph', 'transmission': 'Single Speed', 'drivetrain': 'AWD', 'fuel_economy': '87/95 MPGe', 'seating': '5 passengers', 'price': '$105,700', 'new': False}
]

def load_cars_details() -> dict:
    try:
        path = Path("data/cars_details.json")
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        log.warning("cars_details load failed: %s", exc)
    return {}

def _car_slug(car):
    raw = f"{car['make']}-{car['model']}".lower()
    return raw.replace(' ', '-').replace('/', '-')

def get_car_image_url(slug):
    """
    Checks local directories for provided high-res images.
    Falls back to specific Wikimedia images for each car model to ensure the gallery is always populated.
    """
    search_dirs = ['images/cars', 'images/source']
    extensions = ['.webp', '.jpg', '.jpeg', '.png']
    
    for d in search_dirs:
        for ext in extensions:
            file_path = os.path.join(app.root_path, 'static', d, f"{slug}{ext}")
            if os.path.exists(file_path):
                return f"/static/{d}/{slug}{ext}"
                
    # High-quality fallback images for every car in the database.
    # Live Wikimedia Commons URLs re-resolved via the Wikipedia REST API at 1280px.
    FALLBACK_IMAGES = {
        'toyota-camry': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/1280px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg',
        'honda-accord': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg/1280px-2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg',
        'bmw-3-series': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_G20_%282022%29_IMG_7316_%282%29.jpg/1280px-BMW_G20_%282022%29_IMG_7316_%282%29.jpg',
        'mercedes-benz-c-class': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mercedes-Benz_W206_IMG_6380.jpg/1280px-Mercedes-Benz_W206_IMG_6380.jpg',
        'hyundai-sonata': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2024_Hyundai_Sonata_SEL%2C_front_right.jpg/1280px-2024_Hyundai_Sonata_SEL%2C_front_right.jpg',
        'kia-k5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/2022_Kia_K5_GT-Line_in_Pacific_Blue%2C_Front_Left%2C_09-05-2022.jpg/1280px-2022_Kia_K5_GT-Line_in_Pacific_Blue%2C_Front_Left%2C_09-05-2022.jpg',
        'nissan-altima': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/2024_Nissan_Altima_SR%2C_front_left%2C_05-05-2025.jpg/1280px-2024_Nissan_Altima_SR%2C_front_left%2C_05-05-2025.jpg',
        'audi-a4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg/1280px-Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg',
        'lexus-es': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Lexus_ES_350_%28GSZ10%29_IMG_4332.jpg/1280px-Lexus_ES_350_%28GSZ10%29_IMG_4332.jpg',
        'genesis-g70': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/2022_Genesis_G70_2.0T_Prestige%2C_front_left%2C_09-09-2023.jpg/1280px-2022_Genesis_G70_2.0T_Prestige%2C_front_left%2C_09-09-2023.jpg',
        'toyota-rav4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Toyota_RAV4_XLE_%28facelift%29_%28front%29.jpg/1280px-Toyota_RAV4_XLE_%28facelift%29_%28front%29.jpg',
        'ford-explorer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Ford_Explorer_%28sixth_generation%29_IMG_6063.jpg/1280px-Ford_Explorer_%28sixth_generation%29_IMG_6063.jpg',
        'tesla-model-x': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2017_Tesla_Model_X_100D_Front.jpg/1280px-2017_Tesla_Model_X_100D_Front.jpg',
        'porsche-cayenne': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Porsche_Cayenne_%28III%2C_Facelift%29_%E2%80%93_f_01012025.jpg/1280px-Porsche_Cayenne_%28III%2C_Facelift%29_%E2%80%93_f_01012025.jpg',
        'porsche-911-carrera': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg/1280px-Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg',
        'chevrolet-corvette-c8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Chevrolet_Corvette_C8_IAA_2021_1X7A0156.jpg/1280px-Chevrolet_Corvette_C8_IAA_2021_1X7A0156.jpg',
        'ferrari-296-gtb': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/2022_Ferrari_296_%28cropped%29.jpg/1280px-2022_Ferrari_296_%28cropped%29.jpg',
        'ford-mustang-dark-horse': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2024_Ford_Mustang_GT_Premium_convertible%2C_front_left%2C_09-28-2024.jpg/1280px-2024_Ford_Mustang_GT_Premium_convertible%2C_front_left%2C_09-28-2024.jpg',
        'tesla-model-3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/1280px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg',
        'tesla-model-s-plaid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tesla_Model_S_%28Facelift_ab_04-2016%29_%28cropped%29.jpg/1280px-Tesla_Model_S_%28Facelift_ab_04-2016%29_%28cropped%29.jpg',
        'lucid-air-pure': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2022_Lucid_Air_Grand_Touring_in_Zenith_Red%2C_front_left.jpg/1280px-2022_Lucid_Air_Grand_Touring_in_Zenith_Red%2C_front_left.jpg',
        'rivian-r1t': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2022_Rivian_R1T_%28in_Glacier_White%29%2C_front_6.21.22.jpg/1280px-2022_Rivian_R1T_%28in_Glacier_White%29%2C_front_6.21.22.jpg',
        'hyundai-ioniq-6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/2023_Hyundai_Ioniq_6_Limited%2C_front_4.27.23.jpg/1280px-2023_Hyundai_Ioniq_6_Limited%2C_front_4.27.23.jpg',
        'bmw-i7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/BMW_7-Series_%28G70%29_750e_IMG_9358.jpg/1280px-BMW_7-Series_%28G70%29_750e_IMG_9358.jpg'
    }
    
    return FALLBACK_IMAGES.get(slug, "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1024")

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

@app.route('/cars')
def cars():
    car_type = request.args.get('type')
    selected_slug_qs = request.args.get('slug')
    
    selected_make = request.args.get('make')
    selected_model = request.args.get('model')

    if car_type:
        source = [car for car in cars_data if car['type'] == car_type]
    else:
        source = cars_data

    details_map = load_cars_details()
    enriched_cars = []

    for car in source:
        slug = _car_slug(car)
        car_details = details_map.get(slug, {})
        
        enriched_cars.append({
            **car,
            'slug': slug,
            'image': get_car_image_url(slug),
            'overview': car_details.get('overview'),
            'drives_like': car_details.get('drives_like'),
            'features': car_details.get('features', []),
            'best_for': car_details.get('best_for'),
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

    return render_template(
        'cars.html',
        cars=enriched_cars,
        selected_slug=selected_slug,
        selected_car=selected_car
    )

@app.route('/cars/<slug>')
def car_detail_page(slug):
    slug = slug.strip().lower()
    car = next((c for c in cars_data if _car_slug(c) == slug), None)
    
    if car is None:
        return render_template('car_not_found.html', slug=slug), 404

    details_map = load_cars_details()
    car_details = details_map.get(slug, {})

    enriched = {
        **car,
        'slug': slug,
        'image': get_car_image_url(slug),
        'overview': car_details.get('overview'),
        'drives_like': car_details.get('drives_like'),
        'features': car_details.get('features', []),
        'pros': car_details.get('pros', []),
        'cons': car_details.get('cons', []),
        'awards': car_details.get('awards', []),
        'history': car_details.get('history'),
        'expert_quote': car_details.get('expert_quote'),
        'best_for': car_details.get('best_for'),
        'competitor_slugs': car_details.get('competitors', []),
    }

    # Resolve competitor slugs to summary cards
    competitor_cards = []
    for cs in enriched['competitor_slugs']:
        other = next((c for c in cars_data if _car_slug(c) == cs), None)
        if other:
            competitor_cards.append({
                'slug': cs,
                'make': other['make'],
                'model': other['model'],
                'price': other.get('price', ''),
                'type': other.get('type', 'car'),
            })

    return render_template('car_detail.html', car=enriched, competitors=competitor_cards)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_DEBUG', '1') != '0'
    app.run(host='0.0.0.0', port=port, debug=debug)