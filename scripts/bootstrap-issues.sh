#!/usr/bin/env bash
# Repo için label, milestone ve başlangıç issue'larını oluşturur. Kullanım: scripts/bootstrap-issues.sh <owner/repo>
set -euo pipefail

REPO="${1:?owner/repo gerekli}"
declare -A GH=([sadik]=sadikbilal [kaan]=kaanuzavci [alper]=alpersimsekk)

label() { gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null; }

milestone() {
  gh api "repos/$REPO/milestones" -f title="$1" -f due_on="$2T23:59:59Z" -f description="$3" --jq .title >/dev/null 2>&1 \
    || echo "milestone zaten var: $1"
}

# issue <sorumlu> <milestone> <labels> <title> <body>
issue() {
  local owner="$1" ms="$2" labels="$3" title="$4" body="$5"
  gh issue create --repo "$REPO" --title "$title" --body "$body" --milestone "$ms" \
    --label "sorumlu:$owner,$labels" --assignee "${GH[$owner]}"
}

label "sorumlu:sadik" "1d76db" "Sadık Bilal Şan"
label "sorumlu:kaan"  "0e8a16" "Kaan Uzavcı"
label "sorumlu:alper" "d93f0b" "Alper Şimşek"
label "app"      "5319e7" "Mobil uygulama"
label "backend"  "b60205" "Supabase / veri tabanı"
label "web"      "c5def5" "GitHub Pages / QR sayfası"
label "devops"   "6f42c1" "CI/CD, dağıtım"
label "a11y"     "fbca04" "Erişilebilirlik (WCAG, TalkBack)"
label "saha"     "8b5a2b" "Saha çalışması, ölçüm, veri toplama"
label "tasarim"  "f9d0c4" "Figma / UI tasarımı"
label "rapor"    "bfdadc" "Rapor, sunum, anket, yazışma"

M1="Hafta 5 — Planlama ve Tasarım"
M2="Hafta 6-7 — Saha Verisi ve İlk Sürüm"
M3="Hafta 9-11 — Özellikler ve Kullanıcı Testi"
M4="Hafta 12 — QR Etiketleri ve Analiz"
M5="Hafta 13-14 — Teslim"
milestone "$M1" 2026-10-25 "İş dağılımı, nokta listesi, ölçüm yöntemi, izinler, ön anket, Figma"
milestone "$M2" 2026-11-08 "Saha verisi, basamaksız güzergâhlar, ilk Android sürümü, ilerleme sunumu"
milestone "$M3" 2026-12-06 "En yakın, rota, yol tarifi, sorun bildir, yönetici ekranı, kullanıcı testleri"
milestone "$M4" 2026-12-13 "QR etiketleri, son anket, analiz, eksiklik raporu"
milestone "$M5" 2026-12-27 "Sonuç raporu, video, sunum, birime teslim"

# ───────────── Sadık ─────────────
issue sadik "$M1" "backend" "Supabase projesi, şema ve RLS kuralları" "## Amaç
Veri tabanını \`supabase/migrations/20261019000000_init.sql\` üzerinden kurmak.

## Yapılacaklar
- [ ] Supabase projesi (free plan, Frankfurt) açılması, ekibe erişim
- [ ] PostGIS + migration uygulanması
- [ ] \`point-photos\` Storage bucket'ı (public read, admin write)
- [ ] RLS testleri: anon nokta okuyabilir/yazamaz, anon rapor oluşturabilir/okuyamaz
- [ ] \`.env.local\` örneği ve uygulama başlangıcında Zod ile env doğrulama

## Kabul kriterleri
- Anon key ile \`points\` insert reddediliyor, \`issue_reports\` select boş dönüyor"

issue sadik "$M1" "rapor,saha" "Engelli Öğrenci Birimi görüşmesi ve izin yazışmaları" "## Yapılacaklar
- [ ] Birim yetkilisiyle görüşme (ad, unvan, iletişim, tarih forma işlenecek)
- [ ] Bina içi fotoğraf/dolaşım izni için danışman üzerinden resmi yazı
- [ ] Bina girişlerine QR etiket asma izni (Yapı İşleri ve Teknik Daire Başkanlığı)
- [ ] Anket ve kullanıcı testleri için birim aracılığıyla duyuru"

issue sadik "$M2" "devops" "CI: typecheck/lint, EAS APK build ve GitHub Releases" "## Yapılacaklar
- [ ] PR'larda \`tsc --noEmit\` ve \`expo lint\` çalıştıran workflow
- [ ] EAS preview profili ile APK build
- [ ] Tag push'unda APK'nın GitHub Releases'a yüklenmesi
- [ ] \`main\` için branch protection (PR + 1 onay)"

issue sadik "$M2" "devops,backend" "Supabase keepalive (GitHub Actions cron)" "Free planda 7 gün erişilmeyen proje duraklatılıyor. Haftada 2 kez anon key ile hafif bir select atan zamanlanmış workflow."

issue sadik "$M3" "app,backend" "Yönetici girişi ve yönetici ekranı" "## Yapılacaklar
- [ ] Supabase Auth (e-posta/şifre) ile gizli yönetici girişi
- [ ] Bekleyen sorun bildirimleri listesi; onayla/reddet
- [ ] Onaylanan bildirimde nokta durumunun güncellenmesi
- [ ] Nokta durumunu elle değiştirme
- [ ] Günlük açılış sayıları görünümü

## Kabul kriterleri
- Bildirim yönetici onaylamadan nokta durumunu değiştirmiyor"

issue sadik "$M3" "backend" "Sorun bildirimi kötüye kullanım önlemi (rate limit)" "Cihaza kurulumda üretilen rastgele kimlik (cihazı tanımlamayan) + sunucu tarafında RPC ile saatlik/günlük bildirim sınırı. Doğrudan tablo insert'ü kapatılıp \`submit_report()\` RPC'sine taşınması."

issue sadik "$M3" "rapor" "Kullanıcı testlerinin organizasyonu" "Tekerlekli sandalye kullanan ve görme engelli öğrencilerle test oturumları: bilgilendirilmiş onam formu, görev senaryoları, gözlem notları, düzeltme listesi."

issue sadik "$M4" "rapor,saha" "Eksiklik raporu ve birimden yazılı görüş" "TS 9111'e uymayan / eksik noktaların ölçüm kayıtlarıyla raporlanması; ön tespit niteliğinde olduğunun belirtilmesi. Resmi yazıyla teslim, birimden yazılı görüş."

issue sadik "$M5" "rapor" "Sonuç raporu, proje dosyası, video ve final sunumu" "- [ ] Sonuç raporu ve proje dosyası
- [ ] Proje videosu
- [ ] Final sunumu
- [ ] Uygulama, kullanım kılavuzu ve eksiklik raporunun birime ve Yapı İşleri'ne teslimi"

issue sadik "$M5" "rapor" "Birim için yönetici kullanım kılavuzu ve devir" "Yönetici ekranı kullanımı, veri güncelleme, Supabase hesabı devri."

# ───────────── Kaan ─────────────
issue kaan "$M1" "tasarim,a11y" "Figma ekran tasarımları" "Harita, filtre, nokta/bina detayı, rota, sorun bildir, bilgi ekranı, yönetici ekranı. Büyük dokunma alanı (≥48dp), yüksek kontrast varyantı, renge dayanmayan simgeler."

issue kaan "$M1" "rapor" "Ön/son ihtiyaç anketinin hazırlanması" "5-8 soruluk anonim anket (Google Forms), ön anketin hafta 5'te uygulanması. Hedef ≥10 katılımcı. Kişisel veri sorulmayacak."

issue kaan "$M2" "app" "Uygulama iskeleti: Expo Router, tema, Supabase istemcisi" "## Yapılacaklar
- [ ] Expo Router (\`src/app/\`) ve tab/stack yapısı
- [ ] Tema: yüksek kontrast modu, sistem yazı boyutuna uyum
- [ ] Supabase client + veri çekme hook'ları, Zustand store
- [ ] Açılışta \`log_app_open()\` çağrısı"

issue kaan "$M2" "app" "Harita ekranı ve nokta işaretleri" "react-native-maps (Google) ile kampüs haritası; tür başına ayırt edilebilir simge ve erişilebilir etiket; bina dokununca özet kartı (yeşil/sarı/kırmızı puan + metin)."

issue kaan "$M2" "app,a11y" "Nokta ve bina detay ekranı" "Fotoğraf, kat, durum, son güncelleme tarihi, rampa ölçümleri ve TS 9111 uyarısı, sözlü tarif, kılavuz iz bilgisi. Tüm görsellerde açıklama metni."

issue kaan "$M2" "app" "Türe göre filtreleme" "Rampa / asansör / tuvalet / otopark / otomatik kapı filtreleri; en fazla iki dokunuşla erişim."

issue kaan "$M3" "app" "\"Bana en yakın\" ve Google Haritalar yol tarifi" "expo-location ile konum (sunucuya gönderilmez), seçilen türde en yakın çalışan nokta; Linking ile Google Haritalar yol tarifi."

issue kaan "$M3" "app,a11y" "TalkBack ve WCAG 2.1 denetimi" "Tüm ekranlarda accessibilityLabel/Role/Hint, odak sırası, kontrast ölçümü, büyük yazı testi. Bulguların düzeltilmesi."

issue kaan "$M3" "app" "Bilgi ekranı: birim iletişimi, haklar, KVKK aydınlatma metni" ""

issue alper "$M4" "rapor" "Son anket ve ön/son anket + kullanım verisi analizi" "\"Kolay buldum\" oranı hedefi ≥%70; Releases indirme sayısı, günlük açılış, bildirim sayısı, QR ziyaretleri."

# ───────────── Alper ─────────────
issue alper "$M1" "saha,rapor" "Bina/nokta listesi, saha veri formu ve ölçüm yöntemi" "## Yapılacaklar
- [ ] Haritalanacak en az 8 bina ve aday nokta listesi
- [ ] Saha veri formu (konum, foto, kat, durum, eğim, genişlik, korkuluk, sözlü tarif, kılavuz iz)
- [ ] Ölçüm yöntemi dokümanı: kalibrasyon, en az 3 noktadan ölçüm, şerit metre ile yükseklik/uzunluk doğrulaması
- [ ] \`docs/saha/\` altına eklenmesi"

issue sadik "$M2" "app,saha" "Eğim ölçer ekranı (ekip için)" "expo-sensors ivmeölçer ile eğim (%); düz zeminde kalibrasyon, çoklu ölçüm ortalaması, TS 9111 sınırına göre uyarı. Yalnızca yönetici/ekip modunda görünür."

issue alper "$M2" "saha,backend" "Saha verisinin toplanması ve veri tabanına girilmesi" "Hedef: ≥60 nokta, 8 bina. Fotoğraflar kişi içermeyecek ve sıkıştırılarak Storage'a yüklenecek. Seed script ile toplu giriş."

issue alper "$M2" "saha" "Basamaksız güzergâhların yürünerek kaydedilmesi" "8 binayı bağlayan merdivensiz yolların GPS ile kaydı; \`path_nodes\`/\`path_edges\` grafına dönüştürülmesi (düğümler: kavşaklar, bina girişleri, noktalar)."

issue sadik "$M3" "app" "Basamaksız rota: Dijkstra ve harita üzerinde çizim" "Yol ağı grafı üzerinde cihazda en kısa yol; harita üzerinde polyline; mesafe ve sözlü adım listesi (ekran okuyucu için). Birim testleri ile."

issue sadik "$M3" "app" "Sorun bildir ekranı (anonim)" "Nokta seçimi, durum (arızalı vb.), kısa açıklama (≤500). Üyelik yok, kişisel veri yok. Başarı/hata geri bildirimi ekran okuyucuyla duyurulmalı."

issue alper "$M3" "web" "QR hedef sayfası (GitHub Pages) ve deep link" "\`/b/<slug>\` bina özeti + APK indirme bağlantısı; uygulama yüklüyse Android App Links/scheme ile ilgili bina sayfasının açılması. Ziyaret sayacı (çerezsiz)."

issue alper "$M4" "saha,tasarim" "QR etiketlerinin tasarımı, basımı ve asılması" "Bina puanı + imkân simgeleri, büyük punto, yüksek kontrast, QR altında açık URL; laminasyon; yerden 90-120 cm. 8 bina girişi."

echo "Tamam."
