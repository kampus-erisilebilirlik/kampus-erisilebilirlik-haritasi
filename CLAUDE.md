# Kampüs Erişilebilirlik Haritası

Topluma Hizmet Uygulamaları dersi projesi. Kaynak: `docs/proje-formu/Proje_Teklif_Formu_v2.docx`.

## Kurallar (tüm ekip ve AI araçları için)
- Commit, PR, issue ve yorumlarda AI aracı kendini eklemez: `Co-Authored-By: Claude`, "Generated with Claude Code", oturum linki veya benzeri imza/collaborator satırı yok. Repo `.claude/settings.json` (`attribution` boş) bunu Claude Code için zorlar; başka araç kullanan da aynı kurala uyar.

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

## Handoff — 2026-10-20
Completed: #1 kod kısmı (PR açıldı): config.toml (signup kapalı), view'lar + `point-photos` bucket/policy migration'ı, pgTAP RLS testleri (17/17 geçiyor), `app/src/types/database.ts`, `.env.example`; #4 keepalive (PR #30); #6 SQL kısmı — `submit_report` RPC + testler (PR #31, #29 üzerine stacked)
Blocked: #1 dashboard adımları elle yapılacak (Supabase projesi Frankfurt/Free, Kaan+Alper Developer daveti, admin kullanıcı + `insert into admins`, `supabase link` + `db push`); #4 için repo secrets `SUPABASE_URL`/`SUPABASE_ANON_KEY` gerekli; #3 → #13'ü bekliyor
Next: #6 istemci kısmı (`clientToken.ts`) #13 sonrası #26 ile; canlı projeye `db push` → `gen types --linked` ile tipleri doğrula; #4'ü `workflow_dispatch` ile test et; #13 sonrası #3 CI
Decisions made: v_points açık kolon listesi (ham geography dönmez); storage policy `to authenticated` + `public.is_admin()`; view kolonları üretilen tiplerde nullable — uygulama tarafında non-null assert/Zod ile daraltılmalı; keepalive'da boş commit adımı yok (main korumalı), devre dışı kalma riski README'de

## Handoff — 2026-10-25
Completed: PR #29, #30, #31 merge edildi (main'de, 28/28 pgTAP geçiyor); #1, #4, #6 açık kaldı (elle yapılacak adımlar), panoda "Devam Ediyor". #13 uygulama iskeleti PR #32 (Kaan reviewer, panoda İncelemede): Expo Router 3 sekme, env (Zod safeParse → hata ekranı), `getSupabase()`, Zustand data store + persist önbellek, tema (geçici token'lar), AppText/AppButton/StatusBadge/SyncStatus, ESLint 9 + Jest; typecheck/lint/test (8/8) temiz, expo-doctor 20/20
Blocked: #1 dashboard (Supabase projesi, admin, `link` + `db push`), #4 repo secrets; #32 cihaz testi (emülatör yok) ve Kaan onayı
Next: #32 merge → #3 CI (typecheck/lint/test + EAS), #6 `clientToken.ts`, #22 eğim ölçer; #11 Figma gelince `theme/tokens.ts`
Decisions made: PR'larda dashboard adımı kalan issue'lar `Refs` ile bağlanır, `Closes` değil; stacked PR'da `gh pr merge --delete-branch` kullanma (bağlı PR kapanır); AppText'te `role` yerine `variant` (RN ARIA `role` ile çakışma); view satırları `lib/schemas.ts` Zod şemalarıyla daraltılır; veri yenilemesi persist hydration bittikten sonra başlar; ESLint 9'da sabit (eslint-plugin-react ESLint 10 desteklemiyor); TS 6 → tsconfig `types: ["jest"]`; testler `src/app/` dışında (route sayılmasın)
