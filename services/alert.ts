import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

let lastTriggerTime = 0;

export async function requestNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") return true;

  const result = await Notifications.requestPermissionsAsync();
  return result.status === "granted";
}

export async function triggerGasAlert(message: string) {
  const now = Date.now();

  // prevent spam
  if (now - lastTriggerTime < 5000) return;
  lastTriggerTime = now;

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.log("Haptics error:", error);
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Gas Alert",
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (error) {
    console.log("Notification error:", error);
  }
}