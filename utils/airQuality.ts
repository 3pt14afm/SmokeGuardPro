export type AirState = {
  qualityLabel: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";
  pillText: "Normal" | "Caution" | "Danger";
  ringColor: string;
  pillBg: string; // tailwind class
  pillTextColor: string; // tailwind class
};

// ⚠️ Placeholder mapping (adjust later based on your sensor calibration)
export function getAirState(smokeValue: number): AirState {
  if (smokeValue <= 30) {
    return {
      qualityLabel: "EXCELLENT",
      pillText: "Normal",
      ringColor: "#22C55E",
      pillBg: "bg-emerald-100",
      pillTextColor: "text-emerald-800",
    };
  }
  if (smokeValue <= 60) {
    return {
      qualityLabel: "GOOD",
      pillText: "Normal",
      ringColor: "#22C55E",
      pillBg: "bg-emerald-100",
      pillTextColor: "text-emerald-800",
    };
  }
  if (smokeValue <= 100) {
    return {
      qualityLabel: "MODERATE",
      pillText: "Caution",
      ringColor: "#F59E0B",
      pillBg: "bg-amber-100",
      pillTextColor: "text-amber-800",
    };
  }
  return {
    qualityLabel: "POOR",
    pillText: "Danger",
    ringColor: "#EF4444",
    pillBg: "bg-red-100",
    pillTextColor: "text-red-800",
  };
}
