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
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
      backgroundColor: '#0f66c7',
    },
    predictiveBackGestureEnabled: true,
    softwareKeyboardLayoutMode: 'pan',
    allowBackup: false,
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO', 'android.permission.POST_NOTIFICATIONS', 'android.permission.USE_BIOMETRIC'],
    // Photo Picker (API 33+) replaces broad media access; Play rejects READ_MEDIA_* without a core-use justification.
    blockedPermissions: [
      'android.permission.READ_PHONE_STATE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
    // App Links: verified against https://ezyify.app/.well-known/assetlinks.json (apps/web/public). `www` alias included.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: 'ezyify.app', pathPrefix: '/' },
          { scheme: 'https', host: 'www.ezyify.app', pathPrefix: '/' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    // Play Console → App content → "Notification" & "Photos and videos" declarations are driven by these.
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
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
    ['expo-notifications', { icon: './assets/images/notification-icon.png', color: '#0f66c7', defaultChannel: 'orders' }],
    ['expo-image-picker', { photosPermission: 'Ezyify uses your photos and videos to create posts, loops and stories.', cameraPermission: 'Ezyify uses the camera to capture posts, loops and go live.', microphonePermission: 'Ezyify uses the microphone to record loops and live audio.' }],
    ['expo-local-authentication', { faceIDPermission: 'Ezyify uses Face ID to protect your wallet and account.' }],
    [
      'expo-splash-screen',
      {
        // Matches the web splash (`features/splash`): brand blue field, mark ~140 dp. Android 12+ draws it
        // inside the system icon circle; dark theme keeps the same mark on the app's dark background.
        backgroundColor: '#0f66c7',
        image: './assets/images/splash-icon.png',
        imageWidth: 140,
        dark: { backgroundColor: '#0a0d14' },
      },
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
          // ASVS V9: release builds never talk cleartext. Debug builds keep the Metro/localhost exception via
          // expo-build-properties' default network security config.
          usesCleartextTraffic: false,
          // Play "Data safety": release builds are not debuggable and strip extra native debug symbols.
          extraProguardRules: `
# Ezyify — keep model classes deserialised by Expo modules; everything else is obfuscated by default.
-keepattributes *Annotation*
-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**
`,
          // 16 KB page-size compliance (Play requirement for API 35+ targets since Nov 2025): AGP 8.5.1+ aligns
          // uncompressed native libs; Expo SDK 57 ships AGP 8.13 + NDK r27 so all bundled .so files are 16 KB aligned.
          buildToolsVersion: '36.0.0',
        },
      },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.ezyify.app/v1',
    // `mock` = in-process demo API (no backend needed: QA builds, Maestro, store screenshots). Never the default.
    apiMode: process.env.EXPO_PUBLIC_API_MODE === 'mock' ? 'mock' : 'live',
    eas: {},
  },
});
