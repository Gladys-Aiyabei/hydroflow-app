import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';

import { colors, radius, space } from '@/theme';

import { Icon, ProgressBar, Row, Txt } from './ui';

// Map drawn in a 400x440 coordinate space and stretched to the container.
const VW = 400;
const VH = 440;

type Pt = [number, number];
const ROUTE: Pt[] = [
  [60, 100],
  [160, 100],
  [250, 190],
  [330, 290],
  [330, 318],
  [385, 318],
];

const segLens = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const totalLen = segLens.reduce((a, b) => a + b, 0);

function pointAt(t: number): { pt: Pt; seg: number } {
  let d = t * totalLen;
  for (let i = 0; i < segLens.length; i++) {
    if (d <= segLens[i]) {
      const f = d / segLens[i];
      const [x0, y0] = ROUTE[i];
      const [x1, y1] = ROUTE[i + 1];
      return { pt: [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f], seg: i };
    }
    d -= segLens[i];
  }
  return { pt: ROUTE[ROUTE.length - 1], seg: segLens.length - 1 };
}

const BLOCKS: [number, number, number, number][] = [
  [10, 10, 110, 70],
  [185, 10, 120, 60],
  [10, 130, 90, 120],
  [120, 140, 70, 100],
  [230, 60, 60, 80],
  [345, 120, 55, 100],
  [10, 280, 140, 90],
  [180, 280, 110, 70],
  [230, 360, 90, 50],
];

/** Fixed `height` on phones; omit it to fill the parent (tablet split view). */
export function FleetMap({ mode, height: fixedHeight, onRecenter }: { mode: 'fleet' | 'single'; height?: number; onRecenter?: () => void }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const width = size.width;
  const height = fixedHeight ?? size.height;
  const [t, setT] = useState(0.34);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT((v) => (v >= 0.9 ? 0.2 : v + 0.004)), 250);
    return () => clearInterval(id);
  }, []);

  const sx = width / VW;
  const sy = height / VH;
  const pos = (p: Pt) => ({ left: p[0] * sx, top: p[1] * sy });

  const { pt, seg } = pointAt(t);
  const done = [...ROUTE.slice(0, seg + 1), pt].map((p) => p.join(',')).join(' ');
  const remaining = [pt, ...ROUTE.slice(seg + 1)].map((p) => p.join(',')).join(' ');

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
  };

  return (
    <View style={[styles.wrap, fixedHeight ? { height: fixedHeight } : { flex: 1 }]} onLayout={onLayout}>
      {width > 0 && height > 0 && (
        <>
          <Svg width={width} height={height} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
            <Rect x={0} y={0} width={VW} height={VH} fill={colors.mapBg} />
            {BLOCKS.map(([x, y, w, h], i) => (
              <Rect key={i} x={x} y={y} width={w} height={h} rx={4} fill={colors.mapBlock} />
            ))}
            <Path d={`M0 ${VH - 50} C 100 ${VH - 80} 250 ${VH - 30} ${VW} ${VH - 70} L ${VW} ${VH} L 0 ${VH} Z`} fill="#15314a" opacity={0.85} />
            {[100, 260, 330].map((y) => (
              <Path key={`h${y}`} d={`M0 ${y} H${VW}`} stroke={colors.mapRoad} strokeWidth={6} vectorEffect="non-scaling-stroke" />
            ))}
            {[160, 330].map((x) => (
              <Path key={`v${x}`} d={`M${x} 0 V${VH}`} stroke={colors.mapRoad} strokeWidth={6} vectorEffect="non-scaling-stroke" />
            ))}
            <Path d="M0 200 L 400 150" stroke={colors.mapRoad} strokeWidth={4} vectorEffect="non-scaling-stroke" />
            <Path d={`M330 0 V 95`} stroke={colors.error} strokeWidth={3} opacity={0.8} vectorEffect="non-scaling-stroke" />
            <Path d={`M0 100 H 40`} stroke={colors.warning} strokeWidth={3} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
            <Polyline points={done} fill="none" stroke={colors.primaryContainer} strokeWidth={5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <Polyline points={remaining} fill="none" stroke={colors.cyan} strokeOpacity={0.25} strokeWidth={12} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <Polyline points={remaining} fill="none" stroke="#67e8f9" strokeWidth={4} strokeDasharray="10 7" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </Svg>

          {/* Depot */}
          <View style={[styles.anchor, pos(ROUTE[0])]}>
            <View style={styles.depot}>
              <Icon name="home" size={22} color={colors.onPrimary} />
            </View>
            <Txt variant="labelSm" color="#fff" style={styles.caption}>
              CENTRAL DEPOT
            </Txt>
          </View>

          {/* Destination */}
          <View style={[styles.anchor, pos(ROUTE[ROUTE.length - 1])]}>
            <View style={styles.destTag}>
              <Txt variant="labelSm" color="#fff">
                APEX SITE • BAY 4
              </Txt>
            </View>
            <View style={styles.dest}>
              <Icon name="close" size={16} color="#fff" />
            </View>
          </View>

          {/* Secondary fleet markers */}
          {mode === 'fleet' && (
            <>
              <View style={[styles.anchor, pos([330, 40])]}>
                <Row style={styles.chipDark}>
                  <View style={styles.smallBadge}>
                    <Txt variant="labelSm" color="#fff">
                      02
                    </Txt>
                  </View>
                  <Txt variant="labelSm" color="#fff">
                    9.4kL
                  </Txt>
                </Row>
              </View>
              <View style={[styles.anchor, pos([365, 185])]}>
                <View style={styles.hoa}>
                  <Txt variant="labelSm" color="#fff">
                    HOA
                  </Txt>
                </View>
                <Txt variant="labelSm" color="#c7ced6" style={styles.caption}>
                  Oakridge#2
                </Txt>
              </View>
            </>
          )}
          {[
            [375, 100],
            [160, 330],
          ].map((p, i) => (
            <View key={i} style={[styles.anchor, pos(p as Pt)]}>
              <View style={styles.cyanDot} />
            </View>
          ))}

          {/* Live bowser */}
          <View style={[styles.anchor, pos(pt)]}>
            <View style={styles.truckHalo}>
              <View style={styles.truck}>
                <MaterialCommunityIcons name="water-pump" size={18} color="#fff" style={{ transform: [{ rotate: `${heading}deg` }] }} />
              </View>
            </View>
          </View>
          <View style={[styles.callout, { left: Math.min(pt[0] * sx + 26, width - 150), top: pt[1] * sy - 24 }]}>
            <Txt variant="labelMd" color="#fff">
              BW-04 (10kL)
            </Txt>
            <Row style={{ gap: 6, marginTop: 4 }}>
              <View style={{ width: 54 }}>
                <ProgressBar value={0.72} color={colors.cyan} track="#334155" height={10} />
              </View>
              <Txt variant="labelSm" color={colors.tertiaryFixedDim}>
                42 km/h
              </Txt>
            </Row>
          </View>

          <View style={styles.controls}>
            <Pressable style={styles.ctrl} onPress={onRecenter} accessibilityLabel="Recenter map">
              <Icon name="my-location" size={22} color={colors.tertiaryFixedDim} />
            </Pressable>
            <Pressable style={styles.ctrl} onPress={() => setHeading((h) => (h + 90) % 360)} accessibilityLabel="Rotate compass">
              <Icon name="navigation" size={22} color="#e2e8f0" style={{ transform: [{ rotate: `${heading}deg` }] }} />
            </Pressable>
          </View>

          <Row style={styles.gps}>
            <View style={[styles.cyanDot, { width: 9, height: 9 }]} />
            <Txt variant="labelMd" color="#fff">
              GPS PRECISION: ±1.2m
            </Txt>
            <View style={styles.sep} />
            <Txt variant="labelMd" color={colors.tertiaryFixedDim}>
              4G LTE-M
            </Txt>
          </Row>
          <Txt variant="labelSm" color="#7dd3fc" style={styles.water}>
            CANAL SECTOR 4
          </Txt>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: colors.mapBg, overflow: 'hidden' },
  anchor: { position: 'absolute', width: 0, height: 0, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  depot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { position: 'absolute', top: 24, width: 120, textAlign: 'center' },
  dest: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    borderWidth: 3,
    borderColor: '#3f3f46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destTag: {
    position: 'absolute',
    bottom: 18,
    right: -8,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    width: 118,
    alignItems: 'center',
  },
  chipDark: {
    position: 'absolute',
    left: -14,
    gap: 6,
    backgroundColor: '#1e293b',
    paddingRight: 8,
    borderRadius: radius.full,
    width: 78,
  },
  smallBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoa: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3f4650',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyanDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22d3ee' },
  truckHalo: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(14,165,233,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  truck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    borderWidth: 3,
    borderColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    position: 'absolute',
    backgroundColor: '#0f172a',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  controls: { position: 'absolute', right: space.md - 4, top: space.md - 4, gap: space.sm + 2 },
  ctrl: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(30,41,59,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gps: {
    position: 'absolute',
    left: space.md - 4,
    bottom: space.lg,
    gap: space.sm,
    backgroundColor: 'rgba(30,41,59,0.92)',
    paddingHorizontal: space.md - 4,
    paddingVertical: space.sm + 2,
    borderRadius: radius.md,
  },
  sep: { width: 1, height: 16, backgroundColor: '#64748b' },
  water: { position: 'absolute', right: space.md, bottom: space.sm + 2, letterSpacing: 1.5 },
});
