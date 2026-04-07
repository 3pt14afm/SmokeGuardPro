import React from "react";
import { Text, View } from "react-native";
import { SmokeReading } from "../../../types/history";

export default function SmokeRow({ item }: { item: SmokeReading }) {
  const level = item.level ?? "POOR";

  const dotColor =
    level === "EXCELLENT"
      ? "#22C55E"
      : level === "GOOD"
        ? "#22C55E"
        : level === "MODERATE"
          ? "#F59E0B"
          : "#EF4444";

  const label =
    level === "EXCELLENT"
      ? "Excellent"
      : level === "GOOD"
        ? "Good"
        : level === "MODERATE"
          ? "Moderate"
          : "Poor";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <View>
            <Text className="text-[14px] font-extrabold text-gray-900">
              {label}
            </Text>
            <Text className="text-[11px] font-medium text-gray-400">
              {item.date ?? "No date"} • {item.time ?? "--"}
            </Text>
          </View>
        </View>

        <Text className="text-[13px] font-extrabold text-gray-900">
          {item.aqi ?? 0} AQI
        </Text>
      </View>
    </View>
  );
}