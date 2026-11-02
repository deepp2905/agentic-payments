import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationContent } from './data';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function scheduleRequestNotification(seconds: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { ...notificationContent, sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}

/**
 * Calls `onOpen` when the user taps the request notification — whether the app
 * was in the foreground, backgrounded, or killed (launched from the lock screen).
 */
export function useRequestNotificationTap(onOpen: () => void) {
  const last = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (
      last &&
      last.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER &&
      last.notification.request.content.data?.screen === 'request'
    ) {
      onOpen();
      Notifications.clearLastNotificationResponse();
    }
  }, [last]);
}
