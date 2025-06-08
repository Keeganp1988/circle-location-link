
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.160788ed378d4c76b2e6194fd979546a',
  appName: 'SafeCircle',
  webDir: 'dist',
  server: {
    url: 'https://160788ed-378d-4c76-b2e6-194fd979546a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      requestPermissions: true,
    },
  },
};

export default config;
