import type { Building, PathEdge, PathNode, Point } from "../schemas";
import { FAR_MESSAGE, planRoute, routeSummary, stepText } from "./route";

// Enlemde 1 m ≈ 1/111 195 derece; düğümler kuzeye doğru dizilir
const north = (m: number) => 38.0 + m / 111_195;
const node = (id: string, m: number, extra: Partial<PathNode> = {}): PathNode => ({
  id,
  building_id: null,
  point_id: null,
  lat: north(m),
  lng: 32.5,
  ...extra,
});
const edge = (from: string, to: string, length_m: number, note = ""): PathEdge => ({
  id: `${from}-${to}`,
  from_node: from,
  to_node: to,
  length_m,
  note,
});

// giris(0) ── a(100) ── b(220) ── asansor(260)
//   Yaya yolu 100 + 120, rampa 40
const nodes = [
  node("giris", 0, { building_id: "teknoloji" }),
  node("a", 100),
  node("b", 220),
  node("asansor", 260, { point_id: "p-asansor" }),
  node("ada", 5000), // ağa bağlı olmayan düğüm
];
const edges = [
  edge("giris", "a", 100, "Kütüphane önündeki yaya yolu boyunca"),
  edge("a", "b", 120, "Kütüphane önündeki yaya yolu boyunca"),
  edge("b", "asansor", 40, "Teknoloji Fakültesi rampasına"),
];
const target = { id: "p-asansor", lat: north(262), lng: 32.5 } as Point;
const here = (m: number) => ({ kind: "location" as const, location: { latitude: north(m), longitude: 32.5 } });

describe("planRoute", () => {
  it("konuma en yakın düğümden hedef noktanın düğümüne rota verir", () => {
    const route = planRoute(nodes, edges, target, here(-20));
    expect(route).toMatchObject({ kind: "found", distanceM: 260, durationMin: 5 });
    if (route.kind !== "found") return;
    expect(route.coordinates).toHaveLength(4);
    expect(route.steps).toEqual([
      { note: "Kütüphane önündeki yaya yolu boyunca", distanceM: 220 },
      { note: "Teknoloji Fakültesi rampasına", distanceM: 40 },
    ]);
  });

  it("en yakın düğüm 150 m'den uzaksa yol ağının dışında sayar", () => {
    expect(planRoute(nodes, edges, target, here(-200))).toMatchObject({ kind: "far" });
    expect(FAR_MESSAGE).toContain("Google Haritalar");
  });

  it("konum yoksa seçilen binanın giriş düğümünden başlar", () => {
    const building = { id: "teknoloji", lat: north(0), lng: 32.5 } as Building;
    expect(planRoute(nodes, edges, target, { kind: "building", building })).toMatchObject({
      kind: "found",
      distanceM: 260,
    });
  });

  it("binanın düğümü yoksa başlangıç bulunamaz", () => {
    const building = { id: "rektorluk", lat: north(0), lng: 32.5 } as Building;
    expect(planRoute(nodes, edges, target, { kind: "building", building })).toEqual({ kind: "no-start" });
  });

  it("nokta ağa bağlı değilse ona en yakın düğüme gider", () => {
    const toilet = { id: "p-tuvalet", lat: north(215), lng: 32.5 } as Point;
    expect(planRoute(nodes, edges, toilet, here(0))).toMatchObject({ kind: "found", distanceM: 220 });
  });

  it("ağın ayrı parçasındaki hedefe rota yok", () => {
    const island = { id: "p-ada", lat: north(5000), lng: 32.5 } as Point;
    expect(planRoute(nodes, edges, island, here(0))).toEqual({ kind: "no-route" });
  });

  it("yol ağı boşsa başlangıç bulunamaz", () => {
    expect(planRoute([], [], target, here(0))).toEqual({ kind: "no-start" });
  });

  it("başlangıç hedefin düğümüyse tek düğümlük rota", () => {
    expect(planRoute(nodes, edges, target, here(258))).toMatchObject({ kind: "found", distanceM: 0, steps: [] });
  });
});

describe("metinler", () => {
  it("adım ve özet metni", () => {
    expect(stepText({ note: "Teknoloji Fakültesi rampasına", distanceM: 40 })).toBe(
      "Teknoloji Fakültesi rampasına, 40 metre",
    );
    expect(stepText({ note: " ", distanceM: 123 })).toBe("Yol boyunca, 120 metre");
    expect(routeSummary({ distanceM: 260, durationMin: 5 })).toBe("Yaklaşık 260 metre, yaklaşık 5 dakika");
  });
});
