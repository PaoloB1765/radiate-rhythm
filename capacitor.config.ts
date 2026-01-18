import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.42904fb1b3844c748a674e3c200c67c5',
  appName: 'Viva RadioStar',
  webDir: 'dist',
  // Per sviluppo: commenta 'server' per la build finale dell'APK
  // Decommentalo per vedere le modifiche in tempo reale durante lo sviluppo
  // server: {
  //   url: 'https://42904fb1-b384-4c74-8a67-4e3c200c67c5.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
