import { useWindowDimensions } from 'react-native';

// Breakpoints follow DESIGN.md: 4-col handheld, 8-col in-cab tablet, 12-col desktop dashboards.
export const breakpoints = { compact: 360, tablet: 768, desktop: 1200 } as const;

export const CONTENT_MAX_WIDTH = 1280;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < breakpoints.compact;
  const isTablet = width >= breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;
  const gutter = isDesktop ? 32 : isTablet ? 24 : 16;
  const gap = isTablet ? 20 : 16;

  return {
    width,
    height,
    isCompact,
    isTablet,
    isDesktop,
    gutter,
    gap,
    /** Pick a value per breakpoint; larger breakpoints fall back to smaller ones. */
    pick<T>(values: { base: T; tablet?: T; desktop?: T }): T {
      if (isDesktop && values.desktop !== undefined) return values.desktop;
      if (isTablet && values.tablet !== undefined) return values.tablet;
      return values.base;
    },
  };
}
