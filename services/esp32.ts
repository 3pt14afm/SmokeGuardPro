import { Mode, Esp32Status } from "@/types/dashboard";

const ESP32_BASE_URL = "http://192.168.10.145";
const REQUEST_TIMEOUT_MS = 4000;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function postForm(path: string, value: string | number | boolean) {
  const res = await fetchWithTimeout(`${ESP32_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `value=${encodeURIComponent(String(value))}`,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return res.json();
}

export async function sendModeToEsp32(mode: Mode) {
  return postForm("/mode", mode);
}

export async function sendFanToEsp32(fanOn: boolean) {
  return postForm("/fan", fanOn);
}

export async function sendThresholdToEsp32(value: number) {
  const safeValue = Math.max(0, Math.min(4095, Math.round(value)));
  return postForm("/threshold", safeValue);
}

export async function getEsp32Status(): Promise<Esp32Status> {
  const res = await fetchWithTimeout(`${ESP32_BASE_URL}/status`);

  if (!res.ok) {
    throw new Error("Failed to fetch ESP32 status");
  }

  const data = await res.json();

  return {
    mode: data.mode === "MANUAL" ? "MANUAL" : "AUTO",
    sensor: data.sensor === "DETECTED" ? "DETECTED" : "NORMAL",
    relay: data.relay === "ON" ? "ON" : "OFF",
    fanOn: Boolean(data.fanOn),
    smokeValue: typeof data.smokeValue === "number" ? data.smokeValue : 0,
    gasValue: typeof data.gasValue === "number" ? data.gasValue : 0,
    threshold: typeof data.threshold === "number" ? data.threshold : 1800,
    connected: true,
    wifiName: data.wifiName,
    ip: data.ip ?? ESP32_BASE_URL.replace("http://", ""),
  };
}