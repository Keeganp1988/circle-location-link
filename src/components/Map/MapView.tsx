/// <reference types="google.maps" />
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Location, MovementStatus } from '@/types';

// Get API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const libraries: ("places" | "marker")[] = ["places", "marker"];

interface MarkerData {
  position?: Location;
  title?: string;
  movementStatus?: MovementStatus;
}

interface MapViewProps {
  center?: Location;
  markers?: MarkerData[];
}

const getMarkerIcon = (movementStatus?: MovementStatus) => {
  switch (movementStatus) {
    case 'walking':
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#FFFFFF',
        scale: 1.5,
      };
    case 'driving':
      return {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: '#F44336',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#FFFFFF',
        scale: 1.5,
      };
    default:
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#9E9E9E',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#FFFFFF',
        scale: 1.5,
      };
  }
};

const MapView: React.FC<MapViewProps> = ({ center, markers = [] }) => {
  const [shouldRender, setShouldRender] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  useEffect(() => {
    // Delay rendering to ensure proper mounting
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setShouldRender(false);
    };
  }, []);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded || !shouldRender) {
    return <div>Loading maps...</div>;
  }

  const mapCenter = center 
    ? { lat: center.latitude, lng: center.longitude }
    : { lat: 37.7749, lng: -122.4194 };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={14}
        options={{
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapId: 'safecircle_map'
        }}
      >
        {markers.map((marker, index) => (
          marker.position && (
            <Marker
              key={`${marker.position.latitude}-${marker.position.longitude}-${index}`}
              position={{
                lat: marker.position.latitude,
                lng: marker.position.longitude
              }}
              title={marker.title}
              icon={getMarkerIcon(marker.movementStatus)}
            />
          )
        ))}
      </GoogleMap>
    </div>
  );
};

export { MapView };
