import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function GaugeRing({
  value,
  max,
  strokeColor,
}: {
  value: number;
  max: number;
  strokeColor: string;
}) {
  const size = 200;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.max(0, Math.min(1, value / max));
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D1D5DB"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-6xl font-extrabold text-gray-900">{value}</Text>
        <Text className="mt-1 text-sm font-semibold text-gray-500">MG/M³ SMOKE</Text>
      </View>
    </View>
  );
}
