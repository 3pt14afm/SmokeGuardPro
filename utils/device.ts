export function getSensitivityLabel(threshold: number) {
  if (threshold <= 30) return "VERY SENSITIVE";
  if (threshold <= 60) return "STANDARD";
  return "LESS SENSITIVE";
}


export function mapRawThresholdToUi(raw: number) {
  const clamped = Math.max(500, Math.min(3500, raw));
  const ui = Math.round(((clamped - 500) / (3500 - 500)) * 120);
  return Math.max(1, Math.min(120, ui));
}

export function mapUiThresholdToRaw(ui: number) {
  const clamped = Math.max(1, Math.min(120, ui));
  return Math.round(500 + (clamped / 120) * (3500 - 500));
}