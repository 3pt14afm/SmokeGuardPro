export function getSensitivityLabel(threshold: number) {
  if (threshold <= 30) return "VERY SENSITIVE";
  if (threshold <= 60) return "STANDARD";
  return "LESS SENSITIVE";
}
