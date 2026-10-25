// docs/saha/yol-agi.geojson'daki basamaksız yolları path_nodes/path_edges grafına çevirir (#24). Kullanım: README.md
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import type { Database } from "../../app/src/types/database";
import { buildGraph, components, linkPoints, toWktLine, type LngLat, type PathLine } from "./src/graph";
import { loadCsv } from "./src/load";
import { buildingRowSchema, pointRowSchema, toPointRecord } from "./src/rows";

const here = import.meta.dirname;
const repo = resolve(here, "../..");

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    geojson: { type: "string", default: join(repo, "docs/saha/yol-agi.geojson") },
    points: { type: "string", default: join(here, "data/points.csv") },
    buildings: { type: "string", default: join(repo, "docs/saha/binalar.csv") },
    engeller: { type: "string" },
  },
});

for (const file of [args.geojson, args.points, args.buildings]) {
  if (!existsSync(file)) {
    console.error(`Dosya bulunamadı: ${file}`);
    process.exit(1);
  }
}

// 1. GeoJSON: LineString → yol, Point + "engel" özelliği → geçilemeyen yer (#8)
interface Feature {
  geometry: { type: string; coordinates: unknown } | null;
  properties: Record<string, unknown> | null;
}
const geojson = JSON.parse(readFileSync(args.geojson, "utf8")) as { features?: Feature[] };
const lines: PathLine[] = [];
const barriers: { lat: number; lng: number; text: string }[] = [];
for (const [index, f] of (geojson.features ?? []).entries()) {
  const note = typeof f.properties?.note === "string" ? f.properties.note.trim() : "";
  if (f.geometry?.type === "LineString") {
    lines.push({ coordinates: f.geometry.coordinates as LngLat[], note, index });
  } else if (f.geometry?.type === "MultiLineString") {
    for (const part of f.geometry.coordinates as LngLat[][]) lines.push({ coordinates: part, note, index });
  } else if (f.geometry?.type === "Point" && typeof f.properties?.engel === "string") {
    const [lng, lat] = f.geometry.coordinates as LngLat;
    barriers.push({ lat, lng, text: f.properties.engel });
  }
}

// 2. Graf
const graph = buildGraph(lines);

// 3. Düğümleri noktalara ve bina girişlerine bağla (10 m)
const pointsCsv = loadCsv(args.points, pointRowSchema);
const buildingsCsv = loadCsv(args.buildings, buildingRowSchema);
if (pointsCsv.errors.length + buildingsCsv.errors.length > 0) {
  console.error("CSV'lerde hata var, önce `pnpm seed --dry-run` ile düzeltin.");
  process.exit(1);
}
const points = pointsCsv.rows.map((r) => toPointRecord(r.value));
const buildings = buildingsCsv.rows.map((r) => r.value);
const pointLinks = linkPoints(
  graph.nodes,
  points.map((p) => ({ id: p.code, lat: p.lat, lng: p.lng, buildingSlug: p.buildingSlug })),
);
const entranceLinks = linkPoints(
  graph.nodes,
  buildings.map((b) => ({ id: b.slug, lat: b.enlem, lng: b.boylam, buildingSlug: b.slug })),
);
const nodeBuilding = (key: number) => pointLinks.get(key)?.buildingSlug ?? entranceLinks.get(key)?.buildingSlug;

// 4. Kontrol: bağlılık ve binaların ağa bağlanması
const comps = components(graph.nodes.length, graph.edges);
const totalM = graph.edges.reduce((a, e) => a + e.lengthM, 0);
console.log(`✔ ${lines.length} çizgi → ${graph.nodes.length} düğüm, ${graph.edges.length} kenar (${Math.round(totalM)} m)`);
console.log(`  ${pointLinks.size} düğüm bir noktaya, ${entranceLinks.size} düğüm bir bina girişine bağlandı`);

const problems: string[] = [];
if (comps.length > 1) {
  problems.push(`Graf bağlı değil: ${comps.length} parça. Ana parçaya bağlı olmayan düğümler:`);
  for (const comp of comps.slice(1)) {
    for (const key of comp) {
      const n = graph.nodes[key]!;
      const b = nodeBuilding(key);
      problems.push(`    ${n.lat.toFixed(6)}, ${n.lng.toFixed(6)}${b ? ` (${b})` : ""}`);
    }
  }
}
const main = new Set(comps[0] ?? []);
for (const b of buildings) {
  const linked = graph.nodes.filter((n) => nodeBuilding(n.key) === b.slug);
  if (linked.length === 0) problems.push(`${b.slug}: hiçbir düğüm bu binaya ya da noktalarına ${10} m'den yakın değil`);
  else if (!linked.some((n) => main.has(n.key))) problems.push(`${b.slug}: ana yol ağına bağlı değil`);
}

if (graph.warnings.length > 0) {
  console.log(`\n⚠ ${graph.warnings.length} uyarı:`);
  for (const w of graph.warnings) console.log(`  ${w}`);
}
if (problems.length > 0) {
  console.log(`\n✖ Bağlantı sorunları:`);
  for (const p of problems) console.log(`  ${p}`);
}

if (args.engeller) {
  const md = [
    "# Basamaksız geçişin mümkün olmadığı yerler",
    "",
    "`scripts/seed/import-paths.ts --engeller` tarafından `yol-agi.geojson`'daki `engel` işaretlerinden üretilir. Eksiklik raporuna (#8) girer.",
    "",
    "| # | Konum | Engel |",
    "|---|---|---|",
    ...barriers.map((b, i) => `| ${i + 1} | [${b.lat.toFixed(6)}, ${b.lng.toFixed(6)}](https://www.google.com/maps?q=${b.lat},${b.lng}) | ${b.text.replace(/\|/g, "\\|")} |`),
    "",
  ].join("\n");
  writeFileSync(args.engeller, md);
  console.log(`\n${barriers.length} engel yazıldı: ${args.engeller}`);
}

if (args["dry-run"]) {
  console.log("\n--dry-run: veri tabanına yazılmadı.");
  process.exit(problems.length > 0 ? 1 : 0);
}
if (problems.length > 0) {
  console.error("\nBağlantı sorunları düzeltilmeden yazılmaz.");
  process.exit(1);
}

// 5. Yazma: eski graf silinip yenisi tek transaction'da yazılır
try {
  process.loadEnvFile(join(here, ".env"));
} catch {
  // .env yoksa ortam değişkenleri kullanılır
}
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli (scripts/seed/.env)");
  process.exit(1);
}
const db = createClient<Database>(url, key, { auth: { persistSession: false } });

const [{ data: dbPoints, error: pErr }, { data: dbBuildings, error: bErr }] = await Promise.all([
  db.from("points").select("id, code, building_id"),
  db.from("buildings").select("id, slug"),
]);
if (pErr || bErr) throw new Error((pErr ?? bErr)!.message);
const pointId = new Map(dbPoints.map((p) => [p.code, p]));
const buildingId = new Map(dbBuildings.map((b) => [b.slug, b.id]));

const ids = graph.nodes.map(() => randomUUID());
const nodes = graph.nodes.map((n) => {
  const point = pointLinks.get(n.key);
  const dbPoint = point ? pointId.get(point.id) : undefined;
  if (point && !dbPoint) throw new Error(`${point.id} veri tabanında yok, önce \`pnpm seed\` çalıştırın`);
  const slug = nodeBuilding(n.key);
  return {
    id: ids[n.key],
    lat: n.lat,
    lng: n.lng,
    point_id: dbPoint?.id ?? null,
    building_id: slug ? (buildingId.get(slug) ?? null) : null,
  };
});
const edges = graph.edges.map((e) => ({
  from_node: ids[e.from],
  to_node: ids[e.to],
  length_m: e.lengthM,
  geometry: toWktLine(e.coordinates),
  note: e.note,
}));

const { error } = await db.rpc("replace_path_graph", { p_nodes: nodes, p_edges: edges });
if (error) throw new Error(`replace_path_graph: ${error.message}`);
console.log(`\n✔ ${nodes.length} düğüm, ${edges.length} kenar yazıldı (eski graf silindi)`);
