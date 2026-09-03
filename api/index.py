import asyncio

from fastapi import FastAPI, Query

from api.services.geocoding_service import (
    reverse_geocode,
    search_locations,
)
from api.services.weather_service import get_current_weather


app = FastAPI(
    title="AngaMaps API",
    description="Weather and geospatial intelligence API",
    version="1.0.0",
)


@app.get("/api")
async def root():
    return {
        "name": "AngaMaps API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "AngaMaps API",
    }


@app.get("/api/locations/search")
async def location_search(
    q: str = Query(
        ...,
        min_length=2,
        max_length=150,
    ),
):
    results = await search_locations(
        query=q,
        limit=5,
    )

    return {
        "query": q,
        "count": len(results),
        "results": results,
    }


@app.get("/api/weather/current")
async def current_weather(
    lat: float = Query(
        ...,
        ge=-90,
        le=90,
    ),
    lon: float = Query(
        ...,
        ge=-180,
        le=180,
    ),
):
    weather, location = await asyncio.gather(
        get_current_weather(
            latitude=lat,
            longitude=lon,
        ),
        reverse_geocode(
            latitude=lat,
            longitude=lon,
        ),
    )

    return {
        "location": location,
        "weather": weather,
    }
