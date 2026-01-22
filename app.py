from flask import Flask, render_template, request
import requests

app = Flask(__name__)

# NewsAPI key (replace with yours)
API_KEY = '7120175e997a4aae8edc62c5167858bf'
NEWS_URL = f'https://newsapi.org/v2/everything?q=automobile+industry&apiKey={API_KEY}&pageSize=10'

# Car specifications data
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

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/news')
def news():
    try:
        response = requests.get(NEWS_URL, timeout=10)
        data = response.json()
        articles = data.get('articles', [])
    except Exception as e:
        articles = []
    return render_template('news.html', articles=articles)

@app.route('/info')
def info():
    return render_template('info.html')

@app.route('/cars')
def cars():
    car_type = request.args.get('type')
    if car_type:
        filtered_cars = [car for car in cars_data if car['type'] == car_type]
    else:
        filtered_cars = cars_data
    return render_template('cars.html', cars=filtered_cars)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)

