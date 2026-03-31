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
  const hasPeak = !isFilterDue && !!item.peak;
  const hasDuration = !!item.duration;
  const hasEfficiency = !!item.efficiency;

  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full border ${iconStyles.bg} ${iconStyles.ring}`}
        >
          <Ionicons
            name={iconStyles.icon as any}
            size={20}
            color={iconStyles.iconColor}
          />
        </View>

        <View className="flex-1 px-4">
          <Text className="text-lg font-extrabold text-gray-900">
            {item.title}
          </Text>

          {(hasPeak || hasDuration || hasEfficiency) ? (
            <View className="mt-2 flex-row flex-wrap items-center">
              {hasEfficiency ? (
                <>
                  <Text className="text-base font-medium text-gray-500">
                    Efficiency:
                  </Text>
                  <Text className={`ml-2 text-base font-extrabold ${iconStyles.metricColor}`}>
                    {item.efficiency}
                  </Text>
                </>
              ) : null}

              {hasPeak ? (
                <>
                  <Text className="text-base font-medium text-gray-500">
                    Peak:
                  </Text>
                  <Text className={`ml-2 text-base font-extrabold ${iconStyles.metricColor}`}>
                    {item.peak}
                  </Text>
                </>
              ) : null}

              {hasPeak && hasDuration ? (
                <View className="mx-4 h-6 w-[1px] bg-gray-200" />
              ) : null}

              {!hasEfficiency && hasDuration ? (
                <>
                  <Text className="text-base font-medium text-gray-500">
                    Duration:
                  </Text>
                  <Text className="ml-2 text-base font-extrabold text-gray-500">
                    {item.duration}
                  </Text>
                </>
              ) : null}
            </View>
          ) : null}
        </View>

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