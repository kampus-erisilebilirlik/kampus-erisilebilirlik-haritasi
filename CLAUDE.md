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
- **Sadık** (`sadikbilal`, koordinatör): Supabase şema/RLS, yönetici ekranı, rate limit, CI/CD, kurum yazışmaları, raporlar; tüm `app` issue'larında ortak geliştirici; eğim ölçer, Dijkstra rota ve sorun bildir ekranında lider
- **Kaan**: Uygulama iskeleti, harita, detay, filtre, en yakın, erişilebilirlik (TalkBack/WCAG), Figma, ön anket
- **Alper**: Saha veri formu ve ölçüm yöntemi, veri girişi, basamaksız güzergâh kaydı, QR sayfası/etiketleri, son anket ve etki analizi; RN'yi yeni öğreniyor — eğim ölçer, rota ve sorun bildir ekranında Sadık ile eşli çalışır
- GitHub: `sadikbilal`, `kaanuzavci`, `alpersimsekk` — org `kampus-erisilebilirlik`, repo `kampus-erisilebilirlik-haritasi`

### Proje panosu
- GitHub Projects #1 (org): Tablo, Kanban, Benim işlerim görünümleri
- Status: Backlog → Yapılacak → Devam Ediyor → İncelemede → Tamamlandı

### Milestone'lar (dönem başı 2026-09-21 varsayıldı)
| Milestone | Bitiş |
|---|---|
| Hafta 5 — Planlama ve Tasarım | 2026-10-25 |
| Hafta 6-7 — Saha Verisi ve İlk Sürüm | 2026-11-08 |
| Hafta 9-11 — Özellikler ve Kullanıcı Testi | 2026-12-06 |
| Hafta 12 — QR Etiketleri ve Analiz | 2026-12-13 |
| Hafta 13-14 — Teslim | 2026-12-27 |

### Geliştirmeye başlarken yapılacaklar
- [ ] Repoyu public yap (GitHub Pages / QR sayfası #27 için şart): `gh repo edit kampus-erisilebilirlik/kampus-erisilebilirlik-haritasi --visibility public --accept-visibility-change-consequences`
- [ ] Kaan ve Alper'e write yetkisi: `gh api -X PUT repos/kampus-erisilebilirlik/kampus-erisilebilirlik-haritasi/collaborators/<user> -f permission=push`
- [ ] Proje panosu Workflows (web UI): "Item closed" ve "Pull request merged" → Tamamlandı; "Auto-add to project" açık; PR açılınca İncelemede
- [ ] TS 9111 eşik değerleri standardın metninden kaynak maddeyle doğrulanacak (#21) — internetteki değerlere güvenilmeyecek
- [ ] QR URL'si etiket basımından önce kesinleşecek (#27, #28), basımdan sonra değiştirilemez
- Issue'lara eklenen, formda olmayan kararlar: harita yanında zorunlu liste görünümü, çevrimdışı önbellek, `v_*` lat/lng view'ları, `qr_visits` sayacı, `path_edges.note`, `submit_report` RPC + client token

### Açık sorular
- Repo şu an private; açık kaynak için public yapılacak
- Kaan/Alper'in repo yetkisi org varsayılanı (read) — push için write verilmeli
- Dönem başlangıç tarihi (milestone tarihleri buna göre kaydırılabilir)
