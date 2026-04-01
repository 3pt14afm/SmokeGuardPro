import React, { useEffect, useState } from "react";
import { Alert, Text } from "react-native";

import Screen from "../../components/sg/common/Screen";

import ConnectionCard from "../../components/sg/device/ConnectionCard";
import BluetoothCard from "../../components/sg/device/BluetoothCard";
import SystemHealthCard from "../../components/sg/device/SystemHealthCard";
import ThresholdCard from "../../components/sg/device/ThresholdCard";

import { ConnectionInfo, SystemHealth } from "../../types/device";
import { getEsp32Status, sendThresholdToEsp32 } from "@/services/esp32";
import { mapRawThresholdToUi, mapUiThresholdToRaw } from "@/utils/device";

const POLL_MS = 3000;

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
  const [connection, setConnection] = useState<ConnectionInfo>(DISCONNECTED_CONNECTION);
  const [bluetoothOn, setBluetoothOn] = useState(false);
  const [bluetoothDeviceName] = useState("SG-Pro-01");

  const [health, setHealth] = useState<SystemHealth>({
    powerStatus: "Checking...",
    sensorCalibration: "Checking...",
    internalTemp: "--",
  });

  const [threshold, setThreshold] = useState(45);

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
        sensorCalibration: status.sensor === "DETECTED" ? "Triggered" : "Normal",
        internalTemp: "--",
      });

      setThreshold(mapRawThresholdToUi(status.threshold ?? 1800));
    } catch {
      setConnection(DISCONNECTED_CONNECTION);
      setHealth(DISCONNECTED_HEALTH);
    }
  }

  useEffect(() => {
    loadStatus();

    const timer = setInterval(() => {
      loadStatus();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, []);

  function reconnectDevice() {
    loadStatus();
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

  return (
    <Screen>
      <Text className="text-center text-4xl font-extrabold text-gray-900">
        Device Settings
      </Text>

      <ConnectionCard connection={connection} onReconnect={reconnectDevice} />

      {/* <BluetoothCard
        bluetoothOn={bluetoothOn}
        onToggle={setBluetoothOn}
        deviceName={bluetoothDeviceName}
      /> */}

      <SystemHealthCard health={health} />

      <ThresholdCard threshold={threshold} onChange={handleThresholdChange} />
    </Screen>
  );
}