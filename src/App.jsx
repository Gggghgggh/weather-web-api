import { useEffect, useState } from 'react';
import WeatherMap from './components/WeatherMap';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    async function checkApi() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();

        setApiStatus(
          data.status === 'ok'
            ? 'API Connected'
            : 'API unavailable'
        );
      } catch {
        setApiStatus('API unavailable');
      }
    }

    checkApi();
  }, []);

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
              className={`h-2 w-2 rounded-full ${
                apiStatus === 'API Connected'
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
              }`}
            />

            {apiStatus}
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Selected Location
          </p>

          {selectedLocation ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-slate-500">
                  Latitude
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {selectedLocation.latitude.toFixed(6)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Longitude
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">
                  Weather integration is coming next.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5">
              <p className="text-sm leading-6 text-slate-400">
                Click anywhere on the map to select a location.
              </p>
            </div>
          )}
        </aside>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="h-[calc(100vh-130px)] min-h-[600px]">
            <WeatherMap onLocationSelect={setSelectedLocation} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;