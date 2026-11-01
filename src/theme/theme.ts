export const colors = {
  background: '#F7F4EC',
  backgroundGradientEnd: '#EFE9DB',
  surface: '#FFFFFF',
  surfaceMuted: '#F1ECE0',
  primary: '#4E6B54',
  primarySoft: '#A8C3B8',
  accent: '#C2703D',
  accentSoft: '#E8C9B4',
  onPrimary: '#FFFFFF',
  textPrimary: '#2A2724',
  textSecondary: '#6B6560',
  border: '#E3DDD1',
  success: '#4E7A57',
  error: '#B5544E',
} as const;

export const radius = {
  card: 18,
  lg: 16,
  xl: 24,
  input: 14,
  chip: 10,
  pill: 999,
} as const;

export const spacing = {
  screen: 24,
  block: 24,
} as const;

export const shadow = {
  card: {
    shadowColor: '#2A2724',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
} as const;

export const gradients = {
  hero: ['#F7F4EC', '#EFE9DB'] as const,
  primary: ['#59785F', '#43604A'] as const,
  accent: ['#CE7E49', '#B4622F'] as const,
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
