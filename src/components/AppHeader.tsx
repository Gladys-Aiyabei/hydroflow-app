import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, space } from '@/theme';
import { CONTENT_MAX_WIDTH, useResponsive } from '@/theme/responsive';

import { Row, StatusPill, Txt } from './ui';

export function HydroFlowLogo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="hfBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1596d6" />
          <Stop offset="1" stopColor={colors.primary} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="64" height="64" rx="14" fill="url(#hfBg)" />
      <Path d="M32 9 C32 9 16 27 16 38 a16 16 0 0 0 32 0 C48 27 32 9 32 9 Z" fill="#fff" />
      <Path d="M24.5 40.5 a10.5 10.5 0 0 1 15 0" stroke={colors.primary} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <Path d="M28.3 44.2 a5 5 0 0 1 7.4 0" stroke={colors.primary} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <Rect x="30.4" y="47" width="3.2" height="3.2" rx="1.6" fill={colors.primary} />
      <Path d="M8 48 h7 M49 48 h7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 4.6" />
    </Svg>
  );
}

export function AppHeader({ section }: { section: string }) {
  const insets = useSafeAreaInsets();
  const { isCompact, isTablet, gutter } = useResponsive();
  const logo = isCompact ? 34 : 40;
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + space.sm, paddingHorizontal: gutter }]}>
      <Row style={styles.inner}>
        <Row style={{ gap: isCompact ? space.sm : space.sm + 4, flex: 1 }}>
          <HydroFlowLogo size={logo} />
          <View style={{ flexShrink: 1 }}>
            <Txt variant={isCompact ? 'headlineSm' : 'headlineMd'} numberOfLines={1}>
              HydroFlow Fleet
            </Txt>
            <Txt variant="labelMd" color={colors.onSurfaceVariant} style={{ textTransform: 'uppercase', marginTop: -2 }}>
              {section}
            </Txt>
          </View>
        </Row>
        <Row style={{ gap: isCompact ? space.sm : space.sm + 4 }}>
          {isTablet && (
            <Txt variant="labelMd" color={colors.onSurfaceVariant}>
              Depot Hub North • Shift A
            </Txt>
          )}
          {isCompact ? (
            <View style={styles.onlineDot} accessibilityLabel="Online" />
          ) : (
            <StatusPill label="Online" tone="neutral" style={styles.online} />
          )}
          <Image
            source={require('../../assets/images/manager.png')}
            style={[styles.avatar, { width: logo, height: logo, borderRadius: logo / 2 }]}
            accessibilityLabel="Fleet manager profile"
          />
        </Row>
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: space.sm + 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  inner: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', justifyContent: 'space-between', gap: space.sm },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.tertiary },
  online: { backgroundColor: colors.surfaceContainerHigh },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.primaryFixed },
});
