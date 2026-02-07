import React, { useMemo, useState, useRef } from "react";
import { Alert, Pressable, ScrollView, Text, View, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { SafeAreaView, useSafeAreaInsets  } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";

type Mode = "AUTO" | "MANUAL";

type AirState = {
  qualityLabel: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";
  pillText: "Normal" | "Caution" | "Danger";
  ringColor: string;
  pillBg: string; // tailwind class
  pillTextColor: string; // tailwind class
};

type SystemStatus = {
  powerSupply: "OK" | "ISSUE";
  smokeSensor: "OK" | "ISSUE";
  esp32: {
    connected: boolean;
    wifiName?: string;
  };
};

// ⚠️ Placeholder mapping (adjust later based on your sensor calibration)
function getAirState(smokeValue: number): AirState {
  if (smokeValue <= 30) {
    return {
      qualityLabel: "EXCELLENT",
      pillText: "Normal",
      ringColor: "#22C55E",
      pillBg: "bg-emerald-100",
      pillTextColor: "text-emerald-800",
    };
  }
  if (smokeValue <= 60) {
    return {
      qualityLabel: "GOOD",
      pillText: "Normal",
      ringColor: "#22C55E",
      pillBg: "bg-emerald-100",
      pillTextColor: "text-emerald-800",
    };
  }
  if (smokeValue <= 100) {
    return {
      qualityLabel: "MODERATE",
      pillText: "Caution",
      ringColor: "#F59E0B",
      pillBg: "bg-amber-100",
      pillTextColor: "text-amber-800",
    };
  }
  return {
    qualityLabel: "POOR",
    pillText: "Danger",
    ringColor: "#EF4444",
    pillBg: "bg-red-100",
    pillTextColor: "text-red-800",
  };
}

function StatusPill({
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

function GaugeRing({
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

function Tile({
  title,
  value,
  icon,
  onPress,
  disabled,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress || disabled}
      onPress={onPress}
      className={`flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-3 pt-6 shadow-sm ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {icon}
      <Text className="mt-2 text-[11px] font-bold tracking-wide text-gray-500">
        {title}
      </Text>
      <Text className="my-4 text-2xl font-black text-gray-900">{value}</Text>
    </Pressable>
  );
}

function StatusRow({
  icon,
  title,
  rightTop,
  rightBottom,
  rightTopColor = "text-emerald-600",
}: {
  icon: React.ReactNode;
  title: string;
  rightTop?: string;
  rightBottom?: string;
  rightTopColor?: string;
}) {
  return (
    <View className="flex-row items-center pl-4 justify-between py-2">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-[15px] font-bold text-gray-900">{title}</Text>
      </View>

      <View className="items-end">
        {rightTop ? (
          <Text className={`text-[11px] font-extrabold ${rightTopColor}`}>{rightTop}</Text>
        ) : null}
        {rightBottom ? (
          <Text className="mt-0.5 text-[11px] font-medium text-gray-500">{rightBottom}</Text>
        ) : null}
      </View>
    </View>
  );
}

// --- Wi-Fi functions (stub for now, we’ll wire later) ---
// Your doc confirms Wi-Fi is used for data + control, but doesn't specify endpoints.
async function sendModeToEsp32(_mode: Mode) {
  return;
}
async function sendFanToEsp32(_fanOn: boolean) {
  return;
}

export default function Dashboard() {

  const insets = useSafeAreaInsets();
  

  // Mock for now. Later: replace smokeValue with Wi-Fi live data.
  const [smokeValue, setSmokeValue] = useState(12);

  const [mode, setMode] = useState<Mode>("AUTO");
  const [fanOnManual, setFanOnManual] = useState(false);
  const [busy, setBusy] = useState(false);

  // Mock system status (later: from ESP32 /status)
  const [systemStatus] = useState<SystemStatus>({
    powerSupply: "OK",
    smokeSensor: "OK",
    esp32: { connected: true, wifiName: "SG-Network-A" },
  });

  const air = useMemo(() => getAirState(smokeValue), [smokeValue]);

  // In AUTO: fan is driven by smoke threshold logic (placeholder).
  // In MANUAL: use user's fan toggle.
  const fanOn = mode === "AUTO" ? smokeValue > 60 : fanOnManual;

  async function toggleMode() {
    const next: Mode = mode === "AUTO" ? "MANUAL" : "AUTO";

    setBusy(true);
    try {
      await sendModeToEsp32(next);
      setMode(next);
    } catch {
      Alert.alert("Mode change failed", "Couldn’t change mode. Check Wi-Fi connection.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFan() {
    if (mode !== "MANUAL") {
      Alert.alert("Auto Mode", "Switch to MANUAL to control the fan.");
      return;
    }

    const next = !fanOnManual;

    setBusy(true);
    try {
      await sendFanToEsp32(next);
      setFanOnManual(next);
    } catch {
      Alert.alert("Fan control failed", "Couldn’t update fan state. Check Wi-Fi connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces
        contentContainerStyle={{
          paddingTop: 25,
        }}>
        <View className="flex-1 px-5 pt-2 ">
        <Text className="text-lg font-semibold text-gray-500">Kitchen Safety</Text>
        <Text className="mt-2 text-5xl font-extrabold text-gray-900">Dashboard</Text>

        {/* Air Quality Card */}
        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View />
            <StatusPill
              label={air.pillText}
              bg={air.pillBg}
              textColor={air.pillTextColor}
              dotColor={air.ringColor}
            />
          </View>

          <View className="mt-2 mb-4 items-center">
            <GaugeRing value={smokeValue} max={120} strokeColor={air.ringColor} />

            <Text className="mt-5 text-base font-medium text-gray-500">
              Air quality is{" "}
              <Text className="font-extrabold" style={{ color: air.ringColor }}>
                {air.qualityLabel}
              </Text>
            </Text>

            <Text className="mt-1 text-sm font-medium text-gray-400 italic">Updated just now</Text>
          </View>
        </View>

        {/* Tiles Row */}
        <View className="mt-4 flex-row gap-2.5">
          <Tile
            title="FAN STATUS"
            value={fanOn ? "ON" : "OFF"}
            disabled={busy}
            onPress={toggleFan}
            icon={
              <MaterialCommunityIcons
                name="fan"
                size={24}
                color={fanOn ? "#22C55E" : "#9CA3AF"}
              />
            }
          />

          <Tile
            title="ACTIVE MODE"
            value={mode}
            disabled={busy}
            onPress={toggleMode}
            icon={<Ionicons name="sync-outline" size={24} color="#22C55E" />}
          />

          <Tile
            title="FILTER LIFE"
            value="84%"
            icon={<Ionicons name="funnel-outline" size={24} color="#22C55E" />}
          />
        </View>

        {/* System Status */}
        <View className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Text className="mb-2 text-base font-extrabold tracking-wider text-gray-500">
            SYSTEM STATUS
          </Text>
    
          <StatusRow
            title="Power Supply"
            icon={
              <Ionicons
                name="power"
                size={18}
                color={systemStatus.powerSupply === "OK" ? "#22C55E" : "#EF4444"}
              />
            }
          />

          <StatusRow
            title="Smoke Sensor"
            icon={
              <Ionicons
                name="flame"
                size={18}
                color={systemStatus.smokeSensor === "OK" ? "#22C55E" : "#EF4444"}
              />
            }
          />

          <StatusRow
            title="ESP32 Connectivity"
            icon={
              <Ionicons
                name="wifi"
                size={18}
                color={systemStatus.esp32.connected ? "#22C55E" : "#EF4444"}
              />
            }
            rightTop={systemStatus.esp32.connected ? "CONNECTED" : "DISCONNECTED"}
            rightTopColor={systemStatus.esp32.connected ? "text-emerald-600" : "text-red-600"}
            rightBottom={
              systemStatus.esp32.wifiName ? `WiFi: ${systemStatus.esp32.wifiName}` : undefined
            }
          />
        </View>

        {/* (Temporary) test buttons so you can see the dynamic pill change */}
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => setSmokeValue((v) => Math.max(0, v - 20))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2"
          >
            <Text className="font-semibold text-gray-700">- Smoke</Text>
          </Pressable>
          <Pressable
            onPress={() => setSmokeValue((v) => Math.min(220, v + 20))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2"
          >
            <Text className="font-semibold text-gray-700">+ Smoke</Text>
          </Pressable>
        </View>
      </View>
      <View style={{ height: 1200 }} />
      </ScrollView>
      
      <BlurView
        intensity={1}          // lower = less blur
        tint="default"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 16, // status bar + a bit below
        }}
        pointerEvents="none"
      />
    </View>
  );
}
