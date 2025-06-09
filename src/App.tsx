import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import JoinCircle from "./pages/JoinCircle";

import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useAppContext, AppProvider } from "@/contexts/AppContext";


const queryClient = new QueryClient();

// Component to sync Firebase Auth state with your AppContext user state
function AuthStateListener({ children }: { children: React.ReactNode }) {
  const { login, logout } = useAppContext();
  const auth = getAuth();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const user = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        isOnline: true,
        lastSeen: new Date(),
      };
      login(user);
    } else {
      logout();
    }
  });

  return () => unsubscribe();
}, [auth, login, logout]);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <AuthStateListener>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/join" element={<JoinCircle />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthStateListener>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
