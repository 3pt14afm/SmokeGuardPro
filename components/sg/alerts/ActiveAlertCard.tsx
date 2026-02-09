import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActiveAlert } from "../../../types/alerts";

export default function ActiveAlertCard({
  alert,
  onDismiss,
}: {
  alert: ActiveAlert | null;
  onDismiss: () => void;
}) {
  const hasActive = !!alert;

  const colors = useMemo(() => {
    return {
      bg: "bg-red-50",
      border: "border-red-200",
      title: "text-red-700",
      msg: "text-red-700/80",
      buttonBg: "bg-red-600",
      buttonText: "text-white",
      iconColor: "#EF4444",
      iconBg: "bg-red-100",
    };
  }, []);

  if (!hasActive) {
    return (
      <View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <Text className="text-[13px] font-extrabold text-gray-900">
          No active alerts
        </Text>
        <Text className="mt-2 text-[12px] font-medium text-gray-600">
          You’re all good right now.
        </Text>
      </View>
    );
  }

  return (
    <View className={`rounded-2xl border p-4 shadow-sm ${colors.bg} ${colors.border}`}>
      <View className="flex-row items-start gap-3">
        <View className={`h-12 w-12 items-center justify-center rounded-full ${colors.iconBg}`}>
          <Ionicons name="warning" size={26} color={colors.iconColor} />
        </View>

        <View className="flex-1">
          <Text className={`text-[14px] font-extrabold ${colors.title}`}>
            {alert!.title}
          </Text>

          <Text className={`mt-2 text-[12px] font-semibold ${colors.msg}`}>
            {alert!.message}
          </Text>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[11px] font-semibold text-gray-600">
              {alert!.timestamp}
            </Text>

            <Pressable onPress={onDismiss} className={`rounded-xl px-4 py-2 ${colors.buttonBg}`}>
              <Text className={`text-[12px] font-extrabold ${colors.buttonText}`}>
                DISMISS
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
