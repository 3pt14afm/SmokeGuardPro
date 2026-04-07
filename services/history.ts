import AsyncStorage from "@react-native-async-storage/async-storage";
import { FanEvent, SmokeReading, SmokeLevel } from "@/types/history";

const FAN_EVENTS_KEY = "history:fanEvents";
const SMOKE_READINGS_KEY = "history:smokeReadings";
const FILTER_RESET_RUNTIME_KEY = "history:filterResetRuntimeMs";

const MAX_FAN_EVENTS = 100;
const MAX_SMOKE_READINGS = 200;

async function readList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeList<T>(key: string, items: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export async function getFanEvents(): Promise<FanEvent[]> {
  return readList<FanEvent>(FAN_EVENTS_KEY);
}

export async function getSmokeReadings(): Promise<SmokeReading[]> {
  return readList<SmokeReading>(SMOKE_READINGS_KEY);
}

export async function clearSavedHistory() {
  await Promise.all([
    AsyncStorage.removeItem(FAN_EVENTS_KEY),
    AsyncStorage.removeItem(SMOKE_READINGS_KEY),
    AsyncStorage.removeItem(FILTER_RESET_RUNTIME_KEY),
  ]);
}

export async function saveFanEvent(event: FanEvent) {
  const existing = await getFanEvents();

  const next = [event, ...existing.filter((item) => item.id !== event.id)].slice(
    0,
    MAX_FAN_EVENTS
  );

  await writeList(FAN_EVENTS_KEY, next);
}

export async function saveSmokeReading(reading: SmokeReading) {
  const existing = await getSmokeReadings();

  const isDuplicate = existing.some(
    (item) =>
      item.time === reading.time &&
      item.date === reading.date &&
      item.aqi === reading.aqi
  );

  if (isDuplicate) return;

  const next = [reading, ...existing].slice(0, MAX_SMOKE_READINGS);
  await writeList(SMOKE_READINGS_KEY, next);
}

export function getSmokeLevelFromAqi(aqi: number): SmokeLevel {
  if (aqi <= 25) return "EXCELLENT";
  if (aqi <= 60) return "GOOD";
  if (aqi <= 100) return "MODERATE";
  return "POOR";
}

export function getTimeLabel(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getDateLabel(date = new Date()) {
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDurationFromMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export async function getTotalFanRuntimeMs(): Promise<number> {
  const events = await getFanEvents();

  return events.reduce((sum, item) => {
    if (item.type === "AUTO_STOP" || item.type === "MANUAL_STOP") {
      return sum + Math.max(0, item.durationMs ?? 0);
    }
    return sum;
  }, 0);
}

async function getFilterResetRuntimeMs(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(FILTER_RESET_RUNTIME_KEY);
    const parsed = raw ? JSON.parse(raw) : 0;
    return typeof parsed === "number" ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function resetFilterLife() {
  const currentRuntimeMs = await getTotalFanRuntimeMs();

  await AsyncStorage.setItem(
    FILTER_RESET_RUNTIME_KEY,
    JSON.stringify(currentRuntimeMs)
  );

  await saveFanEvent({
    id: `fe-${Date.now()}`,
    type: "FILTER_RESET",
    title: "Filter Replaced",
    subtitle: "User reset filter life to 100%",
    time: getTimeLabel(),
    date: getDateLabel(),
    duration: "--",
    durationMs: 0,
  });
}

export async function getFilterLifePercent(
  maxFilterHours = 100
): Promise<number> {
  const totalRuntimeMs = await getTotalFanRuntimeMs();
  const resetBaselineMs = await getFilterResetRuntimeMs();

  const usedSinceResetMs = Math.max(0, totalRuntimeMs - resetBaselineMs);
  const maxRuntimeMs = maxFilterHours * 60 * 60 * 1000;

  const remainingPercent = Math.max(
    0,
    Math.round((1 - usedSinceResetMs / maxRuntimeMs) * 100)
  );

  return remainingPercent;
}