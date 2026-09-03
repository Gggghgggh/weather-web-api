import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';

import {
  Cloud,
  LoaderCircle,
  MapPin,
  Navigation,
  Search,
  Wind,
} from 'lucide-react';


function RouteMapController({
  route,
}) {
  const map =
    useMap();


  useEffect(() => {
    if (
      !route?.geometry
        ?.coordinates
        ?.length
    ) {
      return;
    }


    const latLngs =
      route.geometry
        .coordinates
        .map(
          ([
            longitude,
            latitude,
          ]) => [
            latitude,
            longitude,
          ]
        );


    map.fitBounds(
      latLngs,
      {
        padding: [
          40,
          40,
        ],
      }
    );

  }, [
    map,
    route,
  ]);


  return null;
}


function RouteWeatherPanel() {
  const [
    fromQuery,
    setFromQuery,
  ] = useState(
    'Nairobi'
  );


  const [
    toQuery,
    setToQuery,
  ] = useState(
    'Nakuru'
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const [
    route,
    setRoute,
  ] = useState(null);


  const lastGeocodeTime =
    useRef(0);


  async function waitForGeocodeSlot() {
    const elapsed =
      Date.now()
      -
      lastGeocodeTime.current;


    if (elapsed < 1100) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1100 - elapsed
          )
      );
    }


    lastGeocodeTime.current =
      Date.now();
  }


  async function resolveLocation(
    query
  ) {
    await waitForGeocodeSlot();


    const params =
      new URLSearchParams({
        q:
          query.trim(),
      });


    const response =
      await fetch(
        `/api/locations/search?${params}`
      );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.detail ||
        `Unable to find ${query}.`
      );
    }


    const first =
      data.results?.[0];


    if (!first) {
      throw new Error(
        `No location found for "${query}".`
      );
    }


    return first;
  }


  async function handleRoute(
    event
  ) {
    event.preventDefault();


    if (
      fromQuery.trim().length <
      2
      ||
      toQuery.trim().length <
      2
    ) {
      setError(
        'Enter both locations.'
      );

      return;
    }


    setLoading(true);
    setError('');


    try {
      const fromLocation =
        await resolveLocation(
          fromQuery
        );


      const toLocation =
        await resolveLocation(
          toQuery
        );


      const response =
        await fetch(
          '/api/route-weather',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                from_latitude:
                  fromLocation
                    .latitude,

                from_longitude:
                  fromLocation
                    .longitude,

                to_latitude:
                  toLocation
                    .latitude,

                to_longitude:
                  toLocation
                    .longitude,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to calculate the route.'
        );
      }


      setRoute({
        ...data,

        from:
          fromLocation,

        to:
          toLocation,
      });

    } catch (
      requestError
    ) {
      setRoute(null);

      setError(
        requestError.message ||
        'Unable to calculate route.'
      );

    } finally {
      setLoading(false);
    }
  }


  const routePositions =
    route?.geometry
      ?.coordinates
      ?.map(
        ([
          longitude,
          latitude,
        ]) => [
          latitude,
          longitude,
        ]
      )
      || [];


  return (
    <section className="premium-card overflow-hidden rounded-3xl border">

      <div className="border-b p-5">

        <div>

          <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
            Journey intelligence
          </p>

          <h2 className="primary-text mt-1 text-lg font-semibold">
            Route weather
          </h2>

          <p className="secondary-text mt-1 text-xs">
            See conditions along your journey before you leave.
          </p>

        </div>


        <form
          onSubmit={
            handleRoute
          }
          className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"
        >

          <label className="search-box flex items-center rounded-2xl border px-3">

            <MapPin
              size={15}
              className="text-emerald-500"
            />

            <div className="ml-3 flex-1 py-2">

              <span className="secondary-text block text-[8px] font-semibold uppercase tracking-[0.12em]">
                From
              </span>

              <input
                value={
                  fromQuery
                }
                onChange={
                  (event) =>
                    setFromQuery(
                      event.target.value
                    )
                }
                className="primary-text mt-0.5 w-full bg-transparent text-xs outline-none"
                placeholder="Nairobi"
              />

            </div>

          </label>


          <label className="search-box flex items-center rounded-2xl border px-3">

            <Navigation
              size={15}
              className="text-sky-500"
            />

            <div className="ml-3 flex-1 py-2">

              <span className="secondary-text block text-[8px] font-semibold uppercase tracking-[0.12em]">
                To
              </span>

              <input
                value={
                  toQuery
                }
                onChange={
                  (event) =>
                    setToQuery(
                      event.target.value
                    )
                }
                className="primary-text mt-0.5 w-full bg-transparent text-xs outline-none"
                placeholder="Nakuru"
              />

            </div>

          </label>


          <button
            type="submit"
            disabled={
              loading
            }
            className="search-submit flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 text-xs font-semibold"
          >

            {loading ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <Search
                size={15}
              />
            )}

            Plan route

          </button>

        </form>


        {error && (
          <div className="error-banner mt-4 rounded-2xl border p-3 text-xs">
            {error}
          </div>
        )}


        {route && (
          <div className="mt-5 flex flex-wrap gap-3">

            <div className="meta-badge rounded-full border px-3 py-2 text-[10px]">
              {
                route.from.name
              }
              {' → '}
              {
                route.to.name
              }
            </div>

            <div className="meta-badge rounded-full border px-3 py-2 text-[10px]">
              {
                route.distance_km
              } km
            </div>

            <div className="meta-badge rounded-full border px-3 py-2 text-[10px]">
              Approx.{' '}
              {
                route.duration_minutes
              } min
            </div>

          </div>
        )}

      </div>


      <div className="h-[440px]">

        <MapContainer
          center={[
            -0.6,
            36.3,
          ]}
          zoom={7}
          className="h-full w-full"
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {routePositions.length >
            0 && (
              <Polyline
                positions={
                  routePositions
                }
                pathOptions={{
                  weight:
                    5,
                }}
              />
            )}


          {route?.weather_points
            ?.map(
              (
                point,
                index
              ) => (
                <CircleMarker
                  key={
                    `${point.latitude}-${point.longitude}-${index}`
                  }
                  center={[
                    point.latitude,
                    point.longitude,
                  ]}
                  radius={7}
                  pathOptions={{
                    weight:
                      3,
                  }}
                />
              )
            )}


          <RouteMapController
            route={
              route
            }
          />

        </MapContainer>

      </div>


      {route
        ?.weather_points
        ?.length > 0 && (
          <div className="border-t p-5">

            <h3 className="primary-text text-sm font-semibold">
              Conditions along the route
            </h3>


            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

              {route.weather_points.map(
                (
                  point,
                  index
                ) => {
                  const weather =
                    point.weather;


                  return (
                    <div
                      key={
                        index
                      }
                      className="weather-stat rounded-2xl border p-3"
                    >

                      <p className="secondary-text text-[8px] uppercase tracking-[0.12em]">
                        {index === 0
                          ? 'Start'
                          : index ===
                              route
                                .weather_points
                                .length -
                                1
                            ? 'Destination'
                            : `Point ${index + 1}`
                        }
                      </p>


                      {point.available &&
                      weather ? (
                        <>

                          <div className="primary-text mt-3 text-2xl font-semibold">
                            {
                              Math.round(
                                weather.temperature
                              )
                            }°
                          </div>

                          <p className="secondary-text mt-1 text-[9px] capitalize">
                            {
                              weather.description
                            }
                          </p>


                          <div className="secondary-text mt-3 space-y-1 text-[8px]">

                            <p className="flex items-center gap-1">
                              <Wind
                                size={9}
                              />
                              {
                                weather.wind_speed
                              } m/s
                            </p>

                            <p className="flex items-center gap-1">
                              <Cloud
                                size={9}
                              />
                              {
                                weather.cloudiness
                              }% clouds
                            </p>

                          </div>

                        </>
                      ) : (
                        <p className="secondary-text mt-3 text-[9px]">
                          Conditions unavailable.
                        </p>
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>
        )}

    </section>
  );
}


export default RouteWeatherPanel;