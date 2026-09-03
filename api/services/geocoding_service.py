import httpx
from fastapi import HTTPException


NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "User-Agent": "AngaMaps/1.0"
}


def get_best_location_name(address: dict):
    """
    Find the most specific useful location name
    returned by OpenStreetMap Nominatim.
    """

    location_fields = [
        ("amenity", "place"),
        ("building", "building"),
        ("tourism", "place"),
        ("leisure", "place"),
        ("shop", "place"),
        ("office", "place"),
        ("historic", "place"),
        ("neighbourhood", "neighbourhood"),
        ("quarter", "quarter"),
        ("suburb", "suburb"),
        ("hamlet", "hamlet"),
        ("village", "village"),
        ("town", "town"),
        ("municipality", "municipality"),
        ("city", "city"),
    ]

    for field, location_type in location_fields:
        value = address.get(field)

        if value:
            return {
                "name": value,
                "type": location_type,
            }

    return {
        "name": "Selected location",
        "type": "unknown",
    }


def get_search_result_name(result: dict):
    """
    Determine a clean title for a Nominatim search result.
    """

    namedetails = result.get("namedetails", {})

    name = (
        namedetails.get("name")
        or namedetails.get("name:en")
        or result.get("name")
    )

    if name:
        return name

    display_name = result.get("display_name")

    if display_name:
        return display_name.split(",")[0].strip()

    return "Unnamed location"


async def search_locations(
    query: str,
    limit: int = 5,
):
    """
    Search OpenStreetMap for towns, estates,
    landmarks, schools, hospitals and other places.
    """

    clean_query = query.strip()

    if len(clean_query) < 2:
        return []

    safe_limit = max(1, min(limit, 8))

    params = {
        "q": clean_query,
        "format": "jsonv2",
        "addressdetails": 1,
        "namedetails": 1,
        "limit": safe_limit,
        "accept-language": "en",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                NOMINATIM_SEARCH_URL,
                params=params,
                headers=HEADERS,
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail="Unable to search for locations.",
            )

        data = response.json()

        results = []

        for item in data:
            try:
                latitude = float(item.get("lat"))
                longitude = float(item.get("lon"))
            except (TypeError, ValueError):
                continue

            address = item.get("address", {})

            results.append(
                {
                    "name": get_search_result_name(item),

                    "display_name": item.get("display_name"),

                    "latitude": latitude,
                    "longitude": longitude,

                    "category": item.get("category"),
                    "type": item.get("type"),

                    "importance": item.get("importance"),

                    "road": address.get("road"),
                    "neighbourhood": address.get("neighbourhood"),
                    "quarter": address.get("quarter"),
                    "suburb": address.get("suburb"),

                    "hamlet": address.get("hamlet"),
                    "village": address.get("village"),
                    "town": address.get("town"),
                    "municipality": address.get("municipality"),
                    "city": address.get("city"),

                    "county": address.get("county"),
                    "state": address.get("state"),

                    "country": address.get("country"),
                    "country_code": address.get("country_code"),

                    "postcode": address.get("postcode"),

                    "osm_type": item.get("osm_type"),
                    "osm_id": item.get("osm_id"),
                }
            )

        return results

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Location search timed out.",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the location search service.",
        )


async def reverse_geocode(
    latitude: float,
    longitude: float,
):
    """
    Convert coordinates into detailed
    OpenStreetMap location information.
    """

    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "jsonv2",
        "addressdetails": 1,
        "zoom": 18,
        "layer": "address",
        "accept-language": "en",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                NOMINATIM_REVERSE_URL,
                params=params,
                headers=HEADERS,
            )

        if response.status_code == 404:
            return {
                "name": "Selected location",
                "type": "unknown",
                "latitude": latitude,
                "longitude": longitude,
            }

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail="Unable to retrieve location information.",
            )

        data = response.json()

        address = data.get("address", {})

        best_location = get_best_location_name(address)

        return {
            "name": best_location["name"],
            "type": best_location["type"],

            "house_number": address.get("house_number"),
            "road": address.get("road"),

            "neighbourhood": address.get("neighbourhood"),
            "quarter": address.get("quarter"),
            "suburb": address.get("suburb"),

            "hamlet": address.get("hamlet"),
            "village": address.get("village"),
            "town": address.get("town"),
            "municipality": address.get("municipality"),
            "city": address.get("city"),

            "county": address.get("county"),
            "state": address.get("state"),

            "postcode": address.get("postcode"),

            "country": address.get("country"),
            "country_code": address.get("country_code"),

            "display_name": data.get("display_name"),

            "latitude": latitude,
            "longitude": longitude,

            "osm_type": data.get("osm_type"),
            "osm_id": data.get("osm_id"),

            "category": data.get("category"),
            "place_type": data.get("type"),
            "place_rank": data.get("place_rank"),
            "importance": data.get("importance"),
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Location lookup timed out.",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to the location service.",
        )
