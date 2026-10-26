import { rampViolations } from "./ramp";
import type { Point } from "./schemas";
import type { Ts9111Thresholds } from "./ts9111";

// Gerçek eşikler #21'de standarttan girilecek; burada yalnızca bağlantı sınanıyor
const thresholds: Ts9111Thresholds = {
  slopeLimits: [{ maxLengthCm: null, maxSlopePct: 8 }],
  minWidthCm: 120,
  handrailRules: [{ minSides: 2 }],
};

const ramp = {
  type: "ramp",
  ramp_slope_pct: 11,
  ramp_width_cm: 100,
  ramp_has_handrail: true,
  ramp_length_cm: 600,
  ramp_handrail_sides: 1,
} as Point;

describe("rampViolations", () => {
  it("aşılan kuralları yazar", () => {
    expect(rampViolations(ramp, thresholds)).toEqual([
      "Eğim %11, bu uzunluk için en fazla %8 olmalı.",
      "Genişlik 100 cm, en az 120 cm olmalı.",
      "Korkuluk tek tarafta, bu rampada iki tarafta olmalı.",
    ]);
  });

  it("eşikler girilmemişse boş döner", () => {
    expect(rampViolations(ramp, null)).toEqual([]);
  });

  it("uzunluk ya da korkuluk taraf sayısı bilinmiyorsa boş döner", () => {
    expect(rampViolations({ ...ramp, ramp_length_cm: undefined }, thresholds)).toEqual([]);
    expect(rampViolations({ ...ramp, ramp_handrail_sides: null }, thresholds)).toEqual([]);
  });

  it("korkuluk yoksa taraf sayısı olmadan da denetler", () => {
    const violations = rampViolations({ ...ramp, ramp_handrail_sides: null, ramp_has_handrail: false }, thresholds);
    expect(violations).toContain("Korkuluk yok, bu rampada iki tarafta olmalı.");
  });
});
