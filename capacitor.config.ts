import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.160788ed378d4c76b2e6194fd979546a',
  appName: 'SafeCircle',
  webDir: 'dist',
  plugins: {
    Geolocation: {
      requestPermissions: true,
    },
  },
};

export default config;
