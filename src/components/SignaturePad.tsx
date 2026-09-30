import { useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, radius } from '@/theme';

import { Icon, Txt } from './ui';

type Props = {
  strokes: string[];
  onChange: (strokes: string[]) => void;
  /** Lets a parent ScrollView disable scrolling while the user signs. */
  onDrawingChange?: (drawing: boolean) => void;
  disabled?: boolean;
};

export function SignaturePad({ strokes, onChange, onDrawingChange, disabled }: Props) {
  const [current, setCurrent] = useState('');
  const currentRef = useRef('');

  const point = (e: GestureResponderEvent) => `${e.nativeEvent.locationX.toFixed(1)} ${e.nativeEvent.locationY.toFixed(1)}`;

  const finish = () => {
    onDrawingChange?.(false);
    if (currentRef.current.includes('L')) onChange([...strokes, currentRef.current]);
    currentRef.current = '';
    setCurrent('');
  };

  const responderProps: ViewProps = {
    onStartShouldSetResponder: () => !disabled,
    onMoveShouldSetResponder: () => !disabled,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e) => {
      onDrawingChange?.(true);
      currentRef.current = `M${point(e)}`;
      setCurrent(currentRef.current);
    },
    onResponderMove: (e) => {
      currentRef.current += ` L${point(e)}`;
      setCurrent(currentRef.current);
    },
    onResponderRelease: finish,
    onResponderTerminate: finish,
  };

  const empty = strokes.length === 0 && !current;

  return (
    <View style={styles.pad} {...responderProps}>
      {empty && (
        <View style={styles.placeholder}>
          <Icon name="draw" size={28} color={colors.outlineVariant} />
          <Txt variant="labelSm" color={colors.outlineVariant} style={{ letterSpacing: 1.2 }}>
            SIGN WITH FINGER OR STYLUS
          </Txt>
        </View>
      )}
      <Svg style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {[...strokes, current].filter(Boolean).map((d, i) => (
          <Path key={i} d={d} stroke={colors.navy} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
      <View style={styles.baseline}>
        <Txt variant="bodySm" color={colors.outline}>
          x
        </Txt>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    height: 160,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  placeholder: { ...StyleSheet.absoluteFill, pointerEvents: 'none', alignItems: 'center', justifyContent: 'center', gap: 6 },
  baseline: { pointerEvents: 'none', position: 'absolute', left: 16, right: 16, bottom: 28, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  line: { flex: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: colors.outline, marginBottom: 3 },
});
