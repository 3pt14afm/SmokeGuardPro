import { getEsp32BaseUrl } from "@/services/deviceConfig";
import { Esp32Status } from "@/types/dashboard";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = await getEsp32BaseUrl();
  const url = `${baseUrl}${path}`;

  console.log("ESP32 request:", options?.method ?? "GET", url);

  const response = await fetch(url, options);

  const rawText = await response.text();

  console.log("ESP32 response status:", response.status);
  console.log("ESP32 raw response:", rawText);

  if (!response.ok) {
    throw new Error(`ESP32 request failed: ${response.status} ${rawText}`.trim());
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return rawText as T;
  }
}

export async function getEsp32Status(): Promise<Esp32Status> {
  const data = await request<Partial<Esp32Status>>("/status");

  return {
    mode: data.mode ?? "AUTO",
    sensor: data.sensor ?? "NORMAL",
    relay: data.relay ?? "OFF",
    fanOn: data.fanOn ?? false,
    smokeValue: data.smokeValue ?? 0,
    gasValue: data.gasValue ?? 0,
    threshold: data.threshold ?? 1800,
    ip: data.ip,
    wifiName: data.wifiName,
    connected: true,
  };
}

export async function sendFanToEsp32(turnOn: boolean) {
  return request<{ ok: boolean }>(
    `/fan?value=${encodeURIComponent(turnOn ? "true" : "false")}`
  );
}

export async function sendModeToEsp32(mode: "AUTO" | "MANUAL") {
  return request<{ ok: boolean }>(
    `/mode?value=${encodeURIComponent(mode)}`
  );
}

export async function sendThresholdToEsp32(threshold: number) {
  return request<{ ok: boolean }>(
    `/threshold?value=${encodeURIComponent(String(threshold))}`
  );
}