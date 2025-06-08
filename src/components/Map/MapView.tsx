
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getCurrentLocation, requestLocationPermissions } from '@/utils/location';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const { currentLocation, updateLocation, userLocations } = useApp();

  const initializeLocation = async () => {
    const hasPermission = await requestLocationPermissions();
    if (hasPermission) {
      try {
        const location = await getCurrentLocation();
        updateLocation(location);
      } catch (error) {
        console.error('Failed to get current location:', error);
      }
    }
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: currentLocation ? [currentLocation.longitude, currentLocation.latitude] : [-122.4194, 37.7749],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current && currentLocation) {
      map.current.flyTo({
        center: [currentLocation.longitude, currentLocation.latitude],
        zoom: 15,
      });

      // Add user location marker
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([currentLocation.longitude, currentLocation.latitude])
        .addTo(map.current);
    }
  }, [currentLocation]);

  if (!mapboxToken) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please enter your Mapbox access token to enable the map functionality.
          </p>
          <input
            type="text"
            placeholder="Mapbox Access Token"
            className="w-full p-2 border rounded mb-4"
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get your free token at{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary">
              mapbox.com
            </a>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Location update button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={initializeLocation}
          variant="secondary"
          size="sm"
          className="shadow-lg"
        >
          Update Location
        </Button>
      </div>

      {/* Location info */}
      {currentLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="p-3">
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground">
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </p>
            {currentLocation.accuracy && (
              <p className="text-xs text-muted-foreground">
                Accuracy: ±{Math.round(currentLocation.accuracy)}m
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
