import { createContext, useContext, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { nativeTheme, type NativeTheme } from '@ezyify/tokens';

const ThemeContext = createContext<NativeTheme>(nativeTheme('light'));

/** Same token source as the web app (packages/tokens/tokens.json); follows the system scheme. */
export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return <ThemeContext.Provider value={nativeTheme(scheme)}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export const fontFamily = {
  display: 'PlusJakartaSans_700Bold',
  displayMedium: 'PlusJakartaSans_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;
