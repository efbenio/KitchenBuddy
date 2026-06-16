// Shared design tokens for the whole app.
// Import Colors, Spacing, Radii, or FontSizes instead of hardcoding values in components.

export const Colors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  danger: '#e53935',
  dangerDark: '#c62828',
  warning: '#f57c00',
  warningDeep: '#e64a19',
  warningLight: '#fdd835',
  ripenessTooRipe: '#b71c1c',
  success: '#43a047',
  frozenBg: '#e3f2fd',
  frozenText: '#1565c0',
  openBg: '#fff8e1',
  openText: '#f57f17',
  missingBg: '#fff3e0',
  missingText: '#e65100',
  background: '#f7f7f7',
  surface: '#fff',
  surfaceMuted: '#fafafa',
  border: '#ddd',
  borderLight: '#ccc',
  divider: '#eee',
  tagBg: '#f0f0f0',
  chipBg: '#f5f5f5',
  textPrimary: '#222',
  textSecondary: '#333',
  textMuted: '#555',
  textLight: '#666',
  textFaint: '#888',
  placeholder: '#aaa',
  textDisabled: '#999',
  black: '#000',
  transparent: 'transparent',
  overlayDark: 'rgba(0,0,0,0.7)',
  overlayMedium: 'rgba(0,0,0,0.6)',
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const

export const Radii = {
  sm: 6,
  md: 8,
  chip: 16,
  full: 24,
} as const

export const FontSizes = {
  xs: 11,
  sm: 12,
  body: 13,
  md: 14,
  base: 15,
  lg: 16,
} as const
