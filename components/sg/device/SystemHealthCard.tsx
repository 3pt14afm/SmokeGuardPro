import React from "react";
import { Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SystemHealth } from "../../../types/device";

export default function SystemHealthCard({ health }: { health: SystemHealth }) {
  return (
    <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <Text className="mb-4 text-base font-extrabold tracking-wider text-gray-500">
        SYSTEM HEALTH
      </Text>

      <View className="gap-3 px-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Ionicons name="power" size={18} color="#22C55E" />
            <Text className="text-lg font-bold text-gray-900">Power Status</Text>
          </View>
          <Text className="text-[12px] font-semibold text-gray-500">
            {health.powerStatus}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Ionicons name="radio" size={18} color="#22C55E" />
            <Text className="text-lg font-bold text-gray-900">Sensor Calibration</Text>
          </View>
          <Text className="text-[12px] font-semibold text-gray-500">
            {health.sensorCalibration}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="thermometer" size={18} color="#22C55E" />
            <Text className="text-lg font-bold text-gray-900">Internal Temperature</Text>
          </View>
          <Text className="text-[12px] font-semibold text-gray-500">
            {health.internalTemp}
          </Text>
        </View>
      </View>
    </View>
  );
}
