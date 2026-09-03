import os

import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv(".env.local")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"


async def get_current_weather(latitude: float, longitude: float):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenWeather API key is not configured.",
        )

    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                OPENWEATHER_CURRENT_URL,
                params=params,
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail="OpenWeather rejected the API key.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail="Unable to retrieve weather data.",
            )

        data = response.json()

        weather = data.get("weather", [{}])[0]
        main = data.get("main", {})
        wind = data.get("wind", {})
        clouds = data.get("clouds", {})

        return {
            "location": data.get("name") or "Selected location",
            "coordinates": {
                "latitude": data.get("coord", {}).get("lat", latitude),
                "longitude": data.get("coord", {}).get("lon", longitude),
            },
            "temperature": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "temperature_min": main.get("temp_min"),
            "temperature_max": main.get("temp_max"),
            "humidity": main.get("humidity"),
            "pressure": main.get("pressure"),
            "condition": weather.get("main"),
            "description": weather.get("description"),
            "icon": weather.get("icon"),
            "wind_speed": wind.get("speed"),
            "wind_direction": wind.get("deg"),
            "cloudiness": clouds.get("all"),
            "visibility": data.get("visibility"),
            "timezone": data.get("timezone"),
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="OpenWeather request timed out.",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to OpenWeather.",
        )
        