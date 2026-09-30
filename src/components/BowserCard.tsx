import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Bowser, formatLitres } from '@/data/mock';
import { colors, radius, space } from '@/theme';

import { Card, Icon, IconName, InfoStrip, ProgressBar, Row, StatusPill, Tag, Tone, Txt } from './ui';

const statusMeta: Record<Bowser['status'], { label: string; tone: Tone; icon: IconName }> = {
  en_route: { label: 'En Route', tone: 'secondary', icon: 'local-shipping' },
  discharging: { label: 'Discharging', tone: 'primary', icon: 'water-drop' },
  ready: { label: 'Ready Task', tone: 'tertiary', icon: 'check-circle-outline' },
  standby: { label: 'Standby', tone: 'neutral', icon: 'pause-circle-outline' },
};

export function BowserCard({ bowser, onTrack, onAssign }: { bowser: Bowser; onTrack?: () => void; onAssign?: () => void }) {
  const meta = statusMeta[bowser.status];
  const pct = bowser.volume / bowser.capacity;
  const low = pct < 0.25;
  const full = pct >= 0.999;
  const barColor = low ? colors.error : full ? colors.onTertiaryFixedVariant : colors.primary;
  const volumeLabel = low ? `${Math.round(pct * 100)}% Low` : full ? '100% Full' : `${Math.round(pct * 100)}%`;
  const available = low
    ? `${formatLitres(bowser.volume)} L Remaining`
    : full
      ? `${formatLitres(bowser.volume)} L Primed`
      : `${formatLitres(bowser.volume)} L Available`;

  return (
    <Card style={{ flex: 1 }}>
      <Pressable onPress={onTrack}>
        <Row style={{ alignItems: 'flex-start', gap: space.md - 4 }}>
          <View style={styles.iconBox}>
            <Icon name={meta.icon} size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Row style={{ gap: space.sm, flexWrap: 'wrap' }}>
              <Txt variant="headlineMd" style={{ flexShrink: 1 }}>
                Bowser #{bowser.id}
              </Txt>
              <Tag label={`${formatLitres(bowser.capacity)}L`} />
              <StatusPill label={meta.label} tone={meta.tone} />
            </Row>
            <Txt variant="bodyMd" color={colors.onSurfaceVariant}>
              Driver: {bowser.driver} • {bowser.vehicle}
            </Txt>
          </View>
        </Row>

        <Row style={{ justifyContent: 'space-between', marginTop: space.md, marginBottom: 6 }}>
          <Txt variant="labelMd" color={colors.onSurfaceVariant}>
            Tank Water Volume ({volumeLabel})
          </Txt>
          <Txt variant="labelMd" color={low ? colors.error : full ? colors.onTertiaryFixedVariant : colors.onSurface}>
            {available}
          </Txt>
        </Row>
        <ProgressBar value={pct} color={barColor} />

        <InfoStrip
          icon={bowser.status === 'ready' ? 'garage' : bowser.status === 'discharging' ? 'apartment' : 'place'}
          style={{ marginTop: space.md - 4 }}
          trailing={<StripTrailing bowser={bowser} onAssign={onAssign} />}
        >
          <Txt variant="bodyMd" numberOfLines={1}>
            {bowser.location}
          </Txt>
        </InfoStrip>
      </Pressable>
    </Card>
  );
}

function StripTrailing({ bowser, onAssign }: { bowser: Bowser; onAssign?: () => void }) {
  if (bowser.status === 'ready' || bowser.status === 'standby') {
    return (
      <Pressable onPress={onAssign} style={({ pressed }) => [styles.assign, pressed && { opacity: 0.8 }]} hitSlop={8}>
        <Txt variant="labelMd" color={colors.onPrimary}>
          Assign Now
        </Txt>
      </Pressable>
    );
  }
  if (bowser.status === 'discharging') {
    return (
      <Row style={{ gap: 4 }}>
        <MaterialCommunityIcons name="sync" size={16} color={colors.primary} />
        <Txt variant="labelLg" color={colors.primary}>
          Pumping
        </Txt>
      </Row>
    );
  }
  return (
    <Row style={{ gap: 4 }}>
      <Icon name="schedule" size={16} color={colors.primary} />
      <Txt variant="labelLg" color={colors.primary}>
        ETA {bowser.etaMins ?? '--'}m
      </Txt>
    </Row>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assign: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
});
