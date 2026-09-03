import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

function MapController({ selectedLocation }) {
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
  }, [selectedLocation, map]);

  return null;
}

function LocationMarker({
  selectedLocation,
  onLocationSelect,
}) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!selectedLocation) {
      return;
    }

    setPosition([
      selectedLocation.latitude,
      selectedLocation.longitude,
    ]);
  }, [selectedLocation]);

  useMapEvents({
    click(event) {
      const latitude = event.latlng.lat;
      const longitude = event.latlng.lng;

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
    <Marker position={position}>
      <Popup>
        Latitude: {position[0].toFixed(5)}
        <br />
        Longitude: {position[1].toFixed(5)}
      </Popup>
    </Marker>
  );
}

function WeatherMap({
  selectedLocation,
  onLocationSelect,
}) {
  return (
    <MapContainer
      center={[-1.286389, 36.817223]}
      zoom={7}
      scrollWheelZoom={true}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        selectedLocation={selectedLocation}
      />

      <LocationMarker
        selectedLocation={selectedLocation}
        onLocationSelect={onLocationSelect}
      />
    </MapContainer>
  );
}

export default WeatherMap;