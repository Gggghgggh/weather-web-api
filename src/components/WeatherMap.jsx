import {
  useEffect,
  useState,
} from 'react';

import L from 'leaflet';

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import {
  Cloud,
  CloudRain,
  Gauge,
  Layers3,
  Thermometer,
  Wind,
  X,
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';

import markerIcon
  from 'leaflet/dist/images/marker-icon.png';

import markerIcon2x
  from 'leaflet/dist/images/marker-icon-2x.png';

import markerShadow
  from 'leaflet/dist/images/marker-shadow.png';


const defaultMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


const WEATHER_LAYERS = [
  {
    id: 'temperature',
    label: 'Temperature',
    description: 'Surface temperature',
    icon: Thermometer,
  },
  {
    id: 'precipitation',
    label: 'Precipitation',
    description: 'Rain and snowfall',
    icon: CloudRain,
  },
  {
    id: 'clouds',
    label: 'Clouds',
    description: 'Cloud coverage',
    icon: Cloud,
  },
  {
    id: 'wind',
    label: 'Wind',
    description: 'Wind speed',
    icon: Wind,
  },
  {
    id: 'pressure',
    label: 'Pressure',
    description: 'Atmospheric pressure',
    icon: Gauge,
  },
];


function MapController({
  selectedLocation,
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocation) {
      return;
    }

    map.flyTo(
      [
        selectedLocation.latitude,
        selectedLocation.longitude,
      ],
      15,
      {
        duration: 1.3,
      }
    );
  }, [
    selectedLocation,
    map,
  ]);

  return null;
}


function LocationMarker({
  selectedLocation,
  onLocationSelect,
}) {
  const [
    position,
    setPosition,
  ] = useState(null);

  useEffect(() => {
    if (!selectedLocation) {
      return;
    }

    setPosition([
      selectedLocation.latitude,
      selectedLocation.longitude,
    ]);
  }, [
    selectedLocation,
  ]);

  useMapEvents({
    click(event) {
      const latitude =
        event.latlng.lat;

      const longitude =
        event.latlng.lng;

      setPosition([
        latitude,
        longitude,
      ]);

      if (onLocationSelect) {
        onLocationSelect({
          latitude,
          longitude,
        });
      }
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={defaultMarkerIcon}
    >
      <Popup>
        <div>
          <strong>
            Selected location
          </strong>

          <br />

          {position[0].toFixed(5)}
          ,{' '}
          {position[1].toFixed(5)}
        </div>
      </Popup>
    </Marker>
  );
}


function WeatherOverlay({
  activeLayer,
  onTileError,
}) {
  if (!activeLayer) {
    return null;
  }

  return (
    <TileLayer
      key={activeLayer}
      url={`/api/weather/tiles/${activeLayer}/{z}/{x}/{y}.png`}
      opacity={0.62}
      attribution="Weather data © OpenWeather"
      eventHandlers={{
        tileerror() {
          if (onTileError) {
            onTileError();
          }
        },
      }}
    />
  );
}


function WeatherLayerControl({
  activeLayer,
  setActiveLayer,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const selected =
    WEATHER_LAYERS.find(
      (layer) =>
        layer.id === activeLayer
    );

  function toggleLayer(
    layerId
  ) {
    if (
      activeLayer === layerId
    ) {
      setActiveLayer(null);
      return;
    }

    setActiveLayer(layerId);
  }

  return (
    <div className="weather-layer-control absolute right-4 top-4 z-[800]">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        className="map-control-button flex h-11 items-center gap-2 rounded-2xl border px-3.5 shadow-lg"
      >
        {open ? (
          <X size={17} />
        ) : (
          <Layers3 size={17} />
        )}

        <span className="hidden text-xs font-semibold sm:inline">
          {selected
            ? selected.label
            : 'Weather layers'}
        </span>

        {activeLayer && (
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        )}
      </button>

      {open && (
        <div className="map-layer-panel absolute right-0 top-[calc(100%+10px)] w-[270px] overflow-hidden rounded-3xl border p-2 shadow-2xl">
          <div className="px-3 pb-3 pt-2">
            <p className="primary-text text-sm font-semibold">
              Weather layers
            </p>

            <p className="secondary-text mt-1 text-[11px] leading-5">
              Visualize atmospheric conditions directly across the map.
            </p>
          </div>

          <div className="space-y-1">
            {WEATHER_LAYERS.map(
              (layer) => {
                const Icon =
                  layer.icon;

                const isActive =
                  activeLayer === layer.id;

                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() =>
                      toggleLayer(
                        layer.id
                      )
                    }
                    className={`map-layer-option flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      isActive
                        ? 'map-layer-option-active'
                        : ''
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-sky-500 text-white'
                          : 'bg-sky-500/10 text-sky-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="primary-text text-xs font-semibold">
                        {layer.label}
                      </p>

                      <p className="secondary-text mt-0.5 text-[10px]">
                        {
                          layer.description
                        }
                      </p>
                    </div>

                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? 'bg-sky-500'
                          : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              }
            )}
          </div>

          {activeLayer && (
            <div
              className="mx-2 mt-2 border-t pt-2"
              style={{
                borderColor:
                  'var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveLayer(null)
                }
                className="secondary-text w-full rounded-xl px-3 py-2 text-left text-[11px] font-medium transition hover:bg-red-500/5 hover:text-red-500"
              >
                Clear weather layer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function ActiveLayerBadge({
  activeLayer,
}) {
  if (!activeLayer) {
    return null;
  }

  const layer =
    WEATHER_LAYERS.find(
      (item) =>
        item.id === activeLayer
    );

  if (!layer) {
    return null;
  }

  const Icon =
    layer.icon;

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-[700] -translate-x-1/2">
      <div className="map-layer-badge flex items-center gap-2 rounded-2xl border px-3.5 py-2 shadow-lg">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
          <Icon size={14} />
        </div>

        <div>
          <p className="primary-text text-[11px] font-semibold">
            {layer.label}
          </p>

          <p className="secondary-text text-[9px]">
            Map overlay
          </p>
        </div>
      </div>
    </div>
  );
}


function WeatherMap({
  selectedLocation,
  onLocationSelect,
}) {
  const [
    activeLayer,
    setActiveLayer,
  ] = useState(null);

  const [
    layerError,
    setLayerError,
  ] = useState('');

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[
          -1.286389,
          36.817223,
        ]}
        zoom={7}
        scrollWheelZoom
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <WeatherOverlay
          activeLayer={activeLayer}
          onTileError={() => {
            setLayerError(
              'The selected weather layer could not be loaded. Please try again.'
            );
          }}
        />

        <MapController
          selectedLocation={
            selectedLocation
          }
        />

        <LocationMarker
          selectedLocation={
            selectedLocation
          }
          onLocationSelect={
            onLocationSelect
          }
        />
      </MapContainer>

      <WeatherLayerControl
        activeLayer={activeLayer}
        setActiveLayer={(layer) => {
          setLayerError('');
          setActiveLayer(layer);
        }}
      />

      <ActiveLayerBadge
        activeLayer={
          activeLayer
        }
      />

      {layerError && (
        <div className="absolute bottom-5 right-4 z-[850] max-w-[280px]">
          <div className="map-layer-error flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl">
            <div className="min-w-0">
              <p className="primary-text text-xs font-semibold">
                Weather layer unavailable
              </p>

              <p className="secondary-text mt-1 text-[11px] leading-5">
                {layerError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setLayerError('')
              }
              className="secondary-text shrink-0 rounded-lg p-1 transition hover:text-red-500"
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default WeatherMap;