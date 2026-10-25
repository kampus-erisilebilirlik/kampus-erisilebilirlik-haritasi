import { z } from "zod";

import { median } from "../../../app/src/lib/slope";
import { checkRamp, type Handrail } from "../../../app/src/lib/ts9111";

// Saha formu (docs/saha/saha-formu.md) ve binalar.csv satırlarının doğrulanması ve veri tabanı şekline çevrilmesi

export const TYPE_CODES = {
  rampa: { db: "ramp", code: "ramp" },
  asansör: { db: "elevator", code: "elevator" },
  tuvalet: { db: "toilet", code: "toilet" },
  otopark: { db: "parking", code: "parking" },
  "otomatik kapı": { db: "auto_door", code: "auto-door" },
} as const;

type FormType = keyof typeof TYPE_CODES;
export type PointType = (typeof TYPE_CODES)[FormType]["db"];

const STATUS = { çalışıyor: "working", arızalı: "broken", bilinmiyor: "unknown" } as const;
const TACTILE = { var: true, yok: false, bilinmiyor: null } as const;
const HANDRAIL = { "iki tarafta": "both", "tek tarafta": "one", yok: "none" } as const satisfies Record<string, Handrail>;
const HANDRAIL_SIDES: Record<Handrail, number> = { both: 2, one: 1, none: 0 };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CODE = /^([a-z0-9]+(?:-[a-z0-9]+)*)-(ramp|elevator|toilet|parking|auto-door)-([0-9]+)$/;

// Formdan gelen metin: eksik kolon boş sayılır, baş/son boşluk ve büyük/küçük harf farkı tolere edilir
const text = z
  .string()
  .optional()
  .transform((s) => (s ?? "").trim());
const lower = text.transform((s) => s.toLocaleLowerCase("tr-TR"));
const optional = (s: string) => (s === "" ? undefined : s);

// "7,8" ve "7.8" ikisi de kabul edilir
const decimal = text
  .transform((s) => s.replace(",", "."))
  .pipe(z.string().min(1, "boş olamaz"))
  .pipe(z.string().regex(/^-?\d+(\.\d+)?$/, "sayı olmalı"))
  .transform(Number);
const optionalDecimal = text.transform(optional).pipe(decimal.optional());

const oneOf = <K extends string>(options: readonly [K, ...K[]]) =>
  z.enum(options, { error: `şunlardan biri olmalı: ${options.join(" / ")}` });
const choice = <T extends Record<string, unknown>>(map: T) =>
  lower.pipe(oneOf(Object.keys(map) as [keyof T & string, ...(keyof T & string)[]]));

export const pointRowSchema = z
  .object({
    nokta_kodu: lower.pipe(z.string().regex(CODE, "biçim <bina-slug>-<tür>-<sıra> olmalı")),
    bina_slug: lower.pipe(z.string().regex(SLUG, "geçersiz slug")),
    tur: choice(TYPE_CODES),
    ad: text.pipe(z.string().min(1, "boş olamaz")),
    enlem: decimal.pipe(z.number().min(-90).max(90)),
    boylam: decimal.pipe(z.number().min(-180).max(180)),
    kat: decimal.pipe(z.number().int("tam sayı olmalı")),
    durum: choice(STATUS),
    foto_dosyasi: text.transform(optional),
    sozlu_tarif: text,
    kilavuz_iz: choice(TACTILE),
    rampa_egim_1: optionalDecimal,
    rampa_egim_2: optionalDecimal,
    rampa_egim_3: optionalDecimal,
    rampa_yukseklik_cm: optionalDecimal,
    rampa_uzunluk_cm: optionalDecimal,
    rampa_genislik_cm: optionalDecimal,
    korkuluk: text.transform(optional).pipe(choice(HANDRAIL).optional()),
    notlar: text,
    olcen: text,
  })
  .superRefine((row, ctx) => {
    const m = CODE.exec(row.nokta_kodu);
    if (m && m[1] !== row.bina_slug) {
      ctx.addIssue({ code: "custom", path: ["nokta_kodu"], message: `bina_slug (${row.bina_slug}) ile başlamalı` });
    }
    if (m && m[2] !== TYPE_CODES[row.tur].code) {
      ctx.addIssue({ code: "custom", path: ["nokta_kodu"], message: `tür ${row.tur} için kod "${TYPE_CODES[row.tur].code}" olmalı` });
    }
    if (row.tur === "rampa") {
      for (const key of ["rampa_egim_1", "rampa_egim_2", "rampa_egim_3", "rampa_uzunluk_cm", "rampa_genislik_cm", "korkuluk"] as const) {
        if (row[key] === undefined) ctx.addIssue({ code: "custom", path: [key], message: "rampa için zorunlu" });
      }
    }
    if (row.foto_dosyasi && row.foto_dosyasi !== `${row.nokta_kodu}.jpg`) {
      ctx.addIssue({ code: "custom", path: ["foto_dosyasi"], message: `${row.nokta_kodu}.jpg olmalı` });
    }
  });

export type PointRow = z.infer<typeof pointRowSchema>;

export const buildingRowSchema = z.object({
  slug: lower.pipe(z.string().regex(SLUG, "geçersiz slug")),
  ad: text.pipe(z.string().min(1, "boş olamaz")),
  enlem: decimal.pipe(z.number().min(-90).max(90)),
  boylam: decimal.pipe(z.number().min(-180).max(180)),
  kat_sayisi: decimal.pipe(z.number().int().min(1)),
  basamaksiz_giris: lower.pipe(oneOf(["evet", "hayır"])),
  ozet: text,
  puan_elle: lower.transform(optional).pipe(oneOf(["green", "yellow", "red"]).optional()),
});

export type BuildingRow = z.infer<typeof buildingRowSchema>;

export interface PointRecord {
  code: string;
  buildingSlug: string;
  type: PointType;
  name: string;
  lat: number;
  lng: number;
  floor: number;
  status: (typeof STATUS)[keyof typeof STATUS];
  photoFile: string | undefined;
  verbal_directions: string;
  has_tactile_paving: boolean | null;
  ramp_slope_pct: number | null;
  ramp_length_cm: number | null;
  ramp_rise_cm: number | null;
  ramp_width_cm: number | null;
  ramp_handrail_sides: number | null;
  ramp_has_handrail: boolean | null;
  ts9111_compliant: boolean | null;
  // H/L ile telefon medyanı arasındaki fark %1'i aşıyorsa uyarı (ölçüm yöntemi)
  slopeMismatch: number | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function toPointRecord(row: PointRow): PointRecord {
  const isRamp = row.tur === "rampa";
  const slopes = [row.rampa_egim_1, row.rampa_egim_2, row.rampa_egim_3].filter((v): v is number => v !== undefined);
  const slope = isRamp && slopes.length > 0 ? round1(median(slopes.map(Math.abs))) : null;
  const handrail = isRamp && row.korkuluk ? HANDRAIL[row.korkuluk] : null;
  const length = isRamp ? (row.rampa_uzunluk_cm ?? null) : null;
  const width = isRamp ? (row.rampa_genislik_cm ?? null) : null;
  const rise = isRamp ? (row.rampa_yukseklik_cm ?? null) : null;

  const compliant =
    slope !== null && length !== null && width !== null && handrail !== null
      ? checkRamp({ slopePct: slope, lengthCm: length, widthCm: width, handrail }).compliant
      : null;
  const tapeSlope = slope !== null && rise !== null && length ? (rise / length) * 100 : null;
  const mismatch = tapeSlope !== null && slope !== null && Math.abs(tapeSlope - slope) > 1 ? round1(Math.abs(tapeSlope - slope)) : null;

  return {
    code: row.nokta_kodu,
    buildingSlug: row.bina_slug,
    type: TYPE_CODES[row.tur].db,
    name: row.ad,
    lat: row.enlem,
    lng: row.boylam,
    floor: row.kat,
    status: STATUS[row.durum],
    photoFile: row.foto_dosyasi,
    verbal_directions: row.sozlu_tarif,
    has_tactile_paving: TACTILE[row.kilavuz_iz],
    ramp_slope_pct: slope,
    ramp_length_cm: length === null ? null : Math.round(length),
    ramp_rise_cm: rise === null ? null : Math.round(rise),
    ramp_width_cm: width === null ? null : Math.round(width),
    ramp_handrail_sides: handrail === null ? null : HANDRAIL_SIDES[handrail],
    ramp_has_handrail: handrail === null ? null : handrail !== "none",
    ts9111_compliant: compliant,
    slopeMismatch: mismatch,
  };
}

// PostGIS geography için EWKT: önce boylam, sonra enlem
export const toEwkt = (lat: number, lng: number) => `SRID=4326;POINT(${lng} ${lat})`;
