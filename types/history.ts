export type FanEventType = "AUTO_TRIGGER" | "MANUAL_START";

export type FanEvent = {
  id: string;
  type: FanEventType;
  title: string;
  subtitle: string;
  time: string; // e.g. "2:22 PM"
  duration: string; // e.g. "12m"
};

export type SmokeLevel = "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";

export type SmokeReading = {
  id: string;
  level: SmokeLevel;
  aqi: number;
  time: string; // e.g. "4:45 PM" / "Yesterday"
};
