import React from "react";
import { Text, View } from "react-native";

export default function StatusPill({
  label,
  bg,
  textColor,
  dotColor,
}: {
  label: string;
  bg: string;
  textColor: string;
  dotColor: string;
}) {
  return (
    <View className={`flex-row items-center gap-2 rounded-full px-4 py-1.5 ${bg}`}>
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
      <Text className={`text-sm font-extrabold ${textColor}`}>{label}</Text>
    </View>
  );
}
