import { Alert, Platform } from 'react-native';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/** Native `Alert` on device; react-native-web's Alert is a no-op, so the web preview falls back to `window.confirm`. */
export function confirm({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive }: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' ? window.confirm([title, message].filter(Boolean).join('\n\n')) : false);
  }
  return new Promise(resolve =>
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) }),
  );
}

export interface ChoiceOption {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

/** Action sheet–style menu: `Alert` on native, a numbered `window.prompt` on web so the preview stays operable. */
export function choose(title: string, options: ChoiceOption[]) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    const answer = window.prompt(`${title}\n\n${options.map((o, i) => `${i + 1}. ${o.label}`).join('\n')}\n\nEnter a number:`);
    const idx = Number(answer) - 1;
    options[idx]?.onPress();
    return;
  }
  Alert.alert(title, undefined, [...options.map(o => ({ text: o.label, style: o.destructive ? ('destructive' as const) : ('default' as const), onPress: o.onPress })), { text: 'Cancel', style: 'cancel' }]);
}
