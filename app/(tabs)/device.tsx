import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type ConnectionInfo = {
  wifiName: string;
  wifiBand: string; // e.g. "WiFi (2.4Ghz)"
  signalLabel: string; // e.g. "Strong Signal"
  ip: string; // e.g. "192.168.1.42"
  connected: boolean;
};

type SystemHealth = {
  powerStatus: string; // e.g. "Mains Powered"
  sensorCalibration: string; // e.g. "Optimal"
  internalTemp: string; // e.g. "38°C"
};

export default function DeviceScreen() {
  const tabBarHeight = useBottomTabBarHeight();

  // --- Mock state (later: replace with Wi-Fi/BLE live data) ---
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

  // threshold in ug/m³
  const [threshold, setThreshold] = useState(45);

  // helpful derived label (optional)
  const sensitivityLabel = useMemo(() => {
    if (threshold <= 30) return "VERY SENSITIVE";
    if (threshold <= 60) return "STANDARD";
    return "LESS SENSITIVE";
  }, [threshold]);

  function reconnectDevice() {
    // later: call your Wi-Fi reconnect endpoint
    // for now: just simulate
    setConnection((c) => ({ ...c, connected: true }));
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: tabBarHeight + 16,
        }}
      >
        {/* Title */}
        <Text className="text-center text-4xl font-extrabold text-gray-900">
          Device Settings
        </Text>

        {/* Connection Card */}
        <View className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Ionicons name="wifi" size={24} color="#2563EB" />
              </View>

              <View>
                <Text className="text-lg font-extrabold text-gray-900">
                  Connection
                </Text>

                <Text className="mt-1 text-[12px] font-medium text-gray-500">
                  {connection.wifiBand}
                </Text>

                <View className="mt-2 flex-row items-center gap-2">
                  <Ionicons name="cellular" size={14} color="#6B7280" />
                  <Text className="text-[12px] font-semibold text-gray-600">
                    {connection.signalLabel}
                  </Text>
                </View>
              </View>
            </View>

            <View className="items-end">
              <View
                className={`rounded-full px-3 py-1 ${
                  connection.connected ? "bg-emerald-100" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-extrabold ${
                    connection.connected ? "text-emerald-700" : "text-gray-700"
                  }`}
                >
                  {connection.connected ? "Connected" : "Disconnected"}
                </Text>
              </View>

              <Text className="mt-3 text-[12px] font-semibold text-gray-400">
                {connection.ip}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={reconnectDevice}
            className="mt-4 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-3"
          >
            <Text className="text-[13px] font-extrabold text-blue-700">
              Reconnect Device
            </Text>
          </Pressable>
        </View>

        {/* Bluetooth Card */}
        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Ionicons name="bluetooth" size={24} color="#2563EB" />
              </View>

              <View>
                <Text className="text-lg font-extrabold text-gray-900">
                  Bluetooth
                </Text>
                <Text className="mt-1 text-[12px] font-medium text-gray-500">
                  Connected to {bluetoothDeviceName}
                </Text>
              </View>
            </View>

            <Switch value={bluetoothOn} onValueChange={setBluetoothOn} />
          </View>
        </View>

        {/* System Health Card */}
        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <Text className="mb-4 text-base font-extrabold tracking-wider text-gray-500">
            SYSTEM HEALTH
          </Text>

          <View className="gap-3 px-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="power" size={18} color="#22C55E" />
                <Text className="text-lg font-bold text-gray-900">
                  Power Status
                </Text>
              </View>
              <Text className="text-[12px] font-semibold text-gray-500">
                {health.powerStatus}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Ionicons name="radio" size={18} color="#22C55E" />
                <Text className="text-lg font-bold text-gray-900">
                  Sensor Calibration
                </Text>
              </View>
              <Text className="text-[12px] font-semibold text-gray-500">
                {health.sensorCalibration}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons
                  name="thermometer"
                  size={18}
                  color="#22C55E"
                />
                <Text className="text-lg font-bold text-gray-900">
                  Internal Temperature
                </Text>
              </View>
              <Text className="text-[12px] font-semibold text-gray-500">
                {health.internalTemp}
              </Text>
            </View>
          </View>
        </View>

        {/* Threshold Settings Card */}
        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="pb-3">
              <Text className="text-base font-extrabold tracking-wider text-gray-500">
                THRESHOLD SETTINGS
              </Text>
              <Text className="mt-1 text-sm font-medium text-gray-500">
                Sensitivity for auto-fan trigger
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[22px] font-extrabold text-blue-600">
                {threshold}
              </Text>
              <Text className="text-[11px] font-semibold text-gray-500">
                ug/m³
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <Slider
              value={threshold}
              onValueChange={(v) => setThreshold(Math.round(v))}
              minimumValue={10}
              maximumValue={100}
              step={1}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#2563EB"
            />

            <View className="my-2 flex-row items-center justify-between">
              <Text className="text-[10px] font-extrabold text-gray-400">
                VERY SENSITIVE
              </Text>
              <Text className="text-[10px] font-extrabold text-gray-500">
                STANDARD
              </Text>
              <Text className="text-[10px] font-extrabold text-gray-400">
                LESS SENSITIVE
              </Text>
            </View>

            {/* Optional: small live label (you can remove if you don’t want it) */}
            <Text className="mt-2 text-center text-base font-extrabold text-blue-700">
              {sensitivityLabel}
            </Text>

            <View className="mt-4 rounded-2xl bg-blue-50 p-4">
              <View className="flex-row items-start gap-3">
                <Ionicons name="information-circle" size={18} color="#2563EB" />
                <Text className="flex-1 text-[12px] font-medium text-gray-600">
                  Lower thresholds trigger the fan faster when smoke is detected,
                  but may cause false alerts.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
