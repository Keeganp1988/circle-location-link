// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  address?: string;
}

export interface UserLocation extends Location {
  userId: string;
  user: User;
}

export interface CircleSettings {
  allowLocationHistory: boolean;
  allowGeofencing: boolean;
  emergencyContacts: string[];
  locationSharing: boolean;
  checkInFrequencyMinutes: number;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: User[];
  inviteCode: string;
  createdAt: Date;
  settings: CircleSettings;
}

export interface AppState {
  user: User | null;
  currentLocation: Location | null;
  circles: Circle[];
  selectedCircle: Circle | null;
  userLocations: UserLocation[];
  isLocationSharingEnabled: boolean;
  isLoading: boolean;
}
