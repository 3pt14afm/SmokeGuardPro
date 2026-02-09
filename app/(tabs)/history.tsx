import React, { useState } from "react";
import { Text, View } from "react-native";

import Screen from "../../components/sg/common/Screen";
import SectionTitle from "../../components/sg/common/SectionTitle";
import FanEventCard from "../../components/sg/history/FanEventCard";
import SmokeRow from "../../components/sg/history/SmokeRow";

import { FanEvent, SmokeReading } from "../../types/history";

export default function HistoryScreen() {
  const [fanEvents] = useState<FanEvent[]>([
    {
      id: "fe-1",
      type: "AUTO_TRIGGER",
      title: "Auto Trigger",
      subtitle: "Smoke detected: 85 AQI",
      time: "2:22 PM",
      duration: "12m",
    },
    {
      id: "fe-2",
      type: "MANUAL_START",
      title: "Manual Start",
      subtitle: "User initiated via app",
      time: "11:05 AM",
      duration: "5m",
    },
    {
      id: "fe-3",
      type: "AUTO_TRIGGER",
      title: "Auto Trigger",
      subtitle: "High VOC levels",
      time: "7:29 AM",
      duration: "22m",
    },
  ]);

  const [smokeReadings] = useState<SmokeReading[]>([
    { id: "sr-1", level: "EXCELLENT", aqi: 12, time: "4:45 PM" },
    { id: "sr-2", level: "GOOD", aqi: 42, time: "3:30 PM" },
    { id: "sr-3", level: "MODERATE", aqi: 88, time: "2:22 PM" },
    { id: "sr-4", level: "POOR", aqi: 156, time: "2:15 PM" },
    { id: "sr-5", level: "EXCELLENT", aqi: 18, time: "7:43 AM" },
    { id: "sr-6", level: "MODERATE", aqi: 92, time: "7:21 AM" },
    { id: "sr-7", level: "POOR", aqi: 147, time: "Yesterday" },
    { id: "sr-8", level: "EXCELLENT", aqi: 14, time: "Yesterday" },
  ]);

  return (
    <Screen>
      <Text className="mt-1 text-4xl font-extrabold text-gray-900">
        Usage &amp; Event Logs
      </Text>

      <SectionTitle>FAN EVENT LOG</SectionTitle>
      <View className="gap-3">
        {fanEvents.map((e) => (
          <FanEventCard key={e.id} item={e} />
        ))}
      </View>

      <SectionTitle>SMOKE READINGS</SectionTitle>
      <View className="gap-3">
        {smokeReadings.map((r) => (
          <SmokeRow key={r.id} item={r} />
        ))}
      </View>
    </Screen>
  );
}
