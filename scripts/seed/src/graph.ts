// GeoJSON yol çizgilerinden basamaksız yol grafı (#24)

export type LngLat = [number, number]; // GeoJSON sırası: [boylam, enlem]

export interface PathLine {
  coordinates: LngLat[];
  note: string;
  // GeoJSON'daki sırası, hata mesajları için
  index: number;
}

export interface GraphNode {
  key: number;
  lat: number;
  lng: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  lengthM: number;
  coordinates: LngLat[];
  note: string;
}

export const MERGE_RADIUS_M = 3;
export const LINK_RADIUS_M = 10;

const R = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceMeters(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function lineLength(coords: LngLat[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += distanceMeters(coords[i - 1]!, coords[i]!);
  return total;
}

// Kampüs ölçeğinde düzlem yaklaşımı yeterli: noktanın [a, b] doğru parçasına uzaklığı (m)
function distanceToSegment(p: LngLat, a: LngLat, b: LngLat): number {
  const kx = R * rad(1) * Math.cos(rad(p[1]));
  const ky = R * rad(1);
  const ax = (a[0] - p[0]) * kx, ay = (a[1] - p[1]) * ky;
  const bx = (b[0] - p[0]) * kx, by = (b[1] - p[1]) * ky;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

export interface BuiltGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  warnings: string[];
}

// Uçları 3 m içinde olan çizgiler aynı düğümde birleşir
export function buildGraph(lines: PathLine[]): BuiltGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const warnings: string[] = [];

  const nodeAt = (c: LngLat) => {
    const existing = nodes.find((n) => distanceMeters([n.lng, n.lat], c) <= MERGE_RADIUS_M);
    if (existing) return existing.key;
    const node = { key: nodes.length, lng: c[0], lat: c[1] };
    nodes.push(node);
    return node.key;
  };

  for (const line of lines) {
    const label = `çizgi ${line.index + 1}${line.note ? ` ("${line.note}")` : ""}`;
    if (line.coordinates.length < 2) {
      warnings.push(`${label}: en az 2 nokta olmalı, atlandı`);
      continue;
    }
    const from = nodeAt(line.coordinates[0]!);
    const to = nodeAt(line.coordinates.at(-1)!);
    if (from === to) {
      warnings.push(`${label}: iki ucu aynı düğümde (${MERGE_RADIUS_M} m'den kısa ya da kapalı döngü), atlandı`);
      continue;
    }
    if (!line.note) warnings.push(`${label}: note boş (ekran okuyucu açıklaması)`);
    edges.push({ from, to, lengthM: Math.round(lineLength(line.coordinates) * 10) / 10, coordinates: line.coordinates, note: line.note });
  }

  // T kavşak: bir çizginin ucu başka bir çizginin ortasına değiyor ama orada bölünmemiş
  for (const node of nodes) {
    for (const [i, line] of lines.entries()) {
      const c = line.coordinates;
      if (c.length < 2) continue;
      const atEnd = [c[0]!, c.at(-1)!].some((e) => distanceMeters(e, [node.lng, node.lat]) <= MERGE_RADIUS_M);
      if (atEnd) continue;
      for (let j = 1; j < c.length; j++) {
        if (distanceToSegment([node.lng, node.lat], c[j - 1]!, c[j]!) <= MERGE_RADIUS_M) {
          warnings.push(
            `çizgi ${i + 1}: ortasından başka bir çizgi ayrılıyor (${node.lat.toFixed(6)}, ${node.lng.toFixed(6)}). Çizgiyi bu noktada ikiye bölün, yoksa yollar bağlanmaz`,
          );
          break;
        }
      }
    }
  }

  return { nodes, edges, warnings };
}

// Bağlı bileşenler: kenarlar çift yönlü
export function components(nodeCount: number, edges: Pick<GraphEdge, "from" | "to">[]): number[][] {
  const adj = Array.from({ length: nodeCount }, () => [] as number[]);
  for (const e of edges) {
    adj[e.from]!.push(e.to);
    adj[e.to]!.push(e.from);
  }
  const seen = new Array<boolean>(nodeCount).fill(false);
  const result: number[][] = [];
  for (let start = 0; start < nodeCount; start++) {
    if (seen[start]) continue;
    const stack = [start];
    const comp: number[] = [];
    seen[start] = true;
    while (stack.length > 0) {
      const n = stack.pop()!;
      comp.push(n);
      for (const m of adj[n]!) {
        if (!seen[m]) {
          seen[m] = true;
          stack.push(m);
        }
      }
    }
    result.push(comp);
  }
  return result.sort((a, b) => b.length - a.length);
}

export interface Linkable {
  id: string;
  lat: number;
  lng: number;
  buildingSlug: string;
}

// Düğüm, 10 m içindeki en yakın noktaya bağlanır (bina girişi, rampa başı). Bir nokta tek düğüme bağlanır
export function linkPoints(nodes: GraphNode[], points: Linkable[]): Map<number, Linkable> {
  const candidates: { node: number; point: Linkable; d: number }[] = [];
  for (const node of nodes) {
    for (const point of points) {
      const d = distanceMeters([node.lng, node.lat], [point.lng, point.lat]);
      if (d <= LINK_RADIUS_M) candidates.push({ node: node.key, point, d });
    }
  }
  candidates.sort((a, b) => a.d - b.d);
  const links = new Map<number, Linkable>();
  const usedPoints = new Set<string>();
  for (const c of candidates) {
    if (links.has(c.node) || usedPoints.has(c.point.id)) continue;
    links.set(c.node, c.point);
    usedPoints.add(c.point.id);
  }
  return links;
}

export const toWktLine = (coords: LngLat[]) => `LINESTRING(${coords.map(([lng, lat]) => `${lng} ${lat}`).join(", ")})`;
