import React from "react";
import { Text } from "react-native";

export default function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-5 text-xs font-extrabold tracking-wider text-gray-500">
      {children}
    </Text>
  );
}
