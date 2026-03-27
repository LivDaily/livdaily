export const COLORS = {
  // Backgrounds
  background: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0EDE6',
  surfaceTertiary: '#E8E4DC',

  // Text
  text: '#1A1814',
  textSecondary: '#6B6560',
  textTertiary: '#A8A39C',

  // Primary — editorial ink
  primary: '#2C2C2C',
  primaryMuted: 'rgba(44,44,44,0.07)',

  // Accent — warm tobacco/tan
  accent: '#8B6F47',
  accentMuted: 'rgba(139,111,71,0.10)',

  // Pillar accents (kept for pillar-specific UI)
  arrive: '#8B6F47',
  arriveMuted: 'rgba(139,111,71,0.10)',
  breathe: '#5C7A8A',
  breatheMuted: 'rgba(92,122,138,0.10)',
  restore: '#6B7B8A',
  restoreMuted: 'rgba(107,123,138,0.10)',

  // Utility
  border: 'rgba(26,24,20,0.08)',
  divider: 'rgba(26,24,20,0.05)',
  danger: '#C0392B',
  warning: '#D4A017',
  success: '#2D6A4F',
};

export const DARK_COLORS = {
  background: '#141210',
  surface: '#1E1B18',
  surfaceSecondary: '#252220',
  surfaceTertiary: '#2E2A26',

  text: '#F0EDE6',
  textSecondary: '#9C9690',
  textTertiary: '#6B6560',

  primary: '#F0EDE6',
  primaryMuted: 'rgba(240,237,230,0.07)',

  accent: '#C4956A',
  accentMuted: 'rgba(196,149,106,0.12)',

  arrive: '#C4956A',
  arriveMuted: 'rgba(196,149,106,0.12)',
  breathe: '#7BA7BC',
  breatheMuted: 'rgba(123,167,188,0.12)',
  restore: '#8BAEBB',
  restoreMuted: 'rgba(139,174,187,0.12)',

  border: 'rgba(240,237,230,0.07)',
  divider: 'rgba(240,237,230,0.04)',
  danger: '#E05C4B',
  warning: '#D4A017',
  success: '#52B788',
};

// Legacy exports for compatibility
export const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.background,
    tint: COLORS.accent,
    icon: COLORS.textSecondary,
    tabIconDefault: COLORS.textSecondary,
    tabIconSelected: COLORS.accent,
  },
  dark: {
    text: DARK_COLORS.text,
    background: DARK_COLORS.background,
    tint: DARK_COLORS.accent,
    icon: DARK_COLORS.textSecondary,
    tabIconDefault: DARK_COLORS.textSecondary,
    tabIconSelected: DARK_COLORS.accent,
  },
};

// Legacy named exports used by button.tsx / ListItem.tsx
export const appleBlue = COLORS.accent;
export const appleRed = COLORS.danger;
export const borderColor = COLORS.border;
export const zincColors = {
  50: '#F0EDE6',
  100: '#E8E4DC',
  200: '#D8D3C8',
  300: 'rgba(26,24,20,0.20)',
  400: '#A8A39C',
  500: '#6B6560',
  600: '#4A4540',
  700: 'rgba(240,237,230,0.15)',
  800: '#2C2C2C',
  900: '#1A1814',
};
