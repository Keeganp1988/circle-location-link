import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LoginScreen } from '@/components/Auth/LoginScreen';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { MapView } from '@/components/Map/MapView';
import { CirclesView } from '@/components/Circles/CirclesView';
import { UserProfile } from '@/components/Profile/UserProfile';
import { SOSButton } from '@/components/Emergency/SOSButton';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Search, User } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFallback } from '@/components/LoadingFallback';
import { validateEnvironment } from '@/utils/environment';
import { Location, MovementStatus } from '@/types';
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  location: Location;
  movementStatus: MovementStatus;
}

function EnvironmentError() {
  const { errors } = validateEnvironment();
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Configuration Error</h2>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 mb-4">
            Please check your environment configuration and restart the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MainApp() {
  const { user, circles, setSelectedCircle, selectedCircle, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState('circles');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
    timestamp: new Date(),
    movementStatus: 'walking'
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Validate environment
  const { isValid: isEnvironmentValid } = validateEnvironment();
  if (!isEnvironmentValid) {
    return <EnvironmentError />;
  }

  // Handle initial navigation after login
  useEffect(() => {
    if (user) {
      // Ensure we're on the circles tab when user first logs in
      setActiveTab('circles');
      setIsProfileOpen(false);
    }
  }, [user]);

  // Handle memberId from URL
  useEffect(() => {
    const memberId = searchParams.get('memberId');
    if (memberId) {
      setActiveTab('map');
      // Set selectedCircle if not already set
      if (!selectedCircle && circles.length > 0) {
        setSelectedCircle(circles[0]);
      }
    }
  }, [searchParams, circles, selectedCircle, setSelectedCircle]);

  useEffect(() => {
    // When switching tabs, set or clear selectedCircle as needed
    if (activeTab === 'map' && !selectedCircle && circles.length > 0) {
      setSelectedCircle(circles[0]);
    }
    if (activeTab !== 'map') {
      setSelectedCircle(null);
    }
  }, [activeTab, circles, selectedCircle, setSelectedCircle]);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return <LoadingFallback message="Loading application..." />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleMemberClick = (memberId: string) => {
    setSearchParams({ memberId });
    setActiveTab('map');
    // Set selectedCircle if not already set
    if (!selectedCircle && circles.length > 0) {
      setSelectedCircle(circles[0]);
    }
  };

  const renderMapTab = () => {
    if (activeTab !== 'map') return null;

    return (
      <div className="h-full w-full">
        <MapView
          center={currentLocation}
          markers={[
            {
              position: currentLocation,
              title: 'Current Location',
              movementStatus: currentLocation.movementStatus
            },
            ...(selectedContact ? [{
              position: selectedContact.location,
              title: selectedContact.name,
              movementStatus: selectedContact.movementStatus
            }] : [])
          ]}
        />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        {/* Test Toast Button */}
        <div className="p-2">
          <Button onClick={() => toast({ title: "Test Toast", description: "This is a test notification." })}>
            Show Toast
          </Button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-end items-center p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
          <main className="flex-1 overflow-hidden">
            {renderMapTab()}
            {activeTab === 'circles' && <CirclesView onMemberClick={handleMemberClick} />}
            {activeTab === 'alerts' && (
              <div className="flex-1 p-4 pb-20">
                <div className="max-w-md mx-auto">
                  <h1 className="text-2xl font-bold mb-6 text-center">Alerts & Notifications</h1>
                  <Card>
                    <CardContent className="text-center py-8">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Active Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Geofence and emergency alerts will appear here
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {activeTab === 'places' && (
              <div className="flex-1 p-4 pb-20">
                <div className="max-w-md mx-auto">
                  <h1 className="text-2xl font-bold mb-6 text-center">Places</h1>
                  <Card>
                    <CardContent className="text-center py-8">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Saved Places</h3>
                      <p className="text-sm text-muted-foreground">
                        Save important locations and set up geofence alerts
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        <SOSButton />
        {isProfileOpen && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Profile</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileOpen(false)}
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
            <UserProfile />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default function Index() {
  return <MainApp />;
}
