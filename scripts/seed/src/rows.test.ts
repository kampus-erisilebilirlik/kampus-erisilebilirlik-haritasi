import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadCsv } from "./load";
import { buildingRowSchema, pointRowSchema, toEwkt, toPointRecord } from "./rows";
import { buildingScore } from "./score";

const header =
  "nokta_kodu,bina_slug,tur,ad,enlem,boylam,kat,durum,foto_dosyasi,sozlu_tarif,kilavuz_iz,rampa_egim_1,rampa_egim_2,rampa_egim_3,rampa_yukseklik_cm,rampa_uzunluk_cm,rampa_genislik_cm,korkuluk,notlar,olcen";
const ramp =
  'teknoloji-fakultesi-ramp-1,teknoloji-fakultesi,rampa,Ana giriş rampası,38.0251,32.5103,0,çalışıyor,teknoloji-fakultesi-ramp-1.jpg,"Ana girişin solunda, 5 adım.",yok,"7,8",8.1,7.9,45,600,110,tek tarafta,,Alper';
const elevator =
  "teknoloji-fakultesi-elevator-1,teknoloji-fakultesi,Asansör ,Ana asansör,38.0252,32.5104,0,Çalışıyor,,Girişten sağa 10 adım.,var,,,,,,,,,Alper";

const points = (...rows: string[]) => loadCsv("points.csv", pointRowSchema, [header, ...rows].join("\n"));

describe("pointRowSchema", () => {
  it("geçerli satırları okur, virgüllü ondalığı ve büyük harfi tolere eder", () => {
    const { rows, errors } = points(ramp, elevator);
    assert.deepEqual(errors, []);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]!.value.rampa_egim_1, 7.8);
    assert.equal(rows[1]!.value.tur, "asansör");
  });

  it("hataları satır numarası ve alan adıyla verir", () => {
    const bad = ramp.replace("38.0251", "kırk").replace("teknoloji-fakultesi-ramp-1,teknoloji", "teknoloji-fakultesi-elevator-1,teknoloji");
    const { errors } = points(elevator, bad);
    assert.ok(errors.every((e) => e.line === 3));
    assert.ok(errors.some((e) => e.message.startsWith("enlem:")));
    assert.ok(errors.some((e) => e.message.includes('"ramp" olmalı')));
  });

  it("nokta kodu bina slug'ı ile başlamalı", () => {
    const { errors } = points(ramp.replace("teknoloji-fakultesi-ramp-1,teknoloji-fakultesi,", "teknoloji-fakultesi-ramp-1,merkezi-kutuphane,"));
    assert.ok(errors.some((e) => e.message.includes("bina_slug (merkezi-kutuphane) ile başlamalı")));
  });

  it("rampada eğim, uzunluk, genişlik ve korkuluk zorunlu", () => {
    const { errors } = points(ramp.replace(",600,110,tek tarafta,", ",,,,"));
    const fields = errors.map((e) => e.message.split(":")[0]);
    assert.deepEqual(fields.sort(), ["korkuluk", "rampa_genislik_cm", "rampa_uzunluk_cm"]);
  });

  it("fotoğraf adı nokta koduyla aynı olmalı", () => {
    const { errors } = points(ramp.replace("teknoloji-fakultesi-ramp-1.jpg", "IMG_1234.jpg"));
    assert.equal(errors[0]?.message, "foto_dosyasi: teknoloji-fakultesi-ramp-1.jpg olmalı");
  });
});

describe("toPointRecord", () => {
  it("rampa: medyan, kenar sayısı, TS 9111 eşikleri yokken null", () => {
    const record = toPointRecord(points(ramp).rows[0]!.value);
    assert.equal(record.type, "ramp");
    assert.equal(record.ramp_slope_pct, 7.9);
    assert.equal(record.ramp_handrail_sides, 1);
    assert.equal(record.ramp_has_handrail, true);
    assert.equal(record.has_tactile_paving, false);
    assert.equal(record.ts9111_compliant, null);
    assert.equal(record.slopeMismatch, null); // 45/600 = %7,5, fark 0,4
  });

  it("H/L ile telefon farkı %1'i aşınca işaretler", () => {
    const record = toPointRecord(points(ramp.replace(",45,600,", ",30,600,")).rows[0]!.value);
    assert.equal(record.slopeMismatch, 2.9);
  });

  it("rampa dışı noktada rampa alanları null", () => {
    const record = toPointRecord(points(elevator).rows[0]!.value);
    assert.equal(record.type, "elevator");
    assert.equal(record.status, "working");
    assert.equal(record.ramp_slope_pct, null);
    assert.equal(record.photoFile, undefined);
  });
});

describe("buildingScore", () => {
  const building = (over: Record<string, string> = {}) =>
    buildingRowSchema.parse({
      slug: "teknoloji-fakultesi",
      ad: "Teknoloji Fakültesi",
      enlem: "38.02",
      boylam: "32.51",
      kat_sayisi: "4",
      basamaksiz_giris: "evet",
      ozet: "",
      puan_elle: "",
      ...over,
    });
  const toilet = toPointRecord(
    points(elevator.replace(/elevator/g, "toilet").replace("Asansör ", "tuvalet")).rows[0]!.value,
  );
  const lift = toPointRecord(points(elevator).rows[0]!.value);

  it("basamaksız giriş yoksa kırmızı", () => {
    assert.equal(buildingScore(building({ basamaksiz_giris: "hayır" }), [lift, toilet]), "red");
  });

  it("çok katlı binada asansör yoksa sarı, tek katlıda aranmaz", () => {
    assert.equal(buildingScore(building(), [toilet]), "yellow");
    assert.equal(buildingScore(building({ kat_sayisi: "1" }), [toilet]), "green");
  });

  it("arızalı tuvalet çalışıyor sayılmaz", () => {
    assert.equal(buildingScore(building(), [lift, { ...toilet, status: "broken" }]), "yellow");
  });

  it("her şey varsa yeşil, puan_elle her zaman kazanır", () => {
    assert.equal(buildingScore(building(), [lift, toilet]), "green");
    assert.equal(buildingScore(building({ puan_elle: "yellow" }), [lift, toilet]), "yellow");
  });
});

it("EWKT önce boylam sonra enlem", () => {
  assert.equal(toEwkt(38.02, 32.51), "SRID=4326;POINT(32.51 38.02)");
});
