import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/sg/common/Screen";
import StatusPill from "@/components/sg/dashboard/StatusPill";
import GaugeRing from "@/components/sg/dashboard/GaugeRing";
import MetricTile from "@/components/sg/dashboard/MetricTile";
import StatusRow from "@/components/sg/dashboard/StatusRow";

import { getAirState } from "@/utils/airQuality";
import { Esp32Status, SystemStatus } from "@/types/dashboard";
import {
  getEsp32Status,
  sendFanToEsp32,
  sendModeToEsp32,
} from "@/services/esp32";
import {
  formatDurationFromMs,
  getDateLabel,
  getFilterLifePercent,
  getSmokeLevelFromAqi,
  getTimeLabel,
  saveFanEvent,
  saveSmokeReading,
} from "@/services/history";
import { startGasAlert, stopGasAlert } from "@/utils/notifications";

const POLL_MS = 2000;
const MAX_FILTER_HOURS = 100;

const FALLBACK_STATUS: Esp32Status = {
  mode: "AUTO",
  sensor: "NORMAL",
  relay: "OFF",
  fanOn: false,
  smokeValue: 0,
  connected: false,
  wifiName: undefined,
  ip: undefined,
  gasValue: 0,
  threshold: 1800,
};

export default function Dashboard() {
  const [status, setStatus] = useState<Esp32Status>(FALLBACK_STATUS);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [filterLife, setFilterLife] = useState("100%");

  const previousStatusRef = useRef<Esp32Status | null>(null);
  const fanStartTimeRef = useRef<number | null>(null);
  const lastSavedSmokeKeyRef = useRef<string | null>(null);

  const smokeValue = status.smokeValue ?? 0;

  const systemStatus: SystemStatus = {
    powerSupply: status.connected ? "OK" : "ISSUE",
    smokeSensor: status.connected ? "OK" : "ISSUE",
    esp32: {
      connected: status.connected,
      wifiName: status.wifiName,
      ip: status.ip,
    },
  };

  const air = useMemo(() => getAirState(smokeValue), [smokeValue]);

  async function loadFilterLife() {
    try {
      const remainingPercent = await getFilterLifePercent(MAX_FILTER_HOURS);
      setFilterLife(`${remainingPercent}%`);
    } catch (error) {
      console.error("Failed to load filter life:", error);
      setFilterLife("N/A");
    }
  }

  async function saveDashboardHistory(next: Esp32Status) {
    if (!next.connected) return;

    const smokeKey = `${next.smokeValue}-${getTimeLabel()}-${getDateLabel()}`;

    if (
      typeof next.smokeValue === "number" &&
      lastSavedSmokeKeyRef.current !== smokeKey
    ) {
      lastSavedSmokeKeyRef.current = smokeKey;

      await saveSmokeReading({
        id: `sr-${Date.now()}`,
        level: getSmokeLevelFromAqi(next.smokeValue),
        aqi: next.smokeValue,
        time: getTimeLabel(),
        date: getDateLabel(),
      });
    }

    const previous = previousStatusRef.current;

    if (!previous) {
      previousStatusRef.current = next;

      if (next.fanOn) {
        fanStartTimeRef.current = Date.now();

        await saveFanEvent({
          id: `fe-${Date.now()}`,
          type: next.mode === "AUTO" ? "AUTO_TRIGGER" : "MANUAL_START",
          title: next.mode === "AUTO" ? "Auto Trigger" : "Manual Start",
          subtitle:
            next.mode === "AUTO"
              ? `Smoke detected: ${next.smokeValue ?? 0} AQI`
              : "User initiated via app",
          time: getTimeLabel(),
          date: getDateLabel(),
          duration: "--",
          durationMs: 0,
        });
      }

      return;
    }

    if (!previous.fanOn && next.fanOn) {
      fanStartTimeRef.current = Date.now();

      await saveFanEvent({
        id: `fe-${Date.now()}`,
        type: next.mode === "AUTO" ? "AUTO_TRIGGER" : "MANUAL_START",
        title: next.mode === "AUTO" ? "Auto Trigger" : "Manual Start",
        subtitle:
          next.mode === "AUTO"
            ? `Smoke detected: ${next.smokeValue ?? 0} AQI`
            : "User initiated via app",
        time: getTimeLabel(),
        date: getDateLabel(),
        duration: "--",
        durationMs: 0,
      });
    }

    if (previous.fanOn && !next.fanOn) {
      const durationMs = fanStartTimeRef.current
        ? Date.now() - fanStartTimeRef.current
        : 0;

      const wasAuto = previous.mode === "AUTO";

      await saveFanEvent({
        id: `fe-${Date.now()}`,
        type: wasAuto ? "AUTO_STOP" : "MANUAL_STOP",
        title: wasAuto ? "Auto Stop" : "Manual Stop",
        subtitle: wasAuto ? "Fan stopped automatically" : "User turned fan off",
        time: getTimeLabel(),
        date: getDateLabel(),
        duration: formatDurationFromMs(durationMs),
        durationMs,
      });

      fanStartTimeRef.current = null;
      await loadFilterLife();
    }

    previousStatusRef.current = next;
  }

  async function loadStatus(showLoader = false) {
    if (showLoader) setRefreshing(true);

    try {
      const data = await getEsp32Status();
      setStatus(data);
      await saveDashboardHistory(data);

      const threshold = data.threshold ?? 1800;
      const isDanger =
        data.connected &&
        (data.sensor === "DETECTED" || (data.smokeValue ?? 0) > threshold);

      if (isDanger) {
        await startGasAlert(
          `Smoke or gas detected. Current value: ${data.smokeValue ?? 0}`
        );
      } else {
        stopGasAlert();
      }
    } catch {
      setStatus((prev) => ({
        ...prev,
        connected: false,
      }));

      stopGasAlert();
    } finally {
      if (showLoader) setRefreshing(false);
    }
  }

  useEffect(() => {
    loadFilterLife();
    loadStatus(true);

    const timer = setInterval(() => {
      loadStatus(false);
    }, POLL_MS);

    return () => {
      clearInterval(timer);
      stopGasAlert();
    };
  }, []);

  async function toggleMode() {
    const next = status.mode === "AUTO" ? "MANUAL" : "AUTO";

    setBusy(true);
    try {
      await sendModeToEsp32(next);
      await loadStatus();
    }  catch (error) {
  console.log("Mode change error:", error);
  Alert.alert("Mode change failed", String(error));
} finally {
      setBusy(false);
    }
  }

  async function toggleFan() {
    if (status.mode !== "MANUAL") {
      Alert.alert("Auto Mode", "Switch to MANUAL to control the fan.");
      return;
    }

    const next = !status.fanOn;

    setBusy(true);
    try {
      await sendFanToEsp32(next);
      await loadStatus();
    } catch {
      Alert.alert(
        "Fan control failed",
        "Couldn’t update fan state. Check Wi-Fi connection."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Text className="text-lg font-semibold text-gray-500">Kitchen Safety</Text>
      <Text className="mt-2 text-5xl font-extrabold text-gray-900">
        Dashboard
      </Text>

      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View />
          <StatusPill
            label={air.pillText}
            bg={air.pillBg}
            textColor={air.pillTextColor}
            dotColor={air.ringColor}
          />
        </View>

        <View className="mb-4 mt-2 items-center">
          <GaugeRing value={smokeValue} max={120} strokeColor={air.ringColor} />

          <Text className="mt-5 text-base font-medium text-gray-500">
            Air quality is{" "}
            <Text className="font-extrabold" style={{ color: air.ringColor }}>
              {air.qualityLabel}
            </Text>
          </Text>

          <Text className="mt-1 text-sm font-medium text-gray-400 italic">
            {refreshing
              ? "Connecting..."
              : status.connected
                ? "Updated live"
                : "ESP32 disconnected"}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2.5">
        <MetricTile
          title="FAN STATUS"
          value={status.fanOn ? "ON" : "OFF"}
          disabled={busy || !status.connected}
          onPress={toggleFan}
          icon={
            <MaterialCommunityIcons
              name="fan"
              size={24}
              color={status.fanOn ? "#22C55E" : "#9CA3AF"}
            />
          }
        />

        <MetricTile
          title="ACTIVE MODE"
          value={status.mode}
          disabled={busy || !status.connected}
          onPress={toggleMode}
          icon={<Ionicons name="sync-outline" size={24} color="#22C55E" />}
        />

        <MetricTile
          title="FILTER LIFE"
          value={filterLife}
          icon={<Ionicons name="funnel-outline" size={24} color="#22C55E" />}
        />
      </View>

      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Text className="mb-2 text-base font-extrabold tracking-wider text-gray-500">
          SYSTEM STATUS
        </Text>

        <StatusRow
          title="Power Supply"
          icon={
            <Ionicons
              name="power"
              size={18}
              color={systemStatus.powerSupply === "OK" ? "#22C55E" : "#EF4444"}
            />
          }
        />

        <StatusRow
          title="Smoke / Gas Sensor"
          icon={
            <Ionicons
              name="radio"
              size={18}
              color={systemStatus.smokeSensor === "OK" ? "#22C55E" : "#EF4444"}
            />
          }
          rightTop={status.sensor}
          rightTopColor={
            status.sensor === "DETECTED" ? "text-red-600" : "text-emerald-600"
          }
        />

        <StatusRow
          title="ESP32 Connectivity"
          icon={
            <Ionicons
              name="wifi"
              size={18}
              color={systemStatus.esp32.connected ? "#22C55E" : "#EF4444"}
            />
          }
          rightTop={
            systemStatus.esp32.connected ? "CONNECTED" : "DISCONNECTED"
          }
          rightTopColor={
            systemStatus.esp32.connected ? "text-emerald-600" : "text-red-600"
          }
          rightBottom={
            systemStatus.esp32.wifiName
              ? `WiFi: ${systemStatus.esp32.wifiName}`
              : systemStatus.esp32.ip
                ? `IP: ${systemStatus.esp32.ip}`
                : undefined
          }
        />
      </View>
    </Screen>
  );
}