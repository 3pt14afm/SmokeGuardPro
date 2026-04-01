export type FanEventType = "AUTO_TRIGGER" | "MANUAL_START" | "MANUAL_STOP";

export type FanEvent = {
  id: string;
  type: FanEventType;
  title: string;
  subtitle: string;
  time: string;
  duration: string;
};

export type SmokeLevel = "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";

export type SmokeReading = {
  id: string;
  level: SmokeLevel;
  aqi: number;
  time: string;
};