import { directionsUrl } from "./directions";
import { formatDistance } from "./format";
import { distanceMeters, nearest } from "./geo";

const here = { latitude: 38.0, longitude: 32.5 };
// Kuzeye doğru metre cinsinden uzaklıkta nokta (1° enlem ≈ 111 195 m)
const at = (id: string, metersNorth: number) => ({ id, lat: 38.0 + metersNorth / 111_195, lng: 32.5 });

describe("distanceMeters", () => {
  it("bilinen mesafeyi ±1 m doğrulukla hesaplar", () => {
    // 0,01° enlem farkı = 1111,95 m
    expect(Math.abs(distanceMeters(here, { latitude: 38.01, longitude: 32.5 }) - 1111.95)).toBeLessThan(1);
  });

  it("aynı nokta için sıfırdır", () => {
    expect(distanceMeters(here, here)).toBe(0);
  });
});

describe("nearest", () => {
  const items = [at("uzak", 300), at("yakın", 50), at("orta", 120), at("en uzak", 900)];

  it("boş listede boş döner", () => {
    expect(nearest(here, [])).toEqual([]);
  });

  it("yakından uzağa sıralar, n ile sınırlar ve mesafeyi ekler", () => {
    const result = nearest(here, items, 3);
    expect(result.map((r) => r.id)).toEqual(["yakın", "orta", "uzak"]);
    expect(result[0]!.distance).toBeCloseTo(50, 0);
  });

  it("varsayılan olarak tek sonuç verir", () => {
    expect(nearest(here, items)).toHaveLength(1);
  });
});

describe("directionsUrl", () => {
  it("Google Haritalar yürüyüş tarifi adresi üretir", () => {
    expect(directionsUrl(38.02, 32.51)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=38.02,32.51&travelmode=walking",
    );
  });
});

describe("formatDistance", () => {
  it.each([
    [3, false, "10 metre"],
    [137, false, "140 metre"],
    [137, true, "140 m"],
    [1240, false, "1,2 km"],
  ])("%d m, kısa=%s → %s", (meters, short, text) => {
    expect(formatDistance(meters, short)).toBe(text);
  });
});
