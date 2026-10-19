# Kampüs Erişilebilirlik Haritası

Topluma Hizmet Uygulamaları dersi projesi. Kaynak: `docs/proje-formu/Proje_Teklif_Formu_v2.docx`.

## Plan

### Mimari
- `app/`: Expo (SDK 58) + React Native + TypeScript strict, Expo Router, Zustand, react-native-maps (Google), expo-location, expo-sensors
- `supabase/`: PostgreSQL + PostGIS, Storage (`point-photos`), Auth yalnızca yönetici için, RLS ile yazma yetkisi admin'de; `issue_reports` anon için yalnızca insert
- `web/`: GitHub Pages — QR hedefi `/b/<slug>` (bina özeti + APK indirme), uygulama yüklüyse deep link
- Rota: `path_nodes`/`path_edges` grafı istemciye çekilir, Dijkstra cihazda çalışır
- Dağıtım: EAS build → GitHub Releases (APK)
- Supabase free plan pause'u için GitHub Actions keepalive cron

### Ekip ve sorumluluk
- **Sadık** (`sadikbilal`, koordinatör): Supabase şema/RLS, yönetici ekranı, rate limit, CI/CD, kurum yazışmaları, raporlar
- **Kaan**: Uygulama iskeleti, harita, detay, filtre, en yakın, erişilebilirlik (TalkBack/WCAG), Figma, ön anket
- **Alper**: Saha veri formu ve ölçüm yöntemi, eğim ölçer, veri girişi, basamaksız güzergâh + Dijkstra rota, sorun bildir ekranı, QR sayfası/etiketleri, son anket ve etki analizi
- GitHub: `sadikbilal`, `kaanuzavci`, `alpersimsekk` — org `kampus-erisilebilirlik`, repo `kampus-erisilebilirlik-haritasi`

### Milestone'lar (dönem başı 2026-09-21 varsayıldı)
| Milestone | Bitiş |
|---|---|
| Hafta 5 — Planlama ve Tasarım | 2026-10-25 |
| Hafta 6-7 — Saha Verisi ve İlk Sürüm | 2026-11-08 |
| Hafta 9-11 — Özellikler ve Kullanıcı Testi | 2026-12-06 |
| Hafta 12 — QR Etiketleri ve Analiz | 2026-12-13 |
| Hafta 13-14 — Teslim | 2026-12-27 |

### Açık sorular
- Repo şu an private; açık kaynak için public yapılacak
- Kaan/Alper'in repo yetkisi org varsayılanı (read) — push için write verilmeli
- Dönem başlangıç tarihi (milestone tarihleri buna göre kaydırılabilir)
