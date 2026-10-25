// İvmeölçerle rampa eğimi (#22). Telefon ekranı yukarı, uzun kenarı rampa yönünde yatırılır
export interface AccelSample {
  x: number;
  y: number;
  z: number;
}

// Telefonun uzun ekseninin yatayla yaptığı açı (radyan). İşaret, telefonun hangi uca eğildiğini gösterir
export function slopeAngle(s: AccelSample): number {
  return Math.atan2(s.y, Math.hypot(s.x, s.z));
}

// Eğim yüzdesi. offset: kalibrasyonda düz zeminde ölçülen açı, her ölçümden çıkarılır
export function slopePercent(s: AccelSample, offset = 0): number {
  return Math.tan(slopeAngle(s) - offset) * 100;
}

// Örneklerin ortalaması (gürültüyü azaltmak için)
export function averageSample(samples: AccelSample[]): AccelSample {
  if (samples.length === 0) throw new Error("averageSample: örnek yok");
  const sum = samples.reduce((a, s) => ({ x: a.x + s.x, y: a.y + s.y, z: a.z + s.z }), { x: 0, y: 0, z: 0 });
  return { x: sum.x / samples.length, y: sum.y / samples.length, z: sum.z / samples.length };
}

// Ölçümlerin medyanı: biri hatalıysa sonucu bozmaz
export function median(values: number[]): number {
  if (values.length === 0) throw new Error("median: değer yok");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, v) => a + v, 0) / values.length;
  return Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length);
}

// Ölçüm süresince açının standart sapması bu değeri (derece) aşarsa telefon hareket etmiş sayılır
export const MAX_STEADY_STD_DEG = 0.3;

export function isSteady(samples: AccelSample[], maxStdDeg = MAX_STEADY_STD_DEG): boolean {
  const angles = samples.map((s) => (slopeAngle(s) * 180) / Math.PI);
  return standardDeviation(angles) <= maxStdDeg;
}

// Ters çevirme yöntemi: aynı noktada telefon 180° döndürülerek iki ölçüm, cihaz hatası birbirini götürür
export function reversalPercent(first: number, reversed: number): number {
  return (first - reversed) / 2;
}

// Şerit metreyle doğrulama: H / L × 100
export function riseRunPercent(riseCm: number, runCm: number): number {
  if (runCm <= 0) throw new Error("riseRunPercent: uzunluk sıfırdan büyük olmalı");
  return (riseCm / runCm) * 100;
}
