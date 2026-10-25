import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildGraph, components, distanceMeters, linkPoints, toWktLine, type LngLat } from "./graph";

// Enlemde 1 m ≈ 0,000009°. Kampüs yakınında küçük kaydırmalar
const base: LngLat = [32.51, 38.025];
const north = (m: number, from = base): LngLat => [from[0], from[1] + m / 111_195];
const east = (m: number, from = base): LngLat => [from[0] + m / (111_195 * Math.cos((from[1] * Math.PI) / 180)), from[1]];

describe("distanceMeters", () => {
  it("100 m kuzey", () => {
    assert.ok(Math.abs(distanceMeters(base, north(100)) - 100) < 0.1);
  });
});

describe("buildGraph", () => {
  it("3 m içindeki uçları aynı düğümde birleştirir ve uzunluğu çizgi boyunca hesaplar", () => {
    const a = { coordinates: [base, north(50), north(100)], note: "A yolu", index: 0 };
    // 2 m kayık başlıyor: aynı kavşak sayılmalı
    const b = { coordinates: [east(2, north(100)), east(80, north(100))], note: "B yolu", index: 1 };
    const g = buildGraph([a, b]);
    assert.equal(g.nodes.length, 3);
    assert.equal(g.edges.length, 2);
    assert.equal(g.edges[0]!.to, g.edges[1]!.from);
    assert.ok(Math.abs(g.edges[0]!.lengthM - 100) <= 0.2);
    assert.deepEqual(g.warnings, []);
  });

  it("5 m uzaktaki uçları birleştirmez", () => {
    const g = buildGraph([
      { coordinates: [base, north(100)], note: "A", index: 0 },
      { coordinates: [east(5, north(100)), east(50, north(100))], note: "B", index: 1 },
    ]);
    assert.equal(g.nodes.length, 4);
    assert.equal(components(g.nodes.length, g.edges).length, 2);
  });

  it("çok kısa çizgiyi ve boş notu uyarır", () => {
    const g = buildGraph([
      { coordinates: [base, north(1)], note: "", index: 0 },
      { coordinates: [base, north(20)], note: "", index: 1 },
    ]);
    assert.equal(g.edges.length, 1);
    assert.ok(g.warnings.some((w) => w.startsWith("çizgi 1: iki ucu aynı düğümde")));
    assert.ok(g.warnings.some((w) => w.startsWith("çizgi 2: note boş")));
  });

  it("bölünmemiş T kavşağı uyarır", () => {
    const g = buildGraph([
      { coordinates: [base, north(100)], note: "Ana yol", index: 0 },
      { coordinates: [north(50), east(40, north(50))], note: "Yan yol", index: 1 },
    ]);
    assert.ok(g.warnings.some((w) => w.startsWith("çizgi 1: ortasından başka bir çizgi ayrılıyor")));
  });
});

describe("components", () => {
  it("bağlı parçaları büyükten küçüğe döner", () => {
    const comps = components(5, [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 3, to: 4 },
    ]);
    assert.deepEqual(comps.map((c) => c.sort()), [[0, 1, 2], [3, 4]]);
  });
});

describe("linkPoints", () => {
  it("10 m içindeki en yakın noktaya bağlar, bir noktayı tek düğüme verir", () => {
    const nodes = [
      { key: 0, lng: base[0], lat: base[1] },
      { key: 1, lng: north(4)[0], lat: north(4)[1] },
      { key: 2, lng: north(100)[0], lat: north(100)[1] },
    ];
    const p = north(3);
    const links = linkPoints(nodes, [{ id: "rampa", lng: p[0], lat: p[1], buildingSlug: "b" }]);
    assert.deepEqual([...links.keys()], [1]);
  });

  it("10 m'den uzak noktayı bağlamaz", () => {
    const far = north(11);
    const links = linkPoints([{ key: 0, lng: base[0], lat: base[1] }], [{ id: "x", lng: far[0], lat: far[1], buildingSlug: "b" }]);
    assert.equal(links.size, 0);
  });
});

it("WKT: boylam enlem sırası", () => {
  assert.equal(toWktLine([[32.5, 38], [32.6, 38.1]]), "LINESTRING(32.5 38, 32.6 38.1)");
});
