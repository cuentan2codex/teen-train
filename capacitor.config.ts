import type { CapacitorConfig } from '@capacitor/cli';

// Configuración preparada para Capacitor (Android).
// Para activar:
//   npm install @capacitor/core @capacitor/cli @capacitor/android
//   npx cap init TeenTrain com.teentrain.app --web-dir=dist
//   npm run build && npx cap add android && npx cap sync
//   npx cap open android  (abre Android Studio para generar APK/AAB)

const config: CapacitorConfig = {
  appId: 'com.teentrain.app',
  appName: 'TeenTrain',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0b1220',
  },
};

export default config;
