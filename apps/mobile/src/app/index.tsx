import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/app';
import { useAuth } from '@ezyify/core';

/** Entry gate: onboarding once, auth optional (guests can browse), then tabs. */
export default function Index() {
  const hydrated = useAppStore(s => s.hydrated);
  const onboardingSeen = useAppStore(s => s.onboardingSeen);
  const status = useAuth(s => s.status);
  if (!hydrated) return null;
  if (!onboardingSeen) return <Redirect href="/(onboarding)/welcome" />;
  if (status !== 'authenticated') return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)/home" />;
}
