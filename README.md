# AngaMaps

**Weather Intelligence powered by OpenStreetMap and OpenWeather**

AngaMaps is a modern geospatial weather application built with **React, Vite, Tailwind CSS, FastAPI, OpenStreetMap, Leaflet, Nominatim, and OpenWeather**.

Users can search for locations, explore them on an interactive map, click anywhere to select coordinates, reverse-geocode locations, and retrieve current weather conditions.

---

# Quick Start

If you want to clone and run this project locally, follow these steps.

## 1. Requirements

Make sure you have the following installed:

* Git
* Node.js
* npm
* Python 3.13

You also need an **OpenWeather API key**.

---

## 2. Clone the Repository

```bash
git clone <repository-url>
```

Then enter the project directory:

```bash
cd weather-web-api
```

For example:

```bash
git clone https://github.com/your-username/weather-web-api.git
cd weather-web-api
```

---

## 3. Install Frontend Dependencies

Run:

```bash
npm install
```

This installs the React, Vite, Tailwind CSS, Leaflet, React Leaflet, Lucide React, and other frontend dependencies defined in `package.json`.

---

## 4. Create the Python Virtual Environment

This project uses Python 3.13.

### Windows

```cmd
py -3.13 -m venv .venv
```

Activate the virtual environment:

```cmd
.venv\Scripts\activate
```

### macOS / Linux

```bash
python3.13 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

---

## 5. Install Backend Dependencies

With the Python virtual environment activated, run:

```bash
python -m pip install --upgrade pip
```

Then:

```bash
pip install -r requirements.txt
```

---

## 6. Configure Environment Variables

Create a file named:

```text
.env.local
```

in the project root.

Your project should look similar to:

```text
weather-web-api/
├── api/
├── public/
├── src/
├── .env.local
├── package.json
├── requirements.txt
├── vite.config.js
└── README.md
```

Inside `.env.local`, add:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
```

Replace:

```text
your_openweather_api_key
```

with your actual OpenWeather API key.

Do not commit `.env.local` to GitHub.

---

# Running AngaMaps Locally

AngaMaps has two applications:

```text
Frontend → React + Vite
Backend  → FastAPI
```

For local development, run them in **two separate terminals**.

---

## Terminal 1 — Start FastAPI

From the project root, activate the Python environment.

### Windows

```cmd
.venv\Scripts\activate
```

Then start FastAPI:

```cmd
uvicorn api.index:app --reload --port 8000
```

The backend should now be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

You can test the API health endpoint at:

```text
http://127.0.0.1:8000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "AngaMaps API"
}
```

---

## Terminal 2 — Start React

Open another terminal in the same project directory.

Run:

```bash
npm run dev
```

Vite should display something similar to:

```text
Local: http://localhost:5173/
```

Open:

```text
http://localhost:5173
```

in your browser.

AngaMaps should now be running locally.

---

# Local Development Flow

During local development, the application works like this:

```text
Browser
   ↓
React / Vite
localhost:5173
   ↓
/api requests
   ↓
Vite proxy
   ↓
FastAPI
localhost:8000
   ↓
OpenWeather + OpenStreetMap services
```

The frontend therefore makes requests such as:

```text
/api/health
/api/locations/search
/api/weather/current
```

instead of hardcoding the FastAPI URL.

The proxy is configured in `vite.config.js`.

Example:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
}
```

---

# Verify Your Installation

After starting both servers, verify that everything works.

## Backend Health

Open:

```text
http://127.0.0.1:8000/api/health
```

You should receive:

```json
{
  "status": "ok",
  "service": "AngaMaps API"
}
```

---

## Test Location Search

Open:

```text
http://127.0.0.1:8000/api/locations/search?q=Nairobi
```

You should receive location results from OpenStreetMap.

---

## Test Current Weather

Open:

```text
http://127.0.0.1:8000/api/weather/current?lat=-1.286389&lon=36.817223
```

If your OpenWeather API key is configured correctly, you should receive current weather information for the selected coordinates.

---

# Common Setup Problems

## `npm` is not recognized

Install Node.js, then restart your terminal.

Verify:

```bash
node --version
npm --version
```

---

## Python 3.13 is not found

On Windows, check installed versions:

```cmd
py -0p
```

Then make sure Python 3.13 is installed.

Verify:

```cmd
py -3.13 --version
```

---

## `uvicorn` is not recognized

Make sure your Python virtual environment is activated:

```cmd
.venv\Scripts\activate
```

Then install the requirements again:

```cmd
pip install -r requirements.txt
```

Alternatively run Uvicorn through Python:

```cmd
python -m uvicorn api.index:app --reload --port 8000
```

---

## Frontend says API unavailable

Check that FastAPI is running on:

```text
http://127.0.0.1:8000
```

Then test:

```text
http://127.0.0.1:8000/api/health
```

Also make sure the Vite proxy still points to:

```text
http://127.0.0.1:8000
```

---

## Weather returns an API key error

Check that `.env.local` exists in the project root.

It should contain:

```env
OPENWEATHER_API_KEY=your_actual_key
```

Restart FastAPI after modifying environment variables.

---

## Location search does not work

AngaMaps uses OpenStreetMap's public Nominatim service.

Make sure:

* Your internet connection is working
* FastAPI is running
* The Nominatim service is reachable

Location searches are intentionally performed when the user submits a search instead of on every keystroke.

---

# Features

AngaMaps currently includes:

* Interactive OpenStreetMap
* React Leaflet integration
* Map click location selection
* Location markers
* Location search
* Up to 8 search results
* Town, estate and landmark search
* School and university search
* Hospital and amenity search
* Reverse geocoding
* Current weather
* Temperature information
* Feels-like temperature
* Humidity
* Wind speed
* Atmospheric pressure
* Visibility
* Cloudiness
* Weather icons
* API health monitoring
* Light mode
* Dark mode
* Persistent theme preference
* Responsive interface

---

# Application Architecture

```text
┌──────────────────────────────┐
│       React Frontend         │
│                              │
│ Search • Weather • Map • UI  │
└──────────────┬───────────────┘
               │
               │ /api/*
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
│                              │
│ Weather + Geocoding Services │
└──────────┬───────────┬───────┘
           │           │
           ▼           ▼
   ┌─────────────┐ ┌─────────────┐
   │ OpenWeather │ │ OpenStreetMap│
   │     API     │ │  Nominatim   │
   └─────────────┘ └─────────────┘
```

The OpenWeather API key remains on the backend.

The React frontend never needs direct access to the secret API key.

---

# Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* React Leaflet
* Leaflet
* Lucide React

## Backend

* Python 3.13
* FastAPI
* Uvicorn
* HTTPX
* python-dotenv

## Services

* OpenStreetMap
* Nominatim
* OpenWeather

## Deployment

* Vercel

---

# Project Structure

```text
weather-web-api/
│
├── api/
│   ├── index.py
│   │
│   └── services/
│       ├── __init__.py
│       ├── geocoding_service.py
│       └── weather_service.py
│
├── public/
│
├── src/
│   ├── components/
│   │   └── WeatherMap.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.local
├── .gitignore
├── .python-version
├── index.html
├── package.json
├── package-lock.json
├── requirements.txt
├── vercel.json
├── vite.config.js
└── README.md
```

---

# API Endpoints

## API Information

```http
GET /api
```

Example response:

```json
{
  "name": "AngaMaps API",
  "status": "online",
  "version": "1.0.0"
}
```

---

## Health Check

```http
GET /api/health
```

---

## Search Locations

```http
GET /api/locations/search?q={query}
```

Example:

```text
/api/locations/search?q=Kenyatta%20University
```

AngaMaps requests up to 8 relevant OpenStreetMap search results.

---

## Current Weather

```http
GET /api/weather/current?lat={latitude}&lon={longitude}
```

Example:

```text
/api/weather/current?lat=-1.286389&lon=36.817223
```

The backend retrieves:

* Current weather information
* Reverse-geocoded location details

and returns them together.

---

# Environment Variables

AngaMaps currently requires:

| Variable              | Required | Description                                     |
| --------------------- | -------- | ----------------------------------------------- |
| `OPENWEATHER_API_KEY` | Yes      | OpenWeather API key used by the FastAPI backend |

Never expose this value through a frontend variable such as:

```text
VITE_OPENWEATHER_API_KEY
```

Vite-prefixed environment variables can be included in browser code.

---

# Building for Production

Before deployment, create a production frontend build:

```bash
npm run build
```

The generated files will be placed in:

```text
dist/
```

You can test the production frontend locally with:

```bash
npm run preview
```

---

# Vercel Deployment

The project is configured for Vercel deployment.

Recommended Vercel settings:

```text
Framework Preset: Vite

Build Command:
npm run build

Install Command:
npm install

Output Directory:
dist
```

---

## Configure the Production API Key

In Vercel:

```text
Project
   ↓
Settings
   ↓
Environment Variables
```

Add:

```text
OPENWEATHER_API_KEY
```

and use your actual OpenWeather API key as the value.

Enable it for the required environments:

* Production
* Preview
* Development

After changing an environment variable, redeploy the project.

---

## Deploy Using Vercel CLI

Install Vercel CLI if required:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel --prod
```

---

# Security

## Never Commit Secrets

The following files should remain ignored:

```gitignore
.env
.env.local
.venv
```

Do not commit API keys to GitHub.

---

## Backend API Keys

The correct architecture is:

```text
React
   ↓
FastAPI
   ↓
OpenWeather
```

and not:

```text
React
   ↓
OpenWeather API + exposed API key
```

---

# Planned Features

Future AngaMaps development may include:

* Browser current-location detection
* Hourly weather forecast
* Multi-day forecast
* Temperature layers
* Rainfall layers
* Wind layers
* Cloud layers
* Saved locations
* User accounts
* PostgreSQL
* SQLAlchemy
* Weather analytics
* Nearby places
* Route planning
* Weather along routes
* Weather alerts

---

# Development Roadmap

```text
[✓] React + Vite
[✓] Tailwind CSS
[✓] FastAPI backend
[✓] OpenStreetMap
[✓] React Leaflet
[✓] Interactive map
[✓] Location markers
[✓] OpenWeather integration
[✓] Current weather
[✓] Reverse geocoding
[✓] Location search
[✓] Search result selection
[✓] Automatic map navigation
[✓] Automatic weather loading
[✓] Light mode
[✓] Dark mode
[✓] Persistent theme

[ ] Current-location detection
[ ] Hourly forecasts
[ ] Multi-day forecasts
[ ] Weather layers
[ ] Saved locations
[ ] PostgreSQL
[ ] Authentication
[ ] Nearby places
[ ] Weather analytics
[ ] Route weather
[ ] Weather alerts
```

---

# External Services

## OpenStreetMap

OpenStreetMap provides map and geographic data.

Map data must be appropriately attributed to OpenStreetMap contributors.

---

## Nominatim

Nominatim provides:

```text
Place name
    ↓
Coordinates
```

and:

```text
Coordinates
    ↓
Readable place information
```

The public Nominatim service has usage limitations, so AngaMaps currently uses explicit user-submitted searches instead of continuously sending autocomplete requests.

For larger production workloads, consider a dedicated geocoding service or self-hosted Nominatim deployment.

---

## OpenWeather

OpenWeather provides current weather data using latitude and longitude.

The API key is stored securely on the FastAPI backend.

---

# About the Name

**AngaMaps** combines:

```text
Anga + Maps
```

`Anga` is associated with the sky or atmosphere in Swahili, while `Maps` represents the application's geospatial capabilities.

The project combines:

```text
Weather Intelligence
        +
Geospatial Data
        +
Interactive Mapping
        =
AngaMaps
```

---

# License

This project is currently developed as a personal development and portfolio project.

A formal open-source license can be added if the project is made available for public reuse or contribution.

---

# AngaMaps

**Weather Intelligence. Explore the map. Understand the weather.**
