import React from "react";
import { Text, View } from "react-native";
import { SmokeReading } from "../../../types/history";

export default function SmokeRow({ item }: { item: SmokeReading }) {
  const dotColor =
    item.level === "EXCELLENT"
      ? "#22C55E"
      : item.level === "GOOD"
      ? "#22C55E"
      : item.level === "MODERATE"
      ? "#F59E0B"
      : "#EF4444";

  const label =
    item.level === "EXCELLENT"
      ? "Excellent"
      : item.level === "GOOD"
      ? "Good"
      : item.level === "MODERATE"
      ? "Moderate"
      : "Poor";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Left */}
        <View className="flex-row items-center gap-3">
          <View className="h-3 w-3 rounded-full" style={{ backgroundColor: dotColor }} />
          <Text className="text-[14px] font-extrabold text-gray-900">{label}</Text>
        </View>

        {/* Center */}
        <Text className="text-[13px] font-extrabold text-gray-900">
          {item.aqi} AQI
        </Text>

        {/* Right */}
        <Text className="text-[11px] font-semibold text-gray-400">{item.time}</Text>
      </View>
    </View>
  );
}
