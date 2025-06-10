import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { User } from 'lucide-react';

export function UserProfile() {
  const { user, logout, isLocationSharingEnabled, toggleLocationSharing } = useApp();

  if (!user) return null;

  return (
    <div className="p-4 pb-32">
      <div className="max-w-md mx-auto space-y-4">
        {/* Profile Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle>{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            )}
          </CardHeader>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Location Sharing</p>
                <p className="text-sm text-muted-foreground">
                  Share your location with circles
                </p>
              </div>
              <Switch
                checked={isLocationSharingEnabled}
                onCheckedChange={toggleLocationSharing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Location History</p>
                <p className="text-sm text-muted-foreground">
                  Allow circles to see your location history
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Driving Detection</p>
                <p className="text-sm text-muted-foreground">
                  Automatically detect when you're driving
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive alerts and updates
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emergency Alerts</p>
                <p className="text-sm text-muted-foreground">
                  High priority emergency notifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          onClick={logout}
          variant="destructive" 
          className="w-full"
        >
          Sign Out
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          SafeCircle v1.0.0
        </div>
      </div>
    </div>
  );
}
