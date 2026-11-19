const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

// "25 Ekim 2026"
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatNumber(value: number): string {
  return value.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

// Kuş uçuşu mesafe, 10 metreye yuvarlanır: "140 metre" (ekran okuyucu), short ile "140 m" (liste satırı)
export function formatDistance(meters: number, short = false): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} ${short ? "m" : "metre"}`;
  return `${formatNumber(meters / 1000)} km`;
}

// Yok / var / bilinmiyor: veri girilmemiş alan "yok" diye gösterilmez
export function yesNo(value: boolean | null): string {
  if (value === null) return "Bilinmiyor";
  return value ? "Var" : "Yok";
}
