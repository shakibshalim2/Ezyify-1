import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { EzyifyContext } from '@ezyify/core';

import { ThemeProvider, useTheme } from '@/theme';
import { createMobileRuntime } from '@/lib/runtime';
import { notificationUrl } from '@/lib/push';
import { pathFromUrl } from '@/lib/links';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

/** Routes notification taps (cold start + background) to the deep link in the payload. */
function useNotificationRouting() {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const go = (n: Notifications.Notification | null | undefined) => {
      const url = notificationUrl(n);
      const path = url ? pathFromUrl(url) : null;
      if (path) router.push(path as never);
    };
    Notifications.getLastNotificationResponseAsync().then(r => go(r?.notification));
    const sub = Notifications.addNotificationResponseReceivedListener(r => go(r.notification));
    return () => sub.remove();
  }, [router]);
}

function RootStack() {
  const theme = useTheme();
  useNotificationRouting();
  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="loops" options={{ animation: 'fade', contentStyle: { backgroundColor: '#000' } }} />
        <Stack.Screen name="story/[id]" options={{ animation: 'fade', presentation: 'fullScreenModal', contentStyle: { backgroundColor: '#000' } }} />
        <Stack.Screen name="create" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="cart" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="order-success" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="settings/delete-account" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/edit-profile" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/addresses" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/blocked" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/sessions" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="report" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const runtime = useMemo(() => createMobileRuntime(), []);
  const [sessionReady, setSessionReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Silent refresh from the Keystore-held refresh token so a returning user never sees the login screen.
  useEffect(() => {
    let alive = true;
    runtime.restoreSession().finally(() => alive && setSessionReady(true));
    return () => {
      alive = false;
    };
  }, [runtime]);

  useEffect(() => {
    if (fontsLoaded && sessionReady) SplashScreen.hideAsync();
  }, [fontsLoaded, sessionReady]);

  if (!fontsLoaded || !sessionReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <EzyifyContext.Provider value={runtime}>
          <QueryClientProvider client={runtime.queryClient}>
            <ThemeProvider>
              <RootStack />
            </ThemeProvider>
          </QueryClientProvider>
        </EzyifyContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
