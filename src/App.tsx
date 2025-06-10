import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useApp, AppProvider } from "@/contexts/AppContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import JoinCircle from "./pages/JoinCircle";

const queryClient = new QueryClient();

// 👇 Syncs Firebase auth with app context
function AuthStateListener({ children }: { children: React.ReactNode }) {
  const { login, logout } = useApp();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get or create user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        let userName;
        
        if (userDoc.exists()) {
          // Use existing name from Firestore
          const userData = userDoc.data();
          userName = userData.name;
        } else {
          // If no Firestore document exists, use Firebase Auth displayName
          userName = firebaseUser.displayName || 'User';
          
          // Create new user document with the name from Firebase Auth
          await setDoc(userRef, {
            name: userName,
            email: firebaseUser.email || '',
            lastSeen: serverTimestamp(),
            isOnline: true
          });
        }

        const userData = {
          id: firebaseUser.uid,
          name: userName,
          email: firebaseUser.email || '',
          phone: '',  // Required field, default to empty string
          isOnline: true,
          lastSeen: new Date(),
          location: undefined,  // Optional field
          profileImage: firebaseUser.photoURL || undefined,  // Optional field
          status: undefined  // Optional field
        };
        login(userData);
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [auth, login, logout]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthStateListener>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/join" element={<JoinCircle />} />
              <Route path="/map" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthStateListener>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
