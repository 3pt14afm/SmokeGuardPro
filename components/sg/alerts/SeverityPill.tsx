import React from "react";
import { Text, View } from "react-native";
import { AlertSeverity } from "../../../types/alerts";

export default function SeverityPill({ severity }: { severity: AlertSeverity }) {
  const styles =
    severity === "danger"
      ? { bg: "bg-red-100", text: "text-red-700", label: "Danger" }
      : severity === "warning"
      ? { bg: "bg-amber-100", text: "text-amber-700", label: "Warning" }
      : { bg: "bg-gray-100", text: "text-gray-700", label: "Info" };

  return (
    <View className={`rounded-full px-4 py-1 ${styles.bg}`}>
      <Text className={`text-[12px] font-extrabold ${styles.text}`}>
        {styles.label}
      </Text>
    </View>
  );
}
