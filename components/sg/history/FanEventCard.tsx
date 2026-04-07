import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FanEvent } from "../../../types/history";

export default function FanEventCard({ item }: { item: FanEvent }) {
  const isAuto =
    item.type === "AUTO_TRIGGER" || item.type === "AUTO_STOP";

  const isReset = item.type === "FILTER_RESET";
  const isStop =
    item.type === "AUTO_STOP" || item.type === "MANUAL_STOP";

  const iconName = isReset
    ? "air-filter"
    : isAuto
      ? "robot"
      : "account";

  const iconColor = isReset
    ? "#059669"
    : isAuto
      ? "#2563EB"
      : "#6B7280";

  const iconBg = isReset
    ? "#ECFDF5"
    : isAuto
      ? "#EFF6FF"
      : "#F3F4F6";

  const badgeText = isReset
    ? "FILTER"
    : isAuto
      ? "AUTO"
      : "MANUAL";

  const badgeBg = isReset
    ? "bg-emerald-50"
    : isAuto
      ? "bg-blue-50"
      : "bg-gray-100";

  const badgeTextColor = isReset
    ? "text-emerald-700"
    : isAuto
      ? "text-blue-700"
      : "text-gray-700";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 flex-row items-start gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: iconBg }}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color={iconColor}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-[14px] font-extrabold text-gray-900">
                {item.title}
              </Text>

              <View className={`rounded-full px-2 py-1 ${badgeBg}`}>
                <Text className={`text-[10px] font-bold ${badgeTextColor}`}>
                  {badgeText}
                </Text>
              </View>
            </View>

            <Text className="mt-1 text-[12px] font-medium text-gray-500">
              {item.subtitle}
            </Text>

            <Text className="mt-2 text-[11px] font-medium text-gray-400">
              {item.date ?? "No date"} • {item.time ?? "--"}
            </Text>
          </View>
        </View>

        <View className="items-end pl-3">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {isStop ? "Duration" : "Status"}
          </Text>
          <Text className="mt-1 text-[12px] font-extrabold text-gray-800">
            {item.duration ?? "--"}
          </Text>
        </View>
      </View>
    </View>
  );
}