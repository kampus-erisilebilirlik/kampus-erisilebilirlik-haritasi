export interface Edge {
  from: string;
  to: string;
  lengthM: number;
  note: string;
}

export type Graph = Map<string, { to: string; lengthM: number; note: string }[]>;

// Kenar listesinden çift yönlü komşuluk listesi: yol ağında A→B kaydı B→A yürünebilir demek
export function buildGraph(edges: Edge[]): Graph {
  const graph: Graph = new Map();
  const add = (from: string, to: string, lengthM: number, note: string) => {
    const list = graph.get(from) ?? [];
    list.push({ to, lengthM, note });
    graph.set(from, list);
  };
  for (const e of edges) {
    add(e.from, e.to, e.lengthM, e.note);
    add(e.to, e.from, e.lengthM, e.note);
  }
  return graph;
}

// En kısa yol (Dijkstra). Düğüm sayısı birkaç yüz: en yakın düğüm her adımda dizi taranarak bulunur, O(V²)
export function shortestPath(graph: Graph, start: string, goal: string): { nodes: string[]; distanceM: number } | null {
  if (start === goal) return { nodes: [start], distanceM: 0 };

  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, string>();
  const visited = new Set<string>();

  for (;;) {
    // Ziyaret edilmemişler arasında başlangıca en yakın düğüm
    let current: string | null = null;
    let best = Infinity;
    for (const [node, d] of dist) {
      if (!visited.has(node) && d < best) {
        best = d;
        current = node;
      }
    }
    if (current === null) return null; // ulaşılabilir düğüm kalmadı, hedef başka bir parçada
    if (current === goal) break;
    visited.add(current);

    for (const { to, lengthM } of graph.get(current) ?? []) {
      const candidate = best + lengthM;
      if (candidate < (dist.get(to) ?? Infinity)) {
        dist.set(to, candidate);
        prev.set(to, current);
      }
    }
  }

  // Hedeften geriye "nereden geldim" zinciri
  const nodes = [goal];
  while (nodes[0] !== start) nodes.unshift(prev.get(nodes[0]!)!);
  return { nodes, distanceM: dist.get(goal)! };
}
