export type FanEventType =
  | "AUTO_TRIGGER"
  | "AUTO_STOP"
  | "MANUAL_START"
  | "MANUAL_STOP"
  | "FILTER_RESET";

export type FanEvent = {
  id: string;
  type: FanEventType;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  duration: string;
  durationMs?: number;
};

export type SmokeLevel = "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";

export type SmokeReading = {
  id: string;
  level: SmokeLevel;
  aqi: number;
  time: string;
  date: string;
};