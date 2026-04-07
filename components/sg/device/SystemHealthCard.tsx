import React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SystemHealth } from "../../../types/device";

type Props = {
  health: SystemHealth;
  filterLife: string;
  onResetFilter: () => void;
};

export default function SystemHealthCard({
  health,
  filterLife,
  onResetFilter,
}: Props) {
  function handleResetFilter() {
    Alert.alert(
      "Replace Filter",
      "Are you sure you changed the filter? This will reset filter life to 100%.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: onResetFilter,
        },
      ]
    );
  }

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
            <Ionicons name="funnel-outline" size={18} color="#22C55E" />
            <Text className="text-lg font-bold text-gray-900">Filter Life</Text>
          </View>
          <Text className="text-[12px] font-semibold text-emerald-600">
            {filterLife}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Ionicons name="construct-outline" size={18} color="#22C55E" />
            <Text className="text-lg font-bold text-gray-900">Filter Replacement</Text>
          </View>

          <Pressable
            onPress={handleResetFilter}
            className="rounded-xl bg-emerald-500 px-3 py-2"
          >
            <Text className="text-[12px] font-semibold text-white">
              Reset to 100%
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}