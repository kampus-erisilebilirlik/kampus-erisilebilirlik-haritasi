import {
  averageSample,
  isSteady,
  median,
  reversalPercent,
  riseRunPercent,
  slopeAngle,
  slopePercent,
  type AccelSample,
} from "./slope";

// θ derecelik eğimde, ekranı yukarı bakan telefonun yerçekimi bileşenleri
const tilted = (deg: number): AccelSample => {
  const rad = (deg * Math.PI) / 180;
  return { x: 0, y: Math.sin(rad), z: Math.cos(rad) };
};

describe("slopePercent", () => {
  it("düz zeminde %0", () => {
    expect(slopePercent({ x: 0, y: 0, z: 1 })).toBeCloseTo(0, 5);
  });

  it("45° → %100", () => {
    expect(slopePercent(tilted(45))).toBeCloseTo(100, 5);
  });

  it("4.57° → yaklaşık %8", () => {
    expect(Math.abs(slopePercent(tilted(4.57)) - 8)).toBeLessThan(0.1);
  });

  it("x ekseni (yan eğim) uzun eksendeki eğimi değiştirmez", () => {
    const along = (5 * Math.PI) / 180;
    const side = (10 * Math.PI) / 180;
    const sample = { x: Math.cos(along) * Math.sin(side), y: Math.sin(along), z: Math.cos(along) * Math.cos(side) };
    expect(slopePercent(sample)).toBeCloseTo(Math.tan(along) * 100, 5);
  });

  it("kalibrasyon offset'ini çıkarır", () => {
    const offset = slopeAngle(tilted(0.5));
    expect(slopePercent(tilted(0.5), offset)).toBeCloseTo(0, 5);
    expect(slopePercent(tilted(5.5), offset)).toBeCloseTo(Math.tan((5 * Math.PI) / 180) * 100, 5);
  });

  it("ters yöne eğimde negatif", () => {
    expect(slopePercent(tilted(-4.57))).toBeLessThan(0);
  });
});

describe("averageSample", () => {
  it("eksen eksen ortalar", () => {
    expect(averageSample([{ x: 0, y: 0.1, z: 1 }, { x: 0.2, y: 0.3, z: 0.9 }])).toEqual({ x: 0.1, y: 0.2, z: 0.95 });
  });

  it("boş listede hata verir", () => {
    expect(() => averageSample([])).toThrow();
  });
});

describe("median", () => {
  it("tek sayıda değer", () => {
    expect(median([8.1, 7.8, 7.9])).toBe(7.9);
  });

  it("hatalı tek ölçümden etkilenmez", () => {
    expect(median([7.8, 25, 7.9])).toBe(7.9);
  });

  it("çift sayıda değer: ortadaki ikisinin ortalaması", () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("girdi dizisini değiştirmez", () => {
    const values = [3, 1, 2];
    median(values);
    expect(values).toEqual([3, 1, 2]);
  });
});

describe("isSteady", () => {
  it("sabit telefonda true", () => {
    expect(isSteady(Array.from({ length: 50 }, () => tilted(4)))).toBe(true);
  });

  it("sallanan telefonda false", () => {
    expect(isSteady(Array.from({ length: 50 }, (_, i) => tilted(i % 2 === 0 ? 3 : 5)))).toBe(false);
  });
});

describe("doğrulama yardımcıları", () => {
  it("ters çevirme: cihaz hatası iptal olur", () => {
    // gerçek %8, cihaz +0.4 hatalı: 8.4 ve ters yönde -7.6
    expect(reversalPercent(8.4, -7.6)).toBeCloseTo(8, 5);
  });

  it("H/L", () => {
    expect(riseRunPercent(45, 600)).toBeCloseTo(7.5, 5);
    expect(() => riseRunPercent(45, 0)).toThrow();
  });
});
