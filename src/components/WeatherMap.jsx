import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      const selected = {
        latitude: lat,
        longitude: lng,
      };

      setPosition([lat, lng]);
      onLocationSelect(selected);
    },
  });

  if (!position) return null;

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

export default function WeatherMap({ onLocationSelect }) {
  return (
    <MapContainer
      center={[-1.286389, 36.817223]}
      zoom={7}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}