import { useEffect, useState } from 'react';
import { Moon, Search, Sun, X } from 'lucide-react';

import WeatherMap from './components/WeatherMap';


function WeatherStat({ label, value }) {
  return (
    <div className="weather-stat rounded-xl p-3">
      <p className="secondary-text text-xs">
        {label}
      </p>

      <p className="primary-text mt-1 text-sm font-semibold">
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
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme =
      localStorage.getItem('angamaps-theme');

    if (savedTheme === 'dark') {
      return true;
    }

    if (savedTheme === 'light') {
      return false;
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  });

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
    const root =
      document.documentElement;

    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);


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


  function toggleTheme() {
    setDarkMode((currentMode) => {
      const nextMode =
        !currentMode;

      localStorage.setItem(
        'angamaps-theme',
        nextMode
          ? 'dark'
          : 'light'
      );

      return nextMode;
    });
  }


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
          // Use fallback.
        }

        throw new Error(
          errorMessage
        );
      }

      const data =
        await response.json();

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
          // Use fallback.
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
      return 'bg-emerald-500';
    }

    if (
      apiStatus ===
      'Checking...'
    ) {
      return 'bg-amber-500';
    }

    return 'bg-red-500';
  }


  const locationHierarchy =
    buildLocationHierarchy(place);


  return (
    <main className="app-shell min-h-screen">
      <nav className="app-navbar relative z-[5000] border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <h1 className="primary-text text-xl font-bold tracking-tight">
              AngaMaps
            </h1>

            <p className="secondary-text text-xs">
              Weather Intelligence
            </p>
          </div>

          <div className="relative z-[6000] w-full lg:mx-auto lg:max-w-xl">
            <form
              onSubmit={handleSearch}
              className="search-box flex items-center rounded-2xl border p-1"
            >
              <div className="secondary-text ml-3">
                <Search
                  size={19}
                  strokeWidth={2}
                />
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
                className="search-input min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                  className="icon-button flex h-9 w-9 items-center justify-center rounded-xl"
                >
                  <X
                    size={17}
                    strokeWidth={2}
                  />
                </button>
              )}

              <button
                type="submit"
                disabled={
                  searchLoading
                }
                className="search-submit ml-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="search-dropdown absolute left-0 right-0 top-[calc(100%+8px)] z-[7000] max-h-[420px] overflow-y-auto overflow-x-hidden rounded-2xl border shadow-2xl">
                {searchError && (
                  <div className="p-4 text-sm text-red-500">
                    {searchError}
                  </div>
                )}

                {!searchError &&
                  hasSearched &&
                  !searchLoading &&
                  searchResults.length ===
                    0 && (
                    <div className="p-4">
                      <p className="primary-text text-sm font-medium">
                        No places found
                      </p>

                      <p className="secondary-text mt-1 text-xs">
                        Try adding the town,
                        county or country.
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
                      className="search-result block w-full border-b px-4 py-3 text-left transition last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="primary-text truncate text-sm font-semibold">
                            {
                              result.name
                            }
                          </p>

                          <p className="secondary-text mt-1 line-clamp-2 text-xs leading-5">
                            {buildSearchResultSubtitle(
                              result
                            )}
                          </p>
                        </div>

                        <span className="place-badge shrink-0 rounded-lg border px-2 py-1 text-[10px] font-medium">
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
                  <div className="search-attribution border-t px-4 py-2 text-[10px]">
                    Search data ©
                    OpenStreetMap contributors
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                darkMode
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                darkMode
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="theme-toggle flex h-10 w-10 items-center justify-center rounded-xl border transition"
            >
              {darkMode ? (
                <Sun
                  size={19}
                  strokeWidth={2}
                />
              ) : (
                <Moon
                  size={19}
                  strokeWidth={2}
                />
              )}
            </button>

            <div className="secondary-text flex items-center gap-2 text-sm">
              <span
                className={
                  'h-2 w-2 rounded-full ' +
                  getStatusColor()
                }
              />

              <span>
                {apiStatus}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="sidebar-card rounded-3xl border p-6">
          <p className="secondary-text text-xs font-semibold uppercase tracking-[0.2em]">
            Selected Location
          </p>

          {!selectedLocation && (
            <div className="empty-card mt-5 rounded-2xl border border-dashed p-5">
              <p className="secondary-text text-sm leading-6">
                Search for a place
                above or click
                anywhere on the map.
              </p>
            </div>
          )}

          {selectedLocation && (
            <div className="mt-5 space-y-4">
              {place && (
                <div className="content-card rounded-2xl border p-5">
                  <p className="secondary-text text-xs font-medium uppercase tracking-[0.15em]">
                    Location
                  </p>

                  <h2 className="primary-text mt-2 text-2xl font-semibold tracking-tight">
                    {place.name ||
                      'Selected location'}
                  </h2>

                  {locationHierarchy && (
                    <p className="secondary-text mt-2 text-sm leading-6">
                      {
                        locationHierarchy
                      }
                    </p>
                  )}

                  {place.type && (
                    <div className="mt-3">
                      <span className="place-badge inline-flex rounded-lg border px-2 py-1 text-xs capitalize">
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
                      <div className="section-divider mt-4 border-t pt-3">
                        <p className="secondary-text text-xs">
                          Road
                        </p>

                        <p className="primary-text mt-1 text-sm">
                          {
                            place.road
                          }
                        </p>
                      </div>
                    )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="weather-stat rounded-xl p-3">
                  <p className="secondary-text text-xs">
                    Latitude
                  </p>

                  <p className="primary-text mt-1 text-sm font-semibold">
                    {selectedLocation.latitude.toFixed(
                      5
                    )}
                  </p>
                </div>

                <div className="weather-stat rounded-xl p-3">
                  <p className="secondary-text text-xs">
                    Longitude
                  </p>

                  <p className="primary-text mt-1 text-sm font-semibold">
                    {selectedLocation.longitude.toFixed(
                      5
                    )}
                  </p>
                </div>
              </div>

              {weatherLoading && (
                <div className="content-card rounded-2xl border p-5">
                  <div className="flex items-center gap-3">
                    <div className="loading-spinner h-5 w-5 animate-spin rounded-full border-2" />

                    <div>
                      <p className="primary-text text-sm font-medium">
                        Loading weather
                      </p>

                      <p className="secondary-text mt-1 text-xs">
                        Retrieving current
                        conditions...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {weatherError &&
                !weatherLoading && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm font-semibold text-red-500">
                      Information unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-500">
                      {
                        weatherError
                      }
                    </p>
                  </div>
                )}

              {weather &&
                !weatherLoading && (
                  <div className="content-card rounded-2xl border p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="secondary-text text-xs font-medium uppercase tracking-[0.15em]">
                          Current Weather
                        </p>

                        <p className="primary-text mt-3 text-4xl font-semibold tracking-tight">
                          {formatTemperature(
                            weather.temperature
                          )}
                        </p>

                        <p className="secondary-text mt-2 text-sm capitalize">
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

        <div className="map-wrapper relative z-0 overflow-hidden rounded-3xl border shadow-2xl">
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