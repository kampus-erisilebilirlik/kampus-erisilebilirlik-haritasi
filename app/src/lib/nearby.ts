import type { LatLng } from "react-native-maps";

import { formatDistance } from "./format";
import { nearest } from "./geo";
import { pointTypeLabel } from "./labels";
import { floorLabel } from "./points";
import type { Building, Point, PointType } from "./schemas";

export type Nearby = Point & { distance: number };

export type NearbyResult =
  { kind: "found"; type: PointType; items: Nearby[] } | { kind: "none"; type: PointType; nearestBroken: Nearby | null };

export const NEARBY_COUNT = 3;

// "Bana en yakın" (#17): seçilen türde arızalı olmayan en yakın noktalar; hiç yoksa en yakın arızalı da söylenir
export function findNearby(points: Point[], type: PointType, from: LatLng, n = NEARBY_COUNT): NearbyResult {
  const ofType = points.filter((p) => p.type === type);
  const items = nearest(
    from,
    ofType.filter((p) => p.status !== "broken"),
    n,
  );
  if (items.length > 0) return { kind: "found", type, items };
  return { kind: "none", type, nearestBroken: nearest(from, ofType, 1)[0] ?? null };
}

export const typeName = (type: PointType) => pointTypeLabel[type].toLocaleLowerCase("tr-TR");

function place(point: Point, buildings: Building[]): string {
  const building = buildings.find((b) => b.id === point.building_id)?.name;
  return [point.name, building, floorLabel(point.floor)?.toLocaleLowerCase("tr-TR")].filter(Boolean).join(", ");
}

// "En yakın asansör: Kütüphane asansörü, Merkezi Kütüphane, zemin kat, 140 metre"
export function nearbyAnnouncement(result: NearbyResult, buildings: Building[]): string {
  const name = typeName(result.type);
  if (result.kind === "found") {
    const first = result.items[0]!;
    return `En yakın ${name}: ${place(first, buildings)}, ${formatDistance(first.distance)}`;
  }
  const broken = result.nearestBroken;
  return broken
    ? `Yakında çalışan ${name} yok. En yakın arızalı: ${place(broken, buildings)}, ${formatDistance(broken.distance)}`
    : `Kayıtlı ${name} yok.`;
}
