# Saha verisi aktarımı (#23)

Saha formundan (#21) gelen noktaları ve `docs/saha/binalar.csv`'deki binaları Supabase'e yazar, fotoğrafları sıkıştırıp Storage'a yükler. Tekrar çalıştırılınca kopya oluşturmaz: binalar `slug`, noktalar `nokta_kodu` (`points.code`) ile **upsert** edilir.

## Kurulum (bir kez)

```bash
cd scripts/seed
pnpm install
cp .env.example .env    # SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY'i doldurun
```

`SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Project Settings → API → `service_role`. Bu anahtar RLS'i atlar. **Yalnızca bu lokal `.env` dosyasında** durur, commit'lenmez, uygulamaya girmez.

Veri tabanında `20261025000000_points_field_data.sql` migration'ı uygulanmış olmalı (`supabase db push`).

## Veriyi hazırlama

`data/` klasörü `.gitignore`'da, içindekiler repoya girmez.

```
scripts/seed/data/
  points.csv                        Google Sheets → Dosya → İndir → CSV
  photos/
    teknoloji-fakultesi/
      teknoloji-fakultesi-ramp-1.jpg  Drive'daki saha-fotograflari/ klasörünün aynısı
```

Binalar `docs/saha/binalar.csv`'den okunur (koordinat, kat sayısı, basamaksız giriş, özet doldurulmuş olmalı).

## Çalıştırma

```bash
pnpm seed --dry-run                                  # önce kontrol: hiçbir şey yazmaz
pnpm seed --dry-run --envanter ../../docs/saha/envanter.md   # envanter tablosunu da üretir
pnpm seed                                            # yazar
```

| Seçenek | Varsayılan |
|---|---|
| `--points <dosya>` | `data/points.csv` |
| `--buildings <dosya>` | `../../docs/saha/binalar.csv` |
| `--photos <klasör>` | `data/photos` |
| `--skip-photos` | fotoğrafları yüklemez |
| `--envanter <dosya>` | bina başına nokta sayısı tablosunu yazar |

## Ne yapar?

1. CSV'leri okur, her satırı doğrular. **Tek bir hata bile varsa** hepsini satır numarası ve alan adıyla listeler ve hiçbir şey yazmaz. Örnek:
   ```
   docs/saha/binalar.csv:3  enlem: boş olamaz
   data/points.csv:14  nokta_kodu: tür rampa için kod "ramp" olmalı
   ```
   Kontroller: zorunlu alanlar, sayılar (virgül de kabul), seçenekler, nokta kodu biçimi ve bina/tür ile uyumu, rampa ölçümleri, fotoğraf adı = nokta kodu, tekrar eden kodlar, olmayan bina.
2. Uyarılar (yazmayı engellemez): H/L ile telefon medyanı arasında %1'den büyük fark, eksik fotoğraf, hesaplanamayan TS 9111 uygunluğu.
3. Eğim = 3 ölçümün medyanı → `ramp_slope_pct`. `checkRamp` (`app/src/lib/ts9111.ts`, #22) → `ts9111_compliant`. Eşikler girilmediyse `null` kalır.
4. Bina puanı `docs/saha/puanlama.md` kuralıyla nokta verisinden hesaplanır (`puan_elle` doluysa o kullanılır).
5. Binaları ve noktaları upsert eder.
6. Fotoğrafları en uzun kenar 1280 px, JPEG kalite 75'e sıkıştırır (~150-250 KB) ve `point-photos/<bina-slug>/<nokta-id>.jpg` olarak yükler.

`olcen` ve `notlar` alanları veri tabanına yazılmaz.

## Test

```bash
pnpm test        # doğrulama, medyan, puanlama
pnpm typecheck
```

## Basamaksız yol ağı (#24)

`docs/saha/yol-agi.geojson` → `path_nodes` / `path_edges`. Çizim kuralları ve adımlar: [`docs/saha/yol-agi.md`](../../docs/saha/yol-agi.md).

```bash
pnpm import-paths --dry-run --engeller ../../docs/saha/engeller.md
pnpm import-paths
```

| Seçenek | Varsayılan |
|---|---|
| `--geojson <dosya>` | `../../docs/saha/yol-agi.geojson` |
| `--points`, `--buildings` | seed ile aynı |
| `--engeller <dosya>` | `engel` işaretlerini Markdown tablo olarak yazar |

Bağlantı sorunu (graf birden fazla parça, ana ağa bağlı olmayan bina) varsa yazmaz. Yazarken eski graf silinir ve yenisi `replace_path_graph` ile tek transaction'da yazılır.
