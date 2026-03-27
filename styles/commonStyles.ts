import { StyleSheet } from 'react-native';

// LivDaily Editorial Theme — Kinfolk / Monocle aesthetic
export const themes = {
  earth_tones: {
    background: '#F7F5F0',
    card: '#FFFFFF',
    text: '#1A1814',
    textSecondary: '#6B6560',
    primary: '#2C2C2C',
    secondary: '#6B6560',
    accent: '#8B6F47',
    highlight: '#F0EDE6',
    success: '#2D6A4F',
    calm: '#5C7A8A',
  },
  pastels: {
    background: '#F7F5F0',
    card: '#FFFFFF',
    text: '#1A1814',
    textSecondary: '#6B6560',
    primary: '#2C2C2C',
    secondary: '#6B6560',
    accent: '#8B6F47',
    highlight: '#F0EDE6',
    success: '#2D6A4F',
    calm: '#5C7A8A',
  },
  neutrals: {
    background: '#F7F5F0',
    card: '#FFFFFF',
    text: '#1A1814',
    textSecondary: '#6B6560',
    primary: '#2C2C2C',
    secondary: '#6B6560',
    accent: '#8B6F47',
    highlight: '#F0EDE6',
    success: '#2D6A4F',
    calm: '#5C7A8A',
  },
  grounding: {
    background: '#F7F5F0',
    card: '#FFFFFF',
    text: '#1A1814',
    textSecondary: '#6B6560',
    primary: '#2C2C2C',
    secondary: '#6B6560',
    accent: '#8B6F47',
    highlight: '#F0EDE6',
    success: '#2D6A4F',
    calm: '#5C7A8A',
  },
  bright: {
    background: '#F7F5F0',
    card: '#FFFFFF',
    text: '#1A1814',
    textSecondary: '#6B6560',
    primary: '#2C2C2C',
    secondary: '#6B6560',
    accent: '#8B6F47',
    highlight: '#F0EDE6',
    success: '#2D6A4F',
    calm: '#5C7A8A',
  },
  seasonal_spring: {
    background: '#F7F5F0',
    card: '#FFFFFF',
    text: '#1A1814',
    textSecondary: '#6B6560',
    primary: '#2C2C2C',
    secondary: '#6B6560',
    accent: '#8B6F47',
    highlight: '#F0EDE6',
    success: '#2D6A4F',
    calm: '#5C7A8A',
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
  // Editorial card: sharp corners, thin border, minimal shadow
  card: {
    borderRadius: 4,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,24,20,0.08)',
    backgroundColor: '#FFFFFF',
    // boxShadow applied inline as string for web compat
  },
  // Playfair Display screen title
  title: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  // Playfair Display section heading
  subtitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  // System sans body
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  // System sans caption — uppercase metadata
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Editorial primary button
  button: {
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2C',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  // Section spacing — generous whitespace
  sectionGap: {
    marginTop: 40,
  },
  // Thin horizontal rule
  divider: {
    height: 1,
    backgroundColor: 'rgba(26,24,20,0.05)',
    marginVertical: 24,
  },
  // Left-border accent line (replaces icon circles)
  accentLine: {
    borderLeftWidth: 2,
    borderLeftColor: '#8B6F47',
    paddingLeft: 12,
  },
});
