import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Safe localStorage access with multiple fallbacks
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = localStorage.getItem('ezyify-theme') as Theme;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
      }
    } catch (error) {
      console.log('[Theme] localStorage not available:', error);
    }
    
    // DARK-FIRST SYSTEM: Default to Dark Mode
    // Dark Mode is the primary, fixed-first experience
    // Light Mode is optional and user-selectable from Settings
    return 'dark';
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatches
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.document) {
        const root = window.document.documentElement;
        
        // Remove previous theme class safely
        root.classList.remove('light', 'dark');
        
        // Add current theme class
        root.classList.add(theme);
        
        // Save to localStorage with error handling
        if (window.localStorage) {
          try {
            localStorage.setItem('ezyify-theme', theme);
          } catch (storageError) {
            console.log('[Theme] Failed to save theme:', storageError);
          }
        }
      }
    } catch (error) {
      console.log('[Theme] Theme update failed:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    } else {
      console.warn('[Theme] Invalid theme value:', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}