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

Ekran tasarımları ayrı bir araçta değil repoda: [tasarım rehberi](docs/tasarim/tasarim-rehberi.md) (kurallar, renkler, bileşenler, ekranlar) ve [ekran taslakları](docs/tasarim/ekranlar).

## Geliştirme

### Ortam kurulumu

Harita Google Maps API key'i gerektirdiği için **Expo Go yeterli değil**, development build kullanılır.

- Node 22+ ve pnpm (`corepack enable`)
- Android Studio + Android SDK (Platform Tools, bir emülatör imajı) veya USB hata ayıklaması açık bir Android telefon
- `ANDROID_HOME` ortam değişkeni ve `platform-tools` PATH'te (`adb devices` cihazı görmeli)

```bash
cd app
pnpm install
cp .env.example .env.local   # değerleri doldurun
pnpm android                 # native build + cihaza kurulum (ilk sefer uzun sürer)
pnpm start                   # sonraki çalıştırmalarda yalnızca Metro
```

Lokal Supabase ile çalışırken `EXPO_PUBLIC_SUPABASE_URL` olarak bilgisayarın yerel ağ IP'si verilir (`http://192.168.x.x:54321`); emülatörde `http://10.0.2.2:54321`.

Eksik veya hatalı env ile uygulama açılışta "Yapılandırma hatası" ekranı gösterir.

Android'de harita için `.env.local` içine `GOOGLE_MAPS_API_KEY` yazılır (Google Cloud → Maps SDK for Android; anahtar `tr.edu.selcuk.kampuserisim` paketi ve imza SHA-1'i ile kısıtlanır). Anahtar `app.config.ts` ile yalnızca derlemede okunur, repoya girmez; EAS build'de aynı adla EAS ortam değişkeni olarak tanımlanır (`--visibility sensitive`). Anahtar yoksa Android'de harita ekranı açılışta çöker ("API key not found"); EAS build anahtarsız başlamaz.

### Kontroller

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Paket eklerken `pnpm expo install <paket>` kullanılır (SDK 58 ile uyumlu sürümü seçer). Uygulama kodu `app/src/`: ekranlar `app/`, ortak bileşenler `components/`, Supabase ve yardımcılar `lib/`, Zustand store'ları `store/`, tema `theme/`.

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

## Sürüm (APK) yayınlama

Uygulama GitHub Releases'tan APK olarak dağıtılır. Her PR'da `.github/workflows/ci.yml` typecheck, lint ve testleri çalıştırır; EAS build yalnızca sürümde alınır (ücretsiz plan kotası sınırlı).

Bir kerelik kurulum:

```bash
cd app
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest init            # app.json'a extra.eas.projectId ekler, commit edin
# Uygulamanın derleme anında okuduğu public değerler (her ortam için)
pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://<ref>.supabase.co --visibility plaintext
pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon-key> --visibility plaintext
# Harita için Android Google Maps anahtarı (yalnızca derlemede okunur, JS paketine girmez)
pnpm dlx eas-cli@latest env:create --environment production --name GOOGLE_MAPS_API_KEY --value <anahtar> --visibility sensitive
```

Repo secrets: `EXPO_TOKEN` (expo.dev → Access tokens).

Sürüm çıkarmak:

```bash
git tag v0.1.0 && git push origin v0.1.0
```

`release.yml` EAS'te production APK'yı üretir ve `kampus-erisilebilirlik-v0.1.0.apk` olarak Releases'a yükler. Ekip içi geliştirme build'i: `pnpm dlx eas-cli@latest build -p android --profile development`. Sahada ölçüm yapacak ekip telefonlarına `preview` profili kurulur (`--profile preview`); bu build'de eğim ölçer Bilgi sekmesinde görünür (`EXPO_PUBLIC_TEAM_TOOLS=1`).

## Çalışma düzeni

- Her iş bir issue; branch adı `<issue-no>-kisa-aciklama` (ör. `12-harita-ekrani`)
- `main`'e doğrudan push yok, PR + en az bir ekip arkadaşının onayı
- Commit mesajları: `feat:`, `fix:`, `docs:`, `chore:` önekleri
- PR, issue'nun kod kısmını bitiriyorsa açıklamaya `Closes #N`; kalan elle yapılacak adımlar ilgili issue'ya checklist ya da yeni issue olur. İş bitmiyorsa (parçası ya da asıl iş kod dışı) `Refs #N`. `Closes` commit mesajına yazılmaz
- Commit, PR ve yorumlara AI aracı imzası eklenmez (`Co-Authored-By: Claude`, "Generated with …" vb.). Claude Code için `.claude/settings.json` bunu kapatır.

## Supabase keepalive

Supabase Free plan, 7 gün istek almayan projeyi duraklatır. `.github/workflows/supabase-keepalive.yml` Pazartesi ve Perşembe 09:00'da REST API'ye istek atar (repo secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`).

- İstek başarısız olursa workflow kırmızı olur ve repo sahibine e-posta gider.
- GitHub, 60 gün commit almayan repolarda zamanlanmış workflow'ları devre dışı bırakır. Actions sekmesinde "workflow disabled" uyarısı görülürse **Enable workflow**'a basın.

## Gizlilik

Uygulama üyelik istemez, kişisel veri toplamaz. Konum yalnızca cihazda kullanılır, sunucuya gönderilmez. Sorun bildirimleri anonimdir.

## Lisans

MIT
