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

## Çalışma düzeni

- Her iş bir issue; branch adı `<issue-no>-kisa-aciklama` (ör. `12-harita-ekrani`)
- `main`'e doğrudan push yok, PR + en az bir ekip arkadaşının onayı
- Commit mesajları: `feat:`, `fix:`, `docs:`, `chore:` önekleri

## Gizlilik

Uygulama üyelik istemez, kişisel veri toplamaz. Konum yalnızca cihazda kullanılır, sunucuya gönderilmez. Sorun bildirimleri anonimdir.

## Lisans

MIT
