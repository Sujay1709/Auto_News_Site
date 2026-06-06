# Auto Industry Hub

A comprehensive Flask-based web application that serves as an automotive information portal, providing the latest news, detailed car specifications, and industry insights.

## Features

### 🚗 Car Specifications
- Detailed specifications for 25+ vehicles across 4 categories:
  - **Sedans**: Toyota Camry, Honda Accord, BMW 3 Series, Mercedes C-Class, and more
  - **SUVs**: Toyota RAV4, Ford Explorer, Tesla Model X, Porsche Cayenne
  - **Sports Cars**: Porsche 911, Corvette C8, Ferrari 296 GTB, Ford Mustang Dark Horse
  - **Electric Vehicles**: Tesla Model 3/Model S Plaid, Lucid Air, Rivian R1T, Hyundai Ioniq 6

### 📰 Latest News
- Real-time automobile industry news fetched from NewsAPI
- Covers Electric Vehicles, Autonomous Technology, New Models, and Industry Trends

### 🏭 Industry Information
- Comprehensive automobile industry history timeline (1886-present)
- Current market statistics and trends
- Key industry segments explanation
- Major automotive markets overview

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3
- **API**: NewsAPI for news content
- **Database**: In-memory Python data structures

## Project Structure

```
auto_news_site/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── compose.yaml        # Docker Compose configuration
├── Dockerfile          # Docker configuration
├── README.md           # Project documentation
├── static/
│   └── styles.css      # CSS stylesheets
└── templates/
    ├── base.html       # Base template with layout
    ├── index.html      # Home page
    ├── news.html       # News page
    ├── cars.html       # Car specifications page
    └── info.html       # Industry information page
```

## Installation

### Using Docker (Recommended)

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Access the application at `http://localhost:5173`

### Manual Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask backend and Vite dev server:
```bash
python app.py &       # Flask backend (internal, port 8080)
npm run dev           # Vite dev server — open http://localhost:5173
```

4. Access the application at `http://localhost:5173`

## Configuration

To fetch news from NewsAPI, replace the API key in `app.py`:
```python
API_KEY = 'your_api_key_here'
```

Get your free API key at: [NewsAPI.org](https://newsapi.org/)

## API Endpoints

- `/` - Home page
- `/news` - Latest automotive news
- `/cars` - Car specifications (supports `?type=filter` parameter)
- `/info` - Industry information

## Car Categories

Filter cars by type:
- `/cars?type=sedan` - Sedans only
- `/cars?type=suv` - SUVs only
- `/cars?type=sports` - Sports cars only
- `/cars?type=electric` - Electric vehicles only

## Deployment

The application can be deployed using Docker to any platform that supports containers (AWS, GCP, Azure, Heroku, Railway, etc.).

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request