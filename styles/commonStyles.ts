
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// LivDaily Theme System - Warm, Modern, Presence-Centered
export const themes = {
  earth_tones: {
    background: '#F5F1E8',
    card: '#FFFFFF',
    text: '#3A3530',
    textSecondary: '#7A7268',
    primary: '#8B7355',
    secondary: '#A89080',
    accent: '#C9A882',
    highlight: '#E8D5C4',
    success: '#7A9B76',
    calm: '#9FB8AD',
  },
  pastels: {
    background: '#FFF8F3',
    card: '#FFFFFF',
    text: '#4A4A4A',
    textSecondary: '#8A8A8A',
    primary: '#D4A5A5',
    secondary: '#B8A9C9',
    accent: '#A8C9C1',
    highlight: '#F5E6D3',
    success: '#A8C9A8',
    calm: '#C9D4E8',
  },
  neutrals: {
    background: '#F8F8F6',
    card: '#FFFFFF',
    text: '#2C2C2C',
    textSecondary: '#6C6C6C',
    primary: '#5C5C5C',
    secondary: '#8C8C8C',
    accent: '#A8A8A8',
    highlight: '#E8E8E6',
    success: '#7C9C7C',
    calm: '#9CACAC',
  },
  grounding: {
    background: '#EDE8E2',
    card: '#FFFFFF',
    text: '#3C3530',
    textSecondary: '#6C6258',
    primary: '#6B5D52',
    secondary: '#8B7D72',
    accent: '#AB9D92',
    highlight: '#D8CFC4',
    success: '#6B8B6B',
    calm: '#8B9B9B',
  },
  bright: {
    background: '#FFFBF5',
    card: '#FFFFFF',
    text: '#2A2A2A',
    textSecondary: '#6A6A6A',
    primary: '#E89B5F',
    secondary: '#F5B88D',
    accent: '#FFD4A3',
    highlight: '#FFF0D9',
    success: '#8BC98B',
    calm: '#7DBBD7',
  },
  seasonal_spring: {
    background: '#F9FBF5',
    card: '#FFFFFF',
    text: '#3A4A3A',
    textSecondary: '#6A7A6A',
    primary: '#7BA87B',
    secondary: '#9BC89B',
    accent: '#C5E8C5',
    highlight: '#E8F5E8',
    success: '#6B9B6B',
    calm: '#A8C8D8',
  },
};

export type ThemeName = keyof typeof themes;

export const getTheme = (themeName: ThemeName = 'earth_tones') => {
  return themes[themeName] || themes.earth_tones;
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
