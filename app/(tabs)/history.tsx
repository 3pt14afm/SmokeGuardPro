import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/sg/common/Screen";
import SectionTitle from "../../components/sg/common/SectionTitle";
import FanEventCard from "../../components/sg/history/FanEventCard";
import SmokeRow from "../../components/sg/history/SmokeRow";

import {
  FanEvent,
  FanEventType,
  SmokeLevel,
  SmokeReading,
} from "../../types/history";
import { getFanEvents, getSmokeReadings } from "@/services/history";

type FanFilter = "ALL" | FanEventType;
type SmokeFilter = "ALL" | SmokeLevel;
type PickerTarget = "fan" | "smoke" | null;
type ActiveTab = "fan" | "smoke";

const FAN_FILTER_OPTIONS: { label: string; value: FanFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Auto Trigger", value: "AUTO_TRIGGER" },
  { label: "Auto Stop", value: "AUTO_STOP" },
  { label: "Manual Start", value: "MANUAL_START" },
  { label: "Manual Stop", value: "MANUAL_STOP" },
  { label: "Filter Reset", value: "FILTER_RESET" },
];

const SMOKE_FILTER_OPTIONS: { label: string; value: SmokeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Excellent", value: "EXCELLENT" },
  { label: "Good", value: "GOOD" },
  { label: "Moderate", value: "MODERATE" },
  { label: "Poor", value: "POOR" },
];

function formatSelectedDate(date: Date | null) {
  if (!date) return "Select date";

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeDateString(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function SelectButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-gray-700">{label}</Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
      >
        <Text className="text-sm text-gray-700">{value}</Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </Pressable>
    </View>
  );
}

function DateSelector({
  label,
  value,
  onPress,
  onClear,
}: {
  label: string;
  value: Date | null;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-gray-700">{label}</Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={onPress}
          className="flex-1 flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
        >
          <Text className="text-sm text-gray-700">
            {formatSelectedDate(value)}
          </Text>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
        </Pressable>

        <Pressable
          onPress={onClear}
          className="items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <Text className="text-sm font-semibold text-gray-600">Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OptionModal<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: { label: string; value: T }[];
  selectedValue: T;
  onClose: () => void;
  onSelect: (value: T) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/30 px-6"
      >
        <Pressable
          onPress={() => {}}
          className="w-full rounded-2xl bg-white p-4"
        >
          <Text className="mb-3 text-base font-extrabold text-gray-900">
            {title}
          </Text>

          <View className="gap-2">
            {options.map((option) => {
              const active = option.value === selectedValue;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  className={`rounded-xl border px-4 py-3 ${
                    active
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-emerald-700" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            className="mt-4 rounded-xl bg-gray-100 px-4 py-3"
          >
            <Text className="text-center text-sm font-semibold text-gray-700">
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-xl px-4 py-3 ${
        active ? "bg-emerald-500" : "bg-white"
      }`}
    >
      <Text
        className={`text-center text-sm font-bold ${
          active ? "text-white" : "text-gray-600"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const [fanEvents, setFanEvents] = useState<FanEvent[]>([]);
  const [smokeReadings, setSmokeReadings] = useState<SmokeReading[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>("fan");

  const [fanTypeFilter, setFanTypeFilter] = useState<FanFilter>("ALL");
  const [smokeLevelFilter, setSmokeLevelFilter] = useState<SmokeFilter>("ALL");

  const [fanDateFilter, setFanDateFilter] = useState<Date | null>(null);
  const [smokeDateFilter, setSmokeDateFilter] = useState<Date | null>(null);

  const [fanModalVisible, setFanModalVisible] = useState(false);
  const [smokeModalVisible, setSmokeModalVisible] = useState(false);

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const selectedFanLabel =
    FAN_FILTER_OPTIONS.find((option) => option.value === fanTypeFilter)?.label ??
    "All";

  const selectedSmokeLabel =
    SMOKE_FILTER_OPTIONS.find((option) => option.value === smokeLevelFilter)
      ?.label ?? "All";

  const filteredFanEvents = useMemo(() => {
    return fanEvents.filter((event) => {
      const matchesType =
        fanTypeFilter === "ALL" ? true : event.type === fanTypeFilter;

      const matchesDate = fanDateFilter
        ? normalizeDateString(event.date) ===
          normalizeDateString(formatSelectedDate(fanDateFilter))
        : true;

      return matchesType && matchesDate;
    });
  }, [fanEvents, fanTypeFilter, fanDateFilter]);

  const filteredSmokeReadings = useMemo(() => {
    return smokeReadings.filter((reading) => {
      const matchesLevel =
        smokeLevelFilter === "ALL" ? true : reading.level === smokeLevelFilter;

      const matchesDate = smokeDateFilter
        ? normalizeDateString(reading.date) ===
          normalizeDateString(formatSelectedDate(smokeDateFilter))
        : true;

      return matchesLevel && matchesDate;
    });
  }, [smokeReadings, smokeLevelFilter, smokeDateFilter]);

  function openDatePicker(target: PickerTarget) {
    setPickerTarget(target);
    setShowDatePicker(true);
  }

  function handleDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    if (pickerTarget === "fan") {
      setFanDateFilter(selectedDate);
    } else if (pickerTarget === "smoke") {
      setSmokeDateFilter(selectedDate);
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="mt-1 text-4xl font-extrabold text-gray-900">
          Usage &amp; Event Logs
        </Text>

        <View className="mt-4 mb-4 flex-row rounded-2xl border border-gray-200 bg-gray-100 p-1">
          <TabButton
            label="Fan Event Logs"
            active={activeTab === "fan"}
            onPress={() => setActiveTab("fan")}
          />
          <TabButton
            label="Smoke Readings"
            active={activeTab === "smoke"}
            onPress={() => setActiveTab("smoke")}
          />
        </View>

        {activeTab === "fan" ? (
          <>
            <SectionTitle>FAN EVENT LOG</SectionTitle>

            <View className="mb-3 gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <SelectButton
                label="Event type"
                value={selectedFanLabel}
                onPress={() => setFanModalVisible(true)}
              />

              <DateSelector
                label="Date"
                value={fanDateFilter}
                onPress={() => openDatePicker("fan")}
                onClear={() => setFanDateFilter(null)}
              />
            </View>

            <View className="gap-3">
              {filteredFanEvents.length > 0 ? (
                filteredFanEvents.map((e) => (
                  <FanEventCard key={e.id} item={e} />
                ))
              ) : (
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  <Text className="text-sm text-gray-500">
                    No fan events match the selected filters.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <SectionTitle>SMOKE READINGS</SectionTitle>

            <View className="mb-3 gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <SelectButton
                label="Smoke level"
                value={selectedSmokeLabel}
                onPress={() => setSmokeModalVisible(true)}
              />

              <DateSelector
                label="Date"
                value={smokeDateFilter}
                onPress={() => openDatePicker("smoke")}
                onClear={() => setSmokeDateFilter(null)}
              />
            </View>

            <View className="gap-3 pb-8">
              {filteredSmokeReadings.length > 0 ? (
                filteredSmokeReadings.map((r) => (
                  <SmokeRow key={r.id} item={r} />
                ))
              ) : (
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  <Text className="text-sm text-gray-500">
                    No smoke readings match the selected filters.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <OptionModal
        visible={fanModalVisible}
        title="Select fan event type"
        options={FAN_FILTER_OPTIONS}
        selectedValue={fanTypeFilter}
        onClose={() => setFanModalVisible(false)}
        onSelect={setFanTypeFilter}
      />

      <OptionModal
        visible={smokeModalVisible}
        title="Select smoke level"
        options={SMOKE_FILTER_OPTIONS}
        selectedValue={smokeLevelFilter}
        onClose={() => setSmokeModalVisible(false)}
        onSelect={setSmokeLevelFilter}
      />

      {showDatePicker && (
        <DateTimePicker
          value={
            pickerTarget === "fan"
              ? fanDateFilter ?? new Date()
              : smokeDateFilter ?? new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </Screen>
  );
}