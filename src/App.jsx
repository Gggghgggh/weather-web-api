import { useEffect, useState } from 'react';
import WeatherMap from './components/WeatherMap';

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function WeatherStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function buildLocationHierarchy(place) {
  if (!place) {
    return '';
  }

  const possibleLocations = [
    place.neighbourhood,
    place.quarter,
    place.suburb,
    place.hamlet,
    place.village,
    place.town,
    place.municipality,
    place.city,
    place.county,
    place.state,
    place.country,
  ];

  const locations = [];

  possibleLocations.forEach((location) => {
    if (
      location &&
      location !== place.name &&
      !locations.includes(location)
    ) {
      locations.push(location);
    }
  });

  return locations.join(', ');
}

function buildSearchResultSubtitle(result) {
  const locations = [
    result.suburb,
    result.village,
    result.town,
    result.city,
    result.county,
    result.state,
    result.country,
  ];

  const uniqueLocations = [];

  locations.forEach((value) => {
    if (
      value &&
      value !== result.name &&
      !uniqueLocations.includes(value)
    ) {
      uniqueLocations.push(value);
    }
  });

  if (uniqueLocations.length > 0) {
    return uniqueLocations.join(', ');
  }

  return result.display_name || '';
}

function getPlaceType(result) {
  if (!result) {
    return '';
  }

  const type =
    result.type ||
    result.category;

  if (!type) {
    return 'Place';
  }

  return type
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatTemperature(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return Math.round(value) + '°C';
}

function formatHumidity(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return value + '%';
}

function formatWind(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return value + ' m/s';
}

function formatPressure(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return value + ' hPa';
}

function formatCloudiness(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return value + '%';
}

function formatVisibility(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return (value / 1000).toFixed(1) + ' km';
}

function getWeatherIconUrl(icon) {
  if (!icon) {
    return '';
  }

  return (
    'https://openweathermap.org/img/wn/' +
    icon +
    '@2x.png'
  );
}

function App() {
  const [apiStatus, setApiStatus] =
    useState('Checking...');

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(null);

  const [place, setPlace] =
    useState(null);

  const [weather, setWeather] =
    useState(null);

  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(false);

  const [
    weatherError,
    setWeatherError,
  ] = useState('');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState('');

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  useEffect(() => {
    async function checkApi() {
      try {
        const response =
          await fetch('/api/health');

        if (!response.ok) {
          throw new Error(
            'API unavailable'
          );
        }

        const data =
          await response.json();

        if (data.status === 'ok') {
          setApiStatus(
            'API Connected'
          );
        } else {
          setApiStatus(
            'API unavailable'
          );
        }
      } catch (error) {
        console.error(
          'API health check failed:',
          error
        );

        setApiStatus(
          'API unavailable'
        );
      }
    }

    checkApi();
  }, []);

  async function loadWeather(location) {
    setWeather(null);
    setWeatherError('');
    setWeatherLoading(true);

    try {
      const url =
        '/api/weather/current?lat=' +
        encodeURIComponent(
          location.latitude
        ) +
        '&lon=' +
        encodeURIComponent(
          location.longitude
        );

      const response =
        await fetch(url);

      if (!response.ok) {
        let errorMessage =
          'Unable to retrieve weather information.';

        try {
          const errorData =
            await response.json();

          if (
            errorData &&
            errorData.detail
          ) {
            errorMessage =
              errorData.detail;
          }
        } catch {
          // Keep fallback.
        }

        throw new Error(
          errorMessage
        );
      }

      const data =
        await response.json();

      console.log(
        'AngaMaps weather response:',
        data
      );

      if (!data.weather) {
        throw new Error(
          'Weather information was not returned.'
        );
      }

      setPlace(
        data.location || null
      );

      setWeather(
        data.weather
      );
    } catch (error) {
      console.error(
        'Weather request failed:',
        error
      );

      if (error instanceof Error) {
        setWeatherError(
          error.message
        );
      } else {
        setWeatherError(
          'Unable to retrieve weather information.'
        );
      }
    } finally {
      setWeatherLoading(false);
    }
  }

  async function handleLocationSelect(
    location
  ) {
    setSelectedLocation(
      location
    );

    await loadWeather(
      location
    );
  }

  async function handleSearch(event) {
    event.preventDefault();

    const query =
      searchQuery.trim();

    if (query.length < 2) {
      setSearchError(
        'Enter at least 2 characters.'
      );

      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(true);

    try {
      const response = await fetch(
        '/api/locations/search?q=' +
          encodeURIComponent(
            query
          )
      );

      if (!response.ok) {
        let errorMessage =
          'Unable to search for locations.';

        try {
          const errorData =
            await response.json();

          if (
            errorData &&
            errorData.detail
          ) {
            errorMessage =
              errorData.detail;
          }
        } catch {
          // Keep fallback.
        }

        throw new Error(
          errorMessage
        );
      }

      const data =
        await response.json();

      setSearchResults(
        Array.isArray(
          data.results
        )
          ? data.results
          : []
      );
    } catch (error) {
      console.error(
        'Location search failed:',
        error
      );

      if (error instanceof Error) {
        setSearchError(
          error.message
        );
      } else {
        setSearchError(
          'Unable to search for locations.'
        );
      }
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSearchResultSelect(
    result
  ) {
    const location = {
      latitude:
        result.latitude,
      longitude:
        result.longitude,
    };

    setSelectedLocation(
      location
    );

    setPlace({
      ...result,
      name:
        result.name ||
        'Selected location',
    });

    setSearchQuery(
      result.name || ''
    );

    setSearchResults([]);
    setHasSearched(false);
    setSearchError('');

    await loadWeather(
      location
    );
  }

  function clearSearch() {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setHasSearched(false);
  }

  function getStatusColor() {
    if (
      apiStatus ===
      'API Connected'
    ) {
      return 'bg-emerald-400';
    }

    if (
      apiStatus ===
      'Checking...'
    ) {
      return 'bg-amber-400';
    }

    return 'bg-red-400';
  }

  const locationHierarchy =
    buildLocationHierarchy(place);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="relative z-[5000] border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <h1 className="text-xl font-bold tracking-tight">
              AngaMaps
            </h1>

            <p className="text-xs text-slate-500">
              Weather Intelligence
            </p>
          </div>
          <div className="relative z-[6000] w-full lg:mx-auto lg:max-w-xl">
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-2xl border border-white/10 bg-slate-900 p-1"
            >
              <div className="ml-3 text-slate-500">
                <SearchIcon />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(
                    event.target.value
                  );

                  if (searchError) {
                    setSearchError('');
                  }
                }}
                placeholder="Search towns, estates, schools, hospitals..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  Clear
                </button>
              )}

              <button
                type="submit"
                disabled={
                  searchLoading
                }
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searchLoading
                  ? 'Searching...'
                  : 'Search'}
              </button>
            </form>

            {(searchResults.length >
              0 ||
              searchError ||
              (
                hasSearched &&
                !searchLoading &&
                searchResults.length ===
                  0
              )) && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[7000] max-h-[420px] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
                {searchError && (
                  <div className="p-4 text-sm text-red-300">
                    {searchError}
                  </div>
                )}

                {!searchError &&
                  hasSearched &&
                  !searchLoading &&
                  searchResults.length ===
                    0 && (
                    <div className="p-4">
                      <p className="text-sm font-medium text-white">
                        No places
                        found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try adding
                        the town,
                        county or
                        country.
                      </p>
                    </div>
                  )}

                {searchResults.map(
                  (result) => (
                    <button
                      type="button"
                      key={
                        String(
                          result.osm_type
                        ) +
                        '-' +
                        String(
                          result.osm_id
                        ) +
                        '-' +
                        String(
                          result.latitude
                        )
                      }
                      onClick={() =>
                        handleSearchResultSelect(
                          result
                        )
                      }
                      className="block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {
                              result.name
                            }
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {buildSearchResultSubtitle(
                              result
                            )}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400">
                          {getPlaceType(
                            result
                          )}
                        </span>
                      </div>
                    </button>
                  )
                )}

                {searchResults.length >
                  0 && (
                  <div className="border-t border-white/10 px-4 py-2 text-[10px] text-slate-600">
                    Search data ©
                    OpenStreetMap
                    contributors
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 text-sm text-slate-400">
            <span
              className={
                'h-2 w-2 rounded-full ' +
                getStatusColor()
              }
            />

            {apiStatus}
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Selected Location
          </p>

          {!selectedLocation && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5">
              <p className="text-sm leading-6 text-slate-400">
                Search for a place
                above or click
                anywhere on the
                map.
              </p>
            </div>
          )}

          {selectedLocation && (
            <div className="mt-5 space-y-4">
              {place && (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                    Location
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {place.name ||
                      'Selected location'}
                  </h2>

                  {locationHierarchy && (
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {
                        locationHierarchy
                      }
                    </p>
                  )}

                  {place.type && (
                    <div className="mt-3">
                      <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs capitalize text-slate-400">
                        {String(
                          place.type
                        ).replaceAll(
                          '_',
                          ' '
                        )}
                      </span>
                    </div>
                  )}

                  {place.road &&
                    place.road !==
                      place.name && (
                      <div className="mt-4 border-t border-white/10 pt-3">
                        <p className="text-xs text-slate-500">
                          Road
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {
                            place.road
                          }
                        </p>
                      </div>
                    )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-500">
                    Latitude
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedLocation.latitude.toFixed(
                      5
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-500">
                    Longitude
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedLocation.longitude.toFixed(
                      5
                    )}
                  </p>
                </div>
              </div>

              {weatherLoading && (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

                    <div>
                      <p className="text-sm font-medium text-white">
                        Loading
                        weather
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Retrieving
                        current
                        conditions...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {weatherError &&
                !weatherLoading && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm font-semibold text-red-300">
                      Information
                      unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-200">
                      {
                        weatherError
                      }
                    </p>
                  </div>
                )}

              {weather &&
                !weatherLoading && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                          Current
                          Weather
                        </p>

                        <p className="mt-3 text-4xl font-semibold tracking-tight">
                          {formatTemperature(
                            weather.temperature
                          )}
                        </p>

                        <p className="mt-2 text-sm capitalize text-slate-400">
                          {weather.description ||
                            weather.condition ||
                            'Weather unavailable'}
                        </p>
                      </div>

                      {weather.icon && (
                        <img
                          src={getWeatherIconUrl(
                            weather.icon
                          )}
                          alt={
                            weather.description ||
                            'Current weather'
                          }
                          className="h-20 w-20"
                        />
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <WeatherStat
                        label="Feels like"
                        value={formatTemperature(
                          weather.feels_like
                        )}
                      />

                      <WeatherStat
                        label="Humidity"
                        value={formatHumidity(
                          weather.humidity
                        )}
                      />

                      <WeatherStat
                        label="Wind speed"
                        value={formatWind(
                          weather.wind_speed
                        )}
                      />

                      <WeatherStat
                        label="Pressure"
                        value={formatPressure(
                          weather.pressure
                        )}
                      />

                      <WeatherStat
                        label="Cloudiness"
                        value={formatCloudiness(
                          weather.cloudiness
                        )}
                      />

                      <WeatherStat
                        label="Visibility"
                        value={formatVisibility(
                          weather.visibility
                        )}
                      />
                    </div>
                  </div>
                )}
            </div>
          )}
        </aside>  
        <div className="relative z-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="h-[calc(100vh-150px)] min-h-[600px]">
            <WeatherMap
              selectedLocation={
                selectedLocation
              }
              onLocationSelect={
                handleLocationSelect
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;