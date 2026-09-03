import {
  useEffect,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';


function formatAlertTime(
  timestamp
) {
  if (!timestamp) {
    return 'Unknown';
  }


  return new Intl
    .DateTimeFormat(
      undefined,
      {
        dateStyle:
          'medium',

        timeStyle:
          'short',
      }
    )
    .format(
      new Date(
        timestamp * 1000
      )
    );
}


function WeatherAlertsPanel({
  selectedLocation,
}) {
  const [
    alerts,
    setAlerts,
  ] = useState([]);


  const [
    available,
    setAvailable,
  ] = useState(true);


  const [
    message,
    setMessage,
  ] = useState('');


  const [
    loading,
    setLoading,
  ] = useState(false);


  useEffect(() => {
    if (!selectedLocation) {
      setAlerts([]);
      setMessage('');
      return;
    }


    let cancelled =
      false;


    async function loadAlerts() {
      setLoading(true);
      setMessage('');


      try {
        const params =
          new URLSearchParams({
            lat:
              selectedLocation
                .latitude
                .toString(),

            lon:
              selectedLocation
                .longitude
                .toString(),
          });


        const response =
          await fetch(
            `/api/weather/alerts?${params}`
          );


        const data =
          await response.json();


        if (cancelled) {
          return;
        }


        if (!response.ok) {
          throw new Error(
            data.detail ||
            'Unable to retrieve weather alerts.'
          );
        }


        setAvailable(
          data.available !==
          false
        );

        setAlerts(
          data.alerts || []
        );

        setMessage(
          data.message || ''
        );

      } catch {
        if (!cancelled) {
          setAvailable(false);
          setAlerts([]);

          setMessage(
            'Weather alerts are temporarily unavailable.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadAlerts();


    return () => {
      cancelled = true;
    };

  }, [
    selectedLocation
      ?.latitude,
    selectedLocation
      ?.longitude,
  ]);


  return (
    <section className="premium-card rounded-3xl border p-5">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
            Safety intelligence
          </p>

          <h2 className="primary-text mt-1 text-lg font-semibold">
            Weather alerts
          </h2>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <ShieldAlert
            size={17}
          />
        </div>

      </div>


      {!selectedLocation && (
        <p className="secondary-text mt-5 text-xs">
          Select a location to check for active weather warnings.
        </p>
      )}


      {selectedLocation &&
        loading && (
          <div className="mt-6 flex items-center gap-3 py-5">

            <LoaderCircle
              size={18}
              className="animate-spin text-sky-500"
            />

            <span className="secondary-text text-xs">
              Checking active alerts…
            </span>

          </div>
        )}


      {selectedLocation &&
        !loading &&
        !available && (
          <div className="empty-state mt-5 rounded-2xl border p-4">

            <p className="primary-text text-xs font-semibold">
              Alert feed unavailable
            </p>

            <p className="secondary-text mt-2 text-[10px] leading-5">
              {message}
            </p>

          </div>
        )}


      {selectedLocation &&
        !loading &&
        available &&
        alerts.length === 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">

            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0 text-emerald-500"
            />


            <div>

              <p className="primary-text text-xs font-semibold">
                No active warnings
              </p>

              <p className="secondary-text mt-1 text-[10px]">
                No severe-weather alert is currently reported for this location.
              </p>

            </div>

          </div>
        )}


      {!loading &&
        alerts.length > 0 && (
          <div className="mt-5 space-y-3">

            {alerts.map(
              (
                alert,
                index
              ) => (
                <article
                  key={
                    `${alert.event}-${index}`
                  }
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
                >

                  <div className="flex items-start gap-3">

                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />


                    <div>

                      <h3 className="primary-text text-xs font-semibold">
                        {alert.event}
                      </h3>

                      {alert.sender_name && (
                        <p className="secondary-text mt-1 text-[9px]">
                          {
                            alert.sender_name
                          }
                        </p>
                      )}

                    </div>

                  </div>


                  <div className="secondary-text mt-4 grid gap-1 text-[9px] sm:grid-cols-2">

                    <p>
                      Starts:{' '}
                      {
                        formatAlertTime(
                          alert.start
                        )
                      }
                    </p>

                    <p>
                      Ends:{' '}
                      {
                        formatAlertTime(
                          alert.end
                        )
                      }
                    </p>

                  </div>


                  {alert.description && (
                    <p className="secondary-text mt-4 whitespace-pre-line text-[10px] leading-5">
                      {alert.description}
                    </p>
                  )}

                </article>
              )
            )}

          </div>
        )}

    </section>
  );
}


export default WeatherAlertsPanel;