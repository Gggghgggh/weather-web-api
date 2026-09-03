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
  HelpCircle,
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
    simpleLabel: 'How hot or cold is it?',
    description:
      'Shows which places are colder and which places are warmer.',
    icon: Thermometer,

    legendTitle:
      'How hot or cold?',

    unit: '°C',

    tip:
      'Cool colors mean colder places. Yellow and orange mean warmer places.',

    legend: [
      {
        value: '-20°C',
        label: 'Very cold',
        color: 'rgb(32, 140, 236)',
      },
      {
        value: '0°C',
        label: 'Cold',
        color: 'rgb(35, 221, 221)',
      },
      {
        value: '10°C',
        label: 'Cool',
        color: 'rgb(194, 255, 40)',
      },
      {
        value: '20°C',
        label: 'Warm',
        color: 'rgb(255, 240, 40)',
      },
      {
        value: '25°C',
        label: 'Quite warm',
        color: 'rgb(255, 194, 40)',
      },
      {
        value: '30°C+',
        label: 'Hot',
        color: 'rgb(252, 128, 20)',
      },
    ],
  },


  {
    id: 'precipitation',
    label: 'Rain',
    simpleLabel: 'Where is it raining?',
    description:
      'Shows where rain or snow is falling and how heavy it is.',
    icon: CloudRain,

    legendTitle:
      'How much rain?',

    unit: 'mm',

    tip:
      'A faint color means very little rain. A stronger blue means heavier rain.',

    legend: [
      {
        value: '0 mm',
        label: 'No rain',
        color: 'rgba(225, 200, 100, 0.2)',
      },
      {
        value: '0.5 mm',
        label: 'Very light',
        color: 'rgba(120, 120, 190, 0.35)',
      },
      {
        value: '1 mm',
        label: 'Light rain',
        color: 'rgba(110, 110, 205, 0.55)',
      },
      {
        value: '10 mm',
        label: 'Heavy rain',
        color: 'rgb(80, 80, 225)',
      },
      {
        value: '140 mm',
        label: 'Very heavy',
        color: 'rgb(20, 20, 255)',
      },
    ],
  },


  {
    id: 'clouds',
    label: 'Clouds',
    simpleLabel: 'How cloudy is the sky?',
    description:
      'Shows how much of the sky is covered by clouds.',
    icon: Cloud,

    legendTitle:
      'How cloudy?',

    unit: '%',

    tip:
      'The more solid the white color becomes, the more clouds there are in the sky.',

    legend: [
      {
        value: '0%',
        label: 'Clear sky',
        color: 'rgba(255,255,255,0.08)',
      },
      {
        value: '25%',
        label: 'A few clouds',
        color: 'rgba(252,251,255,0.3)',
      },
      {
        value: '50%',
        label: 'Half cloudy',
        color: 'rgba(247,247,255,0.55)',
      },
      {
        value: '75%',
        label: 'Mostly cloudy',
        color: 'rgba(244,244,255,0.8)',
      },
      {
        value: '100%',
        label: 'Fully cloudy',
        color: 'rgb(240,240,255)',
      },
    ],
  },


  {
    id: 'wind',
    label: 'Wind',
    simpleLabel: 'How strong is the wind?',
    description:
      'Shows places with gentle wind and places with stronger wind.',
    icon: Wind,

    legendTitle:
      'How strong is the wind?',

    unit: 'm/s',

    tip:
      'Very pale areas have gentle wind. Dark purple areas have stronger wind.',

    legend: [
      {
        value: '1 m/s',
        label: 'Very gentle',
        color: 'rgba(255,255,255,0.35)',
      },
      {
        value: '5 m/s',
        label: 'Gentle',
        color: 'rgb(238,206,206)',
      },
      {
        value: '15 m/s',
        label: 'Strong',
        color: 'rgb(179,100,188)',
      },
      {
        value: '25 m/s',
        label: 'Very strong',
        color: 'rgb(63,33,59)',
      },
      {
        value: '50 m/s+',
        label: 'Extreme',
        color: 'rgb(116,76,172)',
      },
    ],
  },


  {
    id: 'pressure',
    label: 'Air Pressure',
    simpleLabel: 'How heavy is the air?',
    description:
      'Shows changes in air pressure across different places.',
    icon: Gauge,

    legendTitle:
      'Air pressure',

    unit: 'hPa',

    tip:
      'Blue areas have lower air pressure. Orange and red areas have higher air pressure.',

    legend: [
      {
        value: '940 hPa',
        label: 'Very low',
        color: 'rgb(0,115,255)',
      },
      {
        value: '980 hPa',
        label: 'Low',
        color: 'rgb(75,208,214)',
      },
      {
        value: '1000 hPa',
        label: 'Normal-low',
        color: 'rgb(141,231,199)',
      },
      {
        value: '1010 hPa',
        label: 'Normal',
        color: 'rgb(176,247,32)',
      },
      {
        value: '1020 hPa',
        label: 'High',
        color: 'rgb(240,184,0)',
      },
      {
        value: '1060 hPa+',
        label: 'Very high',
        color: 'rgb(243,54,59)',
      },
    ],
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
      opacity={0.68}
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
        layer.id ===
        activeLayer
    );


  function toggleLayer(
    layerId
  ) {
    if (
      activeLayer ===
      layerId
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
            (current) =>
              !current
          )
        }
        className="map-control-button flex min-h-11 items-center gap-2 rounded-2xl border px-3.5 shadow-lg"
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
          <span className="h-2 w-2 rounded-full bg-sky-500" />
        )}
      </button>


      {open && (
        <div className="map-layer-panel absolute right-0 top-[calc(100%+10px)] w-[300px] overflow-hidden rounded-3xl border p-2 shadow-2xl">

          <div className="px-3 pb-3 pt-2">
            <p className="primary-text text-sm font-semibold">
              What do you want to see?
            </p>

            <p className="secondary-text mt-1 text-[11px] leading-5">
              Pick one weather layer.
              The colors on the map will
              show you what is happening.
            </p>
          </div>


          <div className="space-y-1">

            {WEATHER_LAYERS.map(
              (layer) => {
                const Icon =
                  layer.icon;

                const isActive =
                  activeLayer ===
                  layer.id;

                return (
                  <button
                    key={
                      layer.id
                    }
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
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-sky-500 text-white'
                          : 'bg-sky-500/10 text-sky-500'
                      }`}
                    >
                      <Icon
                        size={17}
                      />
                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="primary-text text-xs font-semibold">
                        {layer.label}
                      </p>

                      <p className="secondary-text mt-0.5 text-[10px] leading-4">
                        {
                          layer.simpleLabel
                        }
                      </p>

                    </div>


                    {isActive && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    )}

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
                  setActiveLayer(
                    null
                  )
                }
                className="secondary-text w-full rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition hover:bg-red-500/5 hover:text-red-500"
              >
                Turn weather colors off
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}


function WeatherLegend({
  activeLayer,
}) {
  if (!activeLayer) {
    return null;
  }


  const layer =
    WEATHER_LAYERS.find(
      (item) =>
        item.id ===
        activeLayer
    );


  if (!layer) {
    return null;
  }


  const Icon =
    layer.icon;


  return (
    <div className="absolute bottom-5 left-4 z-[750] w-[290px] max-w-[calc(100%-32px)]">

      <div className="weather-legend overflow-hidden rounded-3xl border shadow-2xl">

        <div className="weather-legend-header flex items-start gap-3 border-b p-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <Icon
              size={18}
            />
          </div>


          <div className="min-w-0">

            <p className="secondary-text text-[9px] font-semibold uppercase tracking-[0.16em]">
              How to read the map
            </p>

            <p className="primary-text mt-1 text-sm font-semibold">
              {layer.legendTitle}
            </p>

            <p className="secondary-text mt-1 text-[10px] leading-4">
              {layer.tip}
            </p>

          </div>

        </div>


        <div className="p-4">

          <div className="space-y-2.5">

            {layer.legend.map(
              (item) => (
                <div
                  key={`${layer.id}-${item.value}`}
                  className="flex items-center gap-3"
                >

                  <span
                    className="weather-legend-color h-4 w-7 shrink-0 rounded-md border"
                    style={{
                      background:
                        item.color,
                    }}
                  />


                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">

                    <span className="primary-text text-[11px] font-medium">
                      {item.label}
                    </span>

                    <span className="secondary-text whitespace-nowrap text-[10px]">
                      {item.value}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>


          <div className="weather-legend-help mt-4 flex items-start gap-2 rounded-xl p-3">

            <HelpCircle
              size={14}
              className="mt-0.5 shrink-0 text-sky-500"
            />

            <p className="secondary-text text-[10px] leading-4">
              Find the color on the map,
              then look for the same color
              in this key. The words tell
              you what that color means.
            </p>

          </div>

        </div>

      </div>

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
        item.id ===
        activeLayer
    );


  if (!layer) {
    return null;
  }


  const Icon =
    layer.icon;


  return (
    <div className="pointer-events-none absolute left-1/2 top-5 z-[700] -translate-x-1/2">

      <div className="map-layer-badge flex items-center gap-2 rounded-2xl border px-3.5 py-2 shadow-lg">

        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
          <Icon
            size={14}
          />
        </div>


        <div>
          <p className="primary-text text-[11px] font-semibold">
            {layer.label}
          </p>

          <p className="secondary-text text-[9px]">
            {layer.simpleLabel}
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
          activeLayer={
            activeLayer
          }
          onTileError={() => {
            setLayerError(
              'The weather colors could not be loaded. Please try another layer or try again shortly.'
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
        activeLayer={
          activeLayer
        }
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


      <WeatherLegend
        activeLayer={
          activeLayer
        }
      />


      {layerError && (
        <div className="absolute bottom-5 right-4 z-[850] max-w-[280px]">

          <div className="map-layer-error flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl">

            <div className="min-w-0">

              <p className="primary-text text-xs font-semibold">
                Weather colors unavailable
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
              <X
                size={15}
              />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}


export default WeatherMap;
