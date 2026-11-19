import { findNearby, nearbyAnnouncement } from "./nearby";
import type { Building, Point } from "./schemas";

const here = { latitude: 38.0, longitude: 32.5 };
const building = { id: "b1", name: "Merkezi Kütüphane" } as Building;

const point = (id: string, metersNorth: number, status: Point["status"], type: Point["type"] = "elevator") =>
  ({
    id,
    type,
    status,
    name: id,
    building_id: "b1",
    floor: 0,
    lat: 38.0 + metersNorth / 111_195,
    lng: 32.5,
  }) as Point;

describe("findNearby", () => {
  it("arızalıları ve başka türleri atlar, en yakın 3 sonucu verir", () => {
    const points = [
      point("arızalı", 10, "broken"),
      point("rampa", 20, "working", "ramp"),
      point("a", 300, "working"),
      point("b", 140, "unknown"),
      point("c", 200, "working"),
      point("d", 900, "working"),
    ];
    const result = findNearby(points, "elevator", here);
    expect(result.kind).toBe("found");
    if (result.kind !== "found") return;
    expect(result.items.map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("hepsi arızalıysa en yakın arızalıyı söyler", () => {
    const result = findNearby([point("uzak", 500, "broken"), point("yakın", 90, "broken")], "elevator", here);
    expect(result).toMatchObject({ kind: "none", nearestBroken: { id: "yakın" } });
  });
});

describe("nearbyAnnouncement", () => {
  it("ilk sonucu bina, kat ve mesafeyle okur", () => {
    const result = findNearby([point("Kütüphane asansörü", 137, "working")], "elevator", here);
    expect(nearbyAnnouncement(result, [building])).toBe(
      "En yakın asansör: Kütüphane asansörü, Merkezi Kütüphane, zemin kat, 140 metre",
    );
  });

  it("çalışan yoksa bunu ve en yakın arızalıyı söyler", () => {
    const result = findNearby([point("Arka asansör", 300, "broken")], "elevator", here);
    expect(nearbyAnnouncement(result, [building])).toBe(
      "Yakında çalışan asansör yok. En yakın arızalı: Arka asansör, Merkezi Kütüphane, zemin kat, 300 metre",
    );
  });

  it("o türde hiç kayıt yoksa bunu söyler", () => {
    expect(nearbyAnnouncement(findNearby([], "toilet", here), [])).toBe("Kayıtlı engelli tuvaleti yok.");
  });
});
