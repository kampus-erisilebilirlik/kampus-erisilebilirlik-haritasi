import type { AccessScore, PointStatus, PointType } from "./schemas";

export const pointStatusLabel: Record<PointStatus, string> = {
  working: "Çalışıyor",
  broken: "Arızalı",
  unknown: "Durumu bilinmiyor",
};

export const pointTypeLabel: Record<PointType, string> = {
  ramp: "Rampa",
  elevator: "Asansör",
  toilet: "Engelli tuvaleti",
  parking: "Engelli otoparkı",
  auto_door: "Otomatik kapı",
};

export const accessScoreLabel: Record<AccessScore, string> = {
  green: "Erişilebilir",
  yellow: "Kısmen erişilebilir",
  red: "Erişilebilir değil",
  unknown: "Henüz ölçülmedi",
};
