import React, { useState } from "react";
import { Pressable, Text, View, Alert as RNAlert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/sg/common/Screen";
import ActiveAlertCard from "../../components/sg/alerts/ActiveAlertCard";
import AlertHistoryCard from "../../components/sg/alerts/AlertHistoryCard";
import AlertSettingsModal from "../../components/sg/alerts/AlertSettingsModal";

import { AlertItem, ActiveAlert } from "../../types/alerts";

export default function AlertsScreen() {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [audibleAlarm, setAudibleAlarm] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>({
    id: "active-1",
    type: "HIGH_SMOKE",
    title: "ACTIVE ALERT: HIGH SMOKE",
    message: "Smoke levels exceeded safe threshold. Fan is running at full speed.",
    timestamp: "Just now",
    severity: "danger",
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

  function dismissActiveAlert() {
    if (!activeAlert) return;

    const toHistory: AlertItem = {
      id: `h-${Date.now()}`,
      type: activeAlert.type,
      title: activeAlert.title.replace("ACTIVE ALERT: ", ""),
      time: "Just dismissed",
      severity: activeAlert.severity,
      // peak/duration/efficiency can be added later
    };

    setHistory((prev) => [toHistory, ...prev]);
    setActiveAlert(null);
  }

  function onTogglePush(v: boolean) {
    setPushAlerts(v);
    if (!v) RNAlert.alert("Push Alerts Off", "You’ll no longer receive push alerts.");
  }

  function onToggleAudible(v: boolean) {
    setAudibleAlarm(v);
  }

  return (
    <Screen>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-5xl font-extrabold text-gray-900">Alerts</Text>

        <Pressable
          onPress={() => setSettingsOpen(true)}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </Pressable>
      </View>

      {/* Active Alert */}
      <View className="mt-5">
        <Text className="mb-2 text-xs font-extrabold tracking-wider text-gray-500">
          ACTIVE ALERT
        </Text>

        <ActiveAlertCard alert={activeAlert} onDismiss={dismissActiveAlert} />
      </View>

      {/* Alert History */}
      <View className="mt-6">
        <Text className="mb-2 text-xs font-extrabold tracking-wider text-gray-500">
          ALERT HISTORY
        </Text>

        <View className="gap-3">
          {history.map((item) => (
            <AlertHistoryCard key={item.id} item={item} />
          ))}
        </View>
      </View>

      <AlertSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        pushAlerts={pushAlerts}
        audibleAlarm={audibleAlarm}
        onTogglePush={onTogglePush}
        onToggleAudible={onToggleAudible}
      />
    </Screen>
  );
}
