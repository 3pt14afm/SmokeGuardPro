import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingRow from "./SettingRow";

export default function AlertSettingsModal({
  open,
  onClose,
  pushAlerts,
  audibleAlarm,
  onTogglePush,
  onToggleAudible,
}: {
  open: boolean;
  onClose: () => void;
  pushAlerts: boolean;
  audibleAlarm: boolean;
  onTogglePush: (v: boolean) => void;
  onToggleAudible: (v: boolean) => void;
}) {
  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable
          onPress={() => {}}
          className="absolute right-5 top-24 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] font-extrabold text-gray-900">
              Alert Settings
            </Text>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-xl bg-gray-100"
            >
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          <View className="mt-3 h-[1px] bg-gray-200" />

          <SettingRow
            title="Push Alerts"
            subtitle="Get notified when smoke levels are high"
            value={pushAlerts}
            onValueChange={onTogglePush}
            icon={<Ionicons name="notifications" size={18} color="#111827" />}
          />

          <View className="h-[1px] bg-gray-200" />

          <SettingRow
            title="Audible Alarm"
            subtitle="Play a sound alarm when danger is detected"
            value={audibleAlarm}
            onValueChange={onToggleAudible}
            icon={<Ionicons name="volume-high" size={18} color="#111827" />}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
