export type AlertType =
  | "HIGH_SMOKE"
  | "MODERATE_ODOR"
  | "FILTER_DUE"
  | "SYSTEM_OFFLINE"
  | "SYSTEM_NORMAL"
  | "AUTO_FAN_ON"
  | "INFO";

export type AlertSeverity = "danger" | "warning" | "info";

export type AlertItem = {
  id: string;
  type: AlertType;
  title: string;
  time: string;
  peak?: string;
  duration?: string;
  efficiency?: string;
  severity: AlertSeverity;
};

export type ActiveAlert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  severity: AlertSeverity;
};