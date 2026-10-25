import type { BuildingRow, PointRecord, PointType } from "./rows";
import type { Score } from "./score";

const columns: [PointType, string][] = [
  ["ramp", "Rampa"],
  ["elevator", "Asansör"],
  ["toilet", "Tuvalet"],
  ["parking", "Otopark"],
  ["auto_door", "Otomatik kapı"],
];
const scoreLabel: Record<Score, string> = { green: "🟢", yellow: "🟡", red: "🔴" };

// docs/saha/envanter.md: bina başına nokta sayısı (etki ölçütü)
export function inventoryMarkdown(buildings: BuildingRow[], points: PointRecord[], scores: Map<string, Score>): string {
  const count = (slug: string | null, type?: PointType) =>
    points.filter((p) => (slug === null || p.buildingSlug === slug) && (!type || p.type === type)).length;
  const ramps = points.filter((p) => p.type === "ramp");
  const lines = [
    "# Saha envanteri",
    "",
    "`scripts/seed` tarafından üretilir (`--envanter`), elle düzenlemeyin.",
    "",
    `| Bina | Puan | ${columns.map(([, l]) => l).join(" | ")} | Toplam |`,
    `|---|---|${columns.map(() => "---|").join("")}---|`,
    ...buildings.map(
      (b) => `| ${b.ad} | ${scoreLabel[scores.get(b.slug)!]} | ${columns.map(([t]) => count(b.slug, t)).join(" | ")} | ${count(b.slug)} |`,
    ),
    `| **Toplam** | | ${columns.map(([t]) => `**${count(null, t)}**`).join(" | ")} | **${points.length}** |`,
    "",
    `- Arızalı nokta: ${points.filter((p) => p.status === "broken").length}`,
    `- TS 9111'e uygun olmayan rampa: ${ramps.filter((p) => p.ts9111_compliant === false).length} / ${ramps.length}` +
      (ramps.some((p) => p.ts9111_compliant === null) ? ` (${ramps.filter((p) => p.ts9111_compliant === null).length} rampa hesaplanamadı)` : ""),
    "",
  ];
  return lines.join("\n");
}
