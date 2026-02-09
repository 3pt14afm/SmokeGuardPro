import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SeverityPill from "./SeverityPill";
import { AlertItem } from "../../../types/alerts";

export default function AlertHistoryCard({ item }: { item: AlertItem }) {
  const iconStyles =
    item.severity === "danger"
      ? {
          bg: "bg-red-100",
          ring: "border-red-200",
          icon: "warning",
          iconColor: "#EF4444",
          metricColor: "text-red-600",
        }
      : item.severity === "warning"
      ? {
          bg: "bg-amber-100",
          ring: "border-amber-200",
          icon: "alert-circle",
          iconColor: "#F59E0B",
          metricColor: "text-amber-600",
        }
      : {
          bg: "bg-gray-100",
          ring: "border-gray-200",
          icon: "information-circle",
          iconColor: "#6B7280",
          metricColor: "text-gray-700",
        };

  const isFilterDue = item.type === "FILTER_DUE";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <View className="flex-row items-start justify-between">
        {/* Left icon */}
        <View
          className={`h-8 w-8 items-center justify-center rounded-full border ${iconStyles.bg} ${iconStyles.ring}`}
        >
          <Ionicons
            name={iconStyles.icon as any}
            size={20}
            color={iconStyles.iconColor}
          />
        </View>

        {/* Middle content */}
        <View className="flex-1 px-4">
          <Text className="text-lg font-extrabold text-gray-900">
            {item.title}
          </Text>

          <View className="mt-2 flex-row items-center">
            <Text className="text-base font-medium text-gray-500">
              {isFilterDue ? "Efficiency:" : "Peak:"}
            </Text>

            <Text className={`ml-2 text-base font-extrabold ${iconStyles.metricColor}`}>
              {isFilterDue ? item.efficiency ?? "-" : item.peak ?? "-"}
            </Text>

            {!isFilterDue ? (
              <>
                <View className="mx-4 h-6 w-[1px] bg-gray-200" />
                <Text className="text-base font-medium text-gray-500">
                  Duration:
                </Text>
                <Text className="ml-2 text-base font-extrabold text-gray-500">
                  {item.duration ?? "-"}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Right side */}
        <View className="items-end">
          <SeverityPill severity={item.severity} />
          <Text className="mt-10 text-[13px] font-semibold text-gray-400">
            {item.time}
          </Text>
        </View>
      </View>
    </View>
  );
}
