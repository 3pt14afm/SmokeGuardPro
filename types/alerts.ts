export type AlertType = "HIGH_SMOKE" | "MODERATE_ODOR" | "FILTER_DUE" | "INFO";

export type AlertSeverity = "danger" | "warning" | "info";

export type AlertItem = {
  id: string;
  type: AlertType;
  title: string;
  time: string; // e.g. "11:20 AM"
  peak?: string; // e.g. "45 ppm"
  duration?: string; // e.g. "4m"
  efficiency?: string; // e.g. "12%"
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
