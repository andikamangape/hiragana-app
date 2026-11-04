import { Platform } from 'react-native';

export interface Palette {
  background: string;
  backgroundGradientEnd: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  onPrimary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  overlay: string;
}

export type ThemeMode = 'light' | 'dark';

export const palettes: Record<ThemeMode, Palette> = {
  light: {
    background: '#F7F4EC',
    backgroundGradientEnd: '#EFE9DB',
    surface: '#FFFFFF',
    surfaceMuted: '#F1ECE0',
    primary: '#4E6B54',
    primarySoft: '#A8C3B8',
    accent: '#A85A28',
    accentSoft: '#E8C9B4',
    onAccent: '#FFFFFF',
    onPrimary: '#FFFFFF',
    textPrimary: '#2A2724',
    textSecondary: '#6B6560',
    border: '#8C8270',
    success: '#4E7A57',
    error: '#B5544E',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    background: '#161513',
    backgroundGradientEnd: '#1E1C19',
    surface: '#232120',
    surfaceMuted: '#2C2926',
    primary: '#8FB79A',
    primarySoft: '#3C4F43',
    accent: '#E0915C',
    accentSoft: '#4A3729',
    onAccent: '#12110F',
    onPrimary: '#12110F',
    textPrimary: '#F2EEE5',
    textSecondary: '#A8A29A',
    border: '#7A7267',
    success: '#7FB98A',
    error: '#E0877F',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export const gradients: Record<ThemeMode, Record<'hero' | 'primary' | 'accent', readonly [string, string]>> = {
  light: {
    hero: ['#F7F4EC', '#EFE9DB'],
    primary: ['#59785F', '#43604A'],
    accent: ['#B4622F', '#A85A28'],
  },
  dark: {
    hero: ['#1E1C19', '#161513'],
    primary: ['#5C7F66', '#43604A'],
    accent: ['#D98A54', '#C06B36'],
  },
};

export const radius = {
  card: 18,
  lg: 16,
  xl: 24,
  input: 14,
  chip: 10,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 24,
  block: 24,
} as const;

export const elevation = {
  flat: {},
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const shadow = {
  card: elevation.card,
} as const;

export const minTapTarget: number = Platform.select({ ios: 44, default: 48 }) ?? 48;

export const onGradient = {
  right: '#BFE3C8',
  wrong: '#F3B7B3',
  muted: 'rgba(255,255,255,0.85)',
  subtle: 'rgba(255,255,255,0.75)',
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
