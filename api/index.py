import asyncio

from fastapi import (
    FastAPI,
    HTTPException,
    Query,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from pydantic import (
    BaseModel,
    Field,
)


from api.services.alerts_service import (
    get_weather_alerts,
)

from api.services.geocoding_service import (
    reverse_geocode,
    search_locations,
)

from api.services.nearby_service import (
    get_nearby_places,
)

from api.services.route_service import (
    build_route_weather,
)

from api.services.weather_map_service import (
    get_weather_tile,
)

from api.services.weather_service import (
    get_current_weather,
    get_forecast,
)


app = FastAPI(
    title="AngaMaps API",
    description=(
        "Weather and geospatial "
        "intelligence API."
    ),
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*",
    ],

    allow_headers=[
        "*",
    ],
)


class RouteWeatherRequest(
    BaseModel
):
    from_latitude: float = Field(
        ge=-90,
        le=90,
    )

    from_longitude: float = Field(
        ge=-180,
        le=180,
    )

    to_latitude: float = Field(
        ge=-90,
        le=90,
    )

    to_longitude: float = Field(
        ge=-180,
        le=180,
    )


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


    return (
        str(error)
        if str(error)
        else fallback_message
    )


@app.get(
    "/api"
)
async def api_root():
    return {
        "name":
            "AngaMaps API",

        "version":
            "2.0.0",

        "status":
            "online",
    }


@app.get(
    "/api/health"
)
async def health():
    return {
        "status":
            "ok",

        "service":
            "AngaMaps",
    }


@app.get(
    "/api/locations/search"
)
async def locations_search(
    q: str = Query(
        ...,
        min_length=2,
        max_length=120,
    ),
):
    results = (
        await search_locations(
            q,
            limit=8,
        )
    )


    return {
        "query":
            q,

        "count":
            len(results),

        "results":
            results,
    }


@app.get(
    "/api/weather"
)
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
    results = (
        await asyncio.gather(
            get_current_weather(
                lat,
                lon,
            ),

            get_forecast(
                lat,
                lon,
            ),

            reverse_geocode(
                lat,
                lon,
            ),

            return_exceptions=True,
        )
    )


    (
        current_result,
        forecast_result,
        location_result,
    ) = results


    if isinstance(
        current_result,
        Exception,
    ):
        message = (
            get_error_message(
                current_result,
                (
                    "Current weather "
                    "is unavailable."
                ),
            )
        )


        if isinstance(
            current_result,
            HTTPException,
        ):
            raise HTTPException(
                status_code=(
                    current_result
                    .status_code
                ),
                detail=message,
            )


        raise HTTPException(
            status_code=502,
            detail=message,
        )


    current = (
        current_result
    )


    forecast_available = (
        not isinstance(
            forecast_result,
            Exception,
        )
    )


    if forecast_available:
        forecast = (
            forecast_result
            or {}
        )

        hourly = (
            forecast.get(
                "hourly",
                []
            )
        )

        daily = (
            forecast.get(
                "daily",
                []
            )
        )

        forecast_error = None

    else:
        hourly = []
        daily = []

        forecast_error = (
            get_error_message(
                forecast_result,
                (
                    "Forecast is "
                    "temporarily "
                    "unavailable."
                ),
            )
        )


    location_available = (
        not isinstance(
            location_result,
            Exception,
        )
    )


    if location_available:
        location = (
            location_result
        )

        location_error = None

    else:
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

        location_error = (
            get_error_message(
                location_result,
                (
                    "Detailed location "
                    "information is "
                    "unavailable."
                ),
            )
        )


    complete = (
        forecast_available
        and
        location_available
    )


    return {
        "status": (
            "complete"
            if complete
            else "partial"
        ),

        "current":
            current,

        "hourly":
            hourly,

        "daily":
            daily,

        "location":
            location,

        "availability": {
            "current":
                True,

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


@app.get(
    "/api/weather/current"
)
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
    results = (
        await asyncio.gather(
            get_current_weather(
                lat,
                lon,
            ),

            reverse_geocode(
                lat,
                lon,
            ),

            return_exceptions=True,
        )
    )


    (
        current_result,
        location_result,
    ) = results


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
                "Current weather "
                "is unavailable."
            ),
        )


    location_available = (
        not isinstance(
            location_result,
            Exception,
        )
    )


    location = (
        location_result
        if location_available
        else {
            "name":
                "Selected location",

            "latitude":
                lat,

            "longitude":
                lon,
        }
    )


    return {
        "current":
            current_result,

        "location":
            location,

        "availability": {
            "current":
                True,

            "location":
                location_available,
        },
    }


@app.get(
    "/api/nearby"
)
async def nearby(
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

    radius: int = Query(
        2500,
        ge=500,
        le=5000,
    ),
):
    return (
        await get_nearby_places(
            latitude=lat,
            longitude=lon,
            radius=radius,
            limit=70,
        )
    )


@app.post(
    "/api/route-weather"
)
async def route_weather(
    request:
        RouteWeatherRequest,
):
    return (
        await build_route_weather(
            from_latitude=(
                request
                .from_latitude
            ),

            from_longitude=(
                request
                .from_longitude
            ),

            to_latitude=(
                request
                .to_latitude
            ),

            to_longitude=(
                request
                .to_longitude
            ),
        )
    )


@app.get(
    "/api/weather/alerts"
)
async def weather_alerts(
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
    return (
        await get_weather_alerts(
            lat,
            lon,
        )
    )


@app.get(
    (
        "/api/weather/tiles/"
        "{layer}/{z}/{x}/{y}.png"
    )
)
async def weather_tiles(
    layer: str,
    z: int,
    x: int,
    y: int,
):
    return (
        await get_weather_tile(
            layer,
            z,
            x,
            y,
        )
    )