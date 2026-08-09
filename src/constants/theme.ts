import { Platform } from 'react-native';

/**
 * Exact brand tokens from mobileappdesignprompt.txt — kept as raw hex here (in addition to
 * tailwind.config.js) for the rare native APIs that need a color string directly
 * (StatusBar, splash config, chart libs) rather than a className.
 */
export const BrandColors = {
  teal: '#06D6A0',
  navy: '#1D2B64',
  navyAlt: '#1C398E',
  ink: '#0A0F1E',
  black: '#000000',
  white: '#FFFFFF',
  amber: '#F59E0B',
  danger: '#EF4444',
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'Inter' },
  android: { sans: 'Inter' },
  default: { sans: 'Inter' },
  web: { sans: 'Inter, ui-sans-serif, system-ui, sans-serif' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
