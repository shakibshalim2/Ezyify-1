import { useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
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

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

function RootStack() {
  const theme = useTheme();
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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const runtime = useMemo(() => createMobileRuntime(), []);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
