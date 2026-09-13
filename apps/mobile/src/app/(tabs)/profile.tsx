import { Redirect } from 'expo-router';
import { useAuth } from '@ezyify/core';

export default function ProfileTab() {
  const user = useAuth(s => s.user);
  return <Redirect href={{ pathname: '/profile/[username]', params: { username: user?.username ?? 'me' } }} />;
}
