import { palettes, type Palette } from "./tokens";

// WCAG 2.1 göreli parlaklık ve kontrast oranı
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

// Metin olarak kullanılan renkler: düz metin, ikincil metin, bağlantı/düğme, durum ve puan rozetleri
const textColors = (p: Palette) => ({
  text: p.text,
  textMuted: p.textMuted,
  primary: p.primary,
  ...Object.fromEntries(Object.entries(p.status).map(([k, v]) => [`status.${k}`, v])),
  ...Object.fromEntries(Object.entries(p.score).map(([k, v]) => [`score.${k}`, v])),
});

describe.each(Object.entries(palettes))("%s palet", (_name, palette) => {
  const grounds = { background: palette.background, surface: palette.surface };

  it.each(Object.entries(textColors(palette)))("%s zeminlerde en az 4.5:1 (WCAG 1.4.3)", (_key, color) => {
    for (const ground of Object.values(grounds)) {
      expect(contrastRatio(color, ground)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("birincil düğme metni en az 4.5:1", () => {
    expect(contrastRatio(palette.onPrimary, palette.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it("kenarlık zeminlerde en az 3:1 (WCAG 1.4.11)", () => {
    for (const ground of Object.values(grounds)) {
      expect(contrastRatio(palette.border, ground)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("contrastRatio", () => {
  it("siyah-beyaz için 21:1 verir", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });
});
