import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "@/components/sg/common/Screen";
import StatusPill from "@/components/sg/dashboard/StatusPill";
import GaugeRing from "@/components/sg/dashboard/GaugeRing";
import MetricTile from "@/components/sg/dashboard/MetricTile";
import StatusRow from "@/components/sg/dashboard/StatusRow";

import { getAirState } from "@/utils/airQuality";
import { Mode, SystemStatus } from "@/types/dashboard";
import { sendFanToEsp32, sendModeToEsp32 } from "@/services/esp32";

export default function Dashboard() {
  // Mock for now. Later: replace smokeValue with Wi-Fi live data.
  const [smokeValue, setSmokeValue] = useState(12);

  const [mode, setMode] = useState<Mode>("AUTO");
  const [fanOnManual, setFanOnManual] = useState(false);
  const [busy, setBusy] = useState(false);

  // Mock system status (later: from ESP32 /status)
  const [systemStatus] = useState<SystemStatus>({
    powerSupply: "OK",
    smokeSensor: "OK",
    esp32: { connected: true, wifiName: "SG-Network-A" },
  });

  const air = useMemo(() => getAirState(smokeValue), [smokeValue]);

  // In AUTO: fan is driven by smoke threshold logic (placeholder).
  // In MANUAL: use user's fan toggle.
  const fanOn = mode === "AUTO" ? smokeValue > 60 : fanOnManual;

  async function toggleMode() {
    const next: Mode = mode === "AUTO" ? "MANUAL" : "AUTO";

    setBusy(true);
    try {
      await sendModeToEsp32(next);
      setMode(next);
    } catch {
      Alert.alert("Mode change failed", "Couldn’t change mode. Check Wi-Fi connection.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFan() {
    if (mode !== "MANUAL") {
      Alert.alert("Auto Mode", "Switch to MANUAL to control the fan.");
      return;
    }

    const next = !fanOnManual;

    setBusy(true);
    try {
      await sendFanToEsp32(next);
      setFanOnManual(next);
    } catch {
      Alert.alert("Fan control failed", "Couldn’t update fan state. Check Wi-Fi connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Text className="text-lg font-semibold text-gray-500">Kitchen Safety</Text>
      <Text className="mt-2 text-5xl font-extrabold text-gray-900">Dashboard</Text>

      {/* Air Quality Card */}
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

        <View className="mt-2 mb-4 items-center">
          <GaugeRing value={smokeValue} max={120} strokeColor={air.ringColor} />

          <Text className="mt-5 text-base font-medium text-gray-500">
            Air quality is{" "}
            <Text className="font-extrabold" style={{ color: air.ringColor }}>
              {air.qualityLabel}
            </Text>
          </Text>

          <Text className="mt-1 text-sm font-medium text-gray-400 italic">
            Updated just now
          </Text>
        </View>
      </View>

      {/* Tiles Row */}
      <View className="mt-4 flex-row gap-2.5">
        <MetricTile
          title="FAN STATUS"
          value={fanOn ? "ON" : "OFF"}
          disabled={busy}
          onPress={toggleFan}
          icon={
            <MaterialCommunityIcons name="fan" size={24} color={fanOn ? "#22C55E" : "#9CA3AF"} />
          }
        />

        <MetricTile
          title="ACTIVE MODE"
          value={mode}
          disabled={busy}
          onPress={toggleMode}
          icon={<Ionicons name="sync-outline" size={24} color="#22C55E" />}
        />

        <MetricTile
          title="FILTER LIFE"
          value="84%"
          icon={<Ionicons name="funnel-outline" size={24} color="#22C55E" />}
        />
      </View>

      {/* System Status */}
      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Text className="mb-2 text-base font-extrabold tracking-wider text-gray-500">
          SYSTEM STATUS
        </Text>

        <StatusRow
          title="Power Supply"
          icon={
            <Ionicons name="power" size={18} color={systemStatus.powerSupply === "OK" ? "#22C55E" : "#EF4444"} />
          }
        />

        <StatusRow
          title="Smoke Sensor"
          icon={
            <Ionicons name="radio" size={18} color={systemStatus.smokeSensor === "OK" ? "#22C55E" : "#EF4444"} />
          }
        />

        <StatusRow
          title="ESP32 Connectivity"
          icon={
            <Ionicons name="wifi" size={18} color={systemStatus.esp32.connected ? "#22C55E" : "#EF4444"} />
          }
          rightTop={systemStatus.esp32.connected ? "CONNECTED" : "DISCONNECTED"}
          rightTopColor={systemStatus.esp32.connected ? "text-emerald-600" : "text-red-600"}
          rightBottom={
            systemStatus.esp32.wifiName ? `WiFi: ${systemStatus.esp32.wifiName}` : undefined
          }
        />
      </View>

      {/* Temporary test buttons */}
      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => setSmokeValue((v) => Math.max(0, v - 20))}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2"
        >
          <Text className="font-semibold text-gray-700">- Smoke</Text>
        </Pressable>

        <Pressable
          onPress={() => setSmokeValue((v) => Math.min(220, v + 20))}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2"
        >
          <Text className="font-semibold text-gray-700">+ Smoke</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
