
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Circle, Location, UserLocation } from '@/types';
import { getCurrentLocation } from '@/utils/location';

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  updateLocation: (location: Location) => void;
  toggleLocationSharing: () => void;
  setSelectedCircle: (circle: Circle | null) => void;
  joinCircle: (inviteCode: string) => Promise<void>;
  createCircle: (name: string, description?: string) => Promise<void>;
  sendCheckIn: (type: 'check-in' | 'sos' | 'safe', message?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  user: null,
  currentLocation: null,
  circles: [],
  selectedCircle: null,
  userLocations: [],
  isLocationSharingEnabled: false,
  isLoading: false,
};

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'TOGGLE_LOCATION_SHARING' }
  | { type: 'SET_CIRCLES'; payload: Circle[] }
  | { type: 'SET_SELECTED_CIRCLE'; payload: Circle | null }
  | { type: 'SET_USER_LOCATIONS'; payload: UserLocation[] }
  | { type: 'SET_LOADING'; payload: boolean };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'TOGGLE_LOCATION_SHARING':
      return { ...state, isLocationSharingEnabled: !state.isLocationSharingEnabled };
    case 'SET_CIRCLES':
      return { ...state, circles: action.payload };
    case 'SET_SELECTED_CIRCLE':
      return { ...state, selectedCircle: action.payload };
    case 'SET_USER_LOCATIONS':
      return { ...state, userLocations: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('safecircle_user', JSON.stringify(user));
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('safecircle_user');
  };

  const updateLocation = (location: Location) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
    console.log('Location updated:', location);
  };

  const toggleLocationSharing = () => {
    dispatch({ type: 'TOGGLE_LOCATION_SHARING' });
  };

  const setSelectedCircle = (circle: Circle | null) => {
    dispatch({ type: 'SET_SELECTED_CIRCLE', payload: circle });
  };

  const joinCircle = async (inviteCode: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Joining circle with code:', inviteCode);
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const createCircle = async (name: string, description?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Creating circle:', name, description);
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const sendCheckIn = async (type: 'check-in' | 'sos' | 'safe', message?: string) => {
    if (!state.currentLocation) {
      await getCurrentLocation().then(updateLocation);
    }
    console.log('Sending check-in:', type, message, state.currentLocation);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('safecircle_user');
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
  }, []);

  const value: AppContextType = {
    ...state,
    login,
    logout,
    updateLocation,
    toggleLocationSharing,
    setSelectedCircle,
    joinCircle,
    createCircle,
    sendCheckIn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
