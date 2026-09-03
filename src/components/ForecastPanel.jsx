import {
  CalendarDays,
  CloudRain,
  Droplets,
  Wind,
} from 'lucide-react';


function getWeatherIconUrl(icon) {
  if (!icon) {
    return null;
  }

  return (
    `https://openweathermap.org/img/wn/${icon}@2x.png`
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


function formatProbability(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  return Math.round(
    value * 100
  );
}


function formatForecastTime(
  localDatetime
) {
  if (!localDatetime) {
    return '--';
  }

  const date = new Date(
    localDatetime
  );

  return date.toLocaleTimeString(
    [],
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  );
}


function formatDay(
  dateValue,
  index
) {
  if (index === 0) {
    return 'Today';
  }

  if (!dateValue) {
    return '--';
  }

  const date = new Date(
    `${dateValue}T12:00:00`
  );

  return date.toLocaleDateString(
    [],
    {
      weekday: 'short',
    }
  );
}


function HourForecastCard({
  item,
  index,
}) {
  const iconUrl =
    getWeatherIconUrl(
      item.icon
    );

  return (
    <div className="content-card min-w-[118px] rounded-2xl border p-4 text-center">
      <p className="secondary-text text-xs font-semibold">
        {index === 0
          ? 'Next'
          : formatForecastTime(
              item.local_datetime
            )}
      </p>

      <div className="my-2 flex h-12 items-center justify-center">
        {iconUrl && (
          <img
            src={iconUrl}
            alt={
              item.description ||
              'Weather'
            }
            className="h-12 w-12"
          />
        )}
      </div>

      <p className="primary-text text-xl font-semibold">
        {formatTemperature(
          item.temperature
        )}
      </p>

      <p className="secondary-text mt-1 min-h-8 text-xs capitalize">
        {item.description ||
          item.condition}
      </p>

      <div className="secondary-text mt-3 flex items-center justify-center gap-1 text-xs">
        <CloudRain
          size={12}
        />

        <span>
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
    getWeatherIconUrl(
      item.icon
    );

  return (
    <div className="content-card rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="primary-text font-semibold">
            {formatDay(
              item.date,
              index
            )}
          </p>

          <p className="secondary-text mt-1 text-xs capitalize">
            {item.description ||
              item.condition}
          </p>
        </div>

        {iconUrl && (
          <img
            src={iconUrl}
            alt={
              item.description ||
              'Weather'
            }
            className="h-12 w-12"
          />
        )}
      </div>


      <div className="mt-4 flex items-end gap-2">
        <p className="primary-text text-2xl font-semibold">
          {formatTemperature(
            item.temperature_max
          )}
        </p>

        <p className="secondary-text pb-1 text-sm">
          /
          {' '}
          {formatTemperature(
            item.temperature_min
          )}
        </p>
      </div>


      <div
        className="mt-4 space-y-2 border-t pt-3"
        style={{
          borderColor:
            'var(--border-subtle)',
        }}
      >
        <div className="secondary-text flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <CloudRain
              size={13}
            />

            Rain
          </span>

          <span>
            {formatProbability(
              item.precipitation_probability
            )}
            %
          </span>
        </div>


        <div className="secondary-text flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <Droplets
              size={13}
            />

            Humidity
          </span>

          <span>
            {item.humidity ??
              '--'}
            %
          </span>
        </div>


        <div className="secondary-text flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <Wind
              size={13}
            />

            Wind
          </span>

          <span>
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
      <section className="sidebar-card rounded-3xl border p-5 md:p-6">
        <div className="animate-pulse">
          <div
            className="h-5 w-40 rounded-lg"
            style={{
              background:
                'var(--surface-hover)',
            }}
          />

          <div className="mt-5 flex gap-3 overflow-hidden">
            {Array.from({
              length: 8,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-40 min-w-[118px] rounded-2xl"
                  style={{
                    background:
                      'var(--surface-hover)',
                  }}
                />
              )
            )}
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
    <section className="sidebar-card rounded-3xl border p-5 md:p-6">
      <div className="mb-6">
        <div className="secondary-text flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <CalendarDays
            size={15}
          />

          Weather Forecast
        </div>

        <h2 className="primary-text mt-2 text-xl font-semibold">
          Weather outlook
        </h2>

        <p className="secondary-text mt-1 text-sm">
          24-hour outlook and
          five-day forecast
        </p>
      </div>


      {hourly.length > 0 && (
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h3 className="primary-text font-semibold">
                Next 24 hours
              </h3>

              <p className="secondary-text mt-1 text-xs">
                Forecast shown in
                3-hour intervals
              </p>
            </div>

            <span className="place-badge rounded-lg border px-2.5 py-1 text-[11px]">
              FREE API
            </span>
          </div>


          <div className="flex gap-3 overflow-x-auto pb-3">
            {hourly.map(
              (
                item,
                index
              ) => (
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
        <div className="mt-7">
          <div className="mb-3">
            <h3 className="primary-text font-semibold">
              5-day forecast
            </h3>

            <p className="secondary-text mt-1 text-xs">
              Daily weather
              summaries calculated
              from 3-hour forecast
              data
            </p>
          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {daily.map(
              (
                item,
                index
              ) => (
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