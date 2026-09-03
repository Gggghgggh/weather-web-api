import asyncio
import math

import httpx
from fastapi import HTTPException

from api.services.weather_service import (
    get_current_weather,
)


OSRM_ROUTE_URL = (
    "https://router.project-osrm.org"
    "/route/v1/driving"
)


def get_sample_indices(
    length: int,
    sample_count: int = 6,
):
    if length <= 0:
        return []


    if length <= sample_count:
        return list(
            range(length)
        )


    return [
        round(
            index
            *
            (length - 1)
            /
            (sample_count - 1)
        )

        for index
        in range(
            sample_count
        )
    ]


async def get_weather_for_point(
    index: int,
    coordinate: list,
):
    longitude = float(
        coordinate[0]
    )

    latitude = float(
        coordinate[1]
    )


    try:
        weather = (
            await get_current_weather(
                latitude,
                longitude,
            )
        )


        return {
            "index":
                index,

            "latitude":
                latitude,

            "longitude":
                longitude,

            "weather":
                weather,

            "available":
                True,
        }


    except Exception:
        return {
            "index":
                index,

            "latitude":
                latitude,

            "longitude":
                longitude,

            "weather":
                None,

            "available":
                False,
        }


async def build_route_weather(
    from_latitude: float,
    from_longitude: float,
    to_latitude: float,
    to_longitude: float,
):
    coordinates = (
        f"{from_longitude},"
        f"{from_latitude};"
        f"{to_longitude},"
        f"{to_latitude}"
    )


    url = (
        f"{OSRM_ROUTE_URL}/"
        f"{coordinates}"
    )


    params = {
        "overview":
            "full",

        "geometries":
            "geojson",

        "steps":
            "false",

        "alternatives":
            "false",
    }


    try:
        timeout = httpx.Timeout(
            20.0,
            connect=8.0,
        )


        async with httpx.AsyncClient(
            timeout=timeout
        ) as client:
            response = await client.get(
                url,
                params=params,
            )


        if (
            response.status_code
            != 200
        ):
            raise HTTPException(
                status_code=502,
                detail=(
                    "Unable to calculate "
                    "this route."
                ),
            )


        data = response.json()


        if (
            data.get("code")
            != "Ok"
        ):
            raise HTTPException(
                status_code=404,
                detail=(
                    "No suitable driving "
                    "route was found."
                ),
            )


        routes = (
            data.get(
                "routes",
                []
            )
        )


        if not routes:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No suitable route "
                    "was found."
                ),
            )


        route = routes[0]

        geometry = (
            route.get(
                "geometry",
                {}
            )
        )


        route_coordinates = (
            geometry.get(
                "coordinates",
                []
            )
        )


        sample_indices = (
            get_sample_indices(
                len(
                    route_coordinates
                ),
                6,
            )
        )


        tasks = [
            get_weather_for_point(
                order,
                route_coordinates[
                    coordinate_index
                ],
            )

            for (
                order,
                coordinate_index,
            )
            in enumerate(
                sample_indices
            )
        ]


        weather_points = (
            await asyncio.gather(
                *tasks
            )
        )


        duration_seconds = (
            route.get(
                "duration",
                0
            )
        )


        distance_meters = (
            route.get(
                "distance",
                0
            )
        )


        return {
            "distance_km":
                round(
                    distance_meters
                    /
                    1000,
                    1,
                ),

            "duration_minutes":
                round(
                    duration_seconds
                    /
                    60
                ),

            "geometry": {
                "type":
                    "LineString",

                "coordinates":
                    route_coordinates,
            },

            "weather_points":
                weather_points,

            "origin": {
                "latitude":
                    from_latitude,

                "longitude":
                    from_longitude,
            },

            "destination": {
                "latitude":
                    to_latitude,

                "longitude":
                    to_longitude,
            },
        }


    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "Route calculation "
                "timed out."
            ),
        )


    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to connect to "
                "the routing service."
            ),
        )