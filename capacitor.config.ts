import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sherzod.fit',
  appName: 'FITCO STUDIO',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
