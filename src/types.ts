// types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // <-- optional phone field
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  // Add any other fields your app uses (e.g., photoURL, phoneNumber, etc.)
}

export interface Location {
  lat: number;
  lng: number;
  timestamp: number; // Unix time in ms
}

export interface UserLocation extends Location {
  userId: string;
  name: string; // User's name
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: string;
  createdAt: Date;
  members: string[]; // Just user IDs — not used in CircleWithMembers directly
  settings: {
    allowLocationHistory: boolean;
    allowGeofencing: boolean;
    emergencyContacts: string[];
    locationSharing: boolean;
    checkInFrequencyMinutes: number;
  };
}

export interface Member {
  id: string;
  name: string;
}

export interface CircleWithMembers extends Omit<Circle, 'members'> {
  members: Member[];
}

export interface AppState {
  user: User | null;
  currentLocation: Location | null;
  circles: CircleWithMembers[];
  selectedCircle: CircleWithMembers | null;
  userLocations: UserLocation[];
  isLocationSharingEnabled: boolean;
  isLoading: boolean;
}
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}