import * as Notifications from "expo-notifications";
import { Platform, Vibration } from "react-native";

let isAlarmRunning = false;
let lastNotificationTime = 0;

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") return true;

  const result = await Notifications.requestPermissionsAsync();
  return result.status === "granted";
}

export async function startGasAlert(message: string): Promise<void> {
  const now = Date.now();

  if (!isAlarmRunning) {
    isAlarmRunning = true;

    if (Platform.OS === "android") {
      Vibration.vibrate([0, 1000, 1000], true);
    } else {
      Vibration.vibrate();
    }
  }

  if (now - lastNotificationTime >= 10000) {
    lastNotificationTime = now;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Gas Alert",
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }
}

export function stopGasAlert(): void {
  isAlarmRunning = false;
  Vibration.cancel();
}