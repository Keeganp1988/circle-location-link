import { Geolocation } from '@capacitor/geolocation';
import { Location } from '@/types';
import { Capacitor } from '@capacitor/core';

export async function requestLocationPermissions(): Promise<boolean> {
  if (Capacitor.getPlatform() === 'web') {
    // On web, permissions are requested automatically by the browser
    return true;
  }
  try {
    const permissionStatus = await Geolocation.requestPermissions();
    return permissionStatus.location === 'granted';
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}
export async function getCurrentLocation(): Promise<Location> {
  try {
    if (Capacitor.getPlatform() === 'web') {
      return new Promise<Location>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now(),
            });
          },
          (error) => reject(error),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } else {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
