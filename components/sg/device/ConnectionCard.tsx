import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConnectionInfo } from "../../../types/device";

export default function ConnectionCard({
  connection,
  onReconnect,
}: {
  connection: ConnectionInfo;
  onReconnect: () => void;
}) {
  return (
    <View className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="wifi" size={24} color="#2563EB" />
          </View>

          <View>
            <Text className="text-lg font-extrabold text-gray-900">Connection</Text>

            <Text className="mt-1 text-[12px] font-medium text-gray-500">
              {connection.wifiBand}
            </Text>

            <View className="mt-2 flex-row items-center gap-2">
              <Ionicons name="cellular" size={14} color="#6B7280" />
              <Text className="text-[12px] font-semibold text-gray-600">
                {connection.signalLabel}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <View
            className={`rounded-full px-3 py-1 ${
              connection.connected ? "bg-emerald-100" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-[11px] font-extrabold ${
                connection.connected ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              {connection.connected ? "Connected" : "Disconnected"}
            </Text>
          </View>

          <Text className="mt-3 text-[12px] font-semibold text-gray-400">
            {connection.ip}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onReconnect}
        className="mt-4 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-3"
      >
        <Text className="text-[13px] font-extrabold text-blue-700">
          Reconnect Device
        </Text>
      </Pressable>
    </View>
  );
}
