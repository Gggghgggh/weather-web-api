import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException
from fastapi.responses import Response


load_dotenv(".env.local")


OPENWEATHER_API_KEY = os.getenv(
    "OPENWEATHER_API_KEY"
)


OPENWEATHER_TILE_URL = (
    "https://tile.openweathermap.org/map"
)


WEATHER_LAYERS = {
    "temperature": "temp_new",
    "precipitation": "precipitation_new",
    "clouds": "clouds_new",
    "wind": "wind_new",
    "pressure": "pressure_new",
}


async def get_weather_tile(
    layer: str,
    zoom: int,
    x: int,
    y: int,
):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Weather map service is not configured.",
        )

    openweather_layer = WEATHER_LAYERS.get(
        layer
    )

    if not openweather_layer:
        raise HTTPException(
            status_code=404,
            detail="Weather layer not found.",
        )

    if zoom < 0 or zoom > 18:
        raise HTTPException(
            status_code=400,
            detail="Invalid map zoom level.",
        )

    url = (
        f"{OPENWEATHER_TILE_URL}/"
        f"{openweather_layer}/"
        f"{zoom}/{x}/{y}.png"
    )

    params = {
        "appid": OPENWEATHER_API_KEY,
    }

    try:
        async with httpx.AsyncClient(
            timeout=15.0
        ) as client:
            response = await client.get(
                url,
                params=params,
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail="Weather map authentication failed.",
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Weather map request limit reached.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail="Unable to retrieve weather map tile.",
            )

        return Response(
            content=response.content,
            media_type="image/png",
            headers={
                "Cache-Control":
                    "public, max-age=600, stale-while-revalidate=300",
            },
        )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Weather map request timed out.",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the weather map service.",
        )