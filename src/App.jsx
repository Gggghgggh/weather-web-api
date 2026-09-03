import { useEffect, useState } from 'react';
import WeatherMap from './components/WeatherMap';

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

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch('/api/health');

        if (!response.ok) {
          throw new Error('API unavailable');
        }

        const data = await response.json();

        if (data.status === 'ok') {
          setApiStatus('API Connected');
        } else {
          setApiStatus('API unavailable');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('API unavailable');
      }
    }

    checkApi();
  }, []);

  async function handleLocationSelect(location) {
    setSelectedLocation(location);

    setPlace(null);
    setWeather(null);
    setWeatherError('');

    setWeatherLoading(true);

    try {
      const latitude = location.latitude;
      const longitude = location.longitude;

      const url =
        '/api/weather/current?lat=' +
        encodeURIComponent(latitude) +
        '&lon=' +
        encodeURIComponent(longitude);

      const response = await fetch(url);

      if (!response.ok) {
        let errorMessage = 'Unable to retrieve weather data.';

        try {
          const errorData = await response.json();

          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Use the default error message.
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log('AngaMaps API response:', data);

      if (!data) {
        throw new Error('The API returned an empty response.');
      }

      if (!data.weather) {
        throw new Error('Weather information was not returned.');
      }

      setPlace(data.location || null);
      setWeather(data.weather);
    } catch (error) {
      console.error('Weather request failed:', error);

      if (error instanceof Error) {
        setWeatherError(error.message);
      } else {
        setWeatherError('Unable to retrieve weather data.');
      }
    } finally {
      setWeatherLoading(false);
    }
  }

  function getStatusColor() {
    if (apiStatus === 'API Connected') {
      return 'bg-emerald-400';
    }

    if (apiStatus === 'Checking...') {
      return 'bg-amber-400';
    }

    return 'bg-red-400';
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AngaMaps
            </h1>

            <p className="text-xs text-slate-500">
              Weather Intelligence
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
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
      </nav>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Selected Location
          </p>

          {!selectedLocation && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5">
              <p className="text-sm leading-6 text-slate-400">
                Click anywhere on the map to view the location and
                current weather.
              </p>
            </div>
          )}

          {selectedLocation && (
            <div className="mt-5 space-y-4">
              {place && (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Location
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {place.name || 'Selected location'}
                  </h2>

                  {place.suburb &&
                    place.suburb !== place.name && (
                      <p className="mt-1 text-sm text-slate-400">
                        {place.suburb}
                      </p>
                    )}

                  <p className="mt-2 text-sm text-slate-400">
                    {[
                      place.county,
                      place.state,
                      place.country,
                    ]
                      .filter(Boolean)
                      .filter(
                        (value, index, values) =>
                          values.indexOf(value) === index
                      )
                      .join(', ')}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-500">
                    Latitude
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedLocation.latitude.toFixed(5)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-500">
                    Longitude
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {selectedLocation.longitude.toFixed(5)}
                  </p>
                </div>
              </div>

              {weatherLoading && (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

                    <div>
                      <p className="text-sm font-medium text-white">
                        Loading weather
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Retrieving location and current conditions...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {weatherError && !weatherLoading && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm font-semibold text-red-300">
                    Weather unavailable
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-200">
                    {weatherError}
                  </p>
                </div>
              )}

              {weather && !weatherLoading && (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">
                        Current Weather
                      </p>

                      <p className="mt-2 text-4xl font-semibold">
                        {formatTemperature(
                          weather.temperature
                        )}
                      </p>

                      <p className="mt-1 text-sm capitalize text-slate-400">
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
                        className="h-16 w-16"
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
                      label="Wind"
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

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="h-[calc(100vh-130px)] min-h-[600px]">
            <WeatherMap
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;