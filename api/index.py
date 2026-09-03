from fastapi import FastAPI, Query

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


@app.get("/api/weather/current")
async def current_weather(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
):
    return await get_current_weather(
        latitude=lat,
        longitude=lon,
    )