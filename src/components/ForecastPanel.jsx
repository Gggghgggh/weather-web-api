import {
  CalendarDays,
  CloudRain,
  Droplets,
  TrendingUp,
  Wind,
} from 'lucide-react';


function getWeatherIconUrl(icon) {
  if (!icon) {
    return null;
  }

  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
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


function formatProbability(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  return Math.round(value * 100);
}


function formatForecastTime(localDatetime) {
  if (!localDatetime) {
    return '--';
  }

  const date = new Date(localDatetime);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}


function formatDay(dateValue, index) {
  if (index === 0) {
    return 'Today';
  }

  if (!dateValue) {
    return '--';
  }

  const date = new Date(
    `${dateValue}T12:00:00`
  );

  return date.toLocaleDateString([], {
    weekday: 'short',
  });
}


function HourForecastCard({
  item,
  index,
}) {
  const iconUrl =
    getWeatherIconUrl(item.icon);

  return (
    <div className="forecast-hour-card group relative min-w-[132px] overflow-hidden rounded-2xl border p-4 transition duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-center justify-between gap-2">
        <p className="primary-text text-xs font-semibold">
          {index === 0
            ? 'Upcoming'
            : formatForecastTime(
                item.local_datetime
              )}
        </p>

        <span className="h-1.5 w-1.5 rounded-full bg-sky-500/70" />
      </div>

      <div className="my-3 flex h-14 items-center justify-center">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={
              item.description ||
              'Weather'
            }
            className="h-14 w-14 object-contain drop-shadow-sm"
          />
        ) : (
          <div className="h-14" />
        )}
      </div>

      <p className="primary-text text-center text-2xl font-semibold tracking-tight">
        {formatTemperature(
          item.temperature
        )}
      </p>

      <p className="secondary-text mt-1 min-h-8 text-center text-[11px] capitalize leading-4">
        {item.description ||
          item.condition ||
          'Weather'}
      </p>

      <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-sky-500/5 px-2 py-1.5 text-[11px] text-sky-500">
        <CloudRain size={12} />

        <span className="font-medium">
          {formatProbability(
            item.precipitation_probability
          )}
          %
        </span>
      </div>
    </div>
  );
}


function DailyForecastCard({
  item,
  index,
}) {
  const iconUrl =
    getWeatherIconUrl(item.icon);

  return (
    <div className="forecast-day-card group relative overflow-hidden rounded-2xl border p-4 transition duration-300">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="primary-text text-sm font-semibold">
            {formatDay(
              item.date,
              index
            )}
          </p>

          <p className="secondary-text mt-1 text-[11px] capitalize">
            {item.description ||
              item.condition ||
              'Weather'}
          </p>
        </div>

        {iconUrl && (
          <img
            src={iconUrl}
            alt={
              item.description ||
              'Weather'
            }
            className="h-12 w-12 object-contain drop-shadow-sm"
          />
        )}
      </div>

      <div className="mt-5 flex items-end gap-2">
        <p className="primary-text text-2xl font-semibold tracking-tight">
          {formatTemperature(
            item.temperature_max
          )}
        </p>

        <span className="secondary-text pb-1 text-sm">
          /
        </span>

        <p className="secondary-text pb-1 text-sm font-medium">
          {formatTemperature(
            item.temperature_min
          )}
        </p>
      </div>

      <div
        className="mt-4 space-y-2.5 border-t pt-3"
        style={{
          borderColor:
            'var(--border-subtle)',
        }}
      >
        <div className="secondary-text flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <CloudRain size={13} />
            Precipitation
          </span>

          <span className="primary-text font-medium">
            {formatProbability(
              item.precipitation_probability
            )}
            %
          </span>
        </div>

        <div className="secondary-text flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Droplets size={13} />
            Humidity
          </span>

          <span className="primary-text font-medium">
            {item.humidity ?? '--'}%
          </span>
        </div>

        <div className="secondary-text flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Wind size={13} />
            Wind
          </span>

          <span className="primary-text font-medium">
            {item.wind_speed !==
            null &&
            item.wind_speed !==
              undefined
              ? `${item.wind_speed} m/s`
              : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}


function ForecastPanel({
  hourly = [],
  daily = [],
  loading = false,
}) {
  if (loading) {
    return (
      <section className="sidebar-card overflow-hidden rounded-3xl border p-5 md:p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div
                className="h-4 w-32 rounded"
                style={{
                  background:
                    'var(--surface-hover)',
                }}
              />

              <div
                className="mt-3 h-7 w-56 rounded"
                style={{
                  background:
                    'var(--surface-hover)',
                }}
              />
            </div>

            <div
              className="h-10 w-10 rounded-xl"
              style={{
                background:
                  'var(--surface-hover)',
              }}
            />
          </div>

          <div className="mt-7 flex gap-3 overflow-hidden">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="h-44 min-w-[132px] rounded-2xl"
                style={{
                  background:
                    'var(--surface-hover)',
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }


  if (
    hourly.length === 0 &&
    daily.length === 0
  ) {
    return null;
  }


  return (
    <section className="sidebar-card overflow-hidden rounded-3xl border p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="secondary-text flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
            <CalendarDays size={14} />
            Forecast
          </div>

          <h2 className="primary-text mt-2 text-2xl font-semibold tracking-tight">
            Weather outlook
          </h2>

          <p className="secondary-text mt-1 max-w-xl text-sm leading-6">
            A clear view of changing
            conditions over the next
            several days.
          </p>
        </div>

        <div className="hidden h-11 w-11 items-center justify-center rounded-xl border bg-sky-500/5 text-sky-500 sm:flex">
          <TrendingUp size={19} />
        </div>
      </div>


      {hourly.length > 0 && (
        <div className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="primary-text text-sm font-semibold">
                Next 24 hours
              </h3>

              <p className="secondary-text mt-1 text-xs">
                Conditions across the
                coming day
              </p>
            </div>

            <p className="secondary-text hidden text-[11px] sm:block">
              Updated with selected location
            </p>
          </div>

          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
            {hourly.map(
              (item, index) => (
                <HourForecastCard
                  key={
                    item.timestamp ||
                    index
                  }
                  item={item}
                  index={index}
                />
              )
            )}
          </div>
        </div>
      )}


      {daily.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="primary-text text-sm font-semibold">
              5-day outlook
            </h3>

            <p className="secondary-text mt-1 text-xs">
              Daily highs, lows and
              expected conditions
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {daily.map(
              (item, index) => (
                <DailyForecastCard
                  key={
                    item.date ||
                    index
                  }
                  item={item}
                  index={index}
                />
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}


export default ForecastPanel;