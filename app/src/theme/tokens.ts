import type { AccessScore, PointStatus } from "@/lib/schemas";

// Geçici değerler: Figma (#11) tamamlanınca güncellenecek. Tüm metin/zemin çiftleri WCAG AA (4.5:1),
// kenarlık (anahtarın kapalı izi, çip ve düğme sınırı) 3:1 (WCAG 1.4.11) üstünde; tokens.test.ts denetler
export type Palette = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  border: string;
  focus: string;
  status: Record<PointStatus, string>;
  score: Record<AccessScore, string>;
};

const normal: Palette = {
  background: "#FFFFFF",
  surface: "#F3F5F8",
  text: "#1A1C1E",
  textMuted: "#4A5058",
  primary: "#0B57D0",
  onPrimary: "#FFFFFF",
  border: "#80868F",
  focus: "#0B57D0",
  status: { working: "#1B6E33", broken: "#B3261E", unknown: "#4A5058" },
  score: { green: "#1B6E33", yellow: "#8A5300", red: "#B3261E", unknown: "#4A5058" },
};

const highContrast: Palette = {
  background: "#000000",
  surface: "#121212",
  text: "#FFFFFF",
  textMuted: "#E0E0E0",
  primary: "#FFD60A",
  onPrimary: "#000000",
  border: "#FFFFFF",
  focus: "#FFD60A",
  status: { working: "#5CE08A", broken: "#FF8A80", unknown: "#E0E0E0" },
  score: { green: "#5CE08A", yellow: "#FFD60A", red: "#FF8A80", unknown: "#E0E0E0" },
};

export const palettes = { normal, highContrast };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 12 } as const;

// Android'de önerilen en küçük dokunma alanı
export const minTouchSize = 48;

export const typography = {
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700" },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
} as const;

export type TextRole = keyof typeof typography;

export type Theme = {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  highContrast: boolean;
};
