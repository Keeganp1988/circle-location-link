// types.ts

export type MovementStatus = 'stationary' | 'walking' | 'driving';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isOnline: boolean;
  lastSeen: Date;
  location?: Location;
  profileImage?: string;
  status?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  address?: string;
  movementStatus: MovementStatus;
  speed?: number;
  accuracy?: number;
  heading?: number;
}

export interface UserLocation {
  id: string;  // Document ID
  userId: string;
  circleId: string;
  location: Location;
  user: {
    id: string;
    name: string;
  };
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
  error: string | null;
}