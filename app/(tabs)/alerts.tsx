import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Alert as RNAlert, Text, View } from "react-native";

import ActiveAlertCard from "../../components/sg/alerts/ActiveAlertCard";
import AlertHistoryCard from "../../components/sg/alerts/AlertHistoryCard";
import AlertSettingsModal from "../../components/sg/alerts/AlertSettingsModal";
import Screen from "../../components/sg/common/Screen";

import { getEsp32Status } from "@/services/esp32";
import { triggerGasAlert } from "@/services/alert";
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

const OFFLINE_STATUS: Esp32Status = {
  mode: "AUTO",
  sensor: "NORMAL",
  relay: "OFF",
  fanOn: false,
  smokeValue: 0,
  gasValue: 0,
  threshold: 1800,
  connected: false,
  wifiName: undefined,
  ip: undefined,
};

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
  const runningHistoryTypeRef = useRef<AlertType | null>(null);
  const smokePeakRef = useRef<number>(0);
  const idCounterRef = useRef(0);

  function makeUniqueId(prefix = "h") {
    idCounterRef.current += 1;
    return `${prefix}-${Date.now()}-${idCounterRef.current}`;
  }

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

  function updateHistoryItem(id: string | null, patch: Partial<AlertItem>) {
    if (!id) return;

    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function endRunningState() {
    runningHistoryIdRef.current = null;
    runningHistoryStartRef.current = null;
    runningHistoryTypeRef.current = null;
  }

  function beginRunningState(
    type: AlertType,
    title: string,
    severity: AlertSeverity,
    extras?: Partial<AlertItem>
  ) {
    const id = makeUniqueId("h");

    runningHistoryIdRef.current = id;
    runningHistoryStartRef.current = Date.now();
    runningHistoryTypeRef.current = type;

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

  function restartRunningState(
    type: AlertType,
    title: string,
    severity: AlertSeverity,
    extras?: Partial<AlertItem>
  ) {
    endRunningState();
    beginRunningState(type, title, severity, extras);
  }

  function addInstantHistory(
    type: AlertType,
    title: string,
    severity: AlertSeverity,
    extras?: Partial<AlertItem>
  ) {
    prependHistory({
      id: makeUniqueId("h"),
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
    endRunningState();
    smokePeakRef.current = 0;
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

  async function notifyHighGas(message: string) {
    if (!pushAlerts && !audibleAlarm) return;
    await triggerGasAlert(message);
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

  async function processInitialStatus(status: Esp32Status) {
    if (!status.connected) {
      setActiveAlert({
        id: makeUniqueId("active-disconnect"),
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
      smokePeakRef.current = status.smokeValue ?? 0;

      setActiveAlert({
        id: makeUniqueId("active-smoke"),
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
        peak: `${smokePeakRef.current > 0 ? smokePeakRef.current : status.gasValue ?? "Detected"}`,
      });

      await notifyHighGas(
        status.mode === "AUTO" && status.fanOn
          ? "Smoke detected. Fan activated automatically."
          : "Smoke or gas detected."
      );

      if (status.mode === "AUTO" && status.fanOn) {
        addInstantHistory("AUTO_FAN_ON", "Automatic Fan Activation", "info");
      }
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

    beginRunningState("SYSTEM_NORMAL", "System Returned to Normal", "info");
  }

  async function processStatus(status: Esp32Status) {
    const previous = previousStatusRef.current;

    if (!previous) {
      previousStatusRef.current = status;
      await processInitialStatus(status);
      return;
    }

    if (previous.connected && !status.connected) {
      setActiveAlert({
        id: makeUniqueId("active-disconnect"),
        type: "SYSTEM_OFFLINE",
        title: "ACTIVE ALERT: DEVICE DISCONNECTED",
        message: "ESP32 is unreachable. Live monitoring is temporarily unavailable.",
        timestamp: "Just now",
        severity: "warning",
      });

      restartRunningState("SYSTEM_OFFLINE", "Device Disconnected", "warning");
      previousStatusRef.current = status;
      return;
    }

    if (!previous.connected && status.connected) {
      if (activeAlert?.type === "SYSTEM_OFFLINE") {
        setActiveAlert(null);
      }

      restartRunningState("SYSTEM_NORMAL", "Device Reconnected", "info");
      previousStatusRef.current = status;
      return;
    }

    if (previous.sensor !== "DETECTED" && status.sensor === "DETECTED") {
      smokePeakRef.current = status.smokeValue ?? 0;

      setActiveAlert({
        id: makeUniqueId("active-smoke"),
        type: "HIGH_SMOKE",
        title: "ACTIVE ALERT: HIGH SMOKE",
        message:
          status.mode === "AUTO" && status.fanOn
            ? "Smoke/gas exceeded safe threshold. Fan has been automatically activated."
            : "Smoke/gas detected.",
        timestamp: "Just now",
        severity: "danger",
      });

      restartRunningState("HIGH_SMOKE", "High Smoke Detected", "danger", {
        peak: `${smokePeakRef.current > 0 ? smokePeakRef.current : status.gasValue ?? "Detected"}`,
      });

      await notifyHighGas(
        status.mode === "AUTO" && status.fanOn
          ? "Smoke detected. Fan activated automatically."
          : "Smoke or gas detected."
      );
    }

    if (status.sensor === "DETECTED" && runningHistoryTypeRef.current === "HIGH_SMOKE") {
      smokePeakRef.current = Math.max(smokePeakRef.current, status.smokeValue ?? 0);

      updateHistoryItem(runningHistoryIdRef.current, {
        peak: `${smokePeakRef.current > 0 ? smokePeakRef.current : status.gasValue ?? "Detected"}`,
      });

      if (activeAlert?.type === "HIGH_SMOKE" && status.mode === "AUTO" && status.fanOn) {
        setActiveAlert({
          ...activeAlert,
          message: "Smoke/gas exceeded safe threshold. Fan has been automatically activated.",
        });
      }

      if ((status.smokeValue ?? 0) >= 100) {
        await notifyHighGas("Danger! Gas level is very high.");
      }
    }

    if (previous.sensor === "DETECTED" && status.sensor !== "DETECTED") {
      smokePeakRef.current = 0;

      if (activeAlert?.type === "HIGH_SMOKE") {
        setActiveAlert(null);
      }

      restartRunningState("SYSTEM_NORMAL", "System Returned to Normal", "info");
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
      restartRunningState("INFO", "Manual Fan Turned On", "info");
    }

    if (
      previous.fanOn === true &&
      status.fanOn === false &&
      previous.mode === "MANUAL"
    ) {
      restartRunningState("INFO", "Manual Fan Turned Off", "info");
    }

    if (
      previous.mode !== status.mode &&
      status.mode === "AUTO" &&
      status.sensor === "NORMAL" &&
      !status.fanOn &&
      status.connected
    ) {
      restartRunningState("SYSTEM_NORMAL", "System Returned to Normal", "info");
    }

    previousStatusRef.current = status;
  }

  async function pollStatus() {
    try {
      const status = await getEsp32Status();
      await processStatus(status);
    } catch {
      await processStatus(OFFLINE_STATUS);
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