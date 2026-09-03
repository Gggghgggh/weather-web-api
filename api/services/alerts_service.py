import os

import httpx
from dotenv import load_dotenv


load_dotenv(
    ".env.local"
)


OPENWEATHER_API_KEY = (
    os.getenv(
        "OPENWEATHER_API_KEY"
    )
)


OPENWEATHER_ONE_CALL_URL = (
    "https://api.openweathermap.org"
    "/data/3.0/onecall"
)


async def get_weather_alerts(
    latitude: float,
    longitude: float,
):
    if not OPENWEATHER_API_KEY:
        return {
            "available":
                False,

            "alerts":
                [],

            "message":
                "Weather alerts are not configured.",
        }


    params = {
        "lat":
            latitude,

        "lon":
            longitude,

        "appid":
            OPENWEATHER_API_KEY,

        "exclude":
            (
                "current,minutely,"
                "hourly,daily"
            ),

        "units":
            "metric",
    }


    try:
        timeout = httpx.Timeout(
            15.0,
            connect=8.0,
        )


        async with httpx.AsyncClient(
            timeout=timeout
        ) as client:
            response = (
                await client.get(
                    OPENWEATHER_ONE_CALL_URL,
                    params=params,
                )
            )


        if (
            response.status_code
            in (
                401,
                403,
            )
        ):
            return {
                "available":
                    False,

                "alerts":
                    [],

                "message":
                    (
                        "Weather alert data "
                        "is not available for "
                        "this configuration."
                    ),
            }


        if (
            response.status_code
            == 429
        ):
            return {
                "available":
                    False,

                "alerts":
                    [],

                "message":
                    (
                        "Weather alerts are "
                        "temporarily unavailable."
                    ),
            }


        if (
            response.status_code
            != 200
        ):
            return {
                "available":
                    False,

                "alerts":
                    [],

                "message":
                    (
                        "Unable to retrieve "
                        "weather alerts."
                    ),
            }


        data = response.json()


        alerts = []


        for alert in (
            data.get(
                "alerts",
                []
            )
        ):
            alerts.append({
                "sender_name":
                    alert.get(
                        "sender_name"
                    ),

                "event":
                    alert.get(
                        "event"
                    )
                    or
                    "Weather alert",

                "start":
                    alert.get(
                        "start"
                    ),

                "end":
                    alert.get(
                        "end"
                    ),

                "description":
                    alert.get(
                        "description"
                    ),

                "tags":
                    alert.get(
                        "tags",
                        []
                    ),
            })


        return {
            "available":
                True,

            "alerts":
                alerts,

            "count":
                len(alerts),

            "message": (
                "No active weather alerts."
                if not alerts
                else None
            ),
        }


    except (
        httpx.TimeoutException,
        httpx.RequestError,
    ):
        return {
            "available":
                False,

            "alerts":
                [],

            "message":
                (
                    "Weather alerts are "
                    "temporarily unavailable."
                ),
        }