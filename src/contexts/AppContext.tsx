import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AppState,
  User,
  CircleWithMembers,
  Location,
  UserLocation,
} from '@/types';
import { getCurrentLocation } from '@/utils/location';
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
  setDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';

// ❌ Removed the problematic import:
// import { useAppContext, AppProvider } from "@/contexts/AppContext";

interface AppContextType extends AppState {
  login: (user: User) => Promise<void>;
  logout: () => void;
  updateLocation: (location: Location) => void;
  toggleLocationSharing: () => void;
  setSelectedCircle: (circle: CircleWithMembers | null) => void;
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
  | { type: 'SET_CIRCLES'; payload: CircleWithMembers[] }
  | { type: 'SET_SELECTED_CIRCLE'; payload: CircleWithMembers | null }
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
      const data = circleDoc.data();
      const memberIds: string[] = data.members || [];

      const memberPromises = memberIds.map(async (id) => {
        const userDocQuery = query(collection(db, 'users'), where('id', '==', id));
        const userDocSnap = await getDocs(userDocQuery);
        const userData = userDocSnap.docs[0]?.data();
        return {
          id,
          name: userData?.name || 'Unknown',
        };
      });

      const members = await Promise.all(memberPromises);

      circles.push({
        id: circleDoc.id,
        name: data.name || '',
        description: data.description || '',
        inviteCode: data.inviteCode || '',
        ownerId: data.ownerId || '',
        createdAt:
          data.createdAt && (data.createdAt as Timestamp).toDate
            ? (data.createdAt as Timestamp).toDate()
            : new Date(),
        settings: data.settings || {
          allowLocationHistory: true,
          allowGeofencing: false,
          emergencyContacts: [],
          locationSharing: true,
          checkInFrequencyMinutes: 15,
        },
        members,
      });
    }

    return circles;
  } catch (error) {
    console.error('Error loading user circles:', error);
    return [];
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = async (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('safecircle_user', JSON.stringify(user));

    const userCircles = await loadUserCircles(user.id);
    dispatch({ type: 'SET_CIRCLES', payload: userCircles });

    dispatch({
      type: 'SET_SELECTED_CIRCLE',
      payload: userCircles.length > 0 ? userCircles[0] : null,
    });
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_CIRCLES', payload: [] });
    dispatch({ type: 'SET_SELECTED_CIRCLE', payload: null });
    localStorage.removeItem('safecircle_user');
  };

  const updateLocation = (location: Location) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  };

  const toggleLocationSharing = () => {
    dispatch({ type: 'TOGGLE_LOCATION_SHARING' });
  };

  const setSelectedCircle = (circle: CircleWithMembers | null) => {
    dispatch({ type: 'SET_SELECTED_CIRCLE', payload: circle });
  };

  const joinCircle = async (inviteCode: string) => {
    if (!state.user) {
      alert('User not logged in');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const circlesRef = collection(db, 'circles');
      const q = query(circlesRef, where('inviteCode', '==', inviteCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Circle not found with this invite code');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const circleDoc = querySnapshot.docs[0];
      const data = circleDoc.data();
      const circleMembers: string[] = data.members || [];

      if (!circleMembers.includes(state.user.id)) {
        const circleDocRef = doc(db, 'circles', circleDoc.id);
        await updateDoc(circleDocRef, {
          members: [...circleMembers, state.user.id],
        });
      }

      const userDocRef = doc(db, 'users', state.user.id);
      await setDoc(userDocRef, { circleId: circleDoc.id }, { merge: true });

      const userCircles = await loadUserCircles(state.user.id);
      dispatch({ type: 'SET_CIRCLES', payload: userCircles });

      const joinedCircle = userCircles.find((c) => c.id === circleDoc.id) || null;
      dispatch({ type: 'SET_SELECTED_CIRCLE', payload: joinedCircle });

      alert('Successfully joined the circle!');
    } catch (error) {
      console.error('Error joining circle:', error);
      alert('Failed to join circle. Please try again.');
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const createCircle = async (name: string, description?: string) => {
    if (!state.user) {
      alert('User not logged in');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const inviteCode = Math.random().toString(36).substr(2, 6).toUpperCase();

      const docRef = await addDoc(collection(db, 'circles'), {
        name,
        description: description || '',
        inviteCode,
        ownerId: state.user.id,
        createdAt: serverTimestamp(),
        settings: {
          allowLocationHistory: true,
          allowGeofencing: false,
          emergencyContacts: [],
          locationSharing: true,
          checkInFrequencyMinutes: 15,
        },
        members: [state.user.id],
      });

      const userDocRef = doc(db, 'users', state.user.id);
      await setDoc(userDocRef, { circleId: docRef.id }, { merge: true });

      const userCircles = await loadUserCircles(state.user.id);
      dispatch({ type: 'SET_CIRCLES', payload: userCircles });

      const newCircle = userCircles.find((c) => c.id === docRef.id) || null;
      dispatch({ type: 'SET_SELECTED_CIRCLE', payload: newCircle });

      alert('Circle created successfully!');
    } catch (error) {
      console.error('Error creating circle:', error);
      alert('Failed to create circle. Please try again.');
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const sendCheckIn = async (type: 'check-in' | 'sos' | 'safe', message?: string) => {
    // Placeholder for future implementation
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('safecircle_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      login(user);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateLocation,
        toggleLocationSharing,
        setSelectedCircle,
        joinCircle,
        createCircle,
        sendCheckIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
