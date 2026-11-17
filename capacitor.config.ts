import type { CapacitorConfig } from '@capacitor/cli'

// The iOS and Android apps: the same web build (`npm run build:app`) inside a native shell.
const config: CapacitorConfig = {
  appId: 'com.farisalrasheed.shatibyah',
  appName: 'الشاطبية',
  webDir: 'dist-app',
  ios: {
    // The page handles its own safe areas (viewport-fit=cover + env(safe-area-inset-*)).
    contentInset: 'never',
    backgroundColor: '#ffffff',
  },
  android: {
    backgroundColor: '#ffffff',
  },
}

export default config
