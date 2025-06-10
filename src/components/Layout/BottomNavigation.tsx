import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, MapPin, Users, Building2 } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="flex justify-around items-center h-16">
        <Button
          variant={activeTab === 'circles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onTabChange('circles');
            navigate('/');
          }}
          className="flex-1 h-full rounded-none"
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onTabChange('map');
            navigate('/map');
          }}
          className="flex-1 h-full rounded-none"
        >
          <MapPin className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'alerts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onTabChange('alerts');
            navigate('/alerts');
          }}
          className="flex-1 h-full rounded-none"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'places' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            onTabChange('places');
            navigate('/places');
          }}
          className="flex-1 h-full rounded-none"
        >
          <Building2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
