import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon, CloseIcon } from './Icons';
import * as Haptics from 'expo-haptics';
import { SlideToPay, type PayPhase } from './SlideToPay';
import { request } from '../data';
import { colors, fonts } from '../theme';
import { EASE_OUT, SHEET_CLOSE_MS, SHEET_OPEN_MS } from '../motion';

const PROCESSING_MIN_MS = 3000;
const PROCESSING_MAX_MS = 5000;
// How long "Done" shows before the slider turns into the Close button.
const DONE_HOLD_MS = 1000;

type Props = {
  visible: boolean;
  onClose: () => void;
  onDecline: () => void;
  onPaid: () => void;
};

export function RequestSheet({ visible, onClose, onDecline, onPaid }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [phase, setPhase] = useState<PayPhase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const paying = phase !== 'idle';
  const finished = phase === 'done' || phase === 'closable';
  // Once paid, any close settles the request as paid.
  const close = finished ? onPaid : onClose;
  const progress = useSharedValue(0);

  // Opening mounts the sheet with a fresh request; set during render so the
  // first frame already has it, rather than in an effect.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setMounted(true);
      setPhase('idle');
    }
  }

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: SHEET_OPEN_MS, easing: EASE_OUT });
    } else {
      progress.value = withTiming(0, { duration: SHEET_CLOSE_MS, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 0.7 }],
  }));

  if (!mounted) return null;

  const handlePaid = () => {
    setPhase('processing');
    const processingMs = PROCESSING_MIN_MS + Math.random() * (PROCESSING_MAX_MS - PROCESSING_MIN_MS);
    timers.current.push(
      setTimeout(() => {
        setPhase('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, processingMs),
      setTimeout(() => setPhase('closable'), processingMs + DONE_HOLD_MS),
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Blocks touches to the screen behind; only the close button dismisses */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]} />

      <Animated.View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }, sheetStyle]}
      >
        <View style={styles.topRow}>
          <View style={styles.agent}>
            <View style={styles.dotRing}>
              <View style={styles.dot} />
            </View>
            <Text style={styles.agentLabel}>{request.agentRole}</Text>
          </View>
          <Pressable
            onPress={close}
            disabled={phase === 'processing'}
            hitSlop={8}
            style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Close"
          >
            <CloseIcon />
          </Pressable>
        </View>

        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={styles.amount}>{request.amount}</Text>
            <Text style={styles.product}>{request.product}</Text>
          </View>
          <View style={styles.checks}>
            {request.checks.map((c) => (
              <View key={c.label} style={styles.checkRow}>
                <Text style={styles.checkText}>{c.label}</Text>
                <View style={styles.checkValue}>
                  <Text style={styles.checkText}>{c.value}</Text>
                  <CheckIcon />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <SlideToPay phase={phase} onComplete={handlePaid} onClose={close} />
          <Pressable
            onPress={onDecline}
            disabled={paying}
            style={({ pressed }) => [styles.decline, pressed && { opacity: 0.3 }, phase === 'processing' && { opacity: 0.3 }, finished && { opacity: 0 }]}
          >
            <Text style={styles.declineText}>Decline request</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: colors.scrim },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 32,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotRing: { padding: 4, borderRadius: 20, backgroundColor: colors.accentTint },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  agentLabel: { color: colors.muted, fontFamily: fonts.mono, fontSize: 14, lineHeight: 18 },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    color: colors.ink,
    fontFamily: fonts.semibold,
    fontSize: 60,
    lineHeight: 64,
    letterSpacing: -1.8,
  },
  product: { color: colors.ink, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  checks: { gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.bg },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: { color: colors.ink, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  decline: { height: 44, alignItems: 'center', justifyContent: 'center' },
  declineText: { color: colors.subtle, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
});
