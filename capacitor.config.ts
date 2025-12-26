import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixora.app',
  appName: 'Pixora',
  webDir: 'dist',
  server: {
    url: 'https://19ff423b-8059-4a7d-962f-6fb8f8e8b510.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0a1a',
      showSpinner: false,
    },
  },
  // Deep link configuration for OAuth callbacks
  android: {
    allowMixedContent: true,
  },
  ios: {
    scheme: 'com.pixora.app',
  },
};

export default config;
