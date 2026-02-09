import React from "react";
import { Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BluetoothCard({
  bluetoothOn,
  onToggle,
  deviceName,
}: {
  bluetoothOn: boolean;
  onToggle: (v: boolean) => void;
  deviceName: string;
}) {
  return (
    <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="bluetooth" size={24} color="#2563EB" />
          </View>

          <View>
            <Text className="text-lg font-extrabold text-gray-900">Bluetooth</Text>
            <Text className="mt-1 text-[12px] font-medium text-gray-500">
              Connected to {deviceName}
            </Text>
          </View>
        </View>

        <Switch value={bluetoothOn} onValueChange={onToggle} />
      </View>
    </View>
  );
}
