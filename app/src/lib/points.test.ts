import {
  countByType,
  facilitySummary,
  floorLabel,
  groupByBuilding,
  pointA11yLabel,
  pointSubtitle,
  sortPoints,
} from "./points";
import type { Building, Point } from "./schemas";

const building = (id: string, name: string): Building => ({
  id,
  slug: id,
  name,
  summary: "",
  score: "green",
  lat: 38.02,
  lng: 32.51,
  updated_at: "2026-10-01T00:00:00Z",
});

const point = (id: string, overrides: Partial<Point> = {}): Point => ({
  id,
  building_id: null,
  type: "ramp",
  name: id,
  status: "working",
  floor: null,
  lat: 38.02,
  lng: 32.51,
  photo_path: null,
  verbal_directions: "",
  ramp_slope_pct: null,
  ramp_width_cm: null,
  ramp_has_handrail: null,
  has_tactile_paving: null,
  ts9111_compliant: null,
  updated_at: "2026-10-01T00:00:00Z",
  ...overrides,
});

describe("groupByBuilding", () => {
  it("binaları ada göre sıralar, bina dışı noktaları sona koyar", () => {
    const buildings = [building("b2", "Rektörlük"), building("b1", "Çevre Mühendisliği")];
    const points = [
      point("dış", { type: "parking" }),
      point("p1", { building_id: "b1" }),
      point("p2", { building_id: "b2" }),
      point("bilinmeyen", { building_id: "silinmiş" }),
    ];
    const sections = groupByBuilding(buildings, points);
    expect(sections.map((s) => s.building?.name ?? null)).toEqual(["Çevre Mühendisliği", "Rektörlük", null]);
    expect(sections[2]?.data.map((p) => p.id)).toEqual(["bilinmeyen", "dış"]);
  });

  it("noktası olmayan binayı boş bölüm olarak tutar", () => {
    const sections = groupByBuilding([building("b1", "Kütüphane")], []);
    expect(sections).toEqual([{ key: "b1", building: expect.objectContaining({ id: "b1" }), data: [] }]);
  });
});

describe("sortPoints", () => {
  it("önce türe, sonra Türkçe ada göre sıralar", () => {
    const sorted = sortPoints([
      point("a", { type: "toilet", name: "A" }),
      point("b", { type: "ramp", name: "Şadırvan" }),
      point("c", { type: "ramp", name: "Çarşı" }),
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["c", "b", "a"]);
  });
});

describe("facilitySummary", () => {
  it("türleri sayıyla ve küçük harfle yazar", () => {
    const points = [point("1"), point("2"), point("3", { type: "elevator" })];
    expect(countByType(points)).toEqual([
      { type: "ramp", count: 2 },
      { type: "elevator", count: 1 },
    ]);
    expect(facilitySummary(points)).toBe("2 rampa, 1 asansör");
  });

  it("boş listede boş metin döner", () => {
    expect(facilitySummary([])).toBe("");
  });
});

describe("floorLabel", () => {
  it.each([
    [null, null],
    [0, "Zemin kat"],
    [2, "2. kat"],
    [-1, "-1. kat"],
  ])("%s → %s", (floor, label) => {
    expect(floorLabel(floor)).toBe(label);
  });
});

describe("pointA11yLabel", () => {
  it("bilinmeyen bina ve katı atlar", () => {
    expect(pointA11yLabel(point("p", { name: "Ana giriş", status: "broken" }))).toBe(
      "Rampa, Ana giriş, Durum: Arızalı",
    );
  });

  it("tür, ad, bina, kat ve durumu okur", () => {
    expect(pointA11yLabel(point("p", { name: "Ana giriş", floor: 0 }), "Teknoloji Fakültesi")).toBe(
      "Rampa, Ana giriş, Teknoloji Fakültesi, Zemin kat, Durum: Çalışıyor",
    );
  });
});

describe("pointSubtitle", () => {
  it("tür, bina ve katı noktayla ayırır", () => {
    expect(pointSubtitle(point("p", { floor: 1 }), "Kütüphane")).toBe("Rampa · Kütüphane · 1. kat");
    expect(pointSubtitle(point("p"))).toBe("Rampa");
  });
});
