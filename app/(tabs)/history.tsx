import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons  } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type FanEventType = "AUTO_TRIGGER" | "MANUAL_START";

type FanEvent = {
  id: string;
  type: FanEventType;
  title: string;
  subtitle: string;
  time: string; // e.g. "2:22 PM"
  duration: string; // e.g. "12m"
};

type SmokeLevel = "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";

type SmokeReading = {
  id: string;
  level: SmokeLevel;
  aqi: number;
  time: string; // e.g. "4:45 PM" / "Yesterday"
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-5 text-xs font-extrabold tracking-wider text-gray-500">
      {children}
    </Text>
  );
}

function FanEventCard({ item }: { item: FanEvent }) {
  const isAuto = item.type === "AUTO_TRIGGER";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Left */}
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <MaterialCommunityIcons
              name={isAuto ? "robot" : "account"}
              size={20}
              color={isAuto ? "#2563EB" : "#6B7280"}
            />
          </View>

          <View>
            <Text className="text-[14px] font-extrabold text-gray-900">
              {item.title}
            </Text>
            <Text className="mt-1 text-[12px] font-medium text-gray-500">
              {item.subtitle}
            </Text>
          </View>
        </View>

        {/* Right */}
        <View className="items-end">
          <Text className="text-[11px] font-semibold text-gray-400">
            {item.time}
          </Text>
          <Text className="mt-1 text-[11px] font-semibold text-gray-400">
            Duration: {item.duration}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SmokeRow({ item }: { item: SmokeReading }) {
  const dotColor =
    item.level === "EXCELLENT"
      ? "#22C55E"
      : item.level === "GOOD"
      ? "#22C55E"
      : item.level === "MODERATE"
      ? "#F59E0B"
      : "#EF4444";

  const label =
    item.level === "EXCELLENT"
      ? "Excellent"
      : item.level === "GOOD"
      ? "Good"
      : item.level === "MODERATE"
      ? "Moderate"
      : "Poor";

  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        {/* Left */}
        <View className="flex-row items-center gap-3">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <Text className="text-[14px] font-extrabold text-gray-900">
            {label}
          </Text>
        </View>

        {/* Center */}
        <Text className="text-[13px] font-extrabold text-gray-900">
          {item.aqi} AQI
        </Text>

        {/* Right */}
        <Text className="text-[11px] font-semibold text-gray-400">
          {item.time}
        </Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  // Mock data for now (later: from device logs over Wi-Fi)
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
   
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "left", "right"]}>
      
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-6"
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </SafeAreaView>
  );
}
