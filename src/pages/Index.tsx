
import React, { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { LoginScreen } from '@/components/Auth/LoginScreen';
import { BottomNavigation } from '@/components/Layout/BottomNavigation';
import { MapView } from '@/components/Map/MapView';
import { CirclesView } from '@/components/Circles/CirclesView';
import { UserProfile } from '@/components/Profile/UserProfile';
import { SOSButton } from '@/components/Emergency/SOSButton';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Search } from 'lucide-react';

function MainApp() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('map');

  if (!user) {
    return <LoginScreen />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'circles':
        return <CirclesView />;
      case 'map':
        return <MapView />;
          case 'alerts':
        return (
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
        );
      case 'places':
        return (
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
        );
      case 'profile':
        return <UserProfile />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">SafeCircle</h1>
        <button
          onClick={() => setActiveTab('profile')}
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium"
        >
          {user.name.charAt(0).toUpperCase()}
        </button>
      </header>

      {/* Main content */}
      {renderActiveTab()}

      {/* SOS Button */}
      <SOSButton />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default Index;
