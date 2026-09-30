import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppHeader } from '@/components/AppHeader';
import { BowserCard } from '@/components/BowserCard';
import { Button, Card, Grid, Icon, IconBubble, IconName, Label, Page, ProgressBar, Row, SectionHeader, StatusPill, Txt } from '@/components/ui';
import { useFleet } from '@/data/store';
import { notify } from '@/utils/notify';
import { colors, elevation, radius, space, type } from '@/theme';
import { useResponsive } from '@/theme/responsive';

const FLEET_SIZE = 10;
const RESERVE_L = 84000;
const RESERVE_CAPACITY_L = 100000;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function DashboardScreen() {
  const { bowsers, orders, deliveredTodayKl, assignBowser } = useFleet();
  const clock = useClock();
  const [showAll, setShowAll] = useState(false);
  const { isCompact, isTablet, isDesktop, gap, pick } = useResponsive();
  const metricStyle = isCompact ? [type.metric, { fontSize: 26, lineHeight: 30 }] : type.metric;

  const active = bowsers.filter((b) => b.status !== 'standby').length + 4; // 4 additional units off-screen
  const urgent = orders.filter((o) => o.urgent && o.status === 'awaiting').length;
  const visibleBowsers = showAll ? bowsers : bowsers.slice(0, isTablet && !isDesktop ? 4 : 3);

  const handleAssign = (bowserId: string) => {
    const bowser = bowsers.find((b) => b.id === bowserId);
    const target = orders
      .filter((o) => o.status === 'awaiting' && bowser && o.volume <= bowser.volume)
      .sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent))[0];
    if (!target) {
      notify('No matching orders', `No pending orders fit Bowser #${bowserId}.`);
      return;
    }
    assignBowser(target.id, bowserId);
    notify('Bowser dispatched', `#${bowserId} assigned to ${target.customer} (#${target.id}).`);
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader section="Dashboard" />
      <Page>
        <Row style={{ justifyContent: 'space-between', gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <Label color={colors.primary}>Depot Hub North • Shift A</Label>
            <Txt variant={isCompact ? 'headlineMd' : 'headlineLg'} numberOfLines={2}>
              Telemetry & Active Dispatch
            </Txt>
          </View>
          <Row style={styles.clock}>
            <Icon name="schedule" size={18} color={colors.onSurfaceVariant} />
            <Txt variant="labelLg" color={colors.onSurfaceVariant} style={{ fontVariant: ['tabular-nums'] }}>
              {clock}
            </Txt>
          </Row>
        </Row>

        <Card style={{ paddingVertical: space.sm + 4 }}>
          <Row style={{ gap: space.md - 4 }}>
            <IconBubble name="water-drop" bg={colors.tertiaryFixed} color={colors.tertiary} size={36} iconSize={20} />
            <View style={{ flex: 1 }}>
              <Row style={{ gap: 6 }}>
                <View style={[styles.dot, { backgroundColor: colors.tertiary }]} />
                <Txt variant="labelLg">Depot Pressure Optimal</Txt>
              </Row>
              <Txt variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
                Reserve holding at 84,000L. No critical alerts.
              </Txt>
            </View>
            <Pressable style={styles.logs} onPress={() => notify('Depot logs', '06:00 Shift A start\n08:42 Pump P2 cycled\n10:15 Pressure nominal (4.2 bar)')}>
              <Txt variant="labelMd">Logs</Txt>
            </Pressable>
          </Row>
        </Card>

        <Grid columns={pick({ base: 2, tablet: 4 })} gap={space.sm + 2}>
          <MetricCard label="Delivered Today" icon="local-shipping">
            <Row style={{ alignItems: 'flex-end', gap: 2 }}>
              <Txt style={metricStyle}>{deliveredTodayKl.toFixed(1)}</Txt>
              <Txt variant="labelMd">kL</Txt>
            </Row>
            <Row style={{ gap: 4, marginTop: 6 }}>
              <Icon name="trending-up" size={14} color={colors.primary} />
              <Txt variant="labelSm" color={colors.primary}>
                +12% vs 7d avg
              </Txt>
            </Row>
          </MetricCard>
          <MetricCard label="Active Bowsers" icon="home-work">
            <Row style={{ alignItems: 'flex-end', gap: 2 }}>
              <Txt style={metricStyle}>{Math.min(active, FLEET_SIZE)}</Txt>
              <Txt variant="headlineSm" color={colors.onSurfaceVariant}>
                {' '}/ {FLEET_SIZE}
              </Txt>
            </Row>
            <Row style={{ gap: 4, marginTop: 6 }}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Txt variant="labelSm" color={colors.onSurfaceVariant}>
                {FLEET_SIZE - Math.min(active, FLEET_SIZE)} Units Standby/Bay
              </Txt>
            </Row>
          </MetricCard>
          <MetricCard label="Depot Reserve" icon="format-list-bulleted">
            <Row style={{ alignItems: 'flex-end', gap: 2 }}>
              <Txt style={metricStyle}>{(RESERVE_L / 1000).toFixed(1)}</Txt>
              <Txt variant="labelMd">kL</Txt>
            </Row>
            <View style={{ marginTop: space.sm + 2 }}>
              <ProgressBar value={RESERVE_L / RESERVE_CAPACITY_L} height={6} />
            </View>
          </MetricCard>
          <MetricCard label="Dispatches" icon="priority-high" iconColor={colors.error}>
            <Row style={{ alignItems: 'flex-end', gap: 6 }}>
              <Txt style={metricStyle}>{urgent}</Txt>
              <Txt variant="headlineSm" color={colors.error}>
                Urgent
              </Txt>
            </Row>
            <Row style={{ gap: 4, marginTop: 6 }}>
              <Icon name="place" size={14} color={colors.onSurfaceVariant} />
              <Txt variant="labelSm" color={colors.onSurfaceVariant}>
                Avg ETA: 18 mins
              </Txt>
            </Row>
          </MetricCard>
        </Grid>

        <View style={isDesktop ? { flexDirection: 'row', alignItems: 'flex-start', gap } : { gap }}>
          <View style={isDesktop ? { flex: 1 } : undefined}>
            <SectionHeader title="Fast Field Actions" action="Shift Operations" />
            <Row style={{ gap: space.sm + 2, marginTop: -space.sm }}>
              <ActionTile label="Quick Dispatch" icon="send" primary onPress={() => router.navigate('/orders')} />
              <ActionTile label="New Order" icon="post-add" onPress={() => router.push('/new-order')} />
              <ActionTile
                label="Refill Bay Refill"
                icon="water-damage"
                onPress={() => notify('Refill bay', 'Bay 3 queued for refill. Next slot in 6 minutes.')}
              />
            </Row>
          </View>
          <View style={isDesktop ? { flex: 1.3 } : undefined}>
            <ReservoirCard />
          </View>
        </View>

        <SectionHeader title="Live Fleet Bowsers" count={`${visibleBowsers.length} Focus`} action={showAll ? 'Show Less' : `View All ${FLEET_SIZE}`} onAction={() => setShowAll((s) => !s)} />
        <Grid columns={pick({ base: 1, tablet: 2, desktop: 3 })} gap={gap} style={{ marginTop: -space.sm }}>
          {visibleBowsers.map((b) => (
            <BowserCard key={b.id} bowser={b} onTrack={() => router.navigate('/tracking')} onAssign={() => handleAssign(b.id)} />
          ))}
        </Grid>
      </Page>
    </View>
  );
}

function MetricCard({ label, icon, iconColor = colors.primary, children }: { label: string; icon: IconName; iconColor?: string; children: React.ReactNode }) {
  return (
    <Card style={styles.metric}>
      <Row style={{ justifyContent: 'space-between', marginBottom: space.sm }}>
        <Label color={colors.onSurface}>{label}</Label>
        <Icon name={icon} size={20} color={iconColor} />
      </Row>
      {children}
    </Card>
  );
}

function ActionTile({ label, icon, primary, onPress }: { label: string; icon: IconName; primary?: boolean; onPress: () => void }) {
  const { isCompact } = useResponsive();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        primary ? { backgroundColor: colors.primary, borderColor: colors.primaryDark, borderBottomWidth: 3 } : elevation.level1,
        pressed && { transform: [{ translateY: 1.5 }] },
      ]}
    >
      <IconBubble
        name={icon}
        bg={primary ? 'rgba(255,255,255,0.18)' : colors.secondaryContainer}
        color={primary ? colors.onPrimary : colors.primary}
        size={isCompact ? 36 : 44}
      />
      <Txt variant={isCompact ? 'labelLg' : 'headlineSm'} color={primary ? colors.onPrimary : colors.onSurface} style={{ textAlign: 'center' }}>
        {label}
      </Txt>
    </Pressable>
  );
}

function ReservoirCard() {
  const { isCompact } = useResponsive();
  const fill = RESERVE_L / RESERVE_CAPACITY_L;
  return (
    <Card>
      <Row style={{ gap: space.md - 4, alignItems: 'flex-start' }}>
        <MaterialCommunityIcons name="thermometer-water" size={26} color={colors.primary} style={{ marginTop: 4 }} />
        <View style={{ flex: 1 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', columnGap: space.sm, rowGap: 4 }}>
            <Txt variant="headlineMd" style={{ flexShrink: 1 }}>
              Depot Primary Reservoir #R1
            </Txt>
            <StatusPill label="Active Pump" tone="tertiary" style={{ flexShrink: 0 }} />
          </Row>
          <Label color={colors.onSurface} style={{ marginTop: 4 }}>
            Bulk Storage Unit • Bay 1-4 Supply
          </Label>
        </View>
      </Row>

      <View style={styles.tank}>
        <View style={[styles.tankFill, { height: `${fill * 100}%` }]}>
          <Svg width="100%" height={18} viewBox="0 0 400 18" preserveAspectRatio="none" style={styles.wave}>
            <Path d="M0 10 C 50 0 100 18 150 9 C 200 0 250 16 300 8 C 340 2 370 12 400 6 L400 18 L0 18 Z" fill={colors.primaryContainer} />
          </Svg>
        </View>
        <Row style={styles.tankContent}>
          <View style={{ flex: 1 }}>
            <Label color={colors.primaryFixed}>Tank Capacity</Label>
            <Txt variant={isCompact ? 'headlineSm' : 'headlineLg'} color={colors.onPrimary} style={{ fontVariant: ['tabular-nums'] }} numberOfLines={1} adjustsFontSizeToFit>
              84,000 / 100,000 L
            </Txt>
          </View>
          <View style={styles.volBadge}>
            <Txt variant="labelLg" color={colors.primaryDark}>
              {Math.round(fill * 100)}% VOL
            </Txt>
          </View>
        </Row>
      </View>

      <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: space.sm + 2, marginTop: space.md - 4 }}>
        <MiniStat icon="speed" label="Depot Pump Flow" value="450 L/min" />
        <MiniStat icon="verified" label="Purity / TDS" value="110 ppm" suffix="Safe" />
      </View>
      <Button label="Open Reservoir Telemetry" icon="insights" variant="secondary" style={{ marginTop: space.md - 4 }} onPress={() => notify('Reservoir #R1', 'Inflow 380 L/min • Outflow 450 L/min\nLast chlorination 07:30')} />
    </Card>
  );
}

function MiniStat({ icon, label, value, suffix }: { icon: IconName; label: string; value: string; suffix?: string }) {
  return (
    <Row style={styles.miniStat}>
      <Icon name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Label numberOfLines={1}>{label}</Label>
        <Row style={{ alignItems: 'flex-end', gap: 4 }}>
          <Txt variant="headlineSm">{value}</Txt>
          {suffix && (
            <Txt variant="labelSm" color={colors.tertiary} style={{ marginBottom: 3 }}>
              {suffix}
            </Txt>
          )}
        </Row>
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
  clock: {
    gap: 6,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: space.md - 4,
    paddingVertical: space.sm,
    borderRadius: radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  logs: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: space.md - 4,
    paddingVertical: space.sm,
    borderRadius: radius.md,
  },
  metric: { flex: 1, minHeight: 112 },
  tile: {
    flex: 1,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  tank: {
    height: 104,
    marginTop: space.md,
    borderRadius: radius.lg,
    backgroundColor: '#dcecf7',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tankFill: { backgroundColor: colors.primaryContainer, width: '100%' },
  wave: { position: 'absolute', top: -17, left: 0, right: 0 },
  tankContent: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.md - 2,
    gap: space.sm,
  },
  volBadge: {
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 4,
  },
  miniStat: {
    flex: 1,
    gap: space.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: space.md - 4,
  },
});
