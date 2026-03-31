export type Mode = "AUTO" | "MANUAL";

export type SensorState = "NORMAL" | "DETECTED";
export type RelayState = "ON" | "OFF";

export type Esp32Status = {
  mode: Mode;
  sensor: SensorState;
  relay: RelayState;
  fanOn: boolean;
  smokeValue: number;
  connected: boolean;
  wifiName?: string;
  ip?: string;
};

export type SystemStatus = {
  powerSupply: "OK" | "ISSUE";
  smokeSensor: "OK" | "ISSUE";
  esp32: {
    connected: boolean;
    wifiName?: string;
    ip?: string;
  };
};