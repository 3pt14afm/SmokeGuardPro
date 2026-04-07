import AsyncStorage from "@react-native-async-storage/async-storage";

const ESP32_IP_KEY = "settings:esp32Ip";
const DEFAULT_ESP32_IP = "192.168.10.145";

export function normalizeEsp32Ip(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function isValidIpv4(ip: string) {
  const normalized = normalizeEsp32Ip(ip);

  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

  return ipv4Regex.test(normalized);
}

export async function getEsp32Ip(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(ESP32_IP_KEY);
    console.log("Saved ESP32 IP raw:", raw);

    if (!raw) {
      console.log("No saved IP. Using default:", DEFAULT_ESP32_IP);
      return DEFAULT_ESP32_IP;
    }

    const parsed = JSON.parse(raw);

    if (typeof parsed !== "string") {
      console.log("Saved IP is invalid type. Using default:", DEFAULT_ESP32_IP);
      return DEFAULT_ESP32_IP;
    }

    const normalized = normalizeEsp32Ip(parsed);

    if (!normalized) {
      console.log("Saved IP is empty after normalize. Using default:", DEFAULT_ESP32_IP);
      return DEFAULT_ESP32_IP;
    }

    console.log("Using saved ESP32 IP:", normalized);
    return normalized;
  } catch (error) {
    console.log("Failed to read saved ESP32 IP. Using default:", error);
    return DEFAULT_ESP32_IP;
  }
}

// export async function getEsp32Ip(): Promise<string> {
//   return DEFAULT_ESP32_IP;
// }

export async function setEsp32Ip(ip: string): Promise<string> {
  const normalized = normalizeEsp32Ip(ip);

  if (!isValidIpv4(normalized)) {
    throw new Error("Invalid IPv4 address");
  }

  await AsyncStorage.setItem(ESP32_IP_KEY, JSON.stringify(normalized));
  console.log("Saved ESP32 IP:", normalized);
  return normalized;
}

export async function clearEsp32Ip() {
  await AsyncStorage.removeItem(ESP32_IP_KEY);
  console.log("Cleared saved ESP32 IP");
}

export async function getEsp32BaseUrl(): Promise<string> {
  const ip = await getEsp32Ip();
  const url = `http://${ip}`;
  console.log("Using ESP32 base URL:", url);
  return url;
}