import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.resolume.control',
  appName: 'Resolume Control',
  webDir: 'build',
  server: {
    // Allow cleartext traffic for local network communication
    androidScheme: 'http',
    allowNavigation: ['*']
  },
  android: {
    // Enable fullscreen mode
    backgroundColor: '#000000',
    allowMixedContent: true
  }
};

export default config;
