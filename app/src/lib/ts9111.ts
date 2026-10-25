// TS 9111 rampa kontrolü (#22, #15, #8). Eşikler docs/saha/ts9111.md'den, standardın metninden madde numarasıyla gelir
export type Handrail = "both" | "one" | "none";

export interface SlopeLimit {
  // Bu uzunluğa kadar (dahil) geçerli. null: üst sınır yok
  maxLengthCm: number | null;
  maxSlopePct: number;
}

export interface HandrailRule {
  // Koşullardan biri sağlanırsa kural uygulanır; ikisi de verilmezse her rampada uygulanır
  lengthOverCm?: number;
  riseOverCm?: number;
  minSides: 1 | 2;
}

export interface Ts9111Thresholds {
  // Uzunluğa göre artan sırada
  slopeLimits: SlopeLimit[];
  minWidthCm: number;
  handrailRules: HandrailRule[];
}

// ⚠️ Bilerek boş: değerler standarttan doğrulanmadan girilmez (docs/saha/ts9111.md). Doldurulunca sınır testleri eklenir
export const TS9111: Ts9111Thresholds | null = null;

export interface RampInput {
  slopePct: number;
  lengthCm: number;
  widthCm: number;
  handrail: Handrail;
  // Şerit metreyle ölçülen toplam yükselme; yoksa eğim × uzunluktan hesaplanır
  riseCm?: number;
}

export interface RampCheck {
  // null: eşikler henüz girilmedi, uygunluk bilinmiyor
  compliant: boolean | null;
  violations: string[];
}

const sideCount: Record<Handrail, number> = { both: 2, one: 1, none: 0 };

const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 1 });

export function checkRamp(input: RampInput, thresholds: Ts9111Thresholds | null = TS9111): RampCheck {
  if (!thresholds) {
    return { compliant: null, violations: ["TS 9111 eşik değerleri henüz girilmedi, uygunluk hesaplanamıyor."] };
  }
  const violations: string[] = [];
  const slope = Math.abs(input.slopePct);

  const limit = thresholds.slopeLimits.find((l) => l.maxLengthCm === null || input.lengthCm <= l.maxLengthCm);
  if (!limit) {
    violations.push(`Rampa uzunluğu ${fmt(input.lengthCm)} cm, standartta bu uzunluk için eğim sınırı yok (ara sahanlık gerekir).`);
  } else if (slope > limit.maxSlopePct) {
    violations.push(`Eğim %${fmt(slope)}, bu uzunluk için en fazla %${fmt(limit.maxSlopePct)} olmalı.`);
  }

  if (input.widthCm < thresholds.minWidthCm) {
    violations.push(`Genişlik ${fmt(input.widthCm)} cm, en az ${fmt(thresholds.minWidthCm)} cm olmalı.`);
  }

  const riseCm = input.riseCm ?? (input.lengthCm * slope) / 100;
  const required = thresholds.handrailRules
    .filter((r) => {
      const hasCondition = r.lengthOverCm !== undefined || r.riseOverCm !== undefined;
      return (
        !hasCondition ||
        (r.lengthOverCm !== undefined && input.lengthCm > r.lengthOverCm) ||
        (r.riseOverCm !== undefined && riseCm > r.riseOverCm)
      );
    })
    .reduce((max, r) => Math.max(max, r.minSides), 0);
  if (sideCount[input.handrail] < required) {
    const need = required === 2 ? "iki tarafta" : "en az bir tarafta";
    const have = input.handrail === "none" ? "yok" : "tek tarafta";
    violations.push(`Korkuluk ${have}, bu rampada ${need} olmalı.`);
  }

  return { compliant: violations.length === 0, violations };
}
