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
};

// Bina sayfasında grup başlığı: "Asansörler (2)"
export const pointTypePluralLabel: Record<PointType, string> = {
  ramp: "Rampalar",
  elevator: "Asansörler",
  toilet: "Engelli tuvaletleri",
  parking: "Engelli otoparkları",
  auto_door: "Otomatik kapılar",
};

// Puan kuralı (docs/saha/puanlama.md); puan veri girişinde hesaplanır, uygulama yalnızca açıklar
export const accessScoreRule: Record<AccessScore, string> = {
  green: "Basamaksız giriş var, bina çok katlıysa çalışan asansör var ve çalışan engelli tuvaleti var.",
  yellow: "Basamaksız giriş var, ama asansör veya engelli tuvaletinden biri eksik ya da arızalı.",
  red: "Basamaksız giriş yok.",
};
