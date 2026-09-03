import {
  useEffect,
  useState,
} from 'react';

import {
  Cloud,
  Droplets,
  Eye,
  Gauge,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Moon,
  Navigation,
  Search,
  Sparkles,
  Sun,
  Wind,
  X,
} from 'lucide-react';

import ForecastPanel from './components/ForecastPanel.jsx';
import WeatherMap from './components/WeatherMap.jsx';


function WeatherStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="weather-stat group rounded-2xl border p-4 transition duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 transition group-hover:bg-sky-500/15">
          <Icon
            size={16}
            strokeWidth={2}
          />
        </div>

        <span className="secondary-text text-[10px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="primary-text mt-4 text-lg font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}


function buildLocationHierarchy(place) {
  if (!place) {
    return '';
  }

  const values = [
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
  ].filter(Boolean);

  return [
    ...new Set(values),
  ].join(', ');
}


function buildSearchResultSubtitle(result) {
  const parts = [
    result.neighbourhood,
    result.suburb,
    result.village,
    result.town,
    result.city,
    result.county,
    result.state,
    result.country,
  ].filter(Boolean);

  return [
    ...new Set(parts),
  ]
    .filter(
      (value) =>
        value !== result.name
    )
    .slice(0, 4)
    .join(', ');
}


function getPlaceType(place) {
  if (!place) {
    return 'Location';
  }

  const value =
    place.type ||
    place.place_type ||
    place.category;

  if (!value) {
    return 'Location';
  }

  return value
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


function formatTemperature(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '--';
  }

  return `${Math.round(value)}°`;
}


function formatValue(
  value,
  suffix = ''
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '--';
  }

  return `${value}${suffix}`;
}


function getWeatherIconUrl(icon) {
  if (!icon) {
    return null;
  }

  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}


function App() {
  const [
    darkMode,
    setDarkMode,
  ] = useState(() => {
    const storedTheme =
      localStorage.getItem(
        'angamaps-theme'
      );

    if (storedTheme) {
      return (
        storedTheme === 'dark'
      );
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
  });


  const [
    apiStatus,
    setApiStatus,
  ] = useState('checking');

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(null);

  const [
    place,
    setPlace,
  ] = useState(null);

  const [
    weather,
    setWeather,
  ] = useState(null);

  const [
    hourly,
    setHourly,
  ] = useState([]);

  const [
    daily,
    setDaily,
  ] = useState([]);

  const [
    weatherLoading,
    setWeatherLoading,
  ] = useState(false);

  const [
    weatherError,
    setWeatherError,
  ] = useState('');

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('');

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

  const [
    geolocationLoading,
    setGeolocationLoading,
  ] = useState(false);

  const [
    geolocationError,
    setGeolocationError,
  ] = useState('');


  useEffect(() => {
    const root =
      document.documentElement;

    if (darkMode) {
      root.classList.add(
        'dark'
      );

      localStorage.setItem(
        'angamaps-theme',
        'dark'
      );
    } else {
      root.classList.remove(
        'dark'
      );

      localStorage.setItem(
        'angamaps-theme',
        'light'
      );
    }
  }, [darkMode]);


  useEffect(() => {
    async function checkApi() {
      try {
        const response =
          await fetch(
            '/api/health'
          );

        if (!response.ok) {
          throw new Error();
        }

        setApiStatus(
          'connected'
        );
      } catch {
        setApiStatus(
          'disconnected'
        );
      }
    }

    checkApi();
  }, []);


  async function loadWeather(
    location,
    preferredPlace = null
  ) {
    setWeatherLoading(true);
    setWeatherError('');

    try {
      const params =
        new URLSearchParams({
          lat: String(
            location.latitude
          ),

          lon: String(
            location.longitude
          ),
        });

      const response =
        await fetch(
          `/api/weather?${params.toString()}`
        );

      if (!response.ok) {
        let message =
          'Unable to retrieve weather information.';

        try {
          const data =
            await response.json();

          if (data.detail) {
            message =
              data.detail;
          }
        } catch {
          // Keep fallback message.
        }

        throw new Error(
          message
        );
      }

      const data =
        await response.json();

      if (preferredPlace) {
        setPlace({
          ...data.location,
          ...preferredPlace,

          name:
            preferredPlace.name ||
            data.location?.name,
        });
      } else {
        setPlace(
          data.location ||
          null
        );
      }

      setWeather(
        data.current ||
        null
      );

      setHourly(
        data.hourly ||
        []
      );

      setDaily(
        data.daily ||
        []
      );

    } catch (error) {
      console.error(
        'Weather request failed:',
        error
      );

      setWeather(null);
      setHourly([]);
      setDaily([]);

      setWeatherError(
        error.message ||
        'Unable to retrieve weather information.'
      );

    } finally {
      setWeatherLoading(
        false
      );
    }
  }


  async function handleLocationSelect(
    location
  ) {
    setSelectedLocation(
      location
    );

    setGeolocationError('');

    await loadWeather(
      location
    );
  }


  async function handleSearch(
    event
  ) {
    event.preventDefault();

    const query =
      searchQuery.trim();

    if (query.length < 2) {
      setSearchError(
        'Enter at least two characters.'
      );

      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(true);

    try {
      const params =
        new URLSearchParams({
          q: query,
        });

      const response =
        await fetch(
          `/api/locations/search?${params.toString()}`
        );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        await response.json();

      setSearchResults(
        data.results ||
        []
      );

    } catch {
      setSearchError(
        'Unable to search locations. Please try again.'
      );

    } finally {
      setSearchLoading(
        false
      );
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

    setSearchQuery(
      result.name
    );

    setSearchResults([]);
    setSearchError('');
    setHasSearched(false);
    setGeolocationError('');

    await loadWeather(
      location,
      result
    );
  }


  function clearSearch() {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setHasSearched(false);
  }


  function handleUseMyLocation() {
    setGeolocationError('');

    if (
      !navigator.geolocation
    ) {
      setGeolocationError(
        'Geolocation is not supported by this browser.'
      );

      return;
    }

    setGeolocationLoading(
      true
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        setSelectedLocation(
          location
        );

        setSearchQuery('');
        setSearchResults([]);
        setSearchError('');
        setHasSearched(false);

        try {
          await loadWeather(
            location
          );
        } finally {
          setGeolocationLoading(
            false
          );
        }
      },

      (error) => {
        setGeolocationLoading(
          false
        );

        switch (error.code) {
          case 1:
            setGeolocationError(
              'Location permission was denied. Allow AngaMaps to access your location in your browser settings, then try again.'
            );
            break;

          case 2:
            setGeolocationError(
              'Your current location is unavailable. Make sure location services are enabled and try again.'
            );
            break;

          case 3:
            setGeolocationError(
              'Finding your location took too long. Please try again.'
            );
            break;

          default:
            setGeolocationError(
              'AngaMaps could not determine your current location.'
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  }


  function toggleTheme() {
    setDarkMode(
      (current) =>
        !current
    );
  }


  function getStatusDotClass() {
    if (
      apiStatus ===
      'connected'
    ) {
      return 'bg-emerald-500';
    }

    if (
      apiStatus ===
      'disconnected'
    ) {
      return 'bg-red-500';
    }

    return 'bg-amber-500';
  }


  const locationHierarchy =
    buildLocationHierarchy(
      place
    );

  const weatherIcon =
    getWeatherIconUrl(
      weather?.icon
    );


  return (
    <div className="app-shell min-h-screen">

      <nav className="app-navbar relative z-[5000] border-b">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">

          <div className="flex shrink-0 items-center gap-3">
            <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-2xl text-white">
              <Navigation
                size={21}
                strokeWidth={2.2}
              />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className="primary-text text-lg font-bold tracking-tight">
                  AngaMaps
                </p>

                <Sparkles
                  size={13}
                  className="text-sky-500"
                />
              </div>

              <p className="secondary-text mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em]">
                Weather Intelligence
              </p>
            </div>
          </div>


          <div className="relative z-[6000] mx-auto w-full max-w-2xl">
            <form
              onSubmit={
                handleSearch
              }
              className="search-box group flex items-center gap-3 rounded-2xl border px-3.5 transition"
            >
              <Search
                size={18}
                className="secondary-text shrink-0"
              />

              <input
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) => {
                  setSearchQuery(
                    event.target.value
                  );

                  setSearchError('');
                }}
                placeholder="Search a city, estate or landmark..."
                className="primary-text h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  className="secondary-text rounded-lg p-1 transition hover:opacity-70"
                  aria-label="Clear search"
                >
                  <X
                    size={16}
                  />
                </button>
              )}

              <button
                type="submit"
                disabled={
                  searchLoading
                }
                className="search-submit flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searchLoading ? (
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <>
                    <Search
                      size={14}
                      className="sm:hidden"
                    />

                    <span className="hidden sm:inline">
                      Search
                    </span>
                  </>
                )}
              </button>
            </form>


            {(searchLoading ||
              searchError ||
              searchResults.length > 0 ||
              hasSearched) && (
              <div className="search-dropdown absolute left-0 right-0 top-[calc(100%+10px)] z-[7000] overflow-hidden rounded-2xl border shadow-2xl">

                {searchLoading && (
                  <div className="secondary-text flex items-center gap-3 p-5 text-sm">
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Searching locations...
                  </div>
                )}


                {searchError && (
                  <div className="p-5 text-sm text-red-500">
                    {searchError}
                  </div>
                )}


                {!searchLoading &&
                  !searchError &&
                  hasSearched &&
                  searchResults.length === 0 && (
                    <div className="secondary-text p-5 text-sm">
                      No matching locations found.
                    </div>
                  )}


                {!searchLoading &&
                  searchResults.map(
                    (
                      result,
                      index
                    ) => (
                      <button
                        key={`${result.osm_type}-${result.osm_id}-${index}`}
                        type="button"
                        onClick={() =>
                          handleSearchResultSelect(
                            result
                          )
                        }
                        className="search-result flex w-full items-start gap-3 border-b px-5 py-4 text-left transition last:border-b-0"
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                          <MapPin
                            size={16}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="primary-text truncate text-sm font-semibold">
                            {result.name}
                          </p>

                          <p className="secondary-text mt-1 line-clamp-2 text-xs leading-5">
                            {buildSearchResultSubtitle(
                              result
                            ) ||
                              result.display_name}
                          </p>
                        </div>
                      </button>
                    )
                  )}
              </div>
            )}
          </div>


          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={
                handleUseMyLocation
              }
              disabled={
                geolocationLoading
              }
              className="nav-action flex h-11 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
              title="Use my location"
            >
              {geolocationLoading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <LocateFixed
                  size={17}
                />
              )}

              <span className="hidden xl:inline">
                {geolocationLoading
                  ? 'Locating'
                  : 'My location'}
              </span>
            </button>


            <button
              type="button"
              onClick={
                toggleTheme
              }
              className="nav-action flex h-11 w-11 items-center justify-center rounded-xl border transition"
              title={
                darkMode
                  ? 'Light mode'
                  : 'Dark mode'
              }
            >
              {darkMode ? (
                <Sun
                  size={18}
                />
              ) : (
                <Moon
                  size={18}
                />
              )}
            </button>


            <div className="hidden items-center gap-2 pl-1 lg:flex">
              <span
                className={`h-2 w-2 rounded-full ${getStatusDotClass()}`}
              />

              <span className="secondary-text text-[11px] font-medium">
                Live
              </span>
            </div>
          </div>
        </div>
      </nav>


      {geolocationError && (
        <div className="mx-auto max-w-[1500px] px-4 pt-4 sm:px-6 lg:px-8">
          <div className="error-banner flex items-start justify-between gap-4 rounded-2xl border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-red-500">
                Location unavailable
              </p>

              <p className="mt-1 text-sm leading-6 text-red-500/90">
                {geolocationError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setGeolocationError('')
              }
              className="text-red-500 transition hover:opacity-70"
            >
              <X
                size={17}
              />
            </button>
          </div>
        </div>
      )}


      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="secondary-text flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Live conditions
            </div>

            <h1 className="primary-text mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Weather at a glance
            </h1>

            <p className="secondary-text mt-2 max-w-2xl text-sm leading-6">
              Explore local conditions, forecasts and geographic context from one clean workspace.
            </p>
          </div>
        </div>


        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">

          <aside className="space-y-5">

            <div className="premium-card rounded-3xl border p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                  <MapPin
                    size={19}
                  />
                </div>

                <div className="min-w-0">
                  <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Selected location
                  </p>

                  {place ? (
                    <>
                      <h2 className="primary-text mt-2 break-words text-xl font-semibold tracking-tight">
                        {place.name ||
                          'Selected location'}
                      </h2>

                      {locationHierarchy && (
                        <p className="secondary-text mt-1.5 text-sm leading-6">
                          {locationHierarchy}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="meta-badge rounded-lg border px-2.5 py-1 text-[11px] font-medium">
                          {getPlaceType(
                            place
                          )}
                        </span>

                        {selectedLocation && (
                          <span className="meta-badge rounded-lg border px-2.5 py-1 text-[11px] font-medium">
                            {selectedLocation.latitude.toFixed(
                              3
                            )}
                            ,
                            {' '}
                            {selectedLocation.longitude.toFixed(
                              3
                            )}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="secondary-text mt-2 text-sm leading-6">
                      Search for a place, select your current location, or click directly on the map.
                    </p>
                  )}
                </div>
              </div>
            </div>


            <div className="premium-card overflow-hidden rounded-3xl border p-5">

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Current weather
                  </p>

                  <h2 className="primary-text mt-1.5 text-lg font-semibold">
                    Conditions now
                  </h2>
                </div>

                {weatherLoading && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border">
                    <LoaderCircle
                      size={17}
                      className="secondary-text animate-spin"
                    />
                  </div>
                )}
              </div>


              {weatherLoading &&
                !weather && (
                  <div className="mt-5 flex min-h-[300px] items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                        <LoaderCircle
                          size={22}
                          className="animate-spin"
                        />
                      </div>

                      <p className="primary-text mt-4 text-sm font-semibold">
                        Loading conditions
                      </p>

                      <p className="secondary-text mt-1 text-xs">
                        Updating weather intelligence
                      </p>
                    </div>
                  </div>
                )}


              {weatherError && (
                <div className="error-banner mt-5 rounded-2xl border p-4">
                  <p className="text-sm font-semibold text-red-500">
                    Weather unavailable
                  </p>

                  <p className="mt-1.5 text-sm leading-6 text-red-500/90">
                    {weatherError}
                  </p>
                </div>
              )}


              {!weather &&
                !weatherLoading &&
                !weatherError && (
                  <div className="empty-state mt-5 flex min-h-[280px] items-center justify-center rounded-2xl border p-6 text-center">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                        <Cloud
                          size={22}
                        />
                      </div>

                      <p className="primary-text mt-4 text-sm font-semibold">
                        Choose a location
                      </p>

                      <p className="secondary-text mx-auto mt-1 max-w-[220px] text-xs leading-5">
                        Current conditions will appear here once a location is selected.
                      </p>
                    </div>
                  </div>
                )}


              {weather && (
                <>
                  <div className="weather-hero relative mt-5 overflow-hidden rounded-3xl border p-5">
                    <div className="weather-glow absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className="primary-text text-5xl font-semibold tracking-[-0.04em]">
                          {formatTemperature(
                            weather.temperature
                          )}
                        </p>

                        <p className="primary-text mt-2 text-sm font-semibold capitalize">
                          {weather.description ||
                            weather.condition ||
                            'Current conditions'}
                        </p>

                        <p className="secondary-text mt-1 text-xs">
                          Feels like
                          {' '}
                          {formatTemperature(
                            weather.feels_like
                          )}
                        </p>
                      </div>

                      {weatherIcon && (
                        <img
                          src={
                            weatherIcon
                          }
                          alt={
                            weather.description ||
                            'Weather'
                          }
                          className="h-24 w-24 object-contain drop-shadow-xl"
                        />
                      )}
                    </div>
                  </div>


                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <WeatherStat
                      icon={Droplets}
                      label="Humidity"
                      value={formatValue(
                        weather.humidity,
                        '%'
                      )}
                    />

                    <WeatherStat
                      icon={Wind}
                      label="Wind"
                      value={formatValue(
                        weather.wind_speed,
                        ' m/s'
                      )}
                    />

                    <WeatherStat
                      icon={Gauge}
                      label="Pressure"
                      value={formatValue(
                        weather.pressure,
                        ' hPa'
                      )}
                    />

                    <WeatherStat
                      icon={Eye}
                      label="Visibility"
                      value={
                        weather.visibility
                          ? `${(
                              weather.visibility /
                              1000
                            ).toFixed(
                              1
                            )} km`
                          : '--'
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </aside>


          <div className="min-w-0">
            <div className="map-card overflow-hidden rounded-[30px] border">
              <div className="map-toolbar flex items-center justify-between gap-4 border-b px-5 py-4">
                <div>
                  <p className="primary-text text-sm font-semibold">
                    Interactive map
                  </p>

                  <p className="secondary-text mt-0.5 text-[11px]">
                    Click anywhere to inspect local conditions
                  </p>
                </div>

                {selectedLocation && (
                  <div className="hidden items-center gap-2 rounded-xl border px-3 py-2 sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />

                    <span className="secondary-text text-[11px] font-medium">
                      Location selected
                    </span>
                  </div>
                )}
              </div>

              <div className="map-wrapper relative z-0 h-[610px] lg:h-[700px]">
                <WeatherMap
                  selectedLocation={
                    selectedLocation
                  }
                  onLocationSelect={
                    handleLocationSelect
                  }
                />

                {!selectedLocation && (
                  <div className="pointer-events-none absolute left-1/2 top-5 z-[500] -translate-x-1/2">
                    <div className="map-hint rounded-xl border px-4 py-2 text-xs font-medium shadow-lg">
                      Click anywhere on the map
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>


        {(hourly.length > 0 ||
          daily.length > 0 ||
          weatherLoading) && (
          <div className="mt-6">
            <ForecastPanel
              hourly={hourly}
              daily={daily}
              loading={
                weatherLoading
              }
            />
          </div>
        )}

      </main>
    </div>
  );
}


export default App;