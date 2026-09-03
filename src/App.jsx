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


function App() {
  const [
    darkMode,
    setDarkMode,
  ] = useState(() => {
    const savedTheme =
      localStorage.getItem(
        'angamaps-theme'
      );

    if (savedTheme) {
      return savedTheme === 'dark';
    }

    return window
      .matchMedia(
        '(prefers-color-scheme: dark)'
      )
      .matches;
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
    forecastAvailable,
    setForecastAvailable,
  ] = useState(true);


  const [
    forecastError,
    setForecastError,
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
    geolocationLoading,
    setGeolocationLoading,
  ] = useState(false);


  const [
    geolocationError,
    setGeolocationError,
  ] = useState('');


  useEffect(() => {
    document
      .documentElement
      .classList
      .toggle(
        'dark',
        darkMode
      );

    localStorage.setItem(
      'angamaps-theme',
      darkMode
        ? 'dark'
        : 'light'
    );
  }, [
    darkMode,
  ]);


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
          'online'
        );

      } catch {
        setApiStatus(
          'offline'
        );
      }
    }

    checkApi();
  }, []);


  async function loadWeather(
    location,
    preferredPlace = null,
  ) {
    if (!location) {
      return;
    }

    const normalizedLocation = {
      latitude:
        Number(
          location.latitude
        ),

      longitude:
        Number(
          location.longitude
        ),
    };


    setSelectedLocation(
      normalizedLocation
    );

    setWeatherLoading(
      true
    );

    setWeatherError(
      ''
    );

    setForecastError(
      ''
    );

    setForecastAvailable(
      true
    );


    try {
      const params =
        new URLSearchParams({
          lat:
            normalizedLocation
              .latitude
              .toString(),

          lon:
            normalizedLocation
              .longitude
              .toString(),
        });


      const response =
        await fetch(
          `/api/weather?${params.toString()}`
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to retrieve weather information.'
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


      const apiPlace =
        data.location ||
        null;


      if (preferredPlace) {
        setPlace({
          ...apiPlace,
          ...preferredPlace,

          latitude:
            normalizedLocation.latitude,

          longitude:
            normalizedLocation.longitude,
        });

      } else {
        setPlace(
          apiPlace
        );
      }


      const isForecastAvailable =
        data.availability
          ?.forecast !== false;


      setForecastAvailable(
        isForecastAvailable
      );


      if (
        !isForecastAvailable
      ) {
        setForecastError(
          data.errors
            ?.forecast ||
          'Forecast is temporarily unavailable.'
        );
      }

    } catch (error) {
      setWeather(
        null
      );

      setHourly(
        []
      );

      setDaily(
        []
      );

      setForecastAvailable(
        false
      );

      setForecastError(
        ''
      );

      setWeatherError(
        error.message ||
        'Current weather is unavailable.'
      );

    } finally {
      setWeatherLoading(
        false
      );
    }
  }


  function handleLocationSelect(
    location
  ) {
    loadWeather(
      location
    );
  }


  async function handleSearch(
    event
  ) {
    event?.preventDefault();


    const query =
      searchQuery.trim();


    if (
      query.length < 2
    ) {
      setSearchError(
        'Enter at least 2 characters.'
      );

      return;
    }


    setSearchLoading(
      true
    );

    setSearchError(
      ''
    );


    try {
      const params =
        new URLSearchParams({
          q: query,
        });


      const response =
        await fetch(
          `/api/locations/search?${params.toString()}`
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to search for locations.'
        );
      }


      const results =
        data.results ||
        [];


      setSearchResults(
        results
      );


      if (
        results.length === 0
      ) {
        setSearchError(
          'No matching locations found.'
        );
      }

    } catch (error) {
      setSearchResults(
        []
      );

      setSearchError(
        error.message ||
        'Unable to search for locations.'
      );

    } finally {
      setSearchLoading(
        false
      );
    }
  }


  function handleSearchResultSelect(
    result
  ) {
    const location = {
      latitude:
        result.latitude,

      longitude:
        result.longitude,
    };


    setSearchQuery(
      result.name ||
      result.display_name ||
      ''
    );


    setSearchResults(
      []
    );

    setSearchError(
      ''
    );


    loadWeather(
      location,
      result
    );
  }


  function handleUseMyLocation() {
    setGeolocationError(
      ''
    );


    if (
      !navigator.geolocation
    ) {
      setGeolocationError(
        'Location services are not supported by this browser.'
      );

      return;
    }


    setGeolocationLoading(
      true
    );


    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };


        setGeolocationLoading(
          false
        );


        loadWeather(
          location
        );
      },


      (error) => {
        setGeolocationLoading(
          false
        );


        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setGeolocationError(
            'Location permission was denied.'
          );

          return;
        }


        if (
          error.code ===
          error.TIMEOUT
        ) {
          setGeolocationError(
            'Location request timed out.'
          );

          return;
        }


        setGeolocationError(
          'Unable to determine your location.'
        );
      },


      {
        enableHighAccuracy:
          true,

        timeout:
          12000,

        maximumAge:
          30000,
      }
    );
  }


  function formatVisibility(
    visibility
  ) {
    if (
      visibility == null
    ) {
      return '—';
    }

    return (
      `${(
        visibility / 1000
      ).toFixed(1)} km`
    );
  }


  function formatWind(
    speed
  ) {
    if (
      speed == null
    ) {
      return '—';
    }

    return (
      `${Number(
        speed
      ).toFixed(1)} m/s`
    );
  }


  function getLocationName() {
    return (
      place?.name ||
      place?.city ||
      place?.town ||
      place?.suburb ||
      place?.village ||
      'Selected location'
    );
  }


  const hasLocation =
    Boolean(
      selectedLocation
    );


  return (
    <div className="app-shell min-h-screen">

      <header className="app-navbar sticky top-0 z-[5000] border-b">

        <div className="mx-auto flex min-h-[74px] max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">

          <div className="flex shrink-0 items-center gap-3">

            <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg">
              <Cloud
                size={19}
              />
            </div>


            <div>

              <div className="primary-text text-sm font-bold tracking-tight">
                AngaMaps
              </div>

              <div className="secondary-text text-[9px] font-semibold uppercase tracking-[0.18em]">
                Weather Intelligence
              </div>

            </div>

          </div>


          <div className="relative z-[6000] mx-auto hidden w-full max-w-[570px] md:block">

            <form
              onSubmit={
                handleSearch
              }
              className="search-box flex items-center rounded-2xl border p-1"
            >

              <Search
                size={16}
                className="secondary-text ml-3 shrink-0"
              />


              <input
                value={
                  searchQuery
                }
                onChange={
                  (event) => {
                    setSearchQuery(
                      event.target.value
                    );

                    setSearchError(
                      ''
                    );
                  }
                }
                placeholder="Search a place, town or landmark"
                className="primary-text min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
              />


              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(
                      ''
                    );

                    setSearchResults(
                      []
                    );

                    setSearchError(
                      ''
                    );
                  }}
                  className="secondary-text rounded-xl p-2"
                  aria-label="Clear search"
                >
                  <X
                    size={15}
                  />
                </button>
              )}


              <button
                type="submit"
                className="search-submit flex h-9 items-center justify-center rounded-xl px-4 text-xs font-semibold"
              >
                {searchLoading
                  ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  )
                  : 'Search'
                }
              </button>

            </form>


            {(
              searchResults.length > 0
              ||
              searchError
            ) && (
              <div className="search-dropdown absolute left-0 right-0 top-[calc(100%+8px)] z-[7000] overflow-hidden rounded-2xl border shadow-2xl">

                {searchError && (
                  <div className="secondary-text px-4 py-3 text-xs">
                    {searchError}
                  </div>
                )}


                {searchResults.map(
                  (
                    result,
                    index
                  ) => (
                    <button
                      key={
                        result.osm_id
                          ? `${result.osm_type}-${result.osm_id}`
                          : `${result.latitude}-${result.longitude}-${index}`
                      }
                      type="button"
                      onClick={() =>
                        handleSearchResultSelect(
                          result
                        )
                      }
                      className="search-result flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0"
                    >

                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-sky-500"
                      />


                      <div className="min-w-0">

                        <p className="primary-text truncate text-xs font-semibold">
                          {
                            result.name ||
                            'Location'
                          }
                        </p>

                        <p className="secondary-text mt-1 line-clamp-2 text-[10px] leading-4">
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


          <div className="ml-auto flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={
                handleUseMyLocation
              }
              className="nav-action flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold"
            >
              {geolocationLoading
                ? (
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                )
                : (
                  <LocateFixed
                    size={15}
                  />
                )
              }

              <span className="hidden lg:inline">
                My location
              </span>

            </button>


            <button
              type="button"
              onClick={() =>
                setDarkMode(
                  (current) =>
                    !current
                )
              }
              className="nav-action flex h-10 w-10 items-center justify-center rounded-xl border"
              aria-label="Toggle theme"
            >
              {darkMode
                ? (
                  <Sun
                    size={16}
                  />
                )
                : (
                  <Moon
                    size={16}
                  />
                )
              }
            </button>


            <div className="hidden items-center gap-2 pl-2 xl:flex">

              <span
                className={`h-2 w-2 rounded-full ${
                  apiStatus === 'online'
                    ? 'bg-emerald-500'
                    : apiStatus === 'offline'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                }`}
              />


              <span className="secondary-text text-[10px] font-medium">
                {apiStatus === 'online'
                  ? 'Live'
                  : apiStatus === 'offline'
                    ? 'Offline'
                    : 'Checking'
                }
              </span>

            </div>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">

        <section className="mb-6">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <Sparkles
                  size={14}
                  className="text-sky-500"
                />

                <span className="secondary-text text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Live weather intelligence
                </span>

              </div>


              <h1 className="primary-text text-2xl font-semibold tracking-tight sm:text-3xl">
                Weather at a glance
              </h1>


              <p className="secondary-text mt-2 max-w-2xl text-sm">
                Search for a place or select anywhere on the map to explore local conditions.
              </p>

            </div>


            {hasLocation && (
              <div className="meta-badge flex items-center gap-2 rounded-full border px-3 py-2">

                <Navigation
                  size={12}
                  className="text-sky-500"
                />

                <span className="secondary-text text-[10px]">
                  {
                    selectedLocation
                      .latitude
                      .toFixed(4)
                  }
                  ,{' '}
                  {
                    selectedLocation
                      .longitude
                      .toFixed(4)
                  }
                </span>

              </div>
            )}

          </div>


          <div className="relative z-[4500] mt-5 md:hidden">

            <form
              onSubmit={
                handleSearch
              }
              className="search-box flex items-center rounded-2xl border p-1"
            >

              <Search
                size={16}
                className="secondary-text ml-3 shrink-0"
              />


              <input
                value={
                  searchQuery
                }
                onChange={
                  (event) => {
                    setSearchQuery(
                      event.target.value
                    );

                    setSearchError(
                      ''
                    );
                  }
                }
                placeholder="Search location"
                className="primary-text min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
              />


              <button
                type="submit"
                className="search-submit rounded-xl px-4 py-2.5 text-xs font-semibold"
              >
                {searchLoading
                  ? (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  )
                  : 'Search'
                }
              </button>

            </form>


            {(
              searchResults.length > 0
              ||
              searchError
            ) && (
              <div className="search-dropdown absolute left-0 right-0 top-[calc(100%+8px)] z-[7000] overflow-hidden rounded-2xl border shadow-2xl">

                {searchError && (
                  <div className="secondary-text px-4 py-3 text-xs">
                    {searchError}
                  </div>
                )}


                {searchResults.map(
                  (
                    result,
                    index
                  ) => (
                    <button
                      key={
                        result.osm_id
                          ? `${result.osm_type}-${result.osm_id}`
                          : `${result.latitude}-${result.longitude}-${index}`
                      }
                      type="button"
                      onClick={() =>
                        handleSearchResultSelect(
                          result
                        )
                      }
                      className="search-result flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0"
                    >

                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-sky-500"
                      />


                      <div className="min-w-0">

                        <p className="primary-text truncate text-xs font-semibold">
                          {
                            result.name ||
                            'Location'
                          }
                        </p>

                        <p className="secondary-text mt-1 line-clamp-2 text-[10px] leading-4">
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

        </section>


        {geolocationError && (
          <div className="error-banner mb-5 flex items-start gap-3 rounded-2xl border p-4">

            <LocateFixed
              size={16}
              className="mt-0.5 shrink-0"
            />

            <p className="text-xs">
              {geolocationError}
            </p>

          </div>
        )}


        <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">

          <div className="space-y-5">

            <div className="premium-card sidebar-card rounded-3xl border p-5">

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Selected location
                  </p>


                  <h2 className="primary-text mt-2 text-lg font-semibold">
                    {
                      hasLocation
                        ? getLocationName()
                        : 'Choose a location'
                    }
                  </h2>

                </div>


                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <MapPin
                    size={17}
                  />
                </div>

              </div>


              {hasLocation ? (
                <div className="mt-4">

                  <span className="place-badge inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize">
                    {
                      place?.type ||
                      'location'
                    }
                  </span>


                  <p className="secondary-text mt-3 text-[11px] leading-5">
                    {
                      place?.display_name ||
                      `${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`
                    }
                  </p>

                </div>

              ) : (
                <p className="secondary-text mt-3 text-xs leading-5">
                  Search above, use your current location, or click anywhere on the map.
                </p>
              )}

            </div>


            <div className="premium-card sidebar-card rounded-3xl border p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Current weather
                  </p>

                  <h2 className="primary-text mt-1 text-sm font-semibold">
                    Conditions now
                  </h2>

                </div>


                <Cloud
                  size={17}
                  className="text-sky-500"
                />

              </div>


              {!hasLocation && (
                <div className="empty-state mt-5 rounded-2xl border p-5">

                  <p className="primary-text text-xs font-semibold">
                    No location selected
                  </p>

                  <p className="secondary-text mt-2 text-[11px] leading-5">
                    Select a place to see current weather conditions.
                  </p>

                </div>
              )}


              {hasLocation &&
                weatherLoading && (
                  <div className="mt-6 flex items-center gap-3 py-6">

                    <LoaderCircle
                      size={20}
                      className="animate-spin text-sky-500"
                    />

                    <div>

                      <p className="primary-text text-xs font-semibold">
                        Reading the weather
                      </p>

                      <p className="secondary-text mt-1 text-[10px]">
                        Getting the latest conditions…
                      </p>

                    </div>

                  </div>
                )}


              {hasLocation &&
                !weatherLoading &&
                weatherError && (
                  <div className="error-banner mt-5 rounded-2xl border p-4">

                    <p className="text-xs font-semibold">
                      Weather unavailable
                    </p>

                    <p className="mt-1 text-[10px] leading-5">
                      {weatherError}
                    </p>

                  </div>
                )}


              {hasLocation &&
                !weatherLoading &&
                !weatherError &&
                weather && (
                  <>

                    <div className="weather-hero relative mt-5 overflow-hidden rounded-3xl border p-5">

                      <div className="weather-glow" />


                      <div className="relative z-10">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.14em]">
                              Temperature
                            </p>


                            <div className="primary-text mt-2 text-5xl font-semibold tracking-[-0.05em]">
                              {
                                weather.temperature != null
                                  ? `${Math.round(weather.temperature)}°`
                                  : '—'
                              }
                            </div>

                          </div>


                          {weather.icon && (
                            <img
                              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                              alt={
                                weather.description ||
                                'Weather'
                              }
                              className="h-16 w-16"
                            />
                          )}

                        </div>


                        <p className="primary-text mt-3 text-sm font-semibold capitalize">
                          {
                            weather.description ||
                            weather.condition ||
                            'Current conditions'
                          }
                        </p>


                        <p className="secondary-text mt-1 text-[11px]">
                          Feels like{' '}
                          {
                            weather.feels_like != null
                              ? `${Math.round(weather.feels_like)}°C`
                              : '—'
                          }
                        </p>

                      </div>

                    </div>


                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="weather-stat rounded-2xl border p-3">

                        <Droplets
                          size={14}
                          className="text-sky-500"
                        />

                        <p className="secondary-text mt-3 text-[9px] uppercase tracking-[0.12em]">
                          Humidity
                        </p>

                        <p className="primary-text mt-1 text-sm font-semibold">
                          {
                            weather.humidity != null
                              ? `${weather.humidity}%`
                              : '—'
                          }
                        </p>

                      </div>


                      <div className="weather-stat rounded-2xl border p-3">

                        <Wind
                          size={14}
                          className="text-sky-500"
                        />

                        <p className="secondary-text mt-3 text-[9px] uppercase tracking-[0.12em]">
                          Wind
                        </p>

                        <p className="primary-text mt-1 text-sm font-semibold">
                          {
                            formatWind(
                              weather.wind_speed
                            )
                          }
                        </p>

                      </div>


                      <div className="weather-stat rounded-2xl border p-3">

                        <Gauge
                          size={14}
                          className="text-sky-500"
                        />

                        <p className="secondary-text mt-3 text-[9px] uppercase tracking-[0.12em]">
                          Pressure
                        </p>

                        <p className="primary-text mt-1 text-sm font-semibold">
                          {
                            weather.pressure != null
                              ? `${weather.pressure} hPa`
                              : '—'
                          }
                        </p>

                      </div>


                      <div className="weather-stat rounded-2xl border p-3">

                        <Eye
                          size={14}
                          className="text-sky-500"
                        />

                        <p className="secondary-text mt-3 text-[9px] uppercase tracking-[0.12em]">
                          Visibility
                        </p>

                        <p className="primary-text mt-1 text-sm font-semibold">
                          {
                            formatVisibility(
                              weather.visibility
                            )
                          }
                        </p>

                      </div>

                    </div>

                  </>
                )}

            </div>

          </div>


          <div className="premium-card map-card overflow-hidden rounded-3xl border">

            <div className="map-toolbar flex items-center justify-between gap-4 border-b px-5 py-4">

              <div>

                <p className="primary-text text-sm font-semibold">
                  Interactive map
                </p>

                <p className="secondary-text mt-1 text-[10px]">
                  Click anywhere to inspect local conditions
                </p>

              </div>


              <div className="meta-badge hidden items-center gap-2 rounded-full border px-3 py-2 sm:flex">

                <Navigation
                  size={12}
                  className="text-sky-500"
                />

                <span className="secondary-text text-[10px]">
                  Explore
                </span>

              </div>

            </div>


            <div className="map-wrapper relative h-[610px] lg:h-[700px]">

              <WeatherMap
                selectedLocation={
                  selectedLocation
                }
                onLocationSelect={
                  handleLocationSelect
                }
                weather={
                  weather
                }
                place={
                  place
                }
                weatherLoading={
                  weatherLoading
                }
              />


              {!hasLocation && (
                <div className="map-hint pointer-events-none absolute bottom-5 left-1/2 z-[500] -translate-x-1/2 rounded-2xl border px-4 py-2 shadow-lg">

                  <p className="secondary-text whitespace-nowrap text-[10px]">
                    Click the map to select a location
                  </p>

                </div>
              )}

            </div>

          </div>

        </section>


        <section className="mt-6">

          <ForecastPanel
            hourly={
              hourly
            }
            daily={
              daily
            }
            loading={
              weatherLoading
            }
            available={
              forecastAvailable
            }
            error={
              forecastError
            }
            hasLocation={
              hasLocation
            }
          />

        </section>

      </main>

    </div>
  );
}


export default App;