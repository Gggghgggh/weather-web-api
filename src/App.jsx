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
  Sun,
  Wind,
  X,
} from 'lucide-react';

import ForecastPanel from './components/ForecastPanel';
import WeatherMap from './components/WeatherMap';


function WeatherStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="weather-stat rounded-2xl border p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="secondary-text"
        />

        <p className="secondary-text text-xs">
          {label}
        </p>
      </div>

      <p className="primary-text mt-2 font-semibold">
        {value}
      </p>
    </div>
  );
}


function buildLocationHierarchy(
  place
) {
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


function buildSearchResultSubtitle(
  result
) {
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


function formatTemperature(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '--';
  }

  return `${Math.round(value)}°C`;
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


function getWeatherIconUrl(
  icon
) {
  if (!icon) {
    return null;
  }

  return (
    `https://openweathermap.org/img/wn/${icon}@2x.png`
  );
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
          // Keep fallback.
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

    if (
      query.length < 2
    ) {
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
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,
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
              'Your current location is unavailable. Make sure location services are enabled on your device and try again.'
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


  function getStatusText() {
    if (
      apiStatus ===
      'connected'
    ) {
      return 'API Connected';
    }

    if (
      apiStatus ===
      'disconnected'
    ) {
      return 'API Offline';
    }

    return 'Checking API';
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
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6">

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
              <Navigation
                size={20}
              />
            </div>

            <div className="hidden sm:block">
              <p className="primary-text text-lg font-bold">
                AngaMaps
              </p>

              <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
                Weather Intelligence
              </p>
            </div>
          </div>


          <div className="relative z-[6000] mx-auto w-full max-w-xl">
            <form
              onSubmit={
                handleSearch
              }
              className="search-box flex items-center gap-2 rounded-xl border px-3"
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
                    event.target
                      .value
                  );

                  setSearchError(
                    ''
                  );
                }}
                placeholder="Search towns, estates, landmarks..."
                className="primary-text h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />


              {searchQuery && (
                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                >
                  <X
                    size={16}
                    className="secondary-text"
                  />
                </button>
              )}


              <button
                type="submit"
                disabled={
                  searchLoading
                }
                className="primary-button flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold disabled:opacity-60"
              >
                {searchLoading ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  'Search'
                )}
              </button>
            </form>


            {(searchLoading ||
              searchError ||
              searchResults.length >
                0 ||
              hasSearched) && (

              <div className="search-dropdown absolute left-0 right-0 top-[calc(100%+8px)] z-[7000] max-h-[420px] overflow-y-auto rounded-2xl border shadow-2xl">

                {searchLoading && (
                  <div className="secondary-text flex items-center gap-2 p-4 text-sm">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />

                    Searching...
                  </div>
                )}


                {searchError && (
                  <div className="p-4 text-sm text-red-500">
                    {searchError}
                  </div>
                )}


                {!searchLoading &&
                  !searchError &&
                  hasSearched &&
                  searchResults.length ===
                    0 && (

                    <div className="secondary-text p-4 text-sm">
                      No locations
                      found.
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
                        className="search-result flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                          <MapPin
                            size={16}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="primary-text truncate text-sm font-semibold">
                            {
                              result.name
                            }
                          </p>

                          <p className="secondary-text mt-1 text-xs">
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
              title="Use my current location"
              className="theme-toggle flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium disabled:opacity-60"
            >
              {geolocationLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LocateFixed
                  size={18}
                />
              )}

              <span className="hidden xl:inline">
                {geolocationLoading
                  ? 'Locating...'
                  : 'My Location'}
              </span>
            </button>


            <button
              type="button"
              onClick={
                toggleTheme
              }
              className="theme-toggle flex h-10 w-10 items-center justify-center rounded-xl border"
            >
              {darkMode ? (
                <Sun
                  size={19}
                />
              ) : (
                <Moon
                  size={19}
                />
              )}
            </button>


            <div className="hidden items-center gap-2 lg:flex">
              <span
                className={`h-2 w-2 rounded-full ${getStatusDotClass()}`}
              />

              <span className="secondary-text whitespace-nowrap text-xs">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </nav>


      {geolocationError && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">

            <div>
              <p className="text-sm font-semibold text-red-500">
                Location unavailable
              </p>

              <p className="mt-1 text-sm text-red-500">
                {geolocationError}
              </p>
            </div>


            <button
              type="button"
              onClick={() =>
                setGeolocationError(
                  ''
                )
              }
            >
              <X
                size={18}
                className="text-red-500"
              />
            </button>
          </div>
        </div>
      )}


      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">

          <aside className="space-y-5">

            <div className="sidebar-card rounded-3xl border p-5">
              <div className="flex gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <MapPin
                    size={19}
                  />
                </div>


                <div className="min-w-0">
                  <p className="secondary-text text-xs font-semibold uppercase tracking-[0.15em]">
                    Selected Location
                  </p>

                  {place ? (
                    <>
                      <h1 className="primary-text mt-2 text-xl font-semibold">
                        {place.name ||
                          'Selected location'}
                      </h1>

                      {locationHierarchy && (
                        <p className="secondary-text mt-1 text-sm leading-6">
                          {
                            locationHierarchy
                          }
                        </p>
                      )}

                      <span className="place-badge mt-3 inline-block rounded-lg border px-2.5 py-1 text-xs">
                        {getPlaceType(
                          place
                        )}
                      </span>
                    </>
                  ) : (
                    <p className="secondary-text mt-2 text-sm leading-6">
                      Search for a
                      place, click the
                      map or use your
                      current location.
                    </p>
                  )}
                </div>
              </div>
            </div>


            <div className="sidebar-card rounded-3xl border p-5">

              <p className="secondary-text text-xs font-semibold uppercase tracking-[0.15em]">
                Current Weather
              </p>


              {weatherLoading &&
                !weather && (

                  <div className="mt-5 flex min-h-[240px] items-center justify-center">
                    <div className="text-center">
                      <LoaderCircle
                        size={28}
                        className="secondary-text mx-auto animate-spin"
                      />

                      <p className="primary-text mt-3 text-sm font-medium">
                        Loading
                        weather...
                      </p>
                    </div>
                  </div>
                )}


              {weatherError && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                  {weatherError}
                </div>
              )}


              {weather && (
                <>
                  <div className="content-card mt-4 rounded-2xl border p-5">

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="primary-text text-4xl font-bold">
                          {formatTemperature(
                            weather.temperature
                          )}
                        </p>

                        <p className="primary-text mt-2 capitalize">
                          {weather.description ||
                            weather.condition}
                        </p>

                        <p className="secondary-text mt-1 text-sm">
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
                            weather.description
                          }
                          className="h-20 w-20"
                        />
                      )}
                    </div>
                  </div>


                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <WeatherStat
                      icon={
                        Droplets
                      }
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


              {!weather &&
                !weatherLoading &&
                !weatherError && (

                  <div className="mt-5 flex min-h-[200px] items-center justify-center text-center">
                    <div>
                      <Cloud
                        size={30}
                        className="secondary-text mx-auto"
                      />

                      <p className="primary-text mt-3 font-medium">
                        Select a
                        location
                      </p>

                      <p className="secondary-text mt-1 text-sm">
                        Weather data
                        will appear
                        here.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </aside>


          <div className="map-wrapper relative z-0 h-[560px] overflow-hidden rounded-3xl border shadow-2xl lg:h-[680px]">

            <WeatherMap
              selectedLocation={
                selectedLocation
              }
              onLocationSelect={
                handleLocationSelect
              }
            />

          </div>
        </section>


        {(hourly.length >
          0 ||
          daily.length >
            0 ||
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