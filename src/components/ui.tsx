import { MaterialIcons } from '@expo/vector-icons';
import { Children, ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { colors, elevation, radius, space, type } from '@/theme';
import { CONTENT_MAX_WIDTH, useResponsive } from '@/theme/responsive';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Variant = keyof typeof type;

export function Txt({ variant = 'bodyMd', color = colors.onSurface, style, ...rest }: TextProps & { variant?: Variant; color?: string }) {
  return <Text {...rest} style={[type[variant], { color }, style]} />;
}

export function Icon({ name, size = 22, color = colors.onSurface, style }: { name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}

export function Card({ style, children, raised, ...rest }: ViewProps & { raised?: boolean }) {
  return (
    <View {...rest} style={[styles.card, raised ? elevation.level2 : elevation.level1, style]}>
      {children}
    </View>
  );
}

export function Row({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.row, style]} />;
}

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'tertiary' | 'secondary';

const toneStyles: Record<Tone, { bg: string; fg: string; dot: string; border: string }> = {
  primary: { bg: colors.primaryFixed, fg: colors.primaryDark, dot: colors.primary, border: colors.primaryFixed },
  tertiary: { bg: colors.tertiaryFixed, fg: colors.onTertiaryFixedVariant, dot: colors.tertiary, border: colors.tertiaryFixed },
  secondary: { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer, dot: colors.primary, border: colors.secondaryContainer },
  success: { bg: colors.successBg, fg: colors.successText, dot: colors.success, border: colors.successBorder },
  warning: { bg: colors.warningBg, fg: colors.warningText, dot: colors.warning, border: colors.warningBorder },
  danger: { bg: colors.errorContainer, fg: colors.onErrorContainer, dot: colors.error, border: colors.errorContainer },
  neutral: { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant, dot: colors.outline, border: colors.surfaceContainerHigh },
};

export function StatusPill({ label, tone = 'primary', dot = true, icon, style }: { label: string; tone?: Tone; dot?: boolean; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      {icon ? <Icon name={icon} size={12} color={t.fg} /> : dot ? <View style={[styles.dot, { backgroundColor: t.dot }]} /> : null}
      <Txt variant="labelSm" color={t.fg} style={styles.upper} numberOfLines={2}>
        {label}
      </Txt>
    </View>
  );
}

export function Tag({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.tag, style]}>
      <Txt variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </Txt>
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary, track = colors.surfaceContainerHighest, height = 8 }: { value: number; color?: string; track?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'dangerSoft';
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, icon, variant = 'primary', size = 'md', style, disabled, ...rest }: ButtonProps) {
  const v = {
    primary: { bg: colors.primary, fg: colors.onPrimary, edge: colors.primaryDark },
    tertiary: { bg: colors.tertiary, fg: colors.onPrimary, edge: colors.onTertiaryFixedVariant },
    secondary: { bg: colors.surfaceContainerHigh, fg: colors.onSurface, edge: colors.surfaceDim },
    danger: { bg: colors.error, fg: colors.onPrimary, edge: colors.onErrorContainer },
    dangerSoft: { bg: colors.errorContainer, fg: colors.onErrorContainer, edge: '#f5b8b1' },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: v.bg,
          borderBottomColor: v.edge,
          minHeight: size === 'lg' ? 56 : 48,
          borderBottomWidth: pressed ? 0.5 : 2,
          transform: [{ translateY: pressed ? 1.5 : 0 }],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} color={v.fg} />}
      <Txt variant={size === 'lg' ? 'headlineSm' : 'labelLg'} color={v.fg} numberOfLines={2} style={{ textAlign: 'center', flexShrink: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function IconBubble({ name, bg = colors.primaryFixed, color = colors.primary, size = 44, iconSize = 22, style }: { name: IconName; bg?: string; color?: string; size?: number; iconSize?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Icon name={name} size={iconSize} color={color} />
    </View>
  );
}

export function SectionHeader({ title, count, action, onAction }: { title: string; count?: number | string; action?: string; onAction?: () => void }) {
  return (
    <Row style={styles.sectionHeader}>
      <Row style={{ gap: space.sm, flexShrink: 1 }}>
        <Txt variant="headlineMd" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Txt>
        {count !== undefined && <Tag label={String(count)} />}
      </Row>
      {action && (
        <Pressable onPress={onAction} hitSlop={12}>
          <Row style={{ gap: 2 }}>
            <Txt variant="labelMd" color={onAction ? colors.primary : colors.onSurfaceVariant}>
              {action}
            </Txt>
            {onAction && <Icon name="chevron-right" size={16} color={colors.primary} />}
          </Row>
        </Pressable>
      )}
    </Row>
  );
}

export function Label({ children, color = colors.onSurfaceVariant, style, numberOfLines }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return (
    <Txt variant="labelSm" color={color} style={[styles.upper, style]} numberOfLines={numberOfLines}>
      {children}
    </Txt>
  );
}

export function InfoStrip({ icon, children, trailing, tone = 'neutral', style }: { icon: IconName; children: ReactNode; trailing?: ReactNode; tone?: 'neutral' | 'danger'; style?: StyleProp<ViewStyle> }) {
  const danger = tone === 'danger';
  return (
    <Row style={[styles.strip, danger && { backgroundColor: '#fdecea' }, style]}>
      <Icon name={icon} size={18} color={danger ? colors.error : colors.onSurfaceVariant} />
      <View style={{ flex: 1 }}>{children}</View>
      {trailing}
    </Row>
  );
}

/** Lays children out in equal-width rows of `columns`, padding the last row so cells keep their width. */
export function Grid({ columns, gap = space.md, children, style }: { columns: number; gap?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const items = Children.toArray(children);
  if (columns <= 1) return <View style={[{ gap }, style]}>{items}</View>;
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <View style={[{ gap }, style]}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap, alignItems: 'stretch' }}>
          {row.map((child, c) => (
            <View key={c} style={{ flex: 1, minWidth: 0 }}>
              {child}
            </View>
          ))}
          {Array.from({ length: columns - row.length }, (_, k) => (
            <View key={`pad${k}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** Scrollable page body centred at a max width, with gutters that grow on tablet/desktop. */
export function Page({ children, contentStyle, maxWidth = CONTENT_MAX_WIDTH, ...rest }: ScrollViewProps & { contentStyle?: StyleProp<ViewStyle>; maxWidth?: number }) {
  const { gutter, gap } = useResponsive();
  return (
    <ScrollView {...rest} contentContainerStyle={{ paddingVertical: gutter === 16 ? space.md : space.lg, paddingHorizontal: gutter }}>
      <View style={[{ width: '100%', maxWidth, alignSelf: 'center', gap, paddingBottom: space.lg }, contentStyle]}>{children}</View>
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: space.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 24,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexShrink: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  upper: { textTransform: 'uppercase' },
  tag: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  button: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  sectionHeader: { justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 4, columnGap: space.sm, marginTop: space.sm, marginBottom: space.sm + 4 },
  strip: {
    gap: space.sm + 2,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: space.md - 4,
    paddingVertical: space.sm + 2,
  },
});
