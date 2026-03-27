export const COLORS = {
  // Backgrounds
  background: '#F7F4EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#EDE9E2',
  surfaceTertiary: '#E5DFD5',

  // Text
  text: '#1C1917',
  textSecondary: '#78716C',
  textTertiary: '#A8A29E',

  // Brand — earthy sage
  primary: '#5C7A5C',
  primaryMuted: 'rgba(92,122,92,0.10)',
  primaryLight: '#8FAF8F',

  // Accents per pillar
  arrive: '#C4956A',
  arriveMuted: 'rgba(196,149,106,0.12)',
  breathe: '#7BA7BC',
  breatheMuted: 'rgba(123,167,188,0.12)',
  restore: '#7B9EA8',
  restoreMuted: 'rgba(123,158,168,0.12)',

  // Utility
  border: 'rgba(28,25,23,0.08)',
  divider: 'rgba(28,25,23,0.05)',
  danger: '#DC2626',
  success: '#16A34A',
};

export const DARK_COLORS = {
  background: '#1A1714',
  surface: '#242018',
  surfaceSecondary: '#2E2A24',
  surfaceTertiary: '#38332C',

  text: '#F0EDE8',
  textSecondary: '#A8A29E',
  textTertiary: '#78716C',

  primary: '#8FAF8F',
  primaryMuted: 'rgba(143,175,143,0.12)',
  primaryLight: '#5C7A5C',

  arrive: '#D4A574',
  arriveMuted: 'rgba(212,165,116,0.15)',
  breathe: '#8BBDD0',
  breatheMuted: 'rgba(139,189,208,0.15)',
  restore: '#8BAEBB',
  restoreMuted: 'rgba(139,174,187,0.15)',

  border: 'rgba(240,237,232,0.08)',
  divider: 'rgba(240,237,232,0.05)',
  danger: '#EF4444',
  success: '#22C55E',
};

// Legacy exports for compatibility
export const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.background,
    tint: COLORS.primary,
    icon: COLORS.textSecondary,
    tabIconDefault: COLORS.textSecondary,
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: DARK_COLORS.text,
    background: DARK_COLORS.background,
    tint: DARK_COLORS.primary,
    icon: DARK_COLORS.textSecondary,
    tabIconDefault: DARK_COLORS.textSecondary,
    tabIconSelected: DARK_COLORS.primary,
  },
};
