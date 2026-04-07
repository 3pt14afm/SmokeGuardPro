import React, { useEffect, useState } from "react";
import { Alert, Text, Pressable, TextInput, View } from "react-native";

import Screen from "../../components/sg/common/Screen";

import ConnectionCard from "../../components/sg/device/ConnectionCard";
import SystemHealthCard from "../../components/sg/device/SystemHealthCard";
import ThresholdCard from "../../components/sg/device/ThresholdCard";

import { ConnectionInfo, SystemHealth } from "../../types/device";
import { getEsp32Status, sendThresholdToEsp32 } from "@/services/esp32";
import { mapRawThresholdToUi, mapUiThresholdToRaw } from "@/utils/device";
import {
  clearSavedHistory,
  getFilterLifePercent,
  resetFilterLife,
} from "@/services/history";
import {
  getEsp32Ip,
  isValidIpv4,
  setEsp32Ip,
} from "@/services/deviceConfig";

const POLL_MS = 3000;
const MAX_FILTER_HOURS = 100;

const DISCONNECTED_CONNECTION: ConnectionInfo = {
  wifiName: "Not connected",
  wifiBand: "WiFi",
  signalLabel: "Unavailable",
  ip: "-",
  connected: false,
};

const DISCONNECTED_HEALTH: SystemHealth = {
  powerStatus: "Disconnected",
  sensorCalibration: "Unavailable",
  internalTemp: "--",
};

export default function DeviceScreen() {
  const [connection, setConnection] =
    useState<ConnectionInfo>(DISCONNECTED_CONNECTION);

  const [health, setHealth] = useState<SystemHealth>({
    powerStatus: "Checking...",
    sensorCalibration: "Checking...",
    internalTemp: "--",
  });

  const [threshold, setThreshold] = useState(45);
  const [filterLife, setFilterLife] = useState("100%");

  const [esp32Ip, setEsp32IpState] = useState("");
  const [savingIp, setSavingIp] = useState(false);

  async function loadSavedIp() {
    try {
      const savedIp = await getEsp32Ip();
      setEsp32IpState(savedIp);
    } catch {
      setEsp32IpState("");
    }
  }

  async function loadStatus() {
    try {
      const status = await getEsp32Status();

      setConnection({
        wifiName: status.wifiName ?? "ESP32 Network",
        wifiBand: "WiFi (2.4Ghz)",
        signalLabel: status.connected ? "Connected" : "Unavailable",
        ip: status.ip ?? "-",
        connected: status.connected,
      });

      setHealth({
        powerStatus: status.connected ? "Mains Powered" : "Disconnected",
        sensorCalibration:
          status.sensor === "DETECTED" ? "Triggered" : "Normal",
        internalTemp: "--",
      });

      setThreshold(mapRawThresholdToUi(status.threshold ?? 1800));
    } catch {
      setConnection(DISCONNECTED_CONNECTION);
      setHealth(DISCONNECTED_HEALTH);
    }
  }

  async function loadFilterLife() {
    try {
      const remainingPercent = await getFilterLifePercent(MAX_FILTER_HOURS);
      setFilterLife(`${remainingPercent.toFixed(2)}%`);
    } catch {
      setFilterLife("N/A");
    }
  }

  useEffect(() => {
    loadSavedIp();
    loadStatus();
    loadFilterLife();

    const timer = setInterval(() => {
      loadStatus();
      loadFilterLife();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, []);

  async function handleSaveEsp32Ip() {
    const trimmed = esp32Ip.trim();

    if (!isValidIpv4(trimmed)) {
      Alert.alert(
        "Invalid IP",
        "Please enter a valid IPv4 address like 192.168.1.120"
      );
      return;
    }

    setSavingIp(true);

    try {
      const savedIp = await setEsp32Ip(trimmed);
      setEsp32IpState(savedIp);
      await loadStatus();

      Alert.alert(
        "ESP32 IP Saved",
        `The app will now use http://${savedIp}`
      );
    } catch {
      Alert.alert("Save failed", "Could not save ESP32 IP.");
    } finally {
      setSavingIp(false);
    }
  }

  async function handleThresholdChange(value: number) {
    const safeUiValue = Math.max(1, Math.min(120, Math.round(value)));
    const rawThreshold = mapUiThresholdToRaw(safeUiValue);

    setThreshold(safeUiValue);

    try {
      await sendThresholdToEsp32(rawThreshold);
      await loadStatus();
    } catch {
      Alert.alert(
        "Threshold update failed",
        "Couldn’t update threshold. Check local Wi-Fi connection."
      );
    }
  }

  async function handleResetFilter() {
    try {
      await resetFilterLife();
      await loadFilterLife();
      Alert.alert("Filter Reset", "Filter life has been reset to 100%.");
    } catch {
      Alert.alert("Reset failed", "Couldn’t reset filter life.");
    }
  }

  async function handleClearHistory() {
    try {
      await clearSavedHistory();
      await loadFilterLife();
      Alert.alert(
        "History Cleared",
        "All saved fan events and smoke readings were removed."
      );
    } catch {
      Alert.alert("Error", "Failed to clear saved history.");
    }
  }

  return (
    <Screen>
      <Text className="text-center text-4xl font-extrabold text-gray-900">
        Device Settings
      </Text>

      <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <Text className="mb-3 text-base font-extrabold tracking-wider text-gray-500">
          ESP32 CONNECTION
        </Text>

        <Text className="mb-2 text-sm font-semibold text-gray-700">
          ESP32 Local IP Address
        </Text>

        <TextInput
          value={esp32Ip}
          onChangeText={setEsp32IpState}
          placeholder="192.168.1.120"
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
          className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900"
        />

        <Text className="mt-2 text-xs text-gray-500">
          Current base URL: {esp32Ip ? `http://${esp32Ip}` : "Not set"}
        </Text>

        <Text className="mt-1 text-xs text-gray-500">
          Make sure your phone and ESP32 are on the same Wi-Fi network.
        </Text>

        <Pressable
          onPress={handleSaveEsp32Ip}
          disabled={savingIp}
          className="mt-4 rounded-xl bg-emerald-500 px-4 py-3"
        >
          <Text className="text-center text-sm font-bold text-white">
            {savingIp ? "Saving..." : "Save ESP32 IP"}
          </Text>
        </Pressable>
      </View>

      <ConnectionCard connection={connection} onReconnect={loadStatus} />

      <SystemHealthCard
        health={health}
        filterLife={filterLife}
        onResetFilter={handleResetFilter}
      />

      <ThresholdCard threshold={threshold} onChange={handleThresholdChange} />

      <Pressable
        onPress={handleClearHistory}
        className="mt-4 rounded-2xl bg-red-500 px-4 py-4"
      >
        <Text className="text-center text-sm font-bold text-white">
          Clear History
        </Text>
      </Pressable>
    </Screen>
  );
}