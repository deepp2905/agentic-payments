import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { GeistMono_400Regular, GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
import { ActivityScreen } from './src/screens/ActivityScreen';
import { RequestSheet } from './src/components/RequestSheet';
import { request, type Transaction } from './src/data';
import {
  ensurePermission,
  scheduleRequestNotification,
  useRequestNotificationTap,
} from './src/notifications';
import { colors, fonts } from './src/theme';

const NOTIFY_DELAY_SECONDS = 5;

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {fontsLoaded ? <Flow /> : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Flow() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resolved, setResolved] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    ensurePermission();
  }, []);

  useRequestNotificationTap(() => {
    // A tapped notification always brings back a fresh pending request.
    setResolved(null);
    setSheetOpen(true);
  });

  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const triggerDemo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!(await ensurePermission())) {
      showToast('Turn on notifications for Expo Go in Settings');
      return;
    }
    await scheduleRequestNotification(NOTIFY_DELAY_SECONDS);
    setResolved(null);
    showToast(`Lock your phone — request arrives in ${NOTIFY_DELAY_SECONDS}s`);
  };

  const resolve = (status: Transaction['status']) => {
    setResolved({
      id: 'request',
      merchant: request.merchant,
      agent: request.agent,
      amount: request.amount,
      status,
      flag: status === 'paid' ? 'just now' : undefined,
    });
    setSheetOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ActivityScreen
        resolved={resolved}
        onReview={() => setSheetOpen(true)}
        onFilterLongPress={triggerDemo}
      />
      <RequestSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onDecline={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          resolve('declinedByYou');
        }}
        onPaid={() => resolve('paid')}
      />
      {toast && <Toast message={toast} />}
    </View>
  );
}

function Toast({ message }: { message: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={[styles.toast, { top: insets.top + 8 }]}
      pointerEvents="none"
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.avatar,
  },
  toastText: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
});
