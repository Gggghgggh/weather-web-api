import asyncio

from fastapi import FastAPI, Query

from api.services.geocoding_service import (
    reverse_geocode,
    search_locations,
)

from api.services.weather_service import (
    get_current_weather,
    get_forecast,
)

from api.services.weather_map_service import (
    get_weather_tile,
)


app = FastAPI(
    title="AngaMaps API",
    description="Weather and geospatial intelligence API",
    version="1.3.0",
)


@app.get("/api")
async def root():
    return {
        "name": "AngaMaps API",
        "status": "online",
        "version": "1.3.0",
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
        limit=8,
    )

    return {
        "query": q,
        "count": len(results),
        "results": results,
    }


@app.get("/api/weather")
async def weather(
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
    (
        current_weather,
        forecast,
        location,
    ) = await asyncio.gather(
        get_current_weather(
            latitude=lat,
            longitude=lon,
        ),
        get_forecast(
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
        "coordinates": {
            "latitude": lat,
            "longitude": lon,
        },
        "timezone_offset": forecast.get(
            "timezone_offset",
            current_weather.get(
                "timezone_offset",
                0,
            ),
        ),
        "current": current_weather,
        "hourly": forecast.get(
            "hourly",
            [],
        ),
        "daily": forecast.get(
            "daily",
            [],
        ),
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
    (
        weather_data,
        location,
    ) = await asyncio.gather(
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
        "weather": weather_data,
    }


@app.get(
    "/api/weather/tiles/{layer}/{z}/{x}/{y}.png"
)
async def weather_tile(
    layer: str,
    z: int,
    x: int,
    y: int,
):
    return await get_weather_tile(
        layer=layer,
        zoom=z,
        x=x,
        y=y,
    )