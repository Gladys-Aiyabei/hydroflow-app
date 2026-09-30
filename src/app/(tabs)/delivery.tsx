import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppHeader } from '@/components/AppHeader';
import { SignaturePad } from '@/components/SignaturePad';
import { Button, Card, Icon, IconBubble, IconName, Label, Page, ProgressBar, Row, StatusPill, Txt } from '@/components/ui';
import { activeDelivery as d, formatLitres } from '@/data/mock';
import { useFleet } from '@/data/store';
import { colors, radius, space, type } from '@/theme';
import { useResponsive } from '@/theme/responsive';
import { notify } from '@/utils/notify';

type Photo = { key: string; label: string; source: ImageSourcePropType };

const INITIAL_PHOTOS: Photo[] = [
  { key: 'coupling', label: 'Camlock Coupling', source: require('../../../assets/images/coupling.jpg') },
  { key: 'meter', label: 'Meter Final Display', source: require('../../../assets/images/meter.jpg') },
];

function timestamp() {
  const now = new Date();
  const h = now.getHours();
  return `Today, ${((h + 11) % 12) + 1}:${now.getMinutes().toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function DeliveryScreen() {
  const { deliveryConfirmed, confirmDelivery } = useFleet();
  const [strokes, setStrokes] = useState<string[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => Object.fromEntries(d.checks.map((c) => [c.key, true])));
  const [signedAt] = useState(timestamp);
  const { isTablet, gap } = useResponsive();

  const remaining = d.initialTank - d.delivered;
  const allChecksPassed = d.checks.every((c) => checks[c.key]);
  const signed = strokes.length > 0;
  const canConfirm = signed && allChecksPassed && !deliveryConfirmed;

  const addPhoto = async () => {
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
    let result: ImagePicker.ImagePickerResult;
    if (Platform.OS === 'web') {
      result = await ImagePicker.launchImageLibraryAsync(opts);
    } else {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      result = perm.granted ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (!result.canceled && result.assets[0]) {
      setPhotos((p) => [...p, { key: `p${Date.now()}`, label: `Site Photo ${p.length + 1}`, source: { uri: result.assets[0].uri } }]);
    }
  };

  const confirm = () => {
    if (!signed) return notify('Signature required', 'Ask the site representative to sign before confirming.');
    if (!allChecksPassed) return notify('Quality checks incomplete', 'All water quality checks must pass before confirming.');
    confirmDelivery(d.delivered);
    notify('Delivery confirmed', `${formatLitres(d.delivered)} L logged for Order #${d.orderId}. E-receipt sent to ${d.manager}.`);
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader section="Delivery" />
      <Page scrollEnabled={!drawing}>
        <Row style={{ justifyContent: 'space-between', gap: space.sm, flexWrap: 'wrap' }}>
          <StatusPill label={deliveryConfirmed ? 'Delivery Verified' : 'Discharge Phase Complete'} tone={deliveryConfirmed ? 'success' : 'secondary'} />
          <Row style={{ gap: 4 }}>
            <Icon name="verified-user" size={16} color={colors.onSurface} />
            <Txt variant="labelMd">ISO 24510 Safe Potable</Txt>
          </Row>
        </Row>

        <View style={isTablet ? styles.columns : { gap }}>
          <View style={[styles.column, { gap }]}>
            <Card>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Row style={{ gap: space.sm }}>
                    <Txt variant="headlineMd" color={colors.primary}>
                      Order #{d.orderId}
                    </Txt>
                    <StatusPill label="Priority Site" tone="secondary" dot={false} />
                  </Row>
                  <Txt variant="headlineLg">{d.customer}</Txt>
                </View>
                <IconBubble name="water-drop" bg={colors.surfaceContainerLow} size={48} />
              </Row>
              <Row style={{ gap: space.sm, marginTop: space.md - 4 }}>
                <Icon name="place" size={20} color={colors.onSurfaceVariant} />
                <Txt variant="bodyMd" color={colors.onSurfaceVariant} style={{ flex: 1 }}>
                  {d.address}
                </Txt>
              </Row>
              <Row style={styles.manager}>
                <Icon name="how-to-reg" size={20} color={colors.onSurfaceVariant} />
                <Txt variant="bodyLg" style={{ flexShrink: 1 }}>
                  {d.manager} <Txt variant="bodySm">(Site Manager)</Txt>
                </Txt>
                <Row style={styles.verified}>
                  <Icon name="check-circle-outline" size={14} color={colors.tertiary} />
                  <Txt variant="labelSm" color={colors.tertiary}>
                    Verified On-Site
                  </Txt>
                </Row>
              </Row>
            </Card>

            <Card>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm }}>
                <Row style={{ gap: space.sm, flex: 1 }}>
                  <Icon name="speed" size={22} color={colors.primary} />
                  <Txt variant="headlineMd">Digital Flow Meter Log</Txt>
                </Row>
                <View style={styles.smallTag}>
                  <Txt variant="labelSm" color={colors.onSurfaceVariant}>
                    Calibrated • Meter #{d.meterId}
                  </Txt>
                </View>
              </Row>
              <View style={styles.meterBox}>
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Label color={colors.onSurface}>Total Delivered Volume</Label>
                    <Row style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Txt style={[type.metric, { fontSize: 40, lineHeight: 46, color: colors.primary }]}>{formatLitres(d.delivered)}</Txt>
                      <Txt variant="headlineSm" style={{ marginBottom: 6 }}>
                        Liters
                      </Txt>
                    </Row>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Label color={colors.onSurface}>Discharge Time</Label>
                    <Txt variant="headlineMd" style={{ marginTop: 6 }}>
                      {d.dischargeTime}
                    </Txt>
                  </View>
                </Row>
                <Row style={{ justifyContent: 'space-between', gap: space.sm, marginTop: space.sm }}>
                  <Txt variant="labelSm" color={colors.onSurfaceVariant} style={{ flex: 1 }}>
                    Target Batch: {formatLitres(d.target)} L ({Math.round((d.delivered / d.target) * 100)}% Discharged)
                  </Txt>
                  <Txt variant="labelSm" color={colors.onSurfaceVariant} style={{ flex: 1, textAlign: 'right' }}>
                    Bowser Tank Remaining: {formatLitres(remaining)} L
                  </Txt>
                </Row>
                <View style={{ marginVertical: space.sm + 2 }}>
                  <ProgressBar value={d.delivered / d.target} color={colors.primary} height={10} track={colors.surfaceContainerLowest} />
                </View>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ gap: space.sm }}>
                    <Svg width={48} height={14} viewBox="0 0 48 14">
                      <Path d="M1 7 C 7 1, 11 1, 17 7 S 27 13, 33 7 S 43 1, 47 7" stroke={colors.primary} strokeWidth={2} fill="none" />
                    </Svg>
                    <Txt variant="bodySm">
                      Avg: <Txt variant="labelMd">{d.avgFlow} L/min</Txt>
                    </Txt>
                  </Row>
                  <View style={styles.lineTag}>
                    <Txt variant="labelSm">{d.line}</Txt>
                  </View>
                </Row>
              </View>
              <Row style={{ gap: space.sm + 2, marginTop: space.md - 4 }}>
                <TankTile label="Initial Tank Vol" value={`${formatLitres(d.initialTank)} L`} />
                <TankTile label="Current Tank Level" value={`${formatLitres(remaining)} L`} highlight />
              </Row>
            </Card>

            <Card>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm }}>
                <Row style={{ gap: space.sm, flex: 1 }}>
                  <MaterialCommunityIcons name="shield-plus-outline" size={22} color={colors.primary} />
                  <Txt variant="headlineMd">Water Quality Verification</Txt>
                </Row>
                <Label color={colors.primary} style={{ textAlign: 'right', width: 90 }}>
                  Pre-drop certified
                </Label>
              </Row>
              <View style={{ gap: space.sm + 2, marginTop: space.md - 4 }}>
                {d.checks.map((c) => (
                  <QualityRow
                    key={c.key}
                    icon={c.icon as IconName}
                    title={c.title}
                    sub={c.sub}
                    result={`${c.result}\n${c.verdict}`}
                    passed={checks[c.key]}
                    disabled={deliveryConfirmed}
                    onToggle={() => setChecks((s) => ({ ...s, [c.key]: !s[c.key] }))}
                  />
                ))}
              </View>
            </Card>
          </View>
          <View style={[styles.column, { gap }]}>
            <Card>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Row style={{ gap: space.sm, flex: 1 }}>
                  <Icon name="photo-camera" size={22} color={colors.primary} />
                  <Txt variant="headlineMd">Visual Proof & Hose Coupling</Txt>
                </Row>
                <Txt variant="labelSm" color={colors.onSurfaceVariant}>
                  {photos.length} Photos{'\n'}Attached
                </Txt>
              </Row>
              <View style={styles.photos}>
                {photos.map((p) => (
                  <View key={p.key} style={styles.photo}>
                    <Image source={p.source} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <Row style={styles.photoCaption}>
                      <Txt variant="labelSm" color="#fff" numberOfLines={1} style={{ flex: 1 }}>
                        {p.label}
                      </Txt>
                      <Icon name="check-circle-outline" size={14} color="#fff" />
                    </Row>
                  </View>
                ))}
                {!deliveryConfirmed && (
                  <Pressable style={styles.addPhoto} onPress={addPhoto}>
                    <Icon name="add-a-photo" size={22} color={colors.primary} />
                    <Txt variant="labelMd" color={colors.primary}>
                      Add Photo
                    </Txt>
                  </Pressable>
                )}
              </View>
            </Card>

            <Card>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Txt variant="headlineMd">Customer Sign-Off</Txt>
                  <Txt variant="bodySm" color={colors.onSurfaceVariant}>
                    {d.manager} • Authorized Site Representative
                  </Txt>
                </View>
                {!deliveryConfirmed && (
                  <Pressable style={styles.clear} onPress={() => setStrokes([])}>
                    <Txt variant="labelSm">Clear Canvas</Txt>
                  </Pressable>
                )}
              </Row>
              <View style={{ marginTop: space.md - 4 }}>
                <SignaturePad strokes={strokes} onChange={setStrokes} onDrawingChange={setDrawing} disabled={deliveryConfirmed} />
                <View style={[styles.signState, signed && { backgroundColor: colors.successBg }]}>
                  <Txt variant="labelSm" color={signed ? colors.successText : colors.onSurfaceVariant}>
                    {signed ? 'Signed' : 'Ready for Sign'}
                  </Txt>
                </View>
              </View>
              <Row style={styles.gpsRow}>
                <Row style={{ gap: 4 }}>
                  <Icon name="place" size={16} color={colors.onSurfaceVariant} />
                  <Txt variant="bodySm">GPS: {d.gps}</Txt>
                </Row>
                <Row style={{ gap: 4 }}>
                  <Icon name="schedule" size={16} color={colors.onSurfaceVariant} />
                  <Txt variant="bodySm">{signedAt}</Txt>
                </Row>
              </Row>
            </Card>

            {deliveryConfirmed ? (
              <View style={styles.success}>
                <Icon name="check-circle" size={28} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Txt variant="headlineSm" color={colors.successText}>
                    Delivery confirmed & e-receipt sent
                  </Txt>
                  <Txt variant="bodySm" color={colors.successText}>
                    {formatLitres(d.delivered)} L added to today&apos;s depot total.
                  </Txt>
                </View>
              </View>
            ) : (
              <Button label="Confirm Delivery & Send E-Receipt" icon="mark-email-read" size="lg" onPress={confirm} style={!canConfirm && { opacity: 0.6 }} />
            )}
            <Row style={{ gap: space.sm + 2 }}>
              <Button
                label="Print Meter Slip"
                icon="bluetooth"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => notify('Printing meter slip', 'Sent to BT-Printer ZQ320 (paired).')}
              />
              <Button
                label="Report Issue"
                icon="warning-amber"
                variant="dangerSoft"
                style={{ flex: 1 }}
                onPress={() => notify('Issue report started', 'Dispatch has been alerted. Add details in the follow-up form.')}
              />
            </Row>
          </View>
        </View>
      </Page>
    </View>
  );
}

function TankTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.tankTile}>
      <Label>{label}</Label>
      <Txt variant="headlineMd" color={highlight ? colors.primary : colors.onSurface} style={{ marginTop: 4, fontVariant: ['tabular-nums'] }}>
        {value}
      </Txt>
    </View>
  );
}

function QualityRow({ icon, title, sub, result, passed, disabled, onToggle }: { icon: IconName; title: string; sub: string; result: string; passed: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <Row style={styles.quality}>
      <IconBubble name={icon} bg={colors.surfaceContainerHigh} color={colors.onSurfaceVariant} size={36} iconSize={18} />
      <View style={{ flex: 1 }}>
        <Txt variant="headlineSm">{title}</Txt>
        <Txt variant="bodySm" color={colors.onSurfaceVariant}>
          {sub}
        </Txt>
      </View>
      <Pressable
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: passed }}
        style={[styles.result, !passed && { backgroundColor: colors.errorContainer }]}
      >
        <Icon name={passed ? 'check' : 'close'} size={16} color={passed ? colors.onTertiaryFixedVariant : colors.onErrorContainer} />
        <Txt variant="labelSm" color={passed ? colors.onTertiaryFixedVariant : colors.onErrorContainer} style={{ textAlign: 'right' }}>
          {passed ? result : 'Failed\nRe-test'}
        </Txt>
      </Pressable>
    </Row>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: space.lg },
  column: { flex: 1, minWidth: 0 },
  manager: {
    gap: space.sm,
    marginTop: space.md - 4,
    padding: space.md - 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    flexWrap: 'wrap',
  },
  verified: {
    gap: 4,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  smallTag: { backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 130 },
  meterBox: { marginTop: space.md, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerHigh },
  lineTag: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  tankTile: { flex: 1, alignItems: 'center', padding: space.md - 4, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow },
  quality: { gap: space.md - 4, padding: space.md - 4, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerLow },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tertiaryFixed,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 36,
  },
  photos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.sm + 2, marginTop: space.md - 4 },
  photo: { width: '48.5%', aspectRatio: 1.3, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceContainerHigh },
  photoCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  addPhoto: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primaryFixedDim,
    backgroundColor: colors.surfaceContainerLow,
  },
  clear: { backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  signState: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gpsRow: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md - 4,
    padding: space.md - 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md - 4,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
});
