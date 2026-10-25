import { pointStatusLabel, pointTypeLabel } from "./labels";
import { pointTypeSchema, type Building, type Point, type PointType } from "./schemas";

const collator = new Intl.Collator("tr-TR");

const typeOrder = new Map(pointTypeSchema.options.map((type, i) => [type, i]));

// Önce tür (rampa, asansör, …), sonra ad
export function sortPoints(points: Point[]): Point[] {
  return [...points].sort(
    (a, b) => typeOrder.get(a.type)! - typeOrder.get(b.type)! || collator.compare(a.name, b.name),
  );
}

export type BuildingSection = {
  key: string;
  // null: binaya bağlı olmayan noktalar (açık otopark, dış rampa vb.)
  building: Building | null;
  data: Point[];
};

// Liste görünümü: binalar ada göre, bina dışı noktalar en sonda
export function groupByBuilding(buildings: Building[], points: Point[]): BuildingSection[] {
  const byBuilding = new Map<string, Point[]>(buildings.map((b) => [b.id, []]));
  const outdoor: Point[] = [];
  for (const point of points) {
    const list = point.building_id ? byBuilding.get(point.building_id) : undefined;
    if (list) list.push(point);
    else outdoor.push(point);
  }
  const sections: BuildingSection[] = [...buildings]
    .sort((a, b) => collator.compare(a.name, b.name))
    .map((building) => ({ key: building.id, building, data: sortPoints(byBuilding.get(building.id)!) }));
  if (outdoor.length > 0) sections.push({ key: "outdoor", building: null, data: sortPoints(outdoor) });
  return sections;
}

export function countByType(points: Point[]): { type: PointType; count: number }[] {
  return pointTypeSchema.options
    .map((type) => ({ type, count: points.filter((p) => p.type === type).length }))
    .filter(({ count }) => count > 0);
}

// "2 rampa, 1 asansör"; boş liste için boş metin
export function facilitySummary(points: Point[]): string {
  return countByType(points)
    .map(({ type, count }) => `${count} ${pointTypeLabel[type].toLocaleLowerCase("tr-TR")}`)
    .join(", ");
}

// "Zemin kat", "1. kat", "-1. kat" (#15)
export function floorLabel(floor: number | null): string | null {
  if (floor === null) return null;
  if (floor === 0) return "Zemin kat";
  return `${floor}. kat`;
}

// "Rampa · Teknoloji Fakültesi · Zemin kat": liste satırı ve kartta tür, bina ve kat
export function pointSubtitle(point: Point, buildingName?: string): string {
  return [pointTypeLabel[point.type], buildingName, floorLabel(point.floor)].filter(Boolean).join(" · ");
}

// "Rampa, Ana giriş rampası, Teknoloji Fakültesi, Zemin kat, Durum: Çalışıyor"
export function pointA11yLabel(point: Point, buildingName?: string): string {
  return [
    pointTypeLabel[point.type],
    point.name,
    buildingName,
    floorLabel(point.floor),
    `Durum: ${pointStatusLabel[point.status]}`,
  ]
    .filter(Boolean)
    .join(", ");
}
