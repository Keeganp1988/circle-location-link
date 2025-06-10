import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useApp } from "@/contexts/AppContext";
import type { UserLocation } from "@/types";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

export function Map() {
  const { selectedCircle, userLocations } = useApp();

  // Get all member locations for the selected circle
  const memberLocations = userLocations.filter(
    (loc: UserLocation) => selectedCircle?.members.some((m) => m.id === loc.userId)
  );

  // Calculate center point of all markers
  const center = memberLocations.length
    ? {
        lat:
          memberLocations.reduce(
            (sum, loc) => sum + loc.location.latitude,
            0
          ) / memberLocations.length,
        lng:
          memberLocations.reduce(
            (sum, loc) => sum + loc.location.longitude,
            0
          ) / memberLocations.length,
      }
    : defaultCenter;

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {memberLocations.map((loc) => (
          <Marker
            key={loc.userId}
            position={{
              lat: loc.location.latitude,
              lng: loc.location.longitude,
            }}
            title={loc.user.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
} 