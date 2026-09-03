import os

from collections import defaultdict
from datetime import (
    datetime,
    timedelta,
    timezone,
)

import httpx

from dotenv import load_dotenv
from fastapi import HTTPException


load_dotenv(".env.local")


OPENWEATHER_API_KEY = os.getenv(
    "OPENWEATHER_API_KEY"
)

OPENWEATHER_CURRENT_URL = (
    "https://api.openweathermap.org/"
    "data/2.5/weather"
)

OPENWEATHER_FORECAST_URL = (
    "https://api.openweathermap.org/"
    "data/2.5/forecast"
)


def get_weather_condition(
    item: dict,
):
    weather = item.get(
        "weather",
        [],
    )

    if not weather:
        return {}

    return weather[0]


def get_local_datetime(
    timestamp: int,
    timezone_offset: int,
):
    location_timezone = timezone(
        timedelta(
            seconds=timezone_offset
        )
    )

    return datetime.fromtimestamp(
        timestamp,
        tz=location_timezone,
    )


async def get_current_weather(
    latitude: float,
    longitude: float,
):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "Weather service "
                "is not configured."
            ),
        )

    params = {
        "lat": latitude,
        "lon": longitude,
        "appid":
            OPENWEATHER_API_KEY,
        "units": "metric",
    }

    timeout = httpx.Timeout(
        15.0,
        connect=8.0,
    )

    try:
        async with httpx.AsyncClient(
            timeout=timeout
        ) as client:
            response = await client.get(
                OPENWEATHER_CURRENT_URL,
                params=params,
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Weather service "
                    "authentication failed."
                ),
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail=(
                    "Weather service is "
                    "currently busy."
                ),
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Current weather is "
                    "temporarily unavailable."
                ),
            )

        data = response.json()

        main = data.get(
            "main",
            {},
        )

        wind = data.get(
            "wind",
            {},
        )

        clouds = data.get(
            "clouds",
            {},
        )

        rain = data.get(
            "rain",
            {},
        )

        snow = data.get(
            "snow",
            {},
        )

        weather = (
            get_weather_condition(
                data
            )
        )

        sys_data = data.get(
            "sys",
            {},
        )

        return {
            "timestamp":
                data.get("dt"),

            "temperature":
                main.get("temp"),

            "feels_like":
                main.get(
                    "feels_like"
                ),

            "temperature_min":
                main.get(
                    "temp_min"
                ),

            "temperature_max":
                main.get(
                    "temp_max"
                ),

            "pressure":
                main.get(
                    "pressure"
                ),

            "humidity":
                main.get(
                    "humidity"
                ),

            "visibility":
                data.get(
                    "visibility"
                ),

            "wind_speed":
                wind.get(
                    "speed"
                ),

            "wind_direction":
                wind.get(
                    "deg"
                ),

            "wind_gust":
                wind.get(
                    "gust"
                ),

            "cloudiness":
                clouds.get(
                    "all"
                ),

            "rain_1h":
                rain.get(
                    "1h",
                    0,
                ),

            "rain_3h":
                rain.get(
                    "3h",
                    0,
                ),

            "snow_1h":
                snow.get(
                    "1h",
                    0,
                ),

            "snow_3h":
                snow.get(
                    "3h",
                    0,
                ),

            "condition":
                weather.get(
                    "main"
                ),

            "description":
                weather.get(
                    "description"
                ),

            "icon":
                weather.get(
                    "icon"
                ),

            "sunrise":
                sys_data.get(
                    "sunrise"
                ),

            "sunset":
                sys_data.get(
                    "sunset"
                ),

            "timezone_offset":
                data.get(
                    "timezone",
                    0,
                ),
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "Current weather is "
                "temporarily unavailable."
            ),
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to connect to "
                "the weather service."
            ),
        )


async def get_forecast(
    latitude: float,
    longitude: float,
):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "Weather service "
                "is not configured."
            ),
        )

    params = {
        "lat": latitude,
        "lon": longitude,
        "appid":
            OPENWEATHER_API_KEY,
        "units": "metric",
    }

    # Forecast responses are larger than
    # current-weather responses, so give
    # them a little more time.
    timeout = httpx.Timeout(
        20.0,
        connect=8.0,
    )

    try:
        async with httpx.AsyncClient(
            timeout=timeout
        ) as client:
            response = await client.get(
                OPENWEATHER_FORECAST_URL,
                params=params,
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Forecast service "
                    "authentication failed."
                ),
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail=(
                    "Forecast service is "
                    "currently busy."
                ),
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Forecast is temporarily "
                    "unavailable."
                ),
            )

        data = response.json()

        forecast_items = data.get(
            "list",
            [],
        )

        city = data.get(
            "city",
            {},
        )

        timezone_offset = city.get(
            "timezone",
            0,
        )

        # ------------------------------
        # Next 24 hours
        # ------------------------------

        hourly = []

        for item in forecast_items[:8]:
            main = item.get(
                "main",
                {},
            )

            wind = item.get(
                "wind",
                {},
            )

            clouds = item.get(
                "clouds",
                {},
            )

            weather = (
                get_weather_condition(
                    item
                )
            )

            timestamp = item.get(
                "dt"
            )

            local_datetime = None

            if timestamp:
                local_datetime = (
                    get_local_datetime(
                        timestamp,
                        timezone_offset,
                    )
                )

            hourly.append({
                "timestamp":
                    timestamp,

                "local_datetime":
                    (
                        local_datetime
                        .isoformat()
                        if local_datetime
                        else None
                    ),

                "local_time":
                    (
                        local_datetime
                        .strftime(
                            "%I:%M %p"
                        )
                        if local_datetime
                        else None
                    ),

                "temperature":
                    main.get(
                        "temp"
                    ),

                "feels_like":
                    main.get(
                        "feels_like"
                    ),

                "temperature_min":
                    main.get(
                        "temp_min"
                    ),

                "temperature_max":
                    main.get(
                        "temp_max"
                    ),

                "pressure":
                    main.get(
                        "pressure"
                    ),

                "humidity":
                    main.get(
                        "humidity"
                    ),

                "visibility":
                    item.get(
                        "visibility"
                    ),

                "wind_speed":
                    wind.get(
                        "speed"
                    ),

                "wind_direction":
                    wind.get(
                        "deg"
                    ),

                "wind_gust":
                    wind.get(
                        "gust"
                    ),

                "cloudiness":
                    clouds.get(
                        "all"
                    ),

                "precipitation_probability":
                    item.get(
                        "pop",
                        0,
                    ),

                "rain":
                    item.get(
                        "rain",
                        {},
                    ).get(
                        "3h",
                        0,
                    ),

                "snow":
                    item.get(
                        "snow",
                        {},
                    ).get(
                        "3h",
                        0,
                    ),

                "condition":
                    weather.get(
                        "main"
                    ),

                "description":
                    weather.get(
                        "description"
                    ),

                "icon":
                    weather.get(
                        "icon"
                    ),
            })

        # ------------------------------
        # Group forecast by day
        # ------------------------------

        grouped_by_day = defaultdict(
            list
        )

        for item in forecast_items:
            timestamp = item.get(
                "dt"
            )

            if not timestamp:
                continue

            local_datetime = (
                get_local_datetime(
                    timestamp,
                    timezone_offset,
                )
            )

            day_key = (
                local_datetime
                .date()
                .isoformat()
            )

            grouped_by_day[
                day_key
            ].append({
                "data": item,
                "datetime":
                    local_datetime,
            })

        # ------------------------------
        # 5-day outlook
        # ------------------------------

        daily = []

        for (
            day_key,
            day_entries,
        ) in list(
            grouped_by_day.items()
        )[:5]:

            temperatures_min = []
            temperatures_max = []
            humidities = []
            wind_speeds = []
            precipitation_probabilities = []
            rainfall = []

            for entry in day_entries:
                item = entry[
                    "data"
                ]

                main = item.get(
                    "main",
                    {},
                )

                wind = item.get(
                    "wind",
                    {},
                )

                temp_min = main.get(
                    "temp_min"
                )

                temp_max = main.get(
                    "temp_max"
                )

                humidity = main.get(
                    "humidity"
                )

                wind_speed = wind.get(
                    "speed"
                )

                if temp_min is not None:
                    temperatures_min.append(
                        temp_min
                    )

                if temp_max is not None:
                    temperatures_max.append(
                        temp_max
                    )

                if humidity is not None:
                    humidities.append(
                        humidity
                    )

                if wind_speed is not None:
                    wind_speeds.append(
                        wind_speed
                    )

                precipitation_probabilities.append(
                    item.get(
                        "pop",
                        0,
                    )
                )

                rainfall.append(
                    item.get(
                        "rain",
                        {},
                    ).get(
                        "3h",
                        0,
                    )
                )

            representative = min(
                day_entries,
                key=lambda entry:
                    abs(
                        entry[
                            "datetime"
                        ].hour - 12
                    ),
            )

            representative_data = (
                representative[
                    "data"
                ]
            )

            weather = (
                get_weather_condition(
                    representative_data
                )
            )

            daily.append({
                "date":
                    day_key,

                "timestamp":
                    representative_data
                    .get("dt"),

                "temperature_min":
                    (
                        min(
                            temperatures_min
                        )
                        if temperatures_min
                        else None
                    ),

                "temperature_max":
                    (
                        max(
                            temperatures_max
                        )
                        if temperatures_max
                        else None
                    ),

                "humidity":
                    (
                        round(
                            sum(
                                humidities
                            )
                            /
                            len(
                                humidities
                            )
                        )
                        if humidities
                        else None
                    ),

                "wind_speed":
                    (
                        round(
                            max(
                                wind_speeds
                            ),
                            1,
                        )
                        if wind_speeds
                        else None
                    ),

                "precipitation_probability":
                    (
                        max(
                            precipitation_probabilities
                        )
                        if precipitation_probabilities
                        else 0
                    ),

                "rain":
                    round(
                        sum(
                            rainfall
                        ),
                        2,
                    ),

                "condition":
                    weather.get(
                        "main"
                    ),

                "description":
                    weather.get(
                        "description"
                    ),

                "icon":
                    weather.get(
                        "icon"
                    ),
            })

        return {
            "timezone_offset":
                timezone_offset,

            "city": {
                "name":
                    city.get(
                        "name"
                    ),

                "country":
                    city.get(
                        "country"
                    ),

                "sunrise":
                    city.get(
                        "sunrise"
                    ),

                "sunset":
                    city.get(
                        "sunset"
                    ),
            },

            "hourly":
                hourly,

            "daily":
                daily,
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "Forecast is temporarily "
                "unavailable."
            ),
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to connect to "
                "the forecast service."
            ),
        )
