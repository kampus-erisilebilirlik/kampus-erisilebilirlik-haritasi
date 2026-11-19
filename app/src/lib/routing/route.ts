import type { LatLng } from "react-native-maps";

import { formatDistance } from "../format";
import { nearest } from "../geo";
import type { Building, PathEdge, PathNode, Point } from "../schemas";
import { buildGraph, shortestPath, type Graph } from "./dijkstra";

// Başlangıç düğümü bundan uzaksa kullanıcı yol ağının dışında sayılır
export const MAX_START_DISTANCE_M = 150;
// Tekerlekli sandalye için yaklaşık hız; süre metinde "yaklaşık" diye verilir
export const WHEELCHAIR_SPEED_MPS = 0.8;

export const FAR_MESSAGE = "Kampüs yol ağından uzaktasınız. Google Haritalar yol tarifini kullanın.";
export const NO_ROUTE_MESSAGE = "Bu noktaya merdivensiz bir yol kaydı bulunmuyor.";

// Konum izni varsa konumdan, yoksa kullanıcının seçtiği binanın girişinden başlanır
export type RouteStart = { kind: "location"; location: LatLng } | { kind: "building"; building: Building };

export interface RouteStep {
  note: string;
  distanceM: number;
}

export type RouteResult =
  | { kind: "found"; coordinates: LatLng[]; distanceM: number; durationMin: number; steps: RouteStep[] }
  | { kind: "far"; distanceM: number }
  | { kind: "no-start" }
  | { kind: "no-route" };

const toLatLng = (node: PathNode): LatLng => ({ latitude: node.lat, longitude: node.lng });

function startNode(nodes: PathNode[], start: RouteStart): (PathNode & { distance: number }) | null {
  if (start.kind === "location") return nearest(start.location, nodes)[0] ?? null;
  const entrances = nodes.filter((n) => n.building_id === start.building.id);
  return nearest({ latitude: start.building.lat, longitude: start.building.lng }, entrances)[0] ?? null;
}

// Hedef noktaya bağlı düğüm; nokta yol ağına bağlanmamışsa ona en yakın düğüm
function targetNode(nodes: PathNode[], target: Point): PathNode | null {
  return nodes.find((n) => n.point_id === target.id) ?? nearest({ latitude: target.lat, longitude: target.lng }, nodes)[0] ?? null;
}

// Ardışık düğümler arasındaki kenarlardan adım listesi; aynı notlu ardışık kenarlar tek adımda birleşir
export function routeSteps(graph: Graph, path: string[]): RouteStep[] {
  const steps: RouteStep[] = [];
  for (let i = 1; i < path.length; i++) {
    const edge = (graph.get(path[i - 1]!) ?? [])
      .filter((e) => e.to === path[i])
      .sort((a, b) => a.lengthM - b.lengthM)[0];
    if (!edge) continue;
    const last = steps.at(-1);
    if (last && last.note === edge.note) last.distanceM += edge.lengthM;
    else steps.push({ note: edge.note, distanceM: edge.lengthM });
  }
  return steps;
}

// "Kütüphane önündeki yaya yolu boyunca, 120 metre"; notu girilmemiş kenar için genel ifade
export function stepText(step: RouteStep): string {
  return `${step.note.trim() || "Yol boyunca"}, ${formatDistance(step.distanceM)}`;
}

// "Yaklaşık 450 metre, yaklaşık 9 dakika"
export function routeSummary(route: { distanceM: number; durationMin: number }): string {
  return `Yaklaşık ${formatDistance(route.distanceM)}, yaklaşık ${route.durationMin} dakika`;
}

// En kısa merdivensiz rota (#25). Hesap telefonda yapılır, konum sunucuya gitmez
export function planRoute(nodes: PathNode[], edges: PathEdge[], target: Point, start: RouteStart): RouteResult {
  const from = startNode(nodes, start);
  const to = targetNode(nodes, target);
  if (!from || !to) return { kind: "no-start" };
  if (start.kind === "location" && from.distance > MAX_START_DISTANCE_M) return { kind: "far", distanceM: from.distance };

  const graph = buildGraph(
    // Eski önbellekte note alanı yok
    edges.map((e) => ({ from: e.from_node, to: e.to_node, lengthM: e.length_m, note: e.note || "" })),
  );
  const path = shortestPath(graph, from.id, to.id);
  if (!path) return { kind: "no-route" };

  const byId = new Map(nodes.map((n) => [n.id, n]));
  return {
    kind: "found",
    coordinates: path.nodes.map((id) => toLatLng(byId.get(id)!)),
    distanceM: path.distanceM,
    durationMin: Math.max(1, Math.round(path.distanceM / WHEELCHAIR_SPEED_MPS / 60)),
    steps: routeSteps(graph, path.nodes),
  };
}
