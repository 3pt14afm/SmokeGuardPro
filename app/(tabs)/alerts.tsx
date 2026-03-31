import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Alert as RNAlert, Text, View } from "react-native";

import ActiveAlertCard from "../../components/sg/alerts/ActiveAlertCard";
import AlertHistoryCard from "../../components/sg/alerts/AlertHistoryCard";
import AlertSettingsModal from "../../components/sg/alerts/AlertSettingsModal";
import Screen from "../../components/sg/common/Screen";

import { getEsp32Status } from "@/services/esp32";
import { Esp32Status } from "@/types/dashboard";
import { ActiveAlert, AlertItem, AlertSeverity, AlertType } from "../../types/alerts";

const POLL_MS = 2000;

function getTimeLabel() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export default function AlertsScreen() {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [audibleAlarm, setAudibleAlarm] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);

  const [history, setHistory] = useState<AlertItem[]>([
    {
      id: "h-1",
      type: "FILTER_DUE",
      title: "Filter Replacement Due",
      efficiency: "12%",
      time: "Yesterday",
      severity: "info",
    },
  ]);

  const previousStatusRef = useRef<Esp32Status | null>(null);
  const runningHistoryIdRef = useRef<string | null>(null);
  const runningHistoryStartRef = useRef<number | null>(null);

  function prependHistory(item: AlertItem) {
    setHistory((prev) => [item, ...prev]);
  }

  function updateHistoryDuration(id: string | null, duration: string) {
    if (!id) return;

    setHistory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            duration,
          }
          : item
      )
    );
  }

  function beginRunningState(
    type: AlertType,
    title: string,
    severity: AlertSeverity,
    extras?: Partial<AlertItem>
  ) {
    const id = `h-${Date.now()}`;

    runningHistoryIdRef.current = id;
    runningHistoryStartRef.current = Date.now();

    prependHistory({
      id,
      type,
      title,
      severity,
      time: getTimeLabel(),
      duration: type === "FILTER_DUE" ? undefined : "0s",
      peak: extras?.peak,
      efficiency: extras?.efficiency,
    });
  }

  function addInstantHistory(
    type: AlertType,
    title: string,
    severity: AlertSeverity,
    extras?: Partial<AlertItem>
  ) {
    prependHistory({
      id: `h-${Date.now()}`,
      type,
      title,
      severity,
      time: getTimeLabel(),
      duration: extras?.duration,
      peak: extras?.peak,
      efficiency: extras?.efficiency,
    });
  }

  function dismissActiveAlert() {
    setActiveAlert(null);
  }

  function clearHistory() {
    setHistory([]);
    runningHistoryIdRef.current = null;
    runningHistoryStartRef.current = null;
  }

  function onTogglePush(v: boolean) {
    setPushAlerts(v);
    if (!v) {
      RNAlert.alert("Push Alerts Off", "You’ll no longer receive push alerts.");
    }
  }

  function onToggleAudible(v: boolean) {
    setAudibleAlarm(v);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (runningHistoryIdRef.current && runningHistoryStartRef.current) {
        updateHistoryDuration(
          runningHistoryIdRef.current,
          formatDuration(Date.now() - runningHistoryStartRef.current)
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function processStatus(status: Esp32Status) {
    const previous = previousStatusRef.current;

    if (!previous) {
      previousStatusRef.current = status;

      if (!status.connected) {
        setActiveAlert({
          id: `active-disconnect-${Date.now()}`,
          type: "SYSTEM_OFFLINE",
          title: "ACTIVE ALERT: DEVICE DISCONNECTED",
          message: "ESP32 is unreachable. Live monitoring is temporarily unavailable.",
          timestamp: "Just now",
          severity: "warning",
        });

        beginRunningState("SYSTEM_OFFLINE", "Device Disconnected", "warning");
        return;
      }

      if (status.sensor === "DETECTED") {
        setActiveAlert({
          id: `active-smoke-${Date.now()}`,
          type: "HIGH_SMOKE",
          title: "ACTIVE ALERT: HIGH SMOKE",
          message:
            status.mode === "AUTO" && status.fanOn
              ? "Smoke/gas exceeded safe threshold. Fan has been automatically activated."
              : "Smoke/gas detected.",
          timestamp: "Just now",
          severity: "danger",
        });

        beginRunningState("HIGH_SMOKE", "High Smoke Detected", "danger", {
          peak: status.smokeValue > 0 ? `${status.smokeValue}` : "Detected",
        });
        return;
      }

      if (status.mode === "MANUAL" && status.fanOn) {
        beginRunningState("INFO", "Manual Fan Turned On", "info");
        return;
      }

      if (status.mode === "MANUAL" && !status.fanOn) {
        beginRunningState("INFO", "Manual Fan Turned Off", "info");
        return;
      }

      if (status.mode === "AUTO" && !status.fanOn) {
        beginRunningState("SYSTEM_NORMAL", "System Returned to Normal", "info");
      }

      return;
    }

    if (previous.connected && !status.connected) {
      setActiveAlert({
        id: `active-disconnect-${Date.now()}`,
        type: "SYSTEM_OFFLINE",
        title: "ACTIVE ALERT: DEVICE DISCONNECTED",
        message: "ESP32 is unreachable. Live monitoring is temporarily unavailable.",
        timestamp: "Just now",
        severity: "warning",
      });

      beginRunningState("SYSTEM_OFFLINE", "Device Disconnected", "warning");
      previousStatusRef.current = status;
      return;
    }

    if (!previous.connected && status.connected) {
      if (activeAlert?.type === "SYSTEM_OFFLINE") {
        setActiveAlert(null);
      }

      beginRunningState("SYSTEM_NORMAL", "Device Reconnected", "info");
    }

    if (previous.sensor !== "DETECTED" && status.sensor === "DETECTED") {
      setActiveAlert({
        id: `active-smoke-${Date.now()}`,
        type: "HIGH_SMOKE",
        title: "ACTIVE ALERT: HIGH SMOKE",
        message:
          status.mode === "AUTO" && status.fanOn
            ? "Smoke/gas exceeded safe threshold. Fan has been automatically activated."
            : "Smoke/gas detected.",
        timestamp: "Just now",
        severity: "danger",
      });

      beginRunningState("HIGH_SMOKE", "High Smoke Detected", "danger", {
        peak: status.smokeValue > 0 ? `${status.smokeValue}` : "Detected",
      });
    }

    if (previous.sensor === "DETECTED" && status.sensor !== "DETECTED") {
      if (activeAlert?.type === "HIGH_SMOKE") {
        setActiveAlert(null);
      }

      beginRunningState("SYSTEM_NORMAL", "System Returned to Normal", "info");
    }

    if (
      previous.fanOn === false &&
      status.fanOn === true &&
      status.mode === "AUTO" &&
      status.sensor === "DETECTED"
    ) {
      addInstantHistory("AUTO_FAN_ON", "Automatic Fan Activation", "info");

      if (activeAlert?.type === "HIGH_SMOKE") {
        setActiveAlert({
          ...activeAlert,
          message: "Smoke/gas exceeded safe threshold. Fan has been automatically activated.",
        });
      }
    }

    if (
      previous.fanOn === false &&
      status.fanOn === true &&
      status.mode === "MANUAL"
    ) {
      beginRunningState("INFO", "Manual Fan Turned On", "info");
    }

    if (
      previous.fanOn === true &&
      status.fanOn === false &&
      previous.mode === "MANUAL"
    ) {
      beginRunningState("INFO", "Manual Fan Turned Off", "info");
    }

    previousStatusRef.current = status;
  }

  async function pollStatus() {
    try {
      const status = await getEsp32Status();
      processStatus(status);
    } catch {
      processStatus({
        mode: "AUTO",
        sensor: "NORMAL",
        relay: "OFF",
        fanOn: false,
        smokeValue: 0,
        connected: false,
      });
    }
  }

  useEffect(() => {
    pollStatus();

    const timer = setInterval(() => {
      pollStatus();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Text className="text-5xl font-extrabold text-gray-900">Alerts</Text>

        <Pressable
          onPress={() => setSettingsOpen(true)}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </Pressable>
      </View>

      <View className="mt-5">
        <Text className="mb-2 text-xs font-extrabold tracking-wider text-gray-500">
          ACTIVE ALERT
        </Text>

        <ActiveAlertCard alert={activeAlert} onDismiss={dismissActiveAlert} />
      </View>

      <View className="mt-6">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-xs font-extrabold tracking-wider text-gray-500">
            ALERT HISTORY
          </Text>

          <Pressable onPress={clearHistory}>
            <Text className="text-xs font-bold text-emerald-600">Clear All</Text>
          </Pressable>
        </View>

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