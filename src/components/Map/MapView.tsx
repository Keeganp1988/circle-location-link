
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getCurrentLocation, requestLocationPermissions } from '@/utils/location';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
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
    if (!mapContainer.current || !googleMapsApiKey) return;

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: currentLocation 
          ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
          : { lat: 37.7749, lng: -122.4194 },
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      };

      map.current = new google.maps.Map(mapContainer.current, mapOptions);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });

    return () => {
      map.current = null;
    };
  }, [googleMapsApiKey]);

  useEffect(() => {
    if (map.current && currentLocation) {
      const position = { lat: currentLocation.latitude, lng: currentLocation.longitude };
      
      map.current.setCenter(position);
      map.current.setZoom(15);

      // Add user location marker
      new google.maps.Marker({
        position,
        map: map.current,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        }
      });
    }
  }, [currentLocation]);

  if (!googleMapsApiKey) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please enter your Google Maps API key to enable the map functionality.
          </p>
          <input
            type="text"
            placeholder="Google Maps API Key"
            className="w-full p-2 border rounded mb-4"
            onChange={(e) => setGoogleMapsApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get your free API key at{' '}
            <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary">
              Google Cloud Console
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
