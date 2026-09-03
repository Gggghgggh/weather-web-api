import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import L from 'leaflet';

import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import {
  Cloud,
  CloudRain,
  Gauge,
  HelpCircle,
  Layers3,
  LoaderCircle,
  MapPin,
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

  iconSize: [
    25,
    41,
  ],

  iconAnchor: [
    12,
    41,
  ],

  popupAnchor: [
    1,
    -34,
  ],

  shadowSize: [
    41,
    41,
  ],
});


L.Marker.prototype.options.icon =
  defaultMarkerIcon;


const WEATHER_LAYERS = [
  {
    id: 'temperature',
    label: 'Temperature',
    question: 'How hot or cold is it?',
    icon: Thermometer,

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
    question: 'Where is it raining?',
    icon: CloudRain,

    legend: [
      {
        value: '0 mm',
        label: 'No rain',
        color: 'rgba(225, 200, 100, 0.25)',
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
    question: 'How cloudy is the sky?',
    icon: Cloud,

    legend: [
      {
        value: '0%',
        label: 'Clear',
        color: 'rgba(255, 255, 255, 0.08)',
      },

      {
        value: '25%',
        label: 'Few clouds',
        color: 'rgba(255, 255, 255, 0.25)',
      },

      {
        value: '50%',
        label: 'Half cloudy',
        color: 'rgba(255, 255, 255, 0.45)',
      },

      {
        value: '75%',
        label: 'Mostly cloudy',
        color: 'rgba(255, 255, 255, 0.68)',
      },

      {
        value: '100%',
        label: 'Fully cloudy',
        color: 'rgba(255, 255, 255, 0.92)',
      },
    ],
  },

  {
    id: 'wind',
    label: 'Wind',
    question: 'How strong is the wind?',
    icon: Wind,

    legend: [
      {
        value: '1 m/s',
        label: 'Very gentle',
        color: 'rgb(235, 242, 255)',
      },

      {
        value: '5 m/s',
        label: 'Gentle',
        color: 'rgb(155, 220, 255)',
      },

      {
        value: '15 m/s',
        label: 'Strong',
        color: 'rgb(70, 180, 255)',
      },

      {
        value: '25 m/s',
        label: 'Very strong',
        color: 'rgb(120, 90, 220)',
      },

      {
        value: '50+ m/s',
        label: 'Extreme',
        color: 'rgb(170, 45, 150)',
      },
    ],
  },

  {
    id: 'pressure',
    label: 'Air Pressure',
    question: 'How heavy is the air?',
    icon: Gauge,

    legend: [
      {
        value: '940 hPa',
        label: 'Very low',
        color: 'rgb(0, 115, 255)',
      },

      {
        value: '980 hPa',
        label: 'Low',
        color: 'rgb(70, 190, 255)',
      },

      {
        value: '1000 hPa',
        label: 'Normal-low',
        color: 'rgb(120, 220, 170)',
      },

      {
        value: '1010 hPa',
        label: 'Normal',
        color: 'rgb(230, 235, 120)',
      },

      {
        value: '1020 hPa',
        label: 'High',
        color: 'rgb(255, 175, 80)',
      },

      {
        value: '1060+ hPa',
        label: 'Very high',
        color: 'rgb(230, 80, 70)',
      },
    ],
  },
];


function getTemperatureMeaning(
  value
) {
  if (value == null) {
    return null;
  }

  if (value < 5) {
    return {
      label: 'Very cold',
      message: 'It is very cold here.',
      advice:
        'Wear warm clothing if you are going outside.',
    };
  }

  if (value < 15) {
    return {
      label: 'Cool',
      message: 'The air feels cool.',
      advice:
        'A light jacket may be useful.',
    };
  }

  if (value < 23) {
    return {
      label: 'Comfortable',
      message:
        'The temperature is comfortable.',
      advice:
        'Conditions should feel pleasant for most outdoor activities.',
    };
  }

  if (value < 28) {
    return {
      label: 'Warm',
      message:
        'It is comfortably warm here.',
      advice:
        'Carry water if you will be outside for a long time.',
    };
  }

  if (value < 33) {
    return {
      label: 'Hot',
      message:
        'It is hot outside.',
      advice:
        'Stay hydrated and look for shade when needed.',
    };
  }

  return {
    label: 'Very hot',
    message:
      'The temperature is very high.',
    advice:
      'Limit long periods in direct sunlight and drink enough water.',
  };
}


function getRainMeaning(
  value
) {
  if (value == null) {
    return null;
  }

  if (value <= 0) {
    return {
      label: 'No rain',
      message:
        'No recent rain is being reported here.',
      advice:
        'Rain protection is probably not needed right now.',
    };
  }

  if (value < 1) {
    return {
      label: 'Very light rain',
      message:
        'Only a small amount of rain is falling.',
      advice:
        'You may only need light rain protection.',
    };
  }

  if (value < 4) {
    return {
      label: 'Light rain',
      message:
        'There is noticeable rain in this area.',
      advice:
        'An umbrella or raincoat may be useful.',
    };
  }

  if (value < 10) {
    return {
      label: 'Moderate rain',
      message:
        'Rain is falling steadily.',
      advice:
        'Take rain protection and expect wet roads or paths.',
    };
  }

  return {
    label: 'Heavy rain',
    message:
      'A large amount of rain is falling.',
    advice:
      'Use extra care outdoors and when travelling.',
  };
}


function getCloudMeaning(
  value
) {
  if (value == null) {
    return null;
  }

  if (value < 15) {
    return {
      label: 'Clear sky',
      message:
        'There are very few clouds in the sky.',
      advice:
        'Expect plenty of direct sunshine.',
    };
  }

  if (value < 40) {
    return {
      label: 'A few clouds',
      message:
        'There are some clouds, but much of the sky is still clear.',
      advice:
        'Sunshine should still be common.',
    };
  }

  if (value < 70) {
    return {
      label: 'Partly cloudy',
      message:
        'Clouds cover about half of the sky.',
      advice:
        'Expect a mix of sunshine and cloud.',
    };
  }

  if (value < 90) {
    return {
      label: 'Mostly cloudy',
      message:
        'Most of the sky is covered by clouds.',
      advice:
        'Expect less direct sunshine.',
    };
  }

  return {
    label: 'Overcast',
    message:
      'Almost the whole sky is covered by clouds.',
    advice:
      'The sky will likely look grey with little direct sunshine.',
  };
}


function getWindMeaning(
  value
) {
  if (value == null) {
    return null;
  }

  if (value < 2) {
    return {
      label: 'Very gentle',
      message:
        'The air is almost calm.',
      advice:
        'You may barely notice the wind.',
    };
  }

  if (value < 5) {
    return {
      label: 'Gentle breeze',
      message:
        'There is a light breeze.',
      advice:
        'The wind should feel comfortable outdoors.',
    };
  }

  if (value < 10) {
    return {
      label: 'Breezy',
      message:
        'The wind is noticeable.',
      advice:
        'Secure light outdoor items such as papers or hats.',
    };
  }

  if (value < 17) {
    return {
      label: 'Strong wind',
      message:
        'The wind is strong.',
      advice:
        'Be careful with loose outdoor objects.',
    };
  }

  return {
    label: 'Very strong wind',
    message:
      'The wind is very strong.',
    advice:
      'Use extra care outdoors and avoid unsecured objects.',
  };
}


function getPressureMeaning(
  value
) {
  if (value == null) {
    return null;
  }

  if (value < 990) {
    return {
      label: 'Low pressure',
      message:
        'The air pressure is lower than usual.',
      advice:
        'Lower pressure can sometimes come with unsettled weather.',
    };
  }

  if (value < 1015) {
    return {
      label: 'Normal pressure',
      message:
        'The air pressure is within a common range.',
      advice:
        'This reading is close to normal atmospheric pressure.',
    };
  }

  if (value < 1030) {
    return {
      label: 'High pressure',
      message:
        'The air pressure is higher than usual.',
      advice:
        'Higher pressure is often linked with calmer weather.',
    };
  }

  return {
    label: 'Very high pressure',
    message:
      'The air pressure is quite high.',
    advice:
      'Conditions may remain relatively stable and calm.',
  };
}


function getLayerReading(
  layer,
  weather
) {
  if (
    !layer ||
    !weather
  ) {
    return null;
  }

  if (
    layer ===
    'temperature'
  ) {
    const value =
      weather.temperature;

    return {
      value:
        value != null
          ? `${Math.round(value)}°C`
          : '—',

      meaning:
        getTemperatureMeaning(
          value
        ),
    };
  }

  if (
    layer ===
    'precipitation'
  ) {
    const value =
      weather.rain_1h ??
      weather.rain_3h ??
      0;

    return {
      value:
        `${Number(
          value
        ).toFixed(1)} mm`,

      meaning:
        getRainMeaning(
          Number(value)
        ),
    };
  }

  if (
    layer ===
    'clouds'
  ) {
    const value =
      weather.cloudiness;

    return {
      value:
        value != null
          ? `${Math.round(value)}%`
          : '—',

      meaning:
        getCloudMeaning(
          value
        ),
    };
  }

  if (
    layer ===
    'wind'
  ) {
    const value =
      weather.wind_speed;

    return {
      value:
        value != null
          ? `${Number(
              value
            ).toFixed(1)} m/s`
          : '—',

      meaning:
        getWindMeaning(
          value
        ),
    };
  }

  if (
    layer ===
    'pressure'
  ) {
    const value =
      weather.pressure;

    return {
      value:
        value != null
          ? `${Math.round(
              value
            )} hPa`
          : '—',

      meaning:
        getPressureMeaning(
          value
        ),
    };
  }

  return null;
}


function getNearbyPlaceColor(
  category
) {
  switch (category) {
    case 'hospital':
      return '#ef4444';

    case 'pharmacy':
      return '#10b981';

    case 'police':
      return '#3b82f6';

    case 'school':
      return '#8b5cf6';

    case 'restaurant':
      return '#f97316';

    case 'fuel':
      return '#eab308';

    case 'atm':
      return '#06b6d4';

    case 'hotel':
      return '#ec4899';

    case 'clinic':
      return '#14b8a6';

    case 'bank':
      return '#6366f1';

    case 'cafe':
      return '#a16207';

    case 'supermarket':
      return '#22c55e';

    default:
      return '#0ea5e9';
  }
}


function MapController({
  selectedLocation,
}) {
  const map =
    useMap();

  useEffect(() => {
    if (
      !selectedLocation
    ) {
      return;
    }

    map.flyTo(
      [
        selectedLocation.latitude,
        selectedLocation.longitude,
      ],
      15,
      {
        duration: 1.2,
      }
    );

  }, [
    map,
    selectedLocation,
  ]);

  return null;
}


function MapClickHandler({
  onLocationSelect,
}) {
  useMapEvents({
    click(event) {
      onLocationSelect?.({
        latitude:
          event.latlng.lat,

        longitude:
          event.latlng.lng,
      });
    },
  });

  return null;
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
      opacity={0.67}
      attribution="Weather data © OpenWeather"
      eventHandlers={{
        tileerror() {
          onTileError?.();
        },
      }}
    />
  );
}


function WeatherLayerControl({
  activeLayer,
  setActiveLayer,
  onLayerChange,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);


  function selectLayer(
    layer
  ) {
    setActiveLayer(
      layer
    );

    onLayerChange?.();

    setOpen(false);
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
        className="map-control-button flex h-11 items-center gap-2 rounded-2xl border px-3 text-xs font-semibold shadow-lg"
      >
        <Layers3
          size={16}
        />

        <span className="hidden sm:inline">
          Weather layers
        </span>
      </button>


      {open && (
        <div className="map-layer-panel absolute right-0 top-[calc(100%+10px)] w-[300px] overflow-hidden rounded-3xl border p-3 shadow-2xl">

          <div className="flex items-start justify-between gap-3 px-2 pb-3">

            <div>

              <p className="primary-text text-xs font-semibold">
                What do you want to see?
              </p>

              <p className="secondary-text mt-1 text-[10px] leading-4">
                Choose one. We will explain the colors and readings for you.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="secondary-text rounded-xl p-2"
              aria-label="Close weather layers"
            >
              <X
                size={15}
              />
            </button>

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
                    key={layer.id}
                    type="button"
                    onClick={() =>
                      selectLayer(
                        layer.id
                      )
                    }
                    className={`map-layer-option flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                      isActive
                        ? 'map-layer-option-active'
                        : ''
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                      <Icon
                        size={16}
                      />
                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="primary-text text-xs font-semibold">
                        {layer.label}
                      </p>

                      <p className="secondary-text mt-1 text-[9px]">
                        {layer.question}
                      </p>

                    </div>


                    {isActive && (
                      <span className="map-layer-badge rounded-full px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em]">
                        On
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>


          {activeLayer && (
            <button
              type="button"
              onClick={() =>
                selectLayer(null)
              }
              className="secondary-text mt-3 flex w-full items-center justify-center rounded-2xl border px-3 py-2.5 text-[10px] font-semibold"
            >
              Turn weather colors off
            </button>
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


  return (
    <div className="weather-legend absolute bottom-4 left-4 z-[700] w-[220px] rounded-2xl border p-3 shadow-xl">

      <div className="weather-legend-header flex items-start gap-2">

        <HelpCircle
          size={14}
          className="mt-0.5 shrink-0 text-sky-500"
        />


        <div>

          <p className="primary-text text-[10px] font-semibold">
            Color key
          </p>

          <p className="secondary-text mt-0.5 text-[8px]">
            {layer.label}
          </p>

        </div>

      </div>


      <div className="mt-3 space-y-1.5">

        {layer.legend.map(
          (item) => (
            <div
              key={`${item.value}-${item.label}`}
              className="flex items-center gap-2"
            >

              <span
                className="weather-legend-color h-3 w-3 shrink-0 rounded-full border"
                style={{
                  background:
                    item.color,
                }}
              />


              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">

                <span className="secondary-text text-[8px]">
                  {item.label}
                </span>

                <span className="primary-text text-[8px] font-semibold">
                  {item.value}
                </span>

              </div>

            </div>
          )
        )}

      </div>


      <p className="weather-legend-help mt-3 rounded-xl border p-2 text-[8px] leading-4">
        Match a map color with the same color here. The words explain what it means.
      </p>

    </div>
  );
}


function SelectedReadingCard({
  activeLayer,
  weather,
  place,
  loading,
  selectedLocation,
}) {
  if (
    !activeLayer ||
    !selectedLocation
  ) {
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

  const reading =
    getLayerReading(
      activeLayer,
      weather
    );

  const Icon =
    layer.icon;


  return (
    <div className="weather-reading-card absolute left-4 top-4 z-[750] w-[250px] rounded-3xl border p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">

          <Icon
            size={16}
          />

        </div>


        <div className="min-w-0">

          <p className="secondary-text text-[8px] font-semibold uppercase tracking-[0.14em]">
            Selected location
          </p>

          <p className="primary-text mt-1 truncate text-xs font-semibold">
            {
              place?.name ||
              place?.city ||
              place?.town ||
              place?.suburb ||
              place?.village ||
              'Selected location'
            }
          </p>

        </div>

      </div>


      {loading && (
        <div className="mt-4 flex items-center gap-2 py-3">

          <LoaderCircle
            size={15}
            className="animate-spin text-sky-500"
          />

          <p className="secondary-text text-[9px]">
            Reading local conditions…
          </p>

        </div>
      )}


      {!loading &&
        !weather && (
          <div className="mt-4">

            <p className="secondary-text text-[9px] leading-4">
              Weather data is not available for this location right now.
            </p>

          </div>
        )}


      {!loading &&
        weather &&
        reading && (
          <div className="mt-4">

            <p className="secondary-text text-[9px] font-medium">
              {layer.label}
            </p>


            <p className="primary-text mt-1 text-2xl font-semibold tracking-tight">
              {reading.value}
            </p>


            {reading.meaning && (
              <>

                <p className="primary-text mt-3 text-xs font-semibold">
                  {
                    reading
                      .meaning
                      .label
                  }
                </p>


                <p className="secondary-text mt-1 text-[10px] leading-5">
                  {
                    reading
                      .meaning
                      .message
                  }
                </p>


                <div className="weather-reading-advice mt-3 rounded-2xl p-3">

                  <p className="secondary-text text-[9px] leading-4">
                    {
                      reading
                        .meaning
                        .advice
                    }
                  </p>

                </div>

              </>
            )}

          </div>
        )}

    </div>
  );
}


function NearbyPlaceMarkers({
  places,
}) {
  if (
    !places ||
    places.length === 0
  ) {
    return null;
  }


  return places.map(
    (nearbyPlace) => {
      const color =
        getNearbyPlaceColor(
          nearbyPlace.category
        );


      return (
        <CircleMarker
          key={nearbyPlace.id}
          center={[
            nearbyPlace.latitude,
            nearbyPlace.longitude,
          ]}
          radius={6}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.9,
            weight: 2,
          }}
        >

          <Tooltip
            direction="top"
            offset={[
              0,
              -6,
            ]}
          >
            <div className="min-w-[150px]">

              <p className="font-semibold">
                {nearbyPlace.name}
              </p>


              <p className="mt-1 text-xs">
                {
                  nearbyPlace
                    .category_label
                }
              </p>


              <p className="mt-1 text-xs">
                {
                  nearbyPlace
                    .distance_km
                } km away
              </p>


              {nearbyPlace.address && (
                <p className="mt-1 max-w-[190px] text-xs">
                  {nearbyPlace.address}
                </p>
              )}

            </div>
          </Tooltip>


          <Popup>
            <div className="min-w-[180px]">

              <p className="font-semibold">
                {nearbyPlace.name}
              </p>


              <p className="mt-1 text-xs">
                {
                  nearbyPlace
                    .category_label
                }
              </p>


              <p className="mt-2 text-xs">
                Distance:{' '}
                <strong>
                  {
                    nearbyPlace
                      .distance_km
                  } km
                </strong>
              </p>


              {nearbyPlace.address && (
                <p className="mt-2 text-xs">
                  {nearbyPlace.address}
                </p>
              )}


              {nearbyPlace.opening_hours && (
                <p className="mt-2 text-xs">
                  Hours:{' '}
                  {
                    nearbyPlace
                      .opening_hours
                  }
                </p>
              )}


              {nearbyPlace.phone && (
                <p className="mt-2 text-xs">
                  Phone:{' '}
                  {
                    nearbyPlace
                      .phone
                  }
                </p>
              )}

            </div>
          </Popup>

        </CircleMarker>
      );
    }
  );
}


function WeatherMap({
  selectedLocation,
  onLocationSelect,
  weather,
  place,
  weatherLoading = false,
  nearbyPlaces = [],
}) {
  const defaultCenter = [
    -1.286389,
    36.817223,
  ];


  /*
   * IMPORTANT:
   * No weather layer is selected
   * automatically after page load
   * or refresh.
   */
  const [
    activeLayer,
    setActiveLayer,
  ] = useState(null);


  const [
    layerError,
    setLayerError,
  ] = useState('');


  const coordinates =
    useMemo(() => {
      if (
        !selectedLocation
      ) {
        return null;
      }


      const latitude =
        Number(
          selectedLocation.latitude
        );

      const longitude =
        Number(
          selectedLocation.longitude
        );


      if (
        Number.isNaN(
          latitude
        ) ||
        Number.isNaN(
          longitude
        )
      ) {
        return null;
      }


      return {
        latitude,
        longitude,
      };

    }, [
      selectedLocation,
    ]);


  function handleTileError() {
    setLayerError(
      'Weather colors are temporarily unavailable for this map view.'
    );
  }


  function handleLayerChange() {
    setLayerError('');
  }


  function handleMapLocationSelect(
    location
  ) {
    setLayerError('');

    onLocationSelect?.(
      location
    );
  }


  return (
    <div className="relative h-full w-full">

      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        {/* =====================
            OPENSTREETMAP
        ====================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =====================
            WEATHER OVERLAY
        ====================== */}

        <WeatherOverlay
          activeLayer={activeLayer}
          onTileError={
            handleTileError
          }
        />


        {/* =====================
            MAP CLICK HANDLER
        ====================== */}

        <MapClickHandler
          onLocationSelect={
            handleMapLocationSelect
          }
        />


        {/* =====================
            MOVE TO LOCATION
        ====================== */}

        <MapController
          selectedLocation={
            coordinates
          }
        />


        {/* =====================
            NEARBY POIs
        ====================== */}

        <NearbyPlaceMarkers
          places={nearbyPlaces}
        />


        {/* =====================
            SELECTED LOCATION
        ====================== */}

        {coordinates && (
          <Marker
            position={[
              coordinates.latitude,
              coordinates.longitude,
            ]}
          >

            <Popup>

              <div className="min-w-[170px]">

                <div className="flex items-start gap-2">

                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0"
                  />


                  <div>

                    <p className="font-semibold">
                      {
                        place?.name ||
                        place?.city ||
                        place?.town ||
                        place?.suburb ||
                        place?.village ||
                        'Selected location'
                      }
                    </p>


                    <p className="mt-1 text-xs">
                      {
                        coordinates
                          .latitude
                          .toFixed(5)
                      }
                      ,{' '}
                      {
                        coordinates
                          .longitude
                          .toFixed(5)
                      }
                    </p>

                  </div>

                </div>


                {weather && (
                  <div className="mt-3 border-t pt-3">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-lg font-semibold">
                          {
                            weather
                              .temperature !=
                            null
                              ? `${Math.round(
                                  weather.temperature
                                )}°C`
                              : '—'
                          }
                        </p>


                        <p className="mt-1 text-xs capitalize">
                          {
                            weather
                              .description ||
                            weather
                              .condition ||
                            'Current conditions'
                          }
                        </p>

                      </div>


                      {weather.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                          alt={
                            weather.description ||
                            'Weather'
                          }
                          className="h-12 w-12"
                        />
                      )}

                    </div>

                  </div>
                )}

              </div>

            </Popup>

          </Marker>
        )}

      </MapContainer>


      {/* =====================
          WEATHER LAYERS
      ====================== */}

      <WeatherLayerControl
        activeLayer={
          activeLayer
        }
        setActiveLayer={
          setActiveLayer
        }
        onLayerChange={
          handleLayerChange
        }
      />


      {/* =====================
          SELECTED READING
      ====================== */}

      <SelectedReadingCard
        activeLayer={
          activeLayer
        }
        weather={
          weather
        }
        place={
          place
        }
        loading={
          weatherLoading
        }
        selectedLocation={
          coordinates
        }
      />


      {/* =====================
          WEATHER LEGEND
      ====================== */}

      <WeatherLegend
        activeLayer={
          activeLayer
        }
      />


      {/* =====================
          WEATHER TILE ERROR
      ====================== */}

      {layerError &&
        activeLayer && (
          <div className="map-layer-error absolute bottom-4 right-4 z-[800] max-w-[260px] rounded-2xl border p-3 shadow-lg">

            <div className="flex items-start gap-2">

              <Cloud
                size={14}
                className="mt-0.5 shrink-0"
              />


              <div>

                <p className="primary-text text-[10px] font-semibold">
                  Weather colors unavailable
                </p>

                <p className="secondary-text mt-1 text-[9px] leading-4">
                  {layerError}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setLayerError('')
                }
                className="secondary-text ml-auto shrink-0 rounded-lg p-1"
                aria-label="Dismiss weather layer error"
              >
                <X
                  size={12}
                />
              </button>

            </div>

          </div>
        )}


      {/* =====================
          NEARBY COUNT
      ====================== */}

      {nearbyPlaces.length >
        0 &&
        !layerError && (
          <div className="pointer-events-none absolute bottom-4 right-4 z-[650]">

            <div className="meta-badge flex items-center gap-2 rounded-full border px-3 py-2 shadow-lg">

              <MapPin
                size={12}
                className="text-sky-500"
              />

              <span className="secondary-text text-[9px] font-semibold">
                {
                  nearbyPlaces.length
                } nearby places
              </span>

            </div>

          </div>
        )}

    </div>
  );
}


export default WeatherMap;