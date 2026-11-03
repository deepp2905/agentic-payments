import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { ArrowIcon } from './Icons';
import { colors, fonts } from '../theme';

const TRACK_HEIGHT = 68;
const INSET = 6;
const THUMB = 56;
const COMPLETE_AT = 0.85;
const TICK_LENGTH = 18;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// 'closable': the finished slider has turned into the Close button.
export type PayPhase = 'idle' | 'processing' | 'done' | 'closable';

type Props = { phase: PayPhase; onComplete: () => void; onClose: () => void };

export function SlideToPay({ phase, onComplete, onClose }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const maxX = Math.max(trackWidth - INSET * 2 - THUMB, 1);
  const x = useSharedValue(0);
  const start = useSharedValue(0);
  const done = useSharedValue(false);
  const label = useSharedValue(1);
  const atEnd = useSharedValue(false);

  const content = useSharedValue(1);
  const spinner = useSharedValue(0);
  const rotation = useSharedValue(0);
  const tick = useSharedValue(0);
  const doneLabel = useSharedValue(0);
  const closeMix = useSharedValue(0);

  useEffect(() => {
    if (phase === 'processing') {
      content.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) });
      spinner.value = withDelay(100, withTiming(1, { duration: 200 }));
      rotation.value = 0;
      rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1);
    } else if (phase === 'done') {
      spinner.value = withTiming(0, { duration: 150 }, () => cancelAnimation(rotation));
      tick.value = withDelay(120, withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }));
      doneLabel.value = withDelay(120, withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) }));
    } else if (phase === 'closable') {
      closeMix.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    }
  }, [phase]);

  const reachedEnd = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const touch = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const pan = usePanGesture({
    enabled: phase === 'idle',
    activeOffsetX: [-4, 4],
    onBegin: () => {
      'worklet';
      start.value = x.value;
      scheduleOnRN(touch);
    },
    onActivate: () => {
      'worklet';
      label.value = withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) });
    },
    onUpdate: (e) => {
      'worklet';
      if (done.value) return;
      x.value = Math.min(Math.max(start.value + e.translationX, 0), maxX);
      if (x.value >= maxX && !atEnd.value) {
        atEnd.value = true;
        scheduleOnRN(reachedEnd);
      } else if (x.value < maxX - 2) {
        atEnd.value = false;
      }
    },
    onDeactivate: (e) => {
      'worklet';
      if (done.value) return;
      const projected = x.value + e.velocityX * 0.08;
      if (projected >= maxX * COMPLETE_AT) {
        done.value = true;
        x.value = withTiming(maxX, { duration: 180, easing: Easing.out(Easing.quad) });
        // A fling that releases short of the end still gets the end-stop haptic.
        if (!atEnd.value) scheduleOnRN(reachedEnd);
        scheduleOnRN(onComplete);
      } else {
        x.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
        label.value = withTiming(1, { duration: 150 });
      }
    },
  });

  // Track and fill both settle on the close icon button's colour.
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(closeMix.value, [0, 1], [colors.bg, colors.avatar]),
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: THUMB + x.value,
    backgroundColor: interpolateColor(closeMix.value, [0, 1], [colors.accent, colors.avatar]),
  }));
  const closeLabelStyle = useAnimatedStyle(() => ({ opacity: closeMix.value }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: label.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: content.value }));
  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: spinner.value,
    transform: [{ rotate: `${rotation.value}deg` }, { scale: 0.8 + spinner.value * 0.2 }],
  }));
  const doneStyle = useAnimatedStyle(() => ({
    opacity: Math.min(tick.value * 2, 1) * (1 - closeMix.value),
  }));
  const doneLabelStyle = useAnimatedStyle(() => ({ opacity: doneLabel.value }));
  const tickProps = useAnimatedProps(() => ({
    strokeDashoffset: TICK_LENGTH * (1 - tick.value),
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);
  const innerWidth = trackWidth - INSET * 2;

  return (
    <Pressable
      onPress={onClose}
      disabled={phase !== 'closable'}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
      accessibilityRole="button"
      accessibilityLabel={phase === 'closable' ? 'Close' : undefined}
    >
    <Animated.View style={[styles.track, trackStyle]} onLayout={onLayout}>
      <Animated.Text style={[styles.label, labelStyle]} pointerEvents="none">
        Slide to pay
      </Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, contentStyle]} pointerEvents="none">
            {/* Dark copy of the label, revealed as the fill passes over it */}
            <Animated.View style={[styles.centered, { width: innerWidth }, labelStyle]}>
              <Text style={[styles.labelText, { color: colors.bg }]}>Slide to pay</Text>
            </Animated.View>
            <View style={styles.arrow}>
              <ArrowIcon />
            </View>
          </Animated.View>

          <View style={[styles.centered, { width: innerWidth }]} pointerEvents="none">
            <Animated.View style={spinnerStyle}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={9} fill="none" stroke={colors.bg} strokeOpacity={0.2} strokeWidth={2.4} />
                <Path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={colors.bg} strokeWidth={2.4} strokeLinecap="round" />
              </Svg>
            </Animated.View>
          </View>

          <Animated.View style={[styles.centered, styles.doneRow, { width: innerWidth }, doneStyle]} pointerEvents="none">
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <AnimatedPath
                d="M5 11.5l4 4L17 7"
                fill="none"
                stroke={colors.bg}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={TICK_LENGTH}
                animatedProps={tickProps}
              />
            </Svg>
            <Animated.Text style={[styles.doneText, doneLabelStyle]}>Done</Animated.Text>
          </Animated.View>

          <Animated.View style={[styles.centered, { width: innerWidth }, closeLabelStyle]} pointerEvents="none">
            <Text style={styles.closeText}>Close</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.bg,
    padding: INSET,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.ink,
    fontFamily: fonts.medium,
    fontSize: 17,
    lineHeight: 22,
  },
  labelText: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 22, textAlign: 'center' },
  fill: {
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.accent,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  centered: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneRow: { flexDirection: 'row', gap: 8 },
  doneText: { color: colors.bg, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  closeText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  arrow: {
    position: 'absolute',
    right: 0,
    width: THUMB,
    height: THUMB,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
