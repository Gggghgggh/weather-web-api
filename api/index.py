import asyncio

from fastapi import FastAPI, HTTPException, Query

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
    version="1.4.0",
)


@app.get("/api")
async def root():
    return {
        "name": "AngaMaps API",
        "status": "online",
        "version": "1.4.0",
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


def get_error_message(
    error,
    fallback_message,
):
    if isinstance(
        error,
        HTTPException,
    ):
        return str(
            error.detail
        )

    return fallback_message


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
    """
    Main dashboard weather endpoint.

    Current weather is essential.

    Forecast and reverse geocoding are
    optional enhancements. If either
    fails, current weather can still
    be returned successfully.
    """

    results = await asyncio.gather(
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
        return_exceptions=True,
    )

    current_result = results[0]
    forecast_result = results[1]
    location_result = results[2]

    # ------------------------------
    # Current weather
    # ------------------------------

    if isinstance(
        current_result,
        Exception,
    ):
        if isinstance(
            current_result,
            HTTPException,
        ):
            raise current_result

        raise HTTPException(
            status_code=502,
            detail=(
                "Current weather is "
                "temporarily unavailable."
            ),
        )

    current_weather = current_result

    # ------------------------------
    # Forecast
    # ------------------------------

    forecast_available = True
    forecast_error = None

    if isinstance(
        forecast_result,
        Exception,
    ):
        forecast_available = False

        forecast_error = get_error_message(
            forecast_result,
            (
                "Forecast is temporarily "
                "unavailable."
            ),
        )

        forecast = {
            "timezone_offset":
                current_weather.get(
                    "timezone_offset",
                    0,
                ),
            "city": {},
            "hourly": [],
            "daily": [],
        }

    else:
        forecast = forecast_result

    # ------------------------------
    # Location
    # ------------------------------

    location_available = True
    location_error = None

    if isinstance(
        location_result,
        Exception,
    ):
        location_available = False

        location_error = get_error_message(
            location_result,
            (
                "Location name is "
                "temporarily unavailable."
            ),
        )

        location = {
            "name": "Selected location",
            "type": "coordinates",
            "latitude": lat,
            "longitude": lon,
        }

    else:
        location = location_result

    # ------------------------------
    # Overall service status
    # ------------------------------

    if (
        forecast_available
        and location_available
    ):
        status = "complete"

    else:
        status = "partial"

    return {
        "status": status,

        "location": location,

        "coordinates": {
            "latitude": lat,
            "longitude": lon,
        },

        "timezone_offset":
            forecast.get(
                "timezone_offset",
                current_weather.get(
                    "timezone_offset",
                    0,
                ),
            ),

        "current":
            current_weather,

        "hourly":
            forecast.get(
                "hourly",
                [],
            ),

        "daily":
            forecast.get(
                "daily",
                [],
            ),

        "availability": {
            "current": True,
            "forecast":
                forecast_available,
            "location":
                location_available,
        },

        "errors": {
            "forecast":
                forecast_error,
            "location":
                location_error,
        },
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
    """
    Lightweight endpoint used by
    the interactive weather map.

    Reverse geocoding is optional,
    so a location-name failure does
    not remove the weather reading.
    """

    results = await asyncio.gather(
        get_current_weather(
            latitude=lat,
            longitude=lon,
        ),
        reverse_geocode(
            latitude=lat,
            longitude=lon,
        ),
        return_exceptions=True,
    )

    weather_result = results[0]
    location_result = results[1]

    if isinstance(
        weather_result,
        Exception,
    ):
        if isinstance(
            weather_result,
            HTTPException,
        ):
            raise weather_result

        raise HTTPException(
            status_code=502,
            detail=(
                "Current weather is "
                "temporarily unavailable."
            ),
        )

    weather_data = weather_result

    if isinstance(
        location_result,
        Exception,
    ):
        location_available = False

        location = {
            "name":
                "Selected location",
            "type":
                "coordinates",
            "latitude":
                lat,
            "longitude":
                lon,
        }

    else:
        location_available = True
        location = location_result

    return {
        "status":
            "complete"
            if location_available
            else "partial",

        "location":
            location,

        "coordinates": {
            "latitude":
                lat,
            "longitude":
                lon,
        },

        "weather":
            weather_data,

        "availability": {
            "current":
                True,
            "location":
                location_available,
        },
    }


@app.get(
    "/api/weather/tiles/"
    "{layer}/{z}/{x}/{y}.png"
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