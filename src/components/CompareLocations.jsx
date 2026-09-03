import {
  useState,
} from 'react';

import {
  Cloud,
  Droplets,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  Trash2,
  Wind,
} from 'lucide-react';


function CompareLocations() {
  const [
    query,
    setQuery,
  ] = useState('');


  const [
    results,
    setResults,
  ] = useState([]);


  const [
    locations,
    setLocations,
  ] = useState([]);


  const [
    searching,
    setSearching,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  async function searchLocation(
    event
  ) {
    event.preventDefault();


    if (
      query.trim().length <
      2
    ) {
      return;
    }


    setSearching(true);
    setError('');


    try {
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
          'Search failed.'
        );
      }


      setResults(
        data.results || []
      );

    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );

    } finally {
      setSearching(false);
    }
  }


  async function addLocation(
    result
  ) {
    if (
      locations.length >=
      3
    ) {
      return;
    }


    const alreadyExists =
      locations.some(
        (location) =>
          Math.abs(
            location.latitude -
            result.latitude
          ) < 0.00001
          &&
          Math.abs(
            location.longitude -
            result.longitude
          ) < 0.00001
      );


    if (alreadyExists) {
      setResults([]);
      setQuery('');
      return;
    }


    setLoading(true);
    setError('');


    try {
      const params =
        new URLSearchParams({
          lat:
            result.latitude
              .toString(),

          lon:
            result.longitude
              .toString(),
        });


      const response =
        await fetch(
          `/api/weather?${params}`
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Weather unavailable.'
        );
      }


      setLocations(
        (current) => [
          ...current,
          {
            ...result,

            weather:
              data.current,

            forecast:
              data.daily || [],
          },
        ]
      );


      setQuery('');
      setResults([]);

    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );

    } finally {
      setLoading(false);
    }
  }


  function removeLocation(
    index
  ) {
    setLocations(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !==
            index
        )
    );
  }


  return (
    <section className="premium-card rounded-3xl border p-5">

      <div>

        <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
          Side by side
        </p>

        <h2 className="primary-text mt-1 text-lg font-semibold">
          Compare locations
        </h2>

        <p className="secondary-text mt-1 text-xs">
          Compare current conditions across up to three places.
        </p>

      </div>


      {locations.length <
        3 && (
          <div className="relative z-[1000] mt-5 max-w-xl">

            <form
              onSubmit={
                searchLocation
              }
              className="search-box flex rounded-2xl border p-1"
            >

              <Search
                size={15}
                className="secondary-text ml-3 mt-3"
              />

              <input
                value={
                  query
                }
                onChange={
                  (event) =>
                    setQuery(
                      event
                        .target
                        .value
                    )
                }
                placeholder="Add Nairobi, Mombasa, Nakuru…"
                className="primary-text min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none"
              />

              <button
                type="submit"
                className="search-submit rounded-xl px-4 text-xs font-semibold"
              >
                {searching ? (
                  <LoaderCircle
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  'Find'
                )}
              </button>

            </form>


            {results.length > 0 && (
              <div className="search-dropdown absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border shadow-xl">

                {results.map(
                  (
                    result,
                    index
                  ) => (
                    <button
                      key={
                        `${result.latitude}-${result.longitude}-${index}`
                      }
                      type="button"
                      onClick={() =>
                        addLocation(
                          result
                        )
                      }
                      className="search-result flex w-full items-start gap-3 border-b p-3 text-left last:border-0"
                    >

                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-sky-500"
                      />

                      <div>
                        <p className="primary-text text-xs font-semibold">
                          {
                            result.name
                          }
                        </p>

                        <p className="secondary-text mt-1 line-clamp-1 text-[9px]">
                          {
                            result.display_name
                          }
                        </p>
                      </div>

                    </button>
                  )
                )}

              </div>
            )}

          </div>
        )}


      {loading && (
        <div className="mt-4 flex items-center gap-2">

          <LoaderCircle
            size={14}
            className="animate-spin text-sky-500"
          />

          <span className="secondary-text text-[10px]">
            Loading conditions…
          </span>

        </div>
      )}


      {error && (
        <p className="mt-4 text-xs text-red-500">
          {error}
        </p>
      )}


      {locations.length ===
        0 ? (
          <div className="empty-state mt-5 rounded-2xl border p-5">

            <p className="primary-text text-xs font-semibold">
              Add your first location
            </p>

            <p className="secondary-text mt-1 text-[10px]">
              You can compare two or three locations side by side.
            </p>

          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">

            {locations.map(
              (
                location,
                index
              ) => {
                const weather =
                  location.weather;


                return (
                  <article
                    key={
                      `${location.latitude}-${location.longitude}`
                    }
                    className="weather-stat rounded-3xl border p-5"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="secondary-text text-[9px] uppercase tracking-[0.12em]">
                          Location
                        </p>

                        <h3 className="primary-text mt-1 text-sm font-semibold">
                          {
                            location.name
                          }
                        </h3>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          removeLocation(
                            index
                          )
                        }
                        className="secondary-text rounded-xl border p-2"
                      >
                        <Trash2
                          size={13}
                        />
                      </button>

                    </div>


                    <div className="mt-5 flex items-center justify-between">

                      <div className="primary-text text-4xl font-semibold">
                        {
                          weather
                            ?.temperature !=
                          null
                            ? `${Math.round(
                                weather.temperature
                              )}°`
                            : '—'
                        }
                      </div>


                      {weather?.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                          alt=""
                          className="h-14 w-14"
                        />
                      )}

                    </div>


                    <p className="primary-text mt-2 text-xs font-semibold capitalize">
                      {
                        weather
                          ?.description ||
                        'Current conditions'
                      }
                    </p>


                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between">

                        <span className="secondary-text flex items-center gap-2 text-[10px]">
                          <Droplets
                            size={12}
                          />
                          Humidity
                        </span>

                        <strong className="primary-text text-[10px]">
                          {
                            weather
                              ?.humidity ??
                            '—'
                          }%
                        </strong>

                      </div>


                      <div className="flex items-center justify-between">

                        <span className="secondary-text flex items-center gap-2 text-[10px]">
                          <Wind
                            size={12}
                          />
                          Wind
                        </span>

                        <strong className="primary-text text-[10px]">
                          {
                            weather
                              ?.wind_speed !=
                            null
                              ? `${weather.wind_speed} m/s`
                              : '—'
                          }
                        </strong>

                      </div>


                      <div className="flex items-center justify-between">

                        <span className="secondary-text flex items-center gap-2 text-[10px]">
                          <Cloud
                            size={12}
                          />
                          Clouds
                        </span>

                        <strong className="primary-text text-[10px]">
                          {
                            weather
                              ?.cloudiness ??
                            '—'
                          }%
                        </strong>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

    </section>
  );
}


export default CompareLocations;