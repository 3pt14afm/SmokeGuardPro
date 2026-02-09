import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { getSensitivityLabel } from "../../../utils/device";

export default function ThresholdCard({
  threshold,
  onChange,
}: {
  threshold: number;
  onChange: (v: number) => void;
}) {
  const sensitivityLabel = useMemo(() => getSensitivityLabel(threshold), [threshold]);

  return (
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
          <Text className="text-[22px] font-extrabold text-blue-600">{threshold}</Text>
          <Text className="text-[11px] font-semibold text-gray-500">ug/m³</Text>
        </View>
      </View>

      <View className="mt-4">
        <Slider
          value={threshold}
          onValueChange={(v) => onChange(Math.round(v))}
          minimumValue={10}
          maximumValue={100}
          step={1}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#D1D5DB"
          thumbTintColor="#2563EB"
        />

        <View className="my-2 flex-row items-center justify-between">
          <Text className="text-[10px] font-extrabold text-gray-400">VERY SENSITIVE</Text>
          <Text className="text-[10px] font-extrabold text-gray-500">STANDARD</Text>
          <Text className="text-[10px] font-extrabold text-gray-400">LESS SENSITIVE</Text>
        </View>

        <Text className="mt-2 text-center text-base font-extrabold text-blue-700">
          {sensitivityLabel}
        </Text>

        <View className="mt-4 rounded-2xl bg-blue-50 p-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={18} color="#2563EB" />
            <Text className="flex-1 text-[12px] font-medium text-gray-600">
              Lower thresholds trigger the fan faster when smoke is detected, but may
              cause false alerts.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
