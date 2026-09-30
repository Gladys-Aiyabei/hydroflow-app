import { Platform, TextStyle, ViewStyle } from 'react-native';

// HydroFlow Modern Industrial design tokens (see stitch hydroflow_modern_industrial/DESIGN.md)
export const colors = {
  surface: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  onSurface: '#191c1e',
  onSurfaceVariant: '#3f4850',
  inverseSurface: '#2d3133',
  outline: '#707881',
  outlineVariant: '#bfc7d2',
  primary: '#006194',
  primaryDark: '#004b73',
  onPrimary: '#ffffff',
  primaryContainer: '#007bb9',
  primaryFixed: '#cce5ff',
  primaryFixedDim: '#93ccff',
  secondary: '#565e74',
  secondaryContainer: '#dae2fd',
  onSecondaryContainer: '#5c647a',
  tertiary: '#006577',
  tertiaryContainer: '#008096',
  tertiaryFixed: '#acedff',
  tertiaryFixedDim: '#4cd7f6',
  onTertiaryFixedVariant: '#004e5c',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  navy: '#0f172a',
  cyan: '#06b6d4',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  success: '#10b981',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  successText: '#065f46',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  warningText: '#92400e',
  mapBg: '#1b2129',
  mapBlock: '#232a33',
  mapRoad: '#39424d',
} as const;

export const fonts = {
  display: 'SpaceGrotesk_500Medium',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

export const radius = { sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

const tnum: TextStyle = { fontVariant: ['tabular-nums'] };

export const type = {
  headlineXl: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.3 },
  headlineLg: { fontFamily: fonts.displaySemi, fontSize: 22, lineHeight: 30 },
  headlineMd: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 28 },
  headlineSm: { fontFamily: fonts.displaySemi, fontSize: 16, lineHeight: 24, letterSpacing: 0.16 },
  bodyLg: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  labelLg: { fontFamily: fonts.displaySemi, fontSize: 14, lineHeight: 20, letterSpacing: 0.28 },
  labelMd: { fontFamily: fonts.displaySemi, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
  labelSm: { fontFamily: fonts.displayBold, fontSize: 10, lineHeight: 14, letterSpacing: 0.6 },
  metric: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 36, letterSpacing: -1, ...tnum },
} satisfies Record<string, TextStyle>;

export const elevation = {
  level1: Platform.select<ViewStyle>({
    web: { boxShadow: '0 2px 4px -1px rgba(15,23,42,0.06)' },
    default: {
      shadowColor: colors.navy,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
  }),
  level2: Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)' },
    default: {
      shadowColor: colors.navy,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  }),
};
