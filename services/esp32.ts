import { Mode, Esp32Status } from "@/types/dashboard";

const ESP32_BASE_URL = "http://192.168.10.145";

export async function sendModeToEsp32(mode: Mode) {
  const res = await fetch(`${ESP32_BASE_URL}/mode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `value=${encodeURIComponent(mode)}`,
  });

  if (!res.ok) {
    throw new Error("Failed to send mode to ESP32");
  }

  return await res.json();
}

export async function sendFanToEsp32(fanOn: boolean) {
  const res = await fetch(`${ESP32_BASE_URL}/fan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `value=${fanOn}`,
  });

  if (!res.ok) {
    throw new Error("Failed to send fan state to ESP32");
  }

  return await res.json();
}

export async function getEsp32Status(): Promise<Esp32Status> {
  const res = await fetch(`${ESP32_BASE_URL}/status`);

  if (!res.ok) {
    throw new Error("Failed to fetch ESP32 status");
  }

  const data = await res.json();

  return {
    mode: data.mode === "MANUAL" ? "MANUAL" : "AUTO",
    sensor: data.sensor === "DETECTED" ? "DETECTED" : "NORMAL",
    relay: data.relay === "ON" ? "ON" : "OFF",
    fanOn: !!data.fanOn,
    smokeValue: typeof data.smokeValue === "number" ? data.smokeValue : 0,
    connected: true,
    wifiName: data.wifiName,
    ip: data.ip ?? ESP32_BASE_URL.replace("http://", ""),
  };
}