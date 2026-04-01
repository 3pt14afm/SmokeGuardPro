import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/sg/common/Screen";
import SectionTitle from "../../components/sg/common/SectionTitle";
import FanEventCard from "../../components/sg/history/FanEventCard";
import SmokeRow from "../../components/sg/history/SmokeRow";

import { FanEvent, SmokeReading } from "../../types/history";
import { getFanEvents, getSmokeReadings } from "@/services/history";

export default function HistoryScreen() {
  const [fanEvents, setFanEvents] = useState<FanEvent[]>([]);
  const [smokeReadings, setSmokeReadings] = useState<SmokeReading[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const [savedFanEvents, savedSmokeReadings] = await Promise.all([
        getFanEvents(),
        getSmokeReadings(),
      ]);

      setFanEvents(savedFanEvents);
      setSmokeReadings(savedSmokeReadings);
    } catch (error) {
      console.error("Failed to load history:", error);
      setFanEvents([]);
      setSmokeReadings([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  return (
    <Screen>
      <Text className="mt-1 text-4xl font-extrabold text-gray-900">
        Usage &amp; Event Logs
      </Text>

      <SectionTitle>FAN EVENT LOG</SectionTitle>
      <View className="gap-3">
        {fanEvents.length > 0 ? (
          fanEvents.map((e) => <FanEventCard key={e.id} item={e} />)
        ) : (
          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-sm text-gray-500">No fan events recorded yet.</Text>
          </View>
        )}
      </View>

      <SectionTitle>SMOKE READINGS</SectionTitle>
      <View className="gap-3">
        {smokeReadings.length > 0 ? (
          smokeReadings.map((r) => <SmokeRow key={r.id} item={r} />)
        ) : (
          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-sm text-gray-500">No smoke readings recorded yet.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}