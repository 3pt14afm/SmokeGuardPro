export type Mode = "AUTO" | "MANUAL";

export type SystemStatus = {
  powerSupply: "OK" | "ISSUE";
  smokeSensor: "OK" | "ISSUE";
  esp32: {
    connected: boolean;
    wifiName?: string;
  };
};
