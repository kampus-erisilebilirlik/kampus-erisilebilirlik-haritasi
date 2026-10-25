const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

// "25 Ekim 2026"
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatNumber(value: number): string {
  return value.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

// Yok / var / bilinmiyor: veri girilmemiş alan "yok" diye gösterilmez
export function yesNo(value: boolean | null): string {
  if (value === null) return "Bilinmiyor";
  return value ? "Var" : "Yok";
}
