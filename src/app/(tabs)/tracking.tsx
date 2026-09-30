import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { FleetMap } from '@/components/FleetMap';
import { Button, Card, Icon, IconName, Label, ProgressBar, Row, StatusPill, Txt } from '@/components/ui';
import { formatLitres } from '@/data/mock';
import { useFleet } from '@/data/store';
import { colors, radius, space, type } from '@/theme';
import { useResponsive } from '@/theme/responsive';
import { notify } from '@/utils/notify';

export default function TrackingScreen() {
  const { bowsers } = useFleet();
  const [mode, setMode] = useState<'fleet' | 'single'>('single');
  const [signalled, setSignalled] = useState(false);
  const { width, isTablet, isCompact } = useResponsive();
  const splitView = width >= 1024;
  const bowser = bowsers.find((b) => b.id === 'BW-04')!;
  const enRoute = bowsers.filter((b) => b.status === 'en_route' || b.status === 'discharging').length + 1;
  const pct = bowser.volume / bowser.capacity;

  const openNavigation = () => {
    const dest = encodeURIComponent('148 Industrial Blvd');
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${dest}&dirflg=d`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
    });
    Linking.openURL(url);
  };

  const toolbar = (
    <Row style={styles.toolbar}>
      <Row style={styles.segment}>
        {(
          [
            ['fleet', isCompact ? `Fleet ${enRoute}` : `Fleet (${enRoute})`],
            ['single', isCompact ? bowser.id : `Bowser #${bowser.id}`],
          ] as const
        ).map(([key, label]) => (
          <Pressable key={key} onPress={() => setMode(key)} style={[styles.segBtn, mode === key && styles.segActive]}>
            <Txt variant="labelMd" color={mode === key ? colors.onSurface : colors.onSurfaceVariant} style={{ textTransform: 'uppercase' }}>
              {label}
            </Txt>
          </Pressable>
        ))}
      </Row>
      <Row style={{ gap: space.sm }}>
        <Pressable style={styles.toolBtn} onPress={() => notify('Map layers', 'Traffic, water mains and hydrant layers are enabled.')}>
          <Icon name="layers" size={20} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={() => notify('Telematics', 'CAN-bus link healthy • last packet 2s ago')}>
          <Icon name="memory" size={20} color={colors.primary} />
        </Pressable>
      </Row>
    </Row>
  );

  const details = (
    <View style={styles.body}>
      <Card>
        <Row style={{ gap: space.md - 4 }}>
          <View style={[styles.truckBox, isCompact && { width: 44, height: 44 }]}>
            <Icon name="local-shipping" size={isCompact ? 24 : 30} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Row style={{ columnGap: space.sm, rowGap: 4, flexWrap: 'wrap' }}>
              <Txt variant={isCompact ? 'headlineSm' : 'headlineMd'} numberOfLines={1}>
                Bowser #{bowser.id}
              </Txt>
              <StatusPill label="Active" tone="secondary" dot={false} style={{ flexShrink: 0 }} />
            </Row>
            <Txt variant="bodyMd" color={colors.onSurfaceVariant} numberOfLines={1}>
              Heavy Rigid • {formatLitres(bowser.capacity)}L Potable
            </Txt>
          </View>
          <Pressable style={styles.roundBtn} onPress={() => Linking.openURL(`tel:${bowser.driverPhone.replace(/[^\d+]/g, '')}`)} accessibilityLabel="Call driver">
            <Icon name="call" size={20} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.roundBtn} onPress={() => notify('Radio channel', 'Opening push-to-talk on CH-4 (Fleet North).')} accessibilityLabel="Radio">
            <MaterialCommunityIcons name="radio-handheld" size={20} color={colors.primary} />
            <View style={styles.radioDot} />
          </Pressable>
        </Row>
        <Row style={{ marginTop: space.md, gap: space.md }}>
          <Row style={{ gap: space.sm, flex: 1 }}>
            <Icon name="badge" size={20} color={colors.onSurfaceVariant} />
            <View>
              <Txt variant="headlineSm">Marcus Vance</Txt>
              <Label>Lead Tanker Pilot</Label>
            </View>
          </Row>
          <Row style={{ gap: 6, flex: 1 }}>
            <Icon name="verified-user" size={18} color={colors.tertiary} />
            <Label style={{ flex: 1 }}>Hazmat / Potable Cert</Label>
          </Row>
        </Row>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: space.sm }}>
            <View style={[styles.dot, { backgroundColor: colors.error }]} />
            <Label color={colors.error}>Next Delivery Drop-off</Label>
          </Row>
          <Txt variant="labelMd" color={colors.onSurfaceVariant}>
            Job Order #HF-8821
          </Txt>
        </Row>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginTop: space.sm + 2, gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Txt variant={isCompact ? 'headlineMd' : 'headlineLg'} numberOfLines={2}>
              Apex Construction Site
            </Txt>
            <Txt variant="bodyLg" color={colors.onSurfaceVariant}>
              Gate 2 • Bay 4 Hydration Main Line
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt variant="headlineLg" color={colors.primary}>
              {bowser.etaMins ?? 12} mins
            </Txt>
            <Label>3.4 km • On Schedule</Label>
          </View>
        </Row>
        <View style={styles.routeNote}>
          <MaterialCommunityIcons name="call-split" size={20} color={colors.tertiary} />
          <Txt variant="bodyMd" style={{ flex: 1 }}>
            Clear route via Industrial Pkwy. Overhead clearance 4.6m verified.
          </Txt>
        </View>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: space.sm }}>
            <MaterialCommunityIcons name="propane-tank-outline" size={18} color={colors.onSurface} />
            <Label color={colors.onSurface}>Tanker Liquid Dynamics</Label>
          </Row>
          <Label color={colors.tertiary}>{Math.round(pct * 100)}% Full Capacity</Label>
        </Row>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', columnGap: space.sm, marginTop: space.md - 4, marginBottom: space.sm + 2 }}>
          <Row style={{ alignItems: 'flex-end', gap: 6 }}>
            <Txt style={[type.metric, isCompact ? { fontSize: 32, lineHeight: 38 } : { fontSize: 40, lineHeight: 44 }]}>{formatLitres(bowser.volume)}</Txt>
            <Txt variant="bodyLg" color={colors.onSurfaceVariant} style={{ marginBottom: 4 }}>
              / {formatLitres(bowser.capacity)} Liters
            </Txt>
          </Row>
          <Label color={colors.onSurface} style={{ marginBottom: 6 }}>
            Potable Grade A
          </Label>
        </Row>
        <ProgressBar value={pct} color={colors.primaryContainer} height={16} />
        <Row style={{ gap: space.sm + 2, marginTop: space.md }}>
          <Telemetry label="Pump Status" icon="plumbing" value="Standby" sub="Valves Sealed" />
          <Telemetry label="Speed" icon="speed" value={`${bowser.speedKmh}`} unit="km/h" sub="Slosh Guard: OK" />
          <Telemetry label="Tires (PSI)" icon="tire-repair" value="110" unit="PSI" sub="All 6 Axles Nom." />
        </Row>
      </Card>

      <Button label={isCompact ? 'Start Navigation' : 'Open Turn-by-Turn Navigation'} icon="navigation" size="lg" onPress={openNavigation} />
      <Row style={{ gap: space.sm + 2 }}>
        <Button
          label="Site & Tank Specs"
          icon="description"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => notify('Apex Site • Bay 4', 'Inlet: 2.5" Camlock (female)\nTank: 20,000 L cast-in-place\nMax discharge: 450 L/min\nAccess: Gate 2, escort required')}
        />
        <Button
          label={signalled ? 'Site Notified' : 'Signal on Arrival'}
          icon={signalled ? 'check-circle' : 'settings-input-antenna'}
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => {
            setSignalled(true);
            notify('Arrival signal armed', 'Ryan Cole (Site Manager) will be notified when BW-04 enters the geofence.');
          }}
        />
      </Row>
    </View>
  );

  if (splitView) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader section="Tracking" />
        <View style={styles.split}>
          <View style={styles.mapPane}>
            {toolbar}
            <FleetMap mode={mode} onRecenter={() => setMode('single')} />
          </View>
          <ScrollView style={styles.detailPane} contentContainerStyle={{ paddingBottom: space.xl }}>
            {details}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader section="Tracking" />
      <ScrollView contentContainerStyle={{ paddingBottom: space.xl }}>
        {toolbar}
        <FleetMap mode={mode} height={Math.round(Math.min(isTablet ? 560 : 440, Math.max(300, width * (isTablet ? 0.65 : 0.95))))} onRecenter={() => setMode('single')} />
        {details}
      </ScrollView>
    </View>
  );
}

function Telemetry({ label, icon, value, unit, sub }: { label: string; icon: IconName; value: string; unit?: string; sub: string }) {
  const { isCompact } = useResponsive();
  return (
    <View style={styles.telemetry}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Label color={colors.onSurface} style={{ flex: 1 }}>
          {label}
        </Label>
        <Icon name={icon} size={18} color={colors.primary} />
      </Row>
      <Row style={{ alignItems: 'flex-end', gap: 4, marginTop: space.md - 4 }}>
        <Txt variant={isCompact ? 'headlineSm' : 'headlineMd'} style={{ fontVariant: ['tabular-nums'] }}>
          {value}
        </Txt>
        {unit && (
          <Txt variant="bodySm" style={{ marginBottom: 4 }}>
            {unit}
          </Txt>
        )}
      </Row>
      <Txt variant="labelSm" color={colors.onSurfaceVariant} style={{ marginTop: 2 }}>
        {sub}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { justifyContent: 'space-between', padding: space.md - 4, backgroundColor: colors.surface },
  segment: { backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.lg, padding: 4 },
  segBtn: { paddingHorizontal: space.md - 2, height: 36, justifyContent: 'center', borderRadius: radius.md },
  segActive: { backgroundColor: colors.surfaceContainerLowest },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: space.md, gap: space.md },
  split: { flex: 1, flexDirection: 'row' },
  mapPane: { flex: 1.3, borderRightWidth: 1, borderRightColor: colors.surfaceContainerHigh },
  detailPane: { flex: 1, maxWidth: 560 },
  truckBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryContainer,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  routeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm + 2,
    marginTop: space.md - 4,
    padding: space.md - 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  telemetry: {
    flex: 1,
    padding: space.md - 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
});
