import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Switch,
  Text,
  View,
  ScrollView,
  Alert as RNAlert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type AlertType = "HIGH_SMOKE" | "MODERATE_ODOR" | "FILTER_DUE" | "INFO";

type AlertItem = {
  id: string;
  type: AlertType;
  title: string;

  time: string; // e.g. "11:20 AM"

  peak?: string; // e.g. "45 ppm"
  duration?: string; // e.g. "4m"
  efficiency?: string; // e.g. "12%"

  severity: "danger" | "warning" | "info";
};

type ActiveAlert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  severity: "danger" | "warning" | "info";

  // optional extras (so you can easily promote to history later)
  peak?: string;
  duration?: string;
  efficiency?: string;
  time?: string; // if you want
};

function SeverityPill({ severity }: { severity: AlertItem["severity"] }) {
  const styles =
    severity === "danger"
      ? { bg: "bg-red-100", text: "text-red-700", label: "Danger" }
      : severity === "warning"
      ? { bg: "bg-amber-100", text: "text-amber-700", label: "Warning" }
      : { bg: "bg-gray-100", text: "text-gray-700", label: "Info" };

  return (
    <View className={`rounded-full px-4 py-1 ${styles.bg}`}>
      <Text className={`text-[12px] font-extrabold ${styles.text}`}>
        {styles.label}
      </Text>
    </View>
  );
}

function HistoryRow({ item }: { item: AlertItem }) {
  const iconStyles =
    item.severity === "danger"
      ? {
          bg: "bg-red-100",
          ring: "border-red-200",
          icon: "warning",
          iconColor: "#EF4444",
          metricColor: "text-red-600",
        }
      : item.severity === "warning"
      ? {
          bg: "bg-amber-100",
          ring: "border-amber-200",
          icon: "alert-circle",
          iconColor: "#F59E0B",
          metricColor: "text-amber-600",
        }
      : {
          bg: "bg-gray-100",
          ring: "border-gray-200",
          icon: "information-circle",
          iconColor: "#6B7280",
          metricColor: "text-gray-700",
        };

  const isFilterDue = item.type === "FILTER_DUE";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Left icon */}
        <View
          className={`h-8 w-8 items-center justify-center rounded-full border ${iconStyles.bg} ${iconStyles.ring}`}
        >
          <Ionicons
            name={iconStyles.icon as any}
            size={20}
            color={iconStyles.iconColor}
          />
        </View>

        {/* Middle content */}
        <View className="flex-1 px-4">
          <Text className="text-lg font-extrabold text-gray-900">
            {item.title}
          </Text>

          <View className="mt-2 flex-row items-center">
            {/* Label */}
            <Text className="text-base font-medium text-gray-500">
              {isFilterDue ? "Efficiency:" : "Peak:"}
            </Text>

            {/* Value */}
            <Text
              className={`ml-2 text-base font-extrabold ${iconStyles.metricColor}`}
            >
              {isFilterDue ? item.efficiency ?? "-" : item.peak ?? "-"}
            </Text>

            {/* Divider + Duration (only if not filter due) */}
            {!isFilterDue ? (
              <>
                <View className="mx-4 h-6 w-[1px] bg-gray-200" />
                <Text className="text-base font-medium text-gray-500">
                  Duration:
                </Text>
                <Text className="ml-2 text-base font-extrabold text-gray-500">
                  {item.duration ?? "-"}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Right side */}
        <View className="items-end">
          <SeverityPill severity={item.severity} />
          <Text className="mt-10 text-[13px] font-medium text-gray-400">
            {item.time}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3 pr-4 flex-1">
        {icon}
        <View className="flex-1">
          <Text className="text-[14px] font-extrabold text-gray-900">
            {title}
          </Text>
          <Text className="mt-0.5 text-[12px] font-medium text-gray-600">
            {subtitle}
          </Text>
        </View>
      </View>

      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function AlertsScreen() {
  // Settings (will later be saved + sent to ESP32)
  const [pushAlerts, setPushAlerts] = useState(true);
  const [audibleAlarm, setAudibleAlarm] = useState(true);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mock active alert (separate type because it contains message/timestamp)
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>({
    id: "active-1",
    type: "HIGH_SMOKE",
    title: "ACTIVE ALERT: HIGH SMOKE",
    message: "Smoke levels exceeded safe threshold. Fan is running at full speed.",
    timestamp: "Just now",
    severity: "danger",
    peak: "182 ppm",
    duration: "4m",
    time: "2:45 PM",
  });

  const [history, setHistory] = useState<AlertItem[]>([
    {
      id: "h-1",
      type: "HIGH_SMOKE",
      title: "High Smoke Detected",
      peak: "182 ppm",
      duration: "4m",
      time: "2:45 PM",
      severity: "danger",
    },
    {
      id: "h-2",
      type: "MODERATE_ODOR",
      title: "Moderate Odor Alert",
      peak: "45 ppm",
      duration: "4m",
      time: "11:20 AM",
      severity: "warning",
    },
    {
      id: "h-3",
      type: "FILTER_DUE",
      title: "Filter Replacement Due",
      efficiency: "12%",
      time: "Yesterday",
      severity: "info",
    },
  ]);

  const hasActive = !!activeAlert;

  const activeCardColors = useMemo(() => {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      title: "text-red-700",
      msg: "text-red-700/80",
      buttonBg: "bg-red-600",
      buttonText: "text-white",
      iconColor: "#EF4444",
    };
  }, []);

  function dismissActiveAlert() {
    if (!activeAlert) return;

    // Convert active alert into a history row (AlertItem)
    const toHistory: AlertItem = {
      id: `h-${Date.now()}`,
      type: activeAlert.type,
      title: activeAlert.title.replace("ACTIVE ALERT: ", ""),
      time: activeAlert.time ?? "Just now",
      peak: activeAlert.peak,
      duration: activeAlert.duration,
      efficiency: activeAlert.efficiency,
      severity: activeAlert.severity,
    };

    setHistory((prev) => [toHistory, ...prev]);
    setActiveAlert(null);
  }

  function onTogglePush(v: boolean) {
    setPushAlerts(v);
    if (v) return;
    RNAlert.alert("Push Alerts Off", "You’ll no longer receive push alerts.");
  }

  function onToggleAudible(v: boolean) {
    setAudibleAlarm(v);
    // later: send command to ESP32 buzzer/alarm enable
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-5xl font-extrabold text-gray-900">Alerts</Text>

          <Pressable
            onPress={() => setSettingsOpen(true)}
            className="h-11 w-11 items-center justify-center "
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
          </Pressable>
        </View>

        {/* Active Alert */}
        <View className="mt-5">
          <Text className="mb-2 text-xs font-extrabold tracking-wider text-gray-500">
            ACTIVE ALERT
          </Text>

          {hasActive ? (
            <View
              className={`rounded-2xl border p-4 pt-5 shadow-sm ${activeCardColors.bg} ${activeCardColors.border}`}
            >
              <View className="flex-row items-start gap-3">
                <View >
                  <Ionicons
                    name="warning"
                    size={26}
                    color={activeCardColors.iconColor}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-[15px] font-extrabold ${activeCardColors.title}`}
                  >
                    {activeAlert!.title}
                  </Text>

                  <Text
                    className={`mt-2 w-[85%] text-base ${activeCardColors.msg}`}
                  >
                    {activeAlert!.message}
                  </Text>

                  <View className="my-1 flex-row items-end justify-between">
                    <Text className="text-[11px] font-semibold text-gray-600">
                      {activeAlert!.timestamp}
                    </Text>

                    <Pressable
                      onPress={dismissActiveAlert}
                      className={`rounded-xl px-4 py-2 ${activeCardColors.buttonBg}`}
                    >
                      <Text
                        className={`text-[12px] font-extrabold ${activeCardColors.buttonText}`}
                      >
                        DISMISS
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <Text className="text-[13px] font-extrabold text-gray-900">
                No active alerts
              </Text>
              <Text className="mt-2 text-[12px] font-medium text-gray-600">
                You’re all good right now.
              </Text>
            </View>
          )}
        </View>

        {/* Alert History */}
        <View className="mt-6">
          <Text className="mb-2 text-xs font-extrabold tracking-wider text-gray-500">
            ALERT HISTORY
          </Text>

          <View className="gap-3">
            {history.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setSettingsOpen(false)}
        >
          {/* Stop press propagation */}
          <Pressable
            onPress={() => {}}
            className="absolute right-5 top-24 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[14px] font-extrabold text-gray-900">
                Alert Settings
              </Text>
              <Pressable
                onPress={() => setSettingsOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100"
              >
                <Ionicons name="close" size={18} color="#111827" />
              </Pressable>
            </View>

            <View className="mt-3 h-[1px] bg-gray-200" />

            <SettingRow
              title="Push Alerts"
              subtitle="Get notified when smoke levels are high"
              value={pushAlerts}
              onValueChange={onTogglePush}
              icon={<Ionicons name="notifications" size={18} color="#111827" />}
            />

            <View className="h-[1px] bg-gray-200" />

            <SettingRow
              title="Audible Alarm"
              subtitle="Play a sound alarm when danger is detected"
              value={audibleAlarm}
              onValueChange={onToggleAudible}
              icon={<Ionicons name="volume-high" size={18} color="#111827" />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
