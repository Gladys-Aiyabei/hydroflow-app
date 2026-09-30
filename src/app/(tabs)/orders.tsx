import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Button, Card, Grid, Icon, InfoStrip, Label, Page, ProgressBar, Row, SectionHeader, StatusPill, Tag, Txt } from '@/components/ui';
import { Bowser, formatLitres, Order } from '@/data/mock';
import { useFleet } from '@/data/store';
import { colors, elevation, fonts, radius, space } from '@/theme';
import { useResponsive } from '@/theme/responsive';
import { notify } from '@/utils/notify';

type Filter = 'all' | 'pending' | 'transit' | 'scheduled';

const FILTERS: { key: Filter; label: string; match: (o: Order) => boolean }[] = [
  { key: 'all', label: 'All Orders', match: () => true },
  { key: 'pending', label: 'Pending Dispatch', match: (o) => o.status === 'awaiting' },
  { key: 'transit', label: 'In Transit', match: (o) => o.status === 'in_transit' },
  { key: 'scheduled', label: 'Scheduled', match: (o) => o.status === 'scheduled' },
];

export default function OrdersScreen() {
  const { orders, bowsers, assignBowser, compatibleBowsers } = useFleet();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const { isCompact, isTablet, gutter, gap, pick } = useResponsive();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = FILTERS.find((f) => f.key === filter)!.match;
    return orders.filter(
      (o) =>
        match(o) &&
        (!q || [o.id, o.customer, o.site, o.category].some((s) => s.toLowerCase().includes(q))),
    );
  }, [orders, query, filter]);

  const urgentOrders = visible.filter((o) => o.urgent && o.status === 'awaiting');
  const pipeline = visible.filter((o) => !(o.urgent && o.status === 'awaiting'));
  const bowserById = (id?: string) => bowsers.find((b) => b.id === id);

  const assign = (order: Order) => {
    const id = assignBowser(order.id);
    if (id) notify('Bowser assigned', `Bowser #${id} is now en route to ${order.customer}.`);
    else notify('No bowser available', 'No ready bowser has enough water for this order. Queue a depot refill first.');
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader section="Orders" />
      <Page keyboardShouldPersistTaps="handled" contentStyle={{ paddingBottom: 88 }}>
        <Row style={[styles.search, elevation.level1]}>
          <Icon name="search" size={22} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search customer, site, or #HF-9042"
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Icon name="close" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : (
            <Icon name="tune" size={22} color={colors.onSurfaceVariant} />
          )}
        </Row>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.sm, paddingHorizontal: isTablet ? 0 : gutter }}
          style={{ marginHorizontal: isTablet ? 0 : -gutter, flexGrow: 0 }}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            const count = orders.filter(f.match).length;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.chip, active && styles.chipActive]}>
                <Txt variant="labelLg" color={active ? colors.onPrimary : colors.onSurface}>
                  {f.label}
                </Txt>
                <View style={[styles.chipCount, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Txt variant="labelSm" color={active ? colors.onPrimary : colors.primaryDark}>
                    {count}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {urgentOrders.length > 0 && (
          <Grid columns={urgentOrders.length > 1 ? pick({ base: 1, tablet: 2 }) : 1} gap={gap}>
            {urgentOrders.map((o) => (
              <UrgentOrderCard key={o.id} order={o} onAssign={() => assign(o)} />
            ))}
          </Grid>
        )}

        <SectionHeader title="Active Bowser Pipeline" count={pipeline.length} action="Auto-refresh 15s" />
        {pipeline.length === 0 && (
          <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
            <Icon name="inbox" size={32} color={colors.outline} />
            <Txt variant="bodyMd" color={colors.onSurfaceVariant} style={{ marginTop: space.sm }}>
              No orders match this view.
            </Txt>
          </Card>
        )}
        <Grid columns={pick({ base: 1, tablet: 2, desktop: 3 })} gap={gap} style={{ marginTop: -space.sm }}>
          {pipeline.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              bowser={bowserById(o.bowserId)}
              compatible={compatibleBowsers(o)}
              onAssign={() => assign(o)}
            />
          ))}
        </Grid>
      </Page>

      <View style={[styles.fabWrap, { bottom: space.md, pointerEvents: 'box-none' }]}>
        <Pressable onPress={() => router.push('/new-order')} style={({ pressed }) => [styles.fab, elevation.level2, pressed && { transform: [{ translateY: 1.5 }] }]}>
          <Icon name="add" size={24} color={colors.onPrimary} />
          <Txt variant="headlineSm" color={colors.onPrimary}>
            {isCompact ? 'New Water Order' : 'Create Customer Water Order'}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

function UrgentOrderCard({ order, onAssign }: { order: Order; onAssign: () => void }) {
  return (
    <Card raised style={[styles.urgentCard, { flex: 1 }]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm }}>
        <StatusPill label={`High Urgency • ${order.category === 'Hospital' ? 'Hospital Facility Backup' : order.category}`} tone="danger" style={{ flex: 1 }} />
        {order.etaMins !== undefined && (
          <Row style={{ gap: 4 }}>
            <Icon name="timer" size={18} color={colors.error} />
            <Txt variant="labelLg" color={colors.error}>
              In {order.etaMins} mins
            </Txt>
          </Row>
        )}
      </Row>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginTop: space.md - 4, gap: space.sm }}>
        <View style={{ flex: 1 }}>
          <Txt variant="headlineMd">{order.customer}</Txt>
          <Row style={{ gap: 6, alignItems: 'flex-start', marginTop: 2 }}>
            <Icon name="local-hospital" size={16} color={colors.primary} style={{ marginTop: 2 }} />
            <Txt variant="bodyMd" color={colors.onSurfaceVariant} style={{ flex: 1 }}>
              {order.site}
            </Txt>
          </Row>
        </View>
        <VolumeBlock order={order} />
      </Row>
      <InfoStrip
        icon="alarm"
        tone="danger"
        style={{ marginTop: space.md - 4 }}
        trailing={
          order.urgentNote ? (
            <Txt variant="labelSm" color={colors.onSurface}>
              {order.urgentNote}
            </Txt>
          ) : undefined
        }
      >
        <Txt variant="bodyMd">
          Hard Deadline: <Txt variant="labelLg">{order.deadline}</Txt>
        </Txt>
      </InfoStrip>
      <Button label="Instant Assign Bowser" icon="bolt" size="lg" style={{ marginTop: space.md - 4 }} onPress={onAssign} />
    </Card>
  );
}

function VolumeBlock({ order }: { order: Order }) {
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <Txt variant="headlineMd" color={order.status === 'awaiting' ? colors.primary : colors.onSurface} style={{ fontVariant: ['tabular-nums'] }}>
        {formatLitres(order.volume)} L
      </Txt>
      <Label color={order.status === 'awaiting' ? colors.primary : colors.onSurfaceVariant}>{order.grade}</Label>
    </View>
  );
}

const statusPill: Record<Order['status'], (o: Order) => { label: string; tone: 'neutral' | 'secondary' | 'tertiary' | 'success' }> = {
  scheduled: () => ({ label: 'Scheduled Run', tone: 'neutral' }),
  awaiting: () => ({ label: 'Awaiting Dispatch', tone: 'secondary' }),
  in_transit: (o) => ({ label: `In Transit • ${o.etaMins ?? '--'} mins away`, tone: 'tertiary' }),
  delivered: () => ({ label: 'Delivered', tone: 'success' }),
};

function OrderCard({ order, bowser, compatible, onAssign }: { order: Order; bowser?: Bowser; compatible: Bowser[]; onAssign: () => void }) {
  const pill = statusPill[order.status](order);
  return (
    <Card style={{ flex: 1 }}>
      <Row style={{ justifyContent: 'space-between', gap: space.sm }}>
        <Row style={{ gap: space.sm, flexShrink: 1 }}>
          <Tag label={`#${order.id}`} />
          <Label color={order.category === 'Residential Outage' ? colors.tertiary : colors.outline}>{order.category}</Label>
        </Row>
        <StatusPill label={pill.label} tone={pill.tone} />
      </Row>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginTop: space.md - 4, gap: space.sm }}>
        <View style={{ flex: 1 }}>
          <Txt variant="headlineMd" numberOfLines={1}>
            {order.customer}
          </Txt>
          <Txt variant="bodyMd" color={colors.onSurfaceVariant} numberOfLines={1}>
            {order.site}
          </Txt>
        </View>
        <VolumeBlock order={order} />
      </Row>

      {order.status === 'scheduled' && bowser && (
        <>
          <View style={styles.inner}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: 6 }}>
                <Icon name="schedule" size={16} color={colors.primary} />
                <Txt variant="bodyMd">
                  Window: <Txt variant="labelLg">{order.window}</Txt>
                </Txt>
              </Row>
              <Txt variant="labelMd" color={colors.primary}>
                Industrial Grade
              </Txt>
            </Row>
            <BowserLine bowser={bowser} trailing={<Tag label={order.depotBay ?? 'Depot'} style={{ backgroundColor: colors.surfaceContainerLowest }} />} />
          </View>
          <Row style={{ gap: space.sm + 2, marginTop: space.md - 4 }}>
            <Button label="Reassign" icon="swap-horiz" variant="secondary" style={{ flex: 1 }} onPress={() => notify('Reassign requested', `Dispatch will offer a replacement for Bowser #${bowser.id}.`)} />
            <Button label="Track Bowser" icon="my-location" style={{ flex: 1 }} onPress={() => router.navigate('/tracking')} />
          </Row>
        </>
      )}

      {order.status === 'awaiting' && (
        <>
          <View style={styles.inner}>
            {order.advisory && (
              <Row style={{ gap: space.sm + 2, alignItems: 'flex-start' }}>
                <Icon name="warning-amber" size={20} color={colors.onSurfaceVariant} />
                <View style={{ flex: 1 }}>
                  <Txt variant="labelLg">{order.advisory.title}</Txt>
                  <Txt variant="bodyMd" color={colors.onSurfaceVariant}>
                    {order.advisory.body}
                  </Txt>
                </View>
              </Row>
            )}
            <Row style={{ gap: space.sm, justifyContent: 'space-between' }}>
              <Row style={{ gap: 6, flexShrink: 1 }}>
                <Icon name="near-me" size={16} color={colors.primary} />
                <Txt variant="bodySm">
                  {compatible.length} compatible bowser{compatible.length === 1 ? '' : 's'} within 5 km
                </Txt>
              </Row>
              <Txt variant="labelMd" color={colors.primary}>
                {compatible.map((b) => b.id).join(', ') || '—'}
              </Txt>
            </Row>
          </View>
          <Button label="Assign Available Bowser" icon="assignment-turned-in" size="lg" style={{ marginTop: space.md - 4 }} onPress={onAssign} disabled={compatible.length === 0} />
        </>
      )}

      {order.status === 'in_transit' && bowser && (
        <>
          <View style={styles.inner}>
            <BowserLine
              bowser={bowser}
              sub={`${bowser.driver} • Speed ${bowser.speedKmh} km/h`}
              trailing={
                <Txt variant="labelLg" color={colors.primary}>
                  ETA {order.etaMins}m
                </Txt>
              }
            />
            <ProgressBar value={order.progress ?? 0} color={colors.tertiary} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt variant="bodySm" color={colors.onSurfaceVariant}>
                Route: {order.routeName}
              </Txt>
              <Txt variant="bodySm" color={colors.onSurfaceVariant}>
                {order.kmRemaining} km remaining
              </Txt>
            </Row>
          </View>
          <Row style={{ gap: space.sm + 2, marginTop: space.md - 4 }}>
            <Button label="Contact Driver" icon="call" variant="secondary" style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${bowser.driverPhone.replace(/[^\d+]/g, '')}`)} />
            <Button label="Live Telemetry" icon="navigation" variant="tertiary" style={{ flex: 1 }} onPress={() => router.navigate('/tracking')} />
          </Row>
        </>
      )}
    </Card>
  );
}

function BowserLine({ bowser, sub, trailing }: { bowser: Bowser; sub?: string; trailing?: React.ReactNode }) {
  return (
    <Row style={{ gap: space.md - 4 }}>
      <View style={styles.avatar}>
        <Txt variant="labelLg" color={colors.primaryDark}>
          {bowser.id.replace('BW-', '')}
        </Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="labelLg">Bowser #{bowser.id}</Txt>
        <Txt variant="bodySm" color={colors.onSurfaceVariant} numberOfLines={1}>
          {sub ?? `${bowser.driver} • ${bowser.driverPhone}`}
        </Txt>
      </View>
      {trailing}
    </Row>
  );
}

const styles = StyleSheet.create({
  search: {
    gap: space.sm + 2,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    minHeight: 52,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.onSurface, paddingVertical: space.sm + 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipCount: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentCard: { borderLeftWidth: 5, borderLeftColor: colors.error },
  inner: {
    marginTop: space.md - 4,
    padding: space.md - 4,
    gap: space.md - 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    height: 56,
  },
});
