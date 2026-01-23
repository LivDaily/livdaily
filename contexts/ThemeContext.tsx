
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, getTheme } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  themeName: ThemeName;
  colors: ReturnType<typeof getTheme>;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('earth_tones');
  const colors = getTheme(themeName);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('livdaily_theme');
      if (savedTheme) {
        setThemeName(savedTheme as ThemeName);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (theme: ThemeName) => {
    console.log('User changed theme to:', theme);
    try {
      await AsyncStorage.setItem('livdaily_theme', theme);
      setThemeName(theme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
