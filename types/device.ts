export type ConnectionInfo = {
  wifiName: string;
  wifiBand: string; // e.g. "WiFi (2.4Ghz)"
  signalLabel: string; // e.g. "Strong Signal"
  ip: string; // e.g. "192.168.1.42"
  connected: boolean;
};

export type SystemHealth = {
  powerStatus: string; // e.g. "Mains Powered"
  sensorCalibration: string; // e.g. "Optimal"
  internalTemp: string; // e.g. "38°C"
};
