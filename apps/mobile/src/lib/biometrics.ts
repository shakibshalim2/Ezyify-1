import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export async function biometricsAvailable() {
  if (Platform.OS === 'web') return false;
  const [hasHardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
  return hasHardware && enrolled;
}

/** Gate for wallet / checkout / account deletion. Falls back to device credential so users without biometrics aren't locked out. */
export async function authenticate(reason: string) {
  if (!(await biometricsAvailable())) return { success: true, skipped: true };
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
    biometricsSecurityLevel: 'strong',
  });
  return { success: r.success, skipped: false };
}
