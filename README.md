# Kampüs Erişilebilirlik Haritası

Selçuk Üniversitesi Alaeddin Keykubat Yerleşkesi'ndeki rampa, asansör, engelli tuvaleti, engelli otoparkı, otomatik kapı ve basamaksız güzergâhları tek bir mobil uygulamada toplayan açık kaynak proje.

**Ders:** Topluma Hizmet Uygulamaları — Teknoloji Fakültesi, Bilgisayar Mühendisliği
**Danışman:** Prof. Dr. Nurettin Doğan
**Ekip:** Sadık Bilal Şan (koordinatör), Alper Şimşek, Kaan Uzavcı

## Özellikler

- Harita üzerinde erişilebilirlik noktaları (fotoğraf, kat, çalışıyor/arızalı durumu)
- Rampa eğim/genişlik ölçümleri ve TS 9111 uygunluk uyarısı
- Bina bazlı yeşil/sarı/kırmızı erişilebilirlik puanı
- Türe göre filtreleme, "Bana en yakın" arama
- Basamaksız en kısa rota (Dijkstra) ve Google Haritalar yol tarifi
- Ekran okuyucu (TalkBack) uyumlu sözlü tarifler, kılavuz iz bilgisi
- Anonim "Sorun bildir" ve Engelli Öğrenci Birimi için yönetici ekranı
- Bina girişlerinde QR etiketleri → bina özeti / uygulama indirme sayfası

## Yapı

```
app/          React Native (Expo, TypeScript) mobil uygulama
supabase/     PostgreSQL + PostGIS şeması, RLS kuralları (migrations)
web/          GitHub Pages: QR hedef sayfası (bina özeti + APK indirme)
docs/         Proje teklif formu, saha veri formu, ölçüm yöntemi, raporlar
```

## Geliştirme

```bash
cd app
pnpm install
pnpm start
```

`app/.env.local` içine:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### Supabase (lokal)

Docker gerekir. Repo kökünde:

```bash
pnpm dlx supabase start      # lokal Postgres + Auth + Storage, migrations uygulanır
pnpm dlx supabase test db    # supabase/tests/ altındaki RLS testleri (pgTAP)
pnpm dlx supabase db reset   # şemayı sıfırdan kurar
```

Şema değiştiğinde yeni dosya `supabase/migrations/<timestamp>_aciklama.sql` olarak eklenir, ardından tipler yeniden üretilir:

```bash
pnpm dlx supabase gen types typescript --linked > app/src/types/database.ts
```

`service_role` key uygulamaya veya repoya asla girmez.

## Çalışma düzeni

- Her iş bir issue; branch adı `<issue-no>-kisa-aciklama` (ör. `12-harita-ekrani`)
- `main`'e doğrudan push yok, PR + en az bir ekip arkadaşının onayı
- Commit mesajları: `feat:`, `fix:`, `docs:`, `chore:` önekleri

## Supabase keepalive

Supabase Free plan, 7 gün istek almayan projeyi duraklatır. `.github/workflows/supabase-keepalive.yml` Pazartesi ve Perşembe 09:00'da REST API'ye istek atar (repo secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`).

- İstek başarısız olursa workflow kırmızı olur ve repo sahibine e-posta gider.
- GitHub, 60 gün commit almayan repolarda zamanlanmış workflow'ları devre dışı bırakır. Actions sekmesinde "workflow disabled" uyarısı görülürse **Enable workflow**'a basın.

## Gizlilik

Uygulama üyelik istemez, kişisel veri toplamaz. Konum yalnızca cihazda kullanılır, sunucuya gönderilmez. Sorun bildirimleri anonimdir.

## Lisans

MIT
