import React, { useState } from "react";
import { Text } from "react-native";

import Screen from "../../components/sg/common/Screen";

import ConnectionCard from "../../components/sg/device/ConnectionCard";
import BluetoothCard from "../../components/sg/device/BluetoothCard";
import SystemHealthCard from "../../components/sg/device/SystemHealthCard";
import ThresholdCard from "../../components/sg/device/ThresholdCard";

import { ConnectionInfo, SystemHealth } from "../../types/device";

export default function DeviceScreen() {
  const [connection, setConnection] = useState<ConnectionInfo>({
    wifiName: "C_24Ghz",
    wifiBand: "WiFi (2.4Ghz)",
    signalLabel: "Strong Signal",
    ip: "192.168.1.42",
    connected: true,
  });

  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [bluetoothDeviceName] = useState("SG-Pro-01");

  const [health] = useState<SystemHealth>({
    powerStatus: "Mains Powered",
    sensorCalibration: "Optimal",
    internalTemp: "38°C",
  });

  const [threshold, setThreshold] = useState(45);

  function reconnectDevice() {
    setConnection((c) => ({ ...c, connected: true }));
  }

  return (
    <Screen>
      <Text className="text-center text-4xl font-extrabold text-gray-900">
        Device Settings
      </Text>

      <ConnectionCard connection={connection} onReconnect={reconnectDevice} />

      <BluetoothCard
        bluetoothOn={bluetoothOn}
        onToggle={setBluetoothOn}
        deviceName={bluetoothDeviceName}
      />

      <SystemHealthCard health={health} />

      <ThresholdCard threshold={threshold} onChange={setThreshold} />
    </Screen>
  );
}
