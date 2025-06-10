import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  AppState,
  User,
  Circle,
  Location,
  UserLocation,
  CircleWithMembers,
  Member,
  MovementStatus,
} from '@/types';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { joinCircleWithCode } from '../utils/joinCircle';
import { getAuth } from 'firebase/auth';

interface AppContextType {
  user: User | null;
  circles: CircleWithMembers[];
  selectedCircle: CircleWithMembers | null;
  isLoading: boolean;
  error: string | null;
  userLocations: UserLocation[];
  currentLocation: Location | null;
  isLocationSharingEnabled: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateLocation: (location: Location) => void;
  toggleLocationSharing: () => void;
  setSelectedCircle: (circle: CircleWithMembers | null) => void;
  joinCircle: (inviteCode: string) => Promise<boolean>;
  createCircle: (name: string, description?: string) => Promise<boolean>;
  sendCheckIn: (type: 'check-in' | 'sos' | 'safe', message?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CIRCLES'; payload: CircleWithMembers[] }
  | { type: 'SET_SELECTED_CIRCLE'; payload: CircleWithMembers | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER_LOCATION'; payload: { userId: string; location: Location } }
  | { type: 'TOGGLE_LOCATION_SHARING' };

const calculateMovementStatus = (speed: number): MovementStatus => {
  if (speed < 0.28) { // Less than 1 km/h
    return 'stationary';
  } else if (speed < 2.78) { // Less than 10 km/h
    return 'walking';
  } else {
    return 'driving';
  }
};

const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string | undefined> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }
  } catch (error) {
    console.error('Error getting address:', error);
  }
  return undefined;
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CIRCLES':
      return { ...state, circles: action.payload };
    case 'SET_SELECTED_CIRCLE':
      return { ...state, selectedCircle: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_USER_LOCATION':
      const existingLocationIndex = state.userLocations.findIndex(
        loc => loc.userId === action.payload.userId
      );
      
      if (existingLocationIndex >= 0) {
        const updatedLocations = [...state.userLocations];
        updatedLocations[existingLocationIndex] = {
          ...updatedLocations[existingLocationIndex],
          location: action.payload.location
        };
        return { ...state, userLocations: updatedLocations };
      } else {
        // For new locations, we need to create a proper UserLocation object
        const newLocation: UserLocation = {
          id: `temp-${action.payload.userId}`, // Temporary ID until saved to Firestore
          userId: action.payload.userId,
          circleId: state.selectedCircle?.id || '',
          location: action.payload.location,
          user: {
            id: action.payload.userId,
            name: state.user?.name || 'Unknown User'
          }
        };
        return {
          ...state,
          userLocations: [...state.userLocations, newLocation]
        };
      }
    case 'TOGGLE_LOCATION_SHARING':
      return { ...state, isLocationSharingEnabled: !state.isLocationSharingEnabled };
    default:
      return state;
  }
};

async function loadUserCircles(userId: string): Promise<CircleWithMembers[]> {
  if (!userId) {
    console.warn('No user ID provided to loadUserCircles.');
    return [];
  }

  try {
    const circlesRef = collection(db, 'circles');
    const q = query(circlesRef, where('members', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    const circles: CircleWithMembers[] = [];
    for (const circleDoc of querySnapshot.docs) {
      const circleData = circleDoc.data();
      const members: Member[] = [];

      // Get member details for each member ID
      for (const memberId of circleData.members) {
        const userRef = doc(db, 'users', memberId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          members.push({
            id: memberId,
            name: userData.name
          });
        }
      }

      circles.push({
        id: circleDoc.id,
        name: circleData.name,
        description: circleData.description,
        inviteCode: circleData.inviteCode,
        ownerId: circleData.ownerId,
        createdAt: circleData.createdAt.toDate(),
        members,
        settings: circleData.settings
      });
    }

    return circles;
  } catch (error) {
    console.error('Error loading user circles:', error);
    return [];
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    circles: [],
    selectedCircle: null,
    isLoading: false,
    error: null,
    userLocations: [],
    currentLocation: null,
    isLocationSharingEnabled: false
  });

  // Add refs to track component state
  const isMounted = useRef(true);
  const locationUpdateTimeout = useRef<number | null>(null);
  const lastLocationUpdate = useRef<number>(0);
  const LOCATION_UPDATE_INTERVAL = 5000; // 5 seconds minimum between updates

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (locationUpdateTimeout.current) {
        window.clearTimeout(locationUpdateTimeout.current);
      }
    };
  }, []);

  const updateUserLocation = useCallback(async (position: GeolocationPosition) => {
    if (!state.user || !isMounted.current) return;

    const now = Date.now();
    if (now - lastLocationUpdate.current < LOCATION_UPDATE_INTERVAL) {
      return; // Skip if not enough time has passed
    }

    try {
      const { latitude, longitude, speed, accuracy, heading } = position.coords;
      const movementStatus = calculateMovementStatus(speed || 0);
      
      // Create location object with only defined values
      const location: Partial<Location> = {
        latitude,
        longitude,
        timestamp: new Date(),
        movementStatus,
        speed: speed || 0
      };

      // Only add optional fields if they have values
      if (accuracy) {
        location.accuracy = accuracy;
      }
      if (heading) {
        location.heading = heading;
      }

      // Update user location in Firestore
      const userRef = doc(db, 'users', state.user.id);
      await updateDoc(userRef, {
        location: location,
        lastSeen: serverTimestamp()
      });

      // Only dispatch if component is still mounted
      if (isMounted.current) {
        lastLocationUpdate.current = now;
        dispatch({
          type: 'UPDATE_USER_LOCATION',
          payload: {
            userId: state.user.id,
            location: location as Location
          }
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [state.user]);

  // Set up location tracking with debouncing
  useEffect(() => {
    if (!state.user || !state.isLocationSharingEnabled) return;

    let watchId: number | null = null;

    const startLocationTracking = () => {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (locationUpdateTimeout.current) {
              window.clearTimeout(locationUpdateTimeout.current);
            }
            locationUpdateTimeout.current = window.setTimeout(() => {
              updateUserLocation(position);
            }, 1000); // Debounce updates
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }
    };

    startLocationTracking();

    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (locationUpdateTimeout.current) {
        window.clearTimeout(locationUpdateTimeout.current);
      }
    };
  }, [state.user, state.isLocationSharingEnabled, updateUserLocation]);

  const login = useCallback(async (user: User) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Update user in Firestore
      const userRef = doc(db, 'users', user.id);
      const updateData: Partial<User> = {
        name: user.name,
        email: user.email,
        lastSeen: new Date(),
        isOnline: true
      };

      // Only add phone if it's defined and not empty
      if (user.phone) {
        updateData.phone = user.phone;
      }

      await updateDoc(userRef, updateData);

      // Load user's circles
      const circles = await loadUserCircles(user.id);
      dispatch({ type: 'SET_CIRCLES', payload: circles });
      if (circles.length > 0) {
        dispatch({ type: 'SET_SELECTED_CIRCLE', payload: circles[0] });
      }

      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Error during login:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to login' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    if (!state.user) return;

    try {
      // Update user status in Firestore
      const userRef = doc(db, 'users', state.user.id);
      await updateDoc(userRef, {
        isOnline: false,
        lastSeen: new Date()
      });

      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_CIRCLES', payload: [] });
      dispatch({ type: 'SET_SELECTED_CIRCLE', payload: null });
    } catch (error) {
      console.error('Error during logout:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to logout' });
    }
  }, [state.user]);

  const toggleLocationSharing = useCallback(() => {
    dispatch({ type: 'TOGGLE_LOCATION_SHARING' });
  }, []);

  const setSelectedCircle = useCallback((circle: CircleWithMembers | null) => {
    dispatch({ type: 'SET_SELECTED_CIRCLE', payload: circle });
  }, []);

  const joinCircle = useCallback(async (inviteCode: string): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const circlesRef = collection(db, 'circles');
      const q = query(circlesRef, where('inviteCode', '==', inviteCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('No circle found with that invite code');
        return false;
      }

      const circleDoc = querySnapshot.docs[0];
      const circleData = circleDoc.data();
      const members = [...circleData.members, state.user.id];

      await updateDoc(doc(db, 'circles', circleDoc.id), {
        members,
      });

      const userCircles = await loadUserCircles(state.user.id);
      dispatch({ type: 'SET_CIRCLES', payload: userCircles });
      return true;
    } catch (error) {
      console.error('Error joining circle:', error);
      return false;
    }
  }, [state.user]);

  const createCircle = useCallback(async (name: string, description?: string): Promise<boolean> => {
    if (!state.user) return false;

    try {
      // First, ensure the user document exists and is up to date
      const userRef = doc(db, 'users', state.user.id);
      await setDoc(userRef, {
        name: state.user.name,
        email: state.user.email,
        phone: state.user.phone,
        lastSeen: serverTimestamp(),
        isOnline: true
      }, { merge: true });

      const circlesRef = collection(db, 'circles');
      const circleData = {
        name,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        ownerId: state.user.id,
        createdAt: new Date(),
        members: [state.user.id],
        settings: {
          allowLocationHistory: true,
          allowGeofencing: false,
          emergencyContacts: [],
          locationSharing: true,
          checkInFrequencyMinutes: 15,
        },
      };

      // Only add description if it's provided
      if (description) {
        Object.assign(circleData, { description });
      }

      const docRef = await addDoc(circlesRef, circleData);

      const circleWithMembers: CircleWithMembers = {
        id: docRef.id,
        name,
        inviteCode: circleData.inviteCode,
        ownerId: state.user.id,
        createdAt: new Date(),
        settings: circleData.settings,
        members: [{
          id: state.user.id,
          name: state.user.name
        }]
      };

      // Only add description to the local state if it was provided
      if (description) {
        Object.assign(circleWithMembers, { description });
      }

      dispatch({ type: 'SET_CIRCLES', payload: [...state.circles, circleWithMembers] });
      return true;
    } catch (error) {
      console.error('Error creating circle:', error);
      return false;
    }
  }, [state.user, state.circles]);

  const sendCheckIn = useCallback(async (
    type: 'check-in' | 'sos' | 'safe',
    message?: string
  ) => {
    // TODO: Implement check-in functionality
    console.log('Check-in:', { type, message });
  }, []);

  const updateLocation = useCallback((location: Location) => {
    if (!state.user || !isMounted.current) return;
    dispatch({
      type: 'UPDATE_USER_LOCATION',
      payload: {
        userId: state.user.id,
        location
      }
    });
  }, [state.user]);

  useEffect(() => {
    const storedUser = localStorage.getItem('safecircle_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        login(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('safecircle_user');
      }
    }
  }, [login]);

  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    updateLocation,
    toggleLocationSharing,
    setSelectedCircle,
    joinCircle,
    createCircle,
    sendCheckIn
  }), [
    state,
    login,
    logout,
    updateLocation,
    toggleLocationSharing,
    setSelectedCircle,
    joinCircle,
    createCircle,
    sendCheckIn
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};