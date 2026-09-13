import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Standalone native app config — no Expo Go. `expo prebuild` renders android/ from this,
 * and release signing is wired in android/app/build.gradle (see docs/plan/ANDROID_RELEASE.md).
 */
const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? 'Ezyify (Dev)' : 'Ezyify',
  slug: 'ezyify',
  scheme: 'ezyify',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  android: {
    package: IS_DEV ? 'com.ezyify.app.dev' : 'com.ezyify.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
      backgroundColor: '#0f66c7',
    },
    predictiveBackGestureEnabled: true,
    softwareKeyboardLayoutMode: 'pan',
    allowBackup: false,
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.POST_NOTIFICATIONS'],
    blockedPermissions: ['android.permission.READ_PHONE_STATE', 'android.permission.ACCESS_FINE_LOCATION'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: 'ezyify.app', pathPrefix: '/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  ios: {
    bundleIdentifier: IS_DEV ? 'com.ezyify.app.dev' : 'com.ezyify.app',
    supportsTablet: false,
  },
  web: { output: 'static', favicon: './assets/images/favicon.png' },
  plugins: [
    './plugins/withReleaseSigning',
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      { backgroundColor: '#0f66c7', image: './assets/images/splash-icon.png', imageWidth: 140 },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 24,
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          useLegacyPackaging: false,
        },
      },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.ezyify.app/v1',
    eas: {},
  },
});
