import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FanEvent } from "../../../types/history";

export default function FanEventCard({ item }: { item: FanEvent }) {
  const isAuto = item.type === "AUTO_TRIGGER";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Left */}
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <MaterialCommunityIcons
              name={isAuto ? "robot" : "account"}
              size={20}
              color={isAuto ? "#2563EB" : "#6B7280"}
            />
          </View>

          <View>
            <Text className="text-[14px] font-extrabold text-gray-900">
              {item.title}
            </Text>
            <Text className="mt-1 text-[12px] font-medium text-gray-500">
              {item.subtitle}
            </Text>
          </View>
        </View>

        {/* Right */}
        <View className="items-end">
          <Text className="text-[11px] font-semibold text-gray-400">
            {item.time}
          </Text>
          <Text className="mt-1 text-[11px] font-semibold text-gray-400">
            Duration: {item.duration}
          </Text>
        </View>
      </View>
    </View>
  );
}
