// Saha verisini (#23) Supabase'e aktarır. Kullanım: scripts/seed/README.md
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

import type { Database } from "../../app/src/types/database";
import { loadCsv, type RowError } from "./src/load";
import { buildingRowSchema, pointRowSchema, toEwkt, toPointRecord, type BuildingRow, type PointRecord } from "./src/rows";
import { buildingScore, type Score } from "./src/score";
import { inventoryMarkdown } from "./src/inventory";

const here = import.meta.dirname;
const repo = resolve(here, "../..");

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    points: { type: "string", default: join(here, "data/points.csv") },
    buildings: { type: "string", default: join(repo, "docs/saha/binalar.csv") },
    photos: { type: "string", default: join(here, "data/photos") },
    "skip-photos": { type: "boolean", default: false },
    envanter: { type: "string" },
  },
});
const dryRun = args["dry-run"];

function fail(errors: RowError[]): never {
  console.error(`\n✖ ${errors.length} hata bulundu, veri tabanına hiçbir şey yazılmadı:\n`);
  for (const e of errors) console.error(`  ${e.file.replace(repo + "/", "")}:${e.line}  ${e.message}`);
  process.exit(1);
}

// 1. Okuma ve doğrulama
for (const file of [args.points, args.buildings]) {
  if (!existsSync(file)) {
    console.error(`Dosya bulunamadı: ${file}`);
    process.exit(1);
  }
}
const buildingsCsv = loadCsv(args.buildings, buildingRowSchema);
const pointsCsv = loadCsv(args.points, pointRowSchema);
const errors = [...buildingsCsv.errors, ...pointsCsv.errors];

const buildings = new Map<string, BuildingRow>();
for (const { line, value } of buildingsCsv.rows) {
  if (buildings.has(value.slug)) errors.push({ file: args.buildings, line, message: `slug tekrar ediyor: ${value.slug}` });
  buildings.set(value.slug, value);
}

const points: PointRecord[] = [];
const seenCodes = new Map<string, number>();
for (const { line, value } of pointsCsv.rows) {
  const first = seenCodes.get(value.nokta_kodu);
  if (first !== undefined) {
    errors.push({ file: args.points, line, message: `nokta_kodu ${first}. satırda da var: ${value.nokta_kodu}` });
    continue;
  }
  seenCodes.set(value.nokta_kodu, line);
  if (!buildings.has(value.bina_slug)) {
    errors.push({ file: args.points, line, message: `bina_slug binalar.csv'de yok: ${value.bina_slug}` });
    continue;
  }
  points.push(toPointRecord(value));
}
if (errors.length > 0) fail(errors);

// 2. Uyarılar (yazmayı engellemez)
const photoPath = (p: PointRecord) =>
  p.photoFile ? [join(args.photos, p.buildingSlug, p.photoFile), join(args.photos, p.photoFile)].find(existsSync) : undefined;
const warnings: string[] = [];
for (const p of points) {
  if (p.slopeMismatch !== null) warnings.push(`${p.code}: telefon ile H/L arasında %${p.slopeMismatch} fark, ölçüm tekrarlanmalı`);
  if (p.type === "ramp" && p.ts9111_compliant === null) warnings.push(`${p.code}: TS 9111 uygunluğu hesaplanamadı (eşikler girilmedi mi?)`);
  if (!args["skip-photos"] && p.photoFile && !photoPath(p)) warnings.push(`${p.code}: fotoğraf bulunamadı (${p.photoFile})`);
  if (!p.photoFile) warnings.push(`${p.code}: fotoğraf yok`);
}

const scores = new Map<string, Score>();
for (const [slug, b] of buildings) scores.set(slug, buildingScore(b, points.filter((p) => p.buildingSlug === slug)));

console.log(`✔ ${buildings.size} bina, ${points.length} nokta doğrulandı`);
for (const [slug, score] of scores) {
  console.log(`  ${score.padEnd(6)} ${slug} (${points.filter((p) => p.buildingSlug === slug).length} nokta)`);
}
if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} uyarı:`);
  for (const w of warnings) console.log(`  ${w}`);
}

if (args.envanter) {
  writeFileSync(args.envanter, inventoryMarkdown([...buildings.values()], points, scores));
  console.log(`\nEnvanter yazıldı: ${args.envanter}`);
}

if (dryRun) {
  console.log("\n--dry-run: veri tabanına yazılmadı.");
  process.exit(0);
}

// 3. Yazma
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

const { data: savedBuildings, error: bErr } = await db
  .from("buildings")
  .upsert(
    [...buildings.values()].map((b) => ({
      slug: b.slug,
      name: b.ad,
      location: toEwkt(b.enlem, b.boylam),
      score: scores.get(b.slug)!,
      summary: b.ozet,
    })),
    { onConflict: "slug" },
  )
  .select("id, slug");
if (bErr) throw new Error(`buildings: ${bErr.message}`);
const buildingId = new Map(savedBuildings.map((b) => [b.slug, b.id]));

const { data: savedPoints, error: pErr } = await db
  .from("points")
  .upsert(
    points.map((p) => ({
      code: p.code,
      building_id: buildingId.get(p.buildingSlug)!,
      type: p.type,
      name: p.name,
      location: toEwkt(p.lat, p.lng),
      floor: p.floor,
      status: p.status,
      verbal_directions: p.verbal_directions,
      has_tactile_paving: p.has_tactile_paving,
      ramp_slope_pct: p.ramp_slope_pct,
      ramp_length_cm: p.ramp_length_cm,
      ramp_rise_cm: p.ramp_rise_cm,
      ramp_width_cm: p.ramp_width_cm,
      ramp_handrail_sides: p.ramp_handrail_sides,
      ramp_has_handrail: p.ramp_has_handrail,
      ts9111_compliant: p.ts9111_compliant,
    })),
    { onConflict: "code" },
  )
  .select("id, code");
if (pErr) throw new Error(`points: ${pErr.message}`);
console.log(`\n✔ ${savedBuildings.length} bina, ${savedPoints.length} nokta yazıldı`);

if (!args["skip-photos"]) {
  const pointId = new Map(savedPoints.map((p) => [p.code!, p.id]));
  let uploaded = 0;
  for (const p of points) {
    const file = photoPath(p);
    if (!file) continue;
    // En uzun kenar 1280 px, JPEG 75: Free plan 1 GB sınırı için (~150-250 KB). rotate(): EXIF yönünü uygular
    const jpeg = await sharp(readFileSync(file)).rotate().resize(1280, 1280, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 75, mozjpeg: true }).toBuffer();
    const path = `${p.buildingSlug}/${pointId.get(p.code)}.jpg`;
    const { error } = await db.storage.from("point-photos").upload(path, jpeg, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`${p.code} fotoğrafı: ${error.message}`);
    const { error: uErr } = await db.from("points").update({ photo_path: path }).eq("code", p.code);
    if (uErr) throw new Error(`${p.code} photo_path: ${uErr.message}`);
    uploaded++;
    console.log(`  📷 ${p.code} → ${path} (${Math.round(jpeg.length / 1024)} KB)`);
  }
  console.log(`✔ ${uploaded} fotoğraf yüklendi`);
}
