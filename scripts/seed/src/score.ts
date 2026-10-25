import type { BuildingRow, PointRecord } from "./rows";

// docs/saha/puanlama.md
export type Score = "green" | "yellow" | "red";

export function buildingScore(building: BuildingRow, points: PointRecord[]): Score {
  if (building.puan_elle) return building.puan_elle;
  if (building.basamaksiz_giris !== "evet") return "red";
  const working = (type: PointRecord["type"]) => points.some((p) => p.type === type && p.status === "working");
  if (building.kat_sayisi > 1 && !working("elevator")) return "yellow";
  if (!working("toilet")) return "yellow";
  return "green";
}
