import React from "react";
import { Text, View } from "react-native";

export default function StatusRow({
  icon,
  title,
  rightTop,
  rightBottom,
  rightTopColor = "text-emerald-600",
}: {
  icon: React.ReactNode;
  title: string;
  rightTop?: string;
  rightBottom?: string;
  rightTopColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2 pl-4">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-[15px] font-bold text-gray-900">{title}</Text>
      </View>

      <View className="items-end">
        {rightTop ? (
          <Text className={`text-[11px] font-extrabold ${rightTopColor}`}>
            {rightTop}
          </Text>
        ) : null}
        {rightBottom ? (
          <Text className="mt-0.5 text-[11px] font-medium text-gray-500">
            {rightBottom}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
