import React from "react";
import { Pressable, Text } from "react-native";

export default function MetricTile({
  title,
  value,
  icon,
  onPress,
  disabled,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress || disabled}
      onPress={onPress}
      className={`flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-3 pt-6 shadow-sm ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {icon}
      <Text className="mt-2 text-[11px] font-bold tracking-wide text-gray-500">
        {title}
      </Text>
      <Text className="my-4 text-2xl font-black text-gray-900">{value}</Text>
    </Pressable>
  );
}
