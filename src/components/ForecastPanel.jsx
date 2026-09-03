import {
  CalendarDays,
  CloudRain,
  Droplets,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
  Wind,
} from 'lucide-react';


function formatForecastTime(
  item
) {
  if (
    item.local_time
  ) {
    return item.local_time;
  }


  if (
    !item.local_datetime
  ) {
    return '—';
  }


  try {
    return new Intl.DateTimeFormat(
      'en',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    ).format(
      new Date(
        item.local_datetime
      )
    );

  } catch {
    return '—';
  }
}


function formatDay(
  date
) {
  if (!date) {
    return '—';
  }


  const parts =
    date.split('-');


  if (
    parts.length !== 3
  ) {
    return date;
  }


  const [
    year,
    month,
    day,
  ] = parts.map(
    Number
  );


  const value =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );


  return new Intl.DateTimeFormat(
    'en',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }
  ).format(
    value
  );
}


function WeatherIcon({
  icon,
  description,
  size = 'small',
}) {
  if (!icon) {
    return null;
  }


  const className =
    size === 'large'
      ? 'h-14 w-14'
      : 'h-10 w-10';


  return (
    <img
      src={
        `https://openweathermap.org/img/wn/${icon}@2x.png`
      }
      alt={
        description ||
        'Weather condition'
      }
      className={
        className
      }
    />
  );
}


function ForecastUnavailable({
  error,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">

          <RefreshCw
            size={16}
          />

        </div>


        <div>

          <p className="primary-text text-xs font-semibold">
            Forecast temporarily unavailable
          </p>


          <p className="secondary-text mt-1 text-[11px] leading-5">
            {
              error ||
              (
                'Current weather is still available. '
                + 'Upcoming conditions could not be loaded right now.'
              )
            }
          </p>

        </div>

      </div>

    </div>
  );
}


function ForecastPanel({
  hourly = [],
  daily = [],
  loading = false,
  available = true,
  error = '',
  hasLocation = false,
}) {
  return (
    <div className="premium-card content-card rounded-3xl border p-5 sm:p-6">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <TrendingUp
              size={15}
              className="text-sky-500"
            />


            <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
              Forecast
            </p>

          </div>


          <h2 className="primary-text mt-2 text-lg font-semibold">
            Weather outlook
          </h2>


          <p className="secondary-text mt-1 text-xs">
            See how conditions are expected to change.
          </p>

        </div>


        {available &&
          hasLocation &&
          (
            hourly.length > 0 ||
            daily.length > 0
          ) && (
            <div className="meta-badge flex items-center gap-2 rounded-full border px-3 py-2">

              <CalendarDays
                size={12}
                className="text-sky-500"
              />


              <span className="secondary-text text-[10px]">
                Next 5 days
              </span>

            </div>
          )}

      </div>


      {!hasLocation && (
        <div className="empty-state mt-6 rounded-2xl border p-6">

          <p className="primary-text text-sm font-semibold">
            Choose a location
          </p>


          <p className="secondary-text mt-2 text-xs leading-5">
            Select a place to see the upcoming weather outlook.
          </p>

        </div>
      )}


      {hasLocation &&
        loading && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border p-6">

            <LoaderCircle
              size={20}
              className="animate-spin text-sky-500"
            />


            <div>

              <p className="primary-text text-xs font-semibold">
                Preparing your forecast
              </p>


              <p className="secondary-text mt-1 text-[10px]">
                Reading upcoming conditions…
              </p>

            </div>

          </div>
        )}


      {hasLocation &&
        !loading &&
        !available && (
          <ForecastUnavailable
            error={
              error
            }
          />
        )}


      {hasLocation &&
        !loading &&
        available &&
        hourly.length === 0 &&
        daily.length === 0 && (
          <div className="empty-state mt-6 rounded-2xl border p-6">

            <p className="primary-text text-sm font-semibold">
              No forecast data yet
            </p>


            <p className="secondary-text mt-2 text-xs leading-5">
              Current conditions are available, but no upcoming forecast points were returned.
            </p>

          </div>
        )}


      {hasLocation &&
        !loading &&
        available &&
        hourly.length > 0 && (
          <section className="mt-7">

            <div className="mb-4">

              <p className="primary-text text-sm font-semibold">
                Next 24 hours
              </p>


              <p className="secondary-text mt-1 text-[10px]">
                Conditions across the coming day
              </p>

            </div>


            <div className="grid gap-3 overflow-x-auto pb-2 sm:grid-cols-4 lg:grid-cols-8">

              {hourly.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.timestamp ||
                      index
                    }
                    className="forecast-hour-card min-w-[125px] rounded-2xl border p-3"
                  >

                    <p className="secondary-text text-[9px] font-semibold uppercase tracking-[0.1em]">
                      {
                        formatForecastTime(
                          item
                        )
                      }
                    </p>


                    <div className="my-2 flex justify-center">

                      <WeatherIcon
                        icon={
                          item.icon
                        }
                        description={
                          item.description
                        }
                      />

                    </div>


                    <p className="primary-text text-center text-lg font-semibold">
                      {
                        item.temperature != null
                          ? `${Math.round(item.temperature)}°`
                          : '—'
                      }
                    </p>


                    <p className="secondary-text mt-1 truncate text-center text-[9px] capitalize">
                      {
                        item.description ||
                        item.condition ||
                        'Weather'
                      }
                    </p>


                    <div className="mt-3 space-y-1.5">

                      <div className="flex items-center justify-between gap-2">

                        <span className="secondary-text flex items-center gap-1 text-[9px]">

                          <CloudRain
                            size={11}
                            className="text-sky-500"
                          />

                          Rain

                        </span>


                        <span className="secondary-text text-[9px]">
                          {
                            item.precipitation_probability != null
                              ? `${Math.round(
                                  item.precipitation_probability * 100
                                )}%`
                              : '—'
                          }
                        </span>

                      </div>


                      <div className="flex items-center justify-between gap-2">

                        <span className="secondary-text flex items-center gap-1 text-[9px]">

                          <Droplets
                            size={11}
                            className="text-sky-500"
                          />

                          Humidity

                        </span>


                        <span className="secondary-text text-[9px]">
                          {
                            item.humidity != null
                              ? `${item.humidity}%`
                              : '—'
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}


      {hasLocation &&
        !loading &&
        available &&
        daily.length > 0 && (
          <section className="mt-8">

            <div className="mb-4">

              <p className="primary-text text-sm font-semibold">
                5-day outlook
              </p>


              <p className="secondary-text mt-1 text-[10px]">
                Daily highs, lows and expected conditions
              </p>

            </div>


            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">

              {daily.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.date ||
                      index
                    }
                    className="forecast-day-card rounded-2xl border p-4"
                  >

                    <p className="primary-text text-xs font-semibold">
                      {
                        formatDay(
                          item.date
                        )
                      }
                    </p>


                    <div className="mt-2 flex items-center justify-between gap-3">

                      <WeatherIcon
                        icon={
                          item.icon
                        }
                        description={
                          item.description
                        }
                        size="large"
                      />


                      <div className="text-right">

                        <p className="primary-text text-lg font-semibold">
                          {
                            item.temperature_max != null
                              ? `${Math.round(
                                  item.temperature_max
                                )}°`
                              : '—'
                          }
                        </p>


                        <p className="secondary-text text-[10px]">
                          {
                            item.temperature_min != null
                              ? `${Math.round(
                                  item.temperature_min
                                )}° low`
                              : '—'
                          }
                        </p>

                      </div>

                    </div>


                    <p className="secondary-text mt-2 truncate text-[10px] capitalize">
                      {
                        item.description ||
                        item.condition ||
                        'Weather'
                      }
                    </p>


                    <div
                      className="mt-4 space-y-2 border-t pt-3"
                      style={{
                        borderColor:
                          'var(--border-subtle)',
                      }}
                    >

                      <div className="flex items-center justify-between">

                        <span className="secondary-text flex items-center gap-1.5 text-[9px]">

                          <CloudRain
                            size={11}
                          />

                          Rain

                        </span>


                        <span className="primary-text text-[9px] font-semibold">
                          {
                            item.precipitation_probability != null
                              ? `${Math.round(
                                  item.precipitation_probability * 100
                                )}%`
                              : '—'
                          }
                        </span>

                      </div>


                      <div className="flex items-center justify-between">

                        <span className="secondary-text flex items-center gap-1.5 text-[9px]">

                          <Droplets
                            size={11}
                          />

                          Humidity

                        </span>


                        <span className="primary-text text-[9px] font-semibold">
                          {
                            item.humidity != null
                              ? `${item.humidity}%`
                              : '—'
                          }
                        </span>

                      </div>


                      <div className="flex items-center justify-between">

                        <span className="secondary-text flex items-center gap-1.5 text-[9px]">

                          <Wind
                            size={11}
                          />

                          Wind

                        </span>


                        <span className="primary-text text-[9px] font-semibold">
                          {
                            item.wind_speed != null
                              ? `${Number(
                                  item.wind_speed
                                ).toFixed(1)} m/s`
                              : '—'
                          }
                        </span>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

    </div>
  );
}


export default ForecastPanel;