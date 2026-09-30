import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Icon, Label, Row, Txt } from '@/components/ui';
import { formatLitres, OrderCategory } from '@/data/mock';
import { useFleet } from '@/data/store';
import { colors, fonts, radius, space } from '@/theme';
import { notify } from '@/utils/notify';

const CATEGORIES: OrderCategory[] = ['Commercial', 'Residential Outage', 'Agriculture', 'Hospital', 'Industrial'];
const GRADES = ['Drinking Water', 'Potable Certified', 'Irrigation Grade', 'Dust & Concrete'];
const STEP = 500;
const MIN_VOL = 1000;
const MAX_VOL = 15000;

export default function NewOrderScreen() {
  const { addOrder } = useFleet();
  const insets = useSafeAreaInsets();
  const [customer, setCustomer] = useState('');
  const [site, setSite] = useState('');
  const [category, setCategory] = useState<OrderCategory>('Commercial');
  const [grade, setGrade] = useState(GRADES[0]);
  const [volume, setVolume] = useState(5000);
  const [urgent, setUrgent] = useState(false);

  const valid = customer.trim().length > 1 && site.trim().length > 1;

  const submit = () => {
    if (!valid) return notify('Missing details', 'Enter the customer name and delivery site.');
    const order = addOrder({ customer: customer.trim(), site: site.trim(), category, grade, volume, urgent });
    router.back();
    notify('Order created', `#${order.id} added to the dispatch queue.`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Row style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + space.sm : space.md }]}>
        <Txt variant="headlineMd">New Water Order</Txt>
        <Pressable onPress={() => router.back()} style={styles.close} accessibilityLabel="Close">
          <Icon name="close" size={22} />
        </Pressable>
      </Row>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: space.md }}>
          <Field label="Customer" value={customer} onChangeText={setCustomer} placeholder="e.g. Riverside Medical Clinic" icon="business" />
          <Field label="Delivery Site" value={site} onChangeText={setSite} placeholder="Address, gate or tank inlet" icon="place" />
        </Card>

        <Card style={{ gap: space.md - 4 }}>
          <Label color={colors.onSurface}>Category</Label>
          <ChipGroup options={CATEGORIES} value={category} onChange={(c) => setCategory(c as OrderCategory)} />
          <Label color={colors.onSurface} style={{ marginTop: space.sm }}>
            Water Grade
          </Label>
          <ChipGroup options={GRADES} value={grade} onChange={setGrade} />
        </Card>

        <Card style={{ gap: space.md - 4 }}>
          <Label color={colors.onSurface}>Volume (Liters)</Label>
          <Row style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setVolume((v) => Math.max(MIN_VOL, v - STEP))}
              accessibilityLabel="Decrease volume"
            >
              <Icon name="remove" size={28} color={colors.primary} />
            </Pressable>
            <Txt variant="headlineLg" style={{ flex: 1, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
              {formatLitres(volume)} L
            </Txt>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setVolume((v) => Math.min(MAX_VOL, v + STEP))}
              accessibilityLabel="Increase volume"
            >
              <Icon name="add" size={28} color={colors.primary} />
            </Pressable>
          </Row>
          <Txt variant="bodySm" color={colors.onSurfaceVariant}>
            Adjust in {STEP} L steps • max single bowser load {formatLitres(MAX_VOL)} L
          </Txt>
        </Card>

        <Card>
          <Row style={{ gap: space.md - 4 }}>
            <Icon name="priority-high" size={22} color={colors.error} />
            <View style={{ flex: 1 }}>
              <Txt variant="headlineSm">High Urgency</Txt>
              <Txt variant="bodySm" color={colors.onSurfaceVariant}>
                Pins the order to the top of dispatch with a hard deadline.
              </Txt>
            </View>
            <Switch value={urgent} onValueChange={setUrgent} trackColor={{ true: colors.error, false: colors.surfaceContainerHighest }} thumbColor="#fff" />
          </Row>
        </Card>

        <Button label="Create Order" icon="check" size="lg" onPress={submit} style={!valid && { opacity: 0.6 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, ...rest }: React.ComponentProps<typeof TextInput> & { label: string; icon: React.ComponentProps<typeof Icon>['name'] }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Label color={colors.onSurface}>{label}</Label>
      <Row style={[styles.input, focused && styles.inputFocused]}>
        <Icon name={icon} size={20} color={focused ? colors.primary : colors.outline} />
        <TextInput
          {...rest}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.outline}
          style={styles.inputText}
        />
      </Row>
    </View>
  );
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <Row style={{ flexWrap: 'wrap', gap: space.sm }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.chip, active && styles.chipActive]}>
            <Txt variant="labelMd" color={active ? colors.onPrimary : colors.onSurface}>
              {o}
            </Txt>
          </Pressable>
        );
      })}
    </Row>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: space.md,
    paddingBottom: space.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: space.md, gap: space.md, width: '100%', maxWidth: 680, alignSelf: 'center' },
  input: {
    gap: space.sm,
    height: 48,
    paddingHorizontal: space.md - 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    backgroundColor: colors.surfaceContainerLowest,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2 },
  inputText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.onSurface, height: '100%' },
  chip: {
    paddingHorizontal: space.md - 4,
    height: 36,
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.slate300,
    backgroundColor: colors.surfaceContainerLowest,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepper: {
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 64,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
});
