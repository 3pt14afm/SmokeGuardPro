import React from "react";
import { Switch, Text, View } from "react-native";

export default function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3 pr-4 flex-1">
        {icon}
        <View className="flex-1">
          <Text className="text-[14px] font-extrabold text-gray-900">{title}</Text>
          <Text className="mt-0.5 text-[12px] font-medium text-gray-600">
            {subtitle}
          </Text>
        </View>
      </View>

      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}
