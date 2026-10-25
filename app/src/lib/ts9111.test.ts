import { checkRamp, TS9111, type Ts9111Thresholds } from "./ts9111";

// Sayılar TS 9111 değil, yalnızca mantığı test etmek için uydurma eşikler
const fake: Ts9111Thresholds = {
  slopeLimits: [
    { maxLengthCm: 300, maxSlopePct: 10 },
    { maxLengthCm: 600, maxSlopePct: 8 },
    { maxLengthCm: 900, maxSlopePct: 6 },
  ],
  minWidthCm: 100,
  handrailRules: [{ riseOverCm: 15, minSides: 1 }, { lengthOverCm: 600, minSides: 2 }],
};

const ok = { slopePct: 7, lengthCm: 500, widthCm: 120, handrail: "one" as const };

describe("checkRamp", () => {
  it("eşikler girilmemişse uygunluk bilinmiyor", () => {
    expect(TS9111).toBeNull();
    const result = checkRamp(ok);
    expect(result.compliant).toBeNull();
    expect(result.violations[0]).toContain("henüz girilmedi");
  });

  it("tüm koşullar sağlanınca uygun", () => {
    expect(checkRamp(ok, fake)).toEqual({ compliant: true, violations: [] });
  });

  describe("eğim sınırı", () => {
    it("tam eşikte uygun", () => {
      expect(checkRamp({ ...ok, slopePct: 8 }, fake).compliant).toBe(true);
    });

    it("eşiğin biraz üstünde uygun değil ve mesaj Türkçe", () => {
      const result = checkRamp({ ...ok, slopePct: 8.1 }, fake);
      expect(result.compliant).toBe(false);
      expect(result.violations).toEqual(["Eğim %8,1, bu uzunluk için en fazla %8 olmalı."]);
    });

    it("uzunluk sınırı dahil: 300 cm ilk aralıkta", () => {
      expect(checkRamp({ ...ok, lengthCm: 300, slopePct: 10 }, fake).compliant).toBe(true);
      expect(checkRamp({ ...ok, lengthCm: 301, slopePct: 10 }, fake).compliant).toBe(false);
    });

    it("negatif eğim (aşağı yön) mutlak değerle kontrol edilir", () => {
      expect(checkRamp({ ...ok, slopePct: -9 }, fake).compliant).toBe(false);
    });

    it("tablodaki en uzun aralığı aşan rampa", () => {
      const result = checkRamp({ ...ok, lengthCm: 1000, slopePct: 2, handrail: "both" }, fake);
      expect(result.violations[0]).toContain("eğim sınırı yok");
    });
  });

  it("genişlik: tam eşikte uygun, altında değil", () => {
    expect(checkRamp({ ...ok, widthCm: 100 }, fake).compliant).toBe(true);
    expect(checkRamp({ ...ok, widthCm: 99 }, fake).violations).toEqual(["Genişlik 99 cm, en az 100 cm olmalı."]);
  });

  describe("korkuluk", () => {
    it("yükselme eşiği aşılınca en az bir taraf gerekir", () => {
      // 500 cm × %3 = 15 cm, eşik aşılmadı
      expect(checkRamp({ ...ok, slopePct: 3, handrail: "none" }, fake).compliant).toBe(true);
      // 500 cm × %4 = 20 cm
      expect(checkRamp({ ...ok, slopePct: 4, handrail: "none" }, fake).violations).toEqual([
        "Korkuluk yok, bu rampada en az bir tarafta olmalı.",
      ]);
    });

    it("uzun rampada iki taraf gerekir", () => {
      const result = checkRamp({ slopePct: 5, lengthCm: 700, widthCm: 120, handrail: "one" }, fake);
      expect(result.violations).toEqual(["Korkuluk tek tarafta, bu rampada iki tarafta olmalı."]);
    });
  });

  it("birden fazla ihlali birlikte döner", () => {
    const result = checkRamp({ slopePct: 12, lengthCm: 500, widthCm: 80, handrail: "none" }, fake);
    expect(result.compliant).toBe(false);
    expect(result.violations).toHaveLength(3);
  });
});
