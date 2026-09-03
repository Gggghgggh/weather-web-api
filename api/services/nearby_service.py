import math

import httpx
from fastapi import HTTPException


OVERPASS_URL = (
    "https://overpass-api.de/api/interpreter"
)


HEADERS = {
    "User-Agent": "AngaMaps/1.0"
}


PLACE_CATEGORIES = {
    "hospital": {
        "label": "Hospitals",
        "amenity": "hospital",
    },

    "pharmacy": {
        "label": "Pharmacies",
        "amenity": "pharmacy",
    },

    "police": {
        "label": "Police Stations",
        "amenity": "police",
    },

    "school": {
        "label": "Schools",
        "amenity": "school",
    },

    "restaurant": {
        "label": "Restaurants",
        "amenity": "restaurant",
    },

    "fuel": {
        "label": "Fuel Stations",
        "amenity": "fuel",
    },

    "atm": {
        "label": "ATMs",
        "amenity": "atm",
    },

    "bank": {
        "label": "Banks",
        "amenity": "bank",
    },

    "clinic": {
        "label": "Clinics",
        "amenity": "clinic",
    },

    "cafe": {
        "label": "Cafés",
        "amenity": "cafe",
    },

    "supermarket": {
        "label": "Supermarkets",
        "shop": "supermarket",
    },

    "hotel": {
        "label": "Hotels",
        "tourism": "hotel",
    },
}


def calculate_distance(
    latitude_1: float,
    longitude_1: float,
    latitude_2: float,
    longitude_2: float,
):
    earth_radius_km = 6371.0

    latitude_1_rad = math.radians(
        latitude_1
    )

    latitude_2_rad = math.radians(
        latitude_2
    )

    latitude_delta = math.radians(
        latitude_2 - latitude_1
    )

    longitude_delta = math.radians(
        longitude_2 - longitude_1
    )


    a = (
        math.sin(
            latitude_delta / 2
        ) ** 2
        +
        math.cos(
            latitude_1_rad
        )
        *
        math.cos(
            latitude_2_rad
        )
        *
        math.sin(
            longitude_delta / 2
        ) ** 2
    )


    c = (
        2
        *
        math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a),
        )
    )


    return earth_radius_km * c


def get_element_coordinates(
    element: dict,
):
    if (
        element.get("lat") is not None
        and
        element.get("lon") is not None
    ):
        return (
            float(element["lat"]),
            float(element["lon"]),
        )


    center = (
        element.get("center")
        or {}
    )


    if (
        center.get("lat") is not None
        and
        center.get("lon") is not None
    ):
        return (
            float(center["lat"]),
            float(center["lon"]),
        )


    return None


def determine_category(
    tags: dict,
):
    amenity = (
        tags.get("amenity")
    )

    tourism = (
        tags.get("tourism")
    )

    shop = (
        tags.get("shop")
    )


    for (
        category,
        config,
    ) in PLACE_CATEGORIES.items():

        if (
            config.get("amenity")
            and
            amenity
            ==
            config["amenity"]
        ):
            return category


        if (
            config.get("tourism")
            and
            tourism
            ==
            config["tourism"]
        ):
            return category


        if (
            config.get("shop")
            and
            shop
            ==
            config["shop"]
        ):
            return category


    return "other"


def build_address(
    tags: dict,
):
    parts = []


    street = (
        tags.get("addr:street")
    )

    house_number = (
        tags.get("addr:housenumber")
    )

    suburb = (
        tags.get("addr:suburb")
    )

    city = (
        tags.get("addr:city")
    )


    if (
        house_number
        and
        street
    ):
        parts.append(
            f"{house_number} {street}"
        )

    elif street:
        parts.append(
            street
        )


    if suburb:
        parts.append(
            suburb
        )


    if (
        city
        and
        city not in parts
    ):
        parts.append(
            city
        )


    return (
        ", ".join(parts)
        if parts
        else None
    )


async def get_nearby_places(
    latitude: float,
    longitude: float,
    radius: int = 2500,
    limit: int = 60,
):
    safe_radius = max(
        500,
        min(
            int(radius),
            5000,
        ),
    )


    safe_limit = max(
        1,
        min(
            int(limit),
            100,
        ),
    )


    queries = []


    for config in (
        PLACE_CATEGORIES.values()
    ):
        if config.get(
            "amenity"
        ):
            tag = (
                f'["amenity"='
                f'"{config["amenity"]}"]'
            )

        elif config.get(
            "tourism"
        ):
            tag = (
                f'["tourism"='
                f'"{config["tourism"]}"]'
            )

        elif config.get(
            "shop"
        ):
            tag = (
                f'["shop"='
                f'"{config["shop"]}"]'
            )

        else:
            continue


        for element_type in (
            "node",
            "way",
            "relation",
        ):
            queries.append(
                (
                    f"{element_type}"
                    f"{tag}"
                    f"(around:"
                    f"{safe_radius},"
                    f"{latitude},"
                    f"{longitude});"
                )
            )


    overpass_query = (
        "[out:json][timeout:20];"
        "("
        +
        "".join(queries)
        +
        ");"
        "out center tags;"
    )


    try:
        timeout = httpx.Timeout(
            25.0,
            connect=8.0,
        )


        async with httpx.AsyncClient(
            timeout=timeout
        ) as client:
            response = await client.post(
                OVERPASS_URL,
                data={
                    "data":
                        overpass_query,
                },
                headers=HEADERS,
            )


        if (
            response.status_code
            != 200
        ):
            raise HTTPException(
                status_code=502,
                detail=(
                    "Nearby places are "
                    "temporarily unavailable."
                ),
            )


        data = response.json()

        places = []


        for element in (
            data.get(
                "elements",
                []
            )
        ):
            coordinates = (
                get_element_coordinates(
                    element
                )
            )


            if not coordinates:
                continue


            (
                place_latitude,
                place_longitude,
            ) = coordinates


            tags = (
                element.get(
                    "tags",
                    {}
                )
            )


            category = (
                determine_category(
                    tags
                )
            )


            if (
                category
                ==
                "other"
            ):
                continue


            distance_km = (
                calculate_distance(
                    latitude,
                    longitude,
                    place_latitude,
                    place_longitude,
                )
            )


            name = (
                tags.get("name")
                or
                tags.get("brand")
                or
                PLACE_CATEGORIES[
                    category
                ]["label"].rstrip("s")
            )


            places.append({
                "id": (
                    f'{element.get("type")}-'
                    f'{element.get("id")}'
                ),

                "osm_type":
                    element.get("type"),

                "osm_id":
                    element.get("id"),

                "name":
                    name,

                "category":
                    category,

                "category_label":
                    PLACE_CATEGORIES[
                        category
                    ]["label"],

                "latitude":
                    place_latitude,

                "longitude":
                    place_longitude,

                "distance_km":
                    round(
                        distance_km,
                        2,
                    ),

                "address":
                    build_address(
                        tags
                    ),

                "phone": (
                    tags.get("phone")
                    or
                    tags.get(
                        "contact:phone"
                    )
                ),

                "website": (
                    tags.get("website")
                    or
                    tags.get(
                        "contact:website"
                    )
                ),

                "opening_hours":
                    tags.get(
                        "opening_hours"
                    ),
            })


        places.sort(
            key=lambda place:
                place[
                    "distance_km"
                ]
        )


        places = (
            places[
                :safe_limit
            ]
        )


        grouped = {}


        for place in places:
            grouped.setdefault(
                place["category"],
                []
            ).append(place)


        return {
            "radius_m":
                safe_radius,

            "count":
                len(places),

            "places":
                places,

            "groups":
                grouped,

            "categories": [
                {
                    "id":
                        category,

                    "label":
                        config["label"],
                }

                for (
                    category,
                    config,
                )
                in
                PLACE_CATEGORIES.items()
            ],
        }


    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=(
                "Nearby places request "
                "timed out."
            ),
        )


    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to connect to "
                "the places service."
            ),
        )