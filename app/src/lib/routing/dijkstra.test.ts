import { buildGraph, shortestPath, type Edge } from "./dijkstra";

const edge = (from: string, to: string, lengthM: number, note = ""): Edge => ({ from, to, lengthM, note });

//      10       10
//   A ──── B ──── C
//   │             │
//   └──── D ──────┘
//      5      40
// A→C: düz yol A-D-C 45 m, dolambaçlı görünen A-B-C 20 m
const graph = buildGraph([edge("A", "B", 10), edge("B", "C", 10), edge("A", "D", 5), edge("D", "C", 40)]);

describe("buildGraph", () => {
  it("her kenarı iki yöne ekler", () => {
    const g = buildGraph([edge("A", "B", 7, "yaya yolu")]);
    expect(g.get("A")).toEqual([{ to: "B", lengthM: 7, note: "yaya yolu" }]);
    expect(g.get("B")).toEqual([{ to: "A", lengthM: 7, note: "yaya yolu" }]);
  });
});

describe("shortestPath", () => {
  it("ilk adımı kısa olanı değil toplamı kısa olanı seçer", () => {
    expect(shortestPath(graph, "A", "C")).toEqual({ nodes: ["A", "B", "C"], distanceM: 20 });
  });

  it("başlangıç hedefse yol tek düğüm, mesafe 0", () => {
    expect(shortestPath(graph, "B", "B")).toEqual({ nodes: ["B"], distanceM: 0 });
  });

  it("bağlantısız grafta null", () => {
    const split = buildGraph([edge("A", "B", 10), edge("X", "Y", 10)]);
    expect(shortestPath(split, "A", "Y")).toBeNull();
  });

  it("grafta olmayan düğüm için null", () => {
    expect(shortestPath(graph, "A", "Z")).toBeNull();
  });

  it("kenar ters yönde de yürünür", () => {
    const g = buildGraph([edge("A", "B", 10)]);
    expect(shortestPath(g, "B", "A")).toEqual({ nodes: ["B", "A"], distanceM: 10 });
  });

  it("yol uzadığında güncellenen kısa mesafeyi korur", () => {
    // S-T doğrudan 100 m, S-U-T 30 m; U daha geç keşfedilse de kısa yol bulunur
    const g = buildGraph([edge("S", "T", 100), edge("S", "U", 20), edge("U", "T", 10)]);
    expect(shortestPath(g, "S", "T")).toEqual({ nodes: ["S", "U", "T"], distanceM: 30 });
  });
});
