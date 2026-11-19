# TalkBack ve WCAG 2.1 Denetimi

Issue #18. Hedef: WCAG 2.1 AA.

- Bölüm 1, ekran × kriter tablosudur: her ekranın hangi ölçütte denetlendiğini gösterir.
- Bölüm 2, kodda uygulananları WCAG maddelerine göre listeler.
- Bölüm 3, kod denetiminde bulunan sorunlardır.
- Bölüm 4, Android cihazda yapılacak testlerin protokolüdür; bulgular bölüm 5'e işlenir. Sonuçlar sonuç raporuna (#9) eklenir.

Harita ve liste (#14), nokta ve bina detayı (#15), filtre (#16), "en yakın" (#17) ve bilgi ekranı (#19) kodda. Yeni ekran ekleyenler (rota #25, sorun bildir #26, yönetici #5) bölüm 2'deki kurallara uyar ve bölüm 4'teki testleri kendi ekranları için tekrarlar.

## 1. Ekran × kriter tablosu

✓ = kod denetiminde uygun, — = ekranda bu ölçüt yok. Cihaz sütunu bölüm 4'teki testlerle (#42) doldurulur.

| Ekran | Etiket ve rol | Durum (`checked`, `busy`…) | Odak sırası | Duyurular | Renge bağımlılık yok | Dokunma alanı ≥48dp | Büyük yazı / yatay | Cihaz (TalkBack + Scanner) |
|---|---|---|---|---|---|---|---|---|
| Harita | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Bekliyor |
| Liste | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Bekliyor |
| Nokta detayı | ✓ | — | ✓ | — | ✓ | ✓ | ✓ | Bekliyor |
| Bina detayı | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Bekliyor |
| Bilgi / KVKK | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | Bekliyor |
| Eğim ölçer (ekip) | ✓ (K7) | ✓ (K7) | ✓ | ✓ | ✓ | ✓ | Açık (K8) | Bekliyor |
| Sorun bildir | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Bekliyor |
| Rota, yönetici | Ekranlar yapılınca (#25, #5) | | | | | | | |

Jest'te ekran okuyucu sorgularıyla (`getByRole`, `getByLabelText`) yazılmış erişilebilirlik testleri:

- Nokta ve bina detayı: `screens.test.tsx`
- Filtre: `FilterBar.test.tsx`
- Bilgi ekranı: `InfoSections.test.tsx`
- Puan ve durum rozetleri
- Sorun bildir: `ReportForm.test.tsx`, `screens.test.tsx`

## 2. Kodda uygulananlar

| WCAG 2.1 | Uygulama | Nerede |
|---|---|---|
| 1.1.1 Metin dışı içerik | Nokta fotoğrafları açıklamalı ve odaklanabilir ("Fotoğraf: Rampa, Ana giriş rampası, Teknoloji Fakültesi"). Süs simgeleri erişilebilirlik ağacından gizli. Haritanın etiketi ve ipucu var; işaretler "tür, ad, bina, kat, durum" olarak okunur. | `PointPhoto`, `CampusMap`, rozetler |
| 1.3.1 Bilgi ve ilişkiler | Başlıklar `header` rolünde. Filtre çipleri `checkbox`, gezinen satırlar ve iletişim satırları `link`, açılır bölüm `button` + `expanded` rolünde. | `AppText`, `FilterBar`, `PointRow`, `InfoSections`, `ScoreExplanation` |
| 1.3.2 Anlamlı sıra | Ekranlar yukarıdan aşağıya doğal sırada. Nokta detayında sıra: başlık → durum → uyarı → tarif. Harita kartı haritadan sonra gelir. | tüm ekranlar |
| 1.3.4 Yönlendirme | Ekran yönü kilitli değil (`orientation: default`). Telefon tekerlekli sandalyeye yatay sabitlenmiş olabilir. | `app.json` |
| 1.4.1 Rengin kullanımı | Puan ve durum hem simge şekliyle hem metinle verilir. Ölçülmemiş binaya renk verilmez ("Henüz ölçülmedi" + soru işareti). Seçili filtre çipinde onay işareti, arızalı işarette ek simge var. | `ScoreBadge`, `StatusBadge`, `FilterBar`, `CampusMap` |
| 1.4.3 Kontrast (asgari) | Metin renkleri her iki temada ≥4.5:1 (tablo aşağıda). `tokens.test.ts` her CI çalışmasında denetler. Android'de yüksek kontrast modunda harita altlığı da koyu, yüksek kontrastlı stile geçer. | `theme/tokens.ts`, `lib/mapStyle.ts` |
| 1.4.4 Metni yeniden boyutlandırma | `allowFontScaling` kapatılmadı, sabit yükseklik yerine `minHeight` kullanıldı. Uzun içerikler kaydırılabilir. Harita kartı en fazla ekranın %75'i kadar uzar, fazlası kayar. | `AppText`, `SelectionCard` |
| 1.4.10 Yeniden akış | Yatay ekranda ve büyük yazıda içerik kaydırılabilir. İki boyutlu kaydırma yalnızca haritada var. | tüm ekranlar |
| 1.4.11 Metin dışı kontrast | Kenarlık (anahtarın kapalı izi, çip ve düğme sınırı) ≥3:1. İşaret çerçeveleri durum/puan renginde. | `theme/tokens.ts` |
| 2.4.6 Başlıklar ve etiketler | Her ekranın başlığı var. Düğmeler eylemi söyler ("Kartı kapat", "Filtreleri temizle"). Liste başlıklarındaki "Bina sayfasını aç" düğmeleri bina adıyla ayrışır. | tüm ekranlar |
| 2.5.3 Etikette ad | Ekran okuyucu adı görünen metni içerir ("Teknoloji Fakültesi: Bina sayfasını aç"). | `liste.tsx` |
| 2.5.5 Hedef boyutu | Dokunulabilir her öğe en az 48dp (`minTouchSize`). | `AppButton`, `FilterBar`, `SelectionCard`, `InfoSections` |
| 3.1.1 Sayfanın dili | Metinler Türkçe ve sade; kısaltmalar açıklanır ("TS 9111 (Türk erişilebilirlik standardı)"). | tüm ekranlar |
| 4.1.2 Ad, rol, değer | Filtre çipleri ve eğim ölçerin korkuluk seçimi `checked` durumunu verir. Ayar anahtarı etiketli. Liste satırı "tür, ad, bina, kat, durum" olarak tek parça okunur; bilgi satırları "etiket: değer" olarak okunur. | `FilterBar`, `olcum.tsx`, `bilgi.tsx`, `PointRow`, `InfoRow` |
| 4.1.3 Durum mesajları | Veri yükleme ve çevrimdışı durumu, filtre sonucu ("2 nokta gösteriliyor"), harita seçimi, eğim ölçer mesajları ekran okuyucuya duyurulur. | `SyncStatus`, `FilterBar`, `SelectionCard`, `olcum.tsx` |

### Kontrast oranları

Oranlar WCAG göreli parlaklık formülüyle hesaplandı; aynı hesap `app/src/theme/tokens.test.ts` içinde. Zemin `background` / `surface`.

| Öğe | Normal tema | Yüksek kontrast |
|---|---|---|
| Ana metin | #1A1C1E — 17.1 / 15.7 | #FFFFFF — 21.0 / 18.7 |
| İkincil metin, "henüz ölçülmedi" puanı | #4A5058 — 8.1 / 7.5 | #E0E0E0 — 15.9 / 14.2 |
| Birincil renk (düğme, bağlantı) | #0B57D0 — 6.4 / 5.9 | #FFD60A — 14.9 / 13.3 |
| Birincil düğme metni | #FFFFFF / #0B57D0 — 6.4 | #000000 / #FFD60A — 14.9 |
| Çalışıyor / yeşil puan | #1B6E33 — 6.3 / 5.8 | #5CE08A — 12.5 / 11.1 |
| Arızalı / kırmızı puan | #B3261E — 6.5 / 6.0 | #FF8A80 — 9.2 / 8.2 |
| Sarı puan | #8A5300 — 6.3 / 5.8 | #FFD60A — 14.9 / 13.3 |
| Kenarlık (metin dışı, ≥3) | #80868F — 3.7 / 3.4 | #FFFFFF — 21.0 / 18.7 |

## 3. Kod denetimi bulguları

| # | Bulgu | WCAG | Durum |
|---|---|---|---|
| K1 | Normal temada kenarlık #C4C7CC zeminde 1.7:1'di; ayarlar anahtarının kapalı izi ve filtre çiplerinin sınırı seçilemiyordu. | 1.4.11 | Düzeltildi: #80868F (3.7:1), `tokens.test.ts` ile CI'da denetleniyor. |
| K2 | Ekran yönü dikeye kilitliydi. | 1.3.4 | Düzeltildi: `orientation: default`. |
| K3 | Android'de react-native-maps işaretin `accessibilityLabel`'ını TalkBack'e iletmiyor; işaretler adsız okunuyordu. | 1.1.1, 4.1.2 | Düzeltildi (#49): işaretlere `title`/`description` verildi. Cihazda senaryo 5 ile doğrulanacak. |
| K4 | Harita kartı büyük yazıda veya yatay ekranda haritadan taşabiliyordu. | 1.4.4, 1.4.10 | Düzeltildi: kart en fazla %75 yükseklikte, içerik kayar. |
| K5 | Bilgi sekmesinde "Yüksek kontrast" hem metin hem anahtar olarak iki kez okunuyordu. | 4.1.2 | Düzeltildi: görünen metin ekran okuyucudan gizlendi. |
| K6 | Harici klavye veya Switch Access'te uygulamanın çizdiği bir odak göstergesi yok (`theme.focus` kullanılmıyor); TalkBack kendi çerçevesini çizer. | 2.4.7 | Açık: cihaz testinde (senaryo 10) değerlendirilecek. |
| K7 | Eğim ölçerde korkuluk seçenekleri durumu `selected` ile veriyordu; TalkBack "işaretli" okumuyordu. Grubun adı yoktu. | 4.1.2 | Düzeltildi: `checked` kullanıldı, gruba "Korkuluk" adı verildi. |
| K8 | Eğim ölçerin şerit metre alanlarında etiket olarak yalnızca placeholder var; yazı girilince görünen etiket kayboluyor. Ekran okuyucu etiketleri var. | 3.3.2 | Açık: görünen etiket eklenmesi önerildi; karar ekranın sahiplerinde (#22). |
| K9 | Yüksek kontrast modunda harita için `userInterfaceStyle` kullanılıyordu; bu Android'de etkisiz, altlık açık renkte kalıyordu (Sadık'ın tespiti). | 1.4.3 | Düzeltildi: Android'de `customMapStyle` ile koyu, yüksek kontrastlı stil; iOS'ta `userInterfaceStyle` sürüyor. |

### Bilinen kısıtlar

- **Harita işaretleri:** Google Haritalar işaretleri TalkBack ile tek tek gezinmeye pek uygun değil. Eşdeğer yol olarak Liste sekmesi (aynı filtreyle) ve "Bana en yakın" sunulur; haritanın ipucu Liste sekmesini önerir.
- **Harita altlığı:** Sokak ve bina adları Google'dan gelir. Dilleri uygulamanın kontrolünde değil.
- **Okuma dili:** React Native'de içerik dili öğe bazında belirtilemiyor. Telefon dili Türkçe değilse TalkBack başka dilin sesiyle okuyabilir; testler Türkçe cihazda yapılır.
- **Hareketler:** Hiçbir işlem sürükleme, uzun basma veya çok parmak hareketi gerektirmez. Tek istisna yönetici girişine giden 5 dokunuştur (#5, #19); normal kullanıcı için değildir.

## 4. Cihaz test protokolü

Android telefonda, Türkçe dil ayarıyla yapılır.

- Her senaryo normal ve yüksek kontrast temada denenir.
- Ekranlar Google'ın **Erişilebilirlik Tarayıcısı** (Accessibility Scanner) ile taranır.
- Gözler kapalı iki görev denenir: en yakın tuvaleti bulup sözlü tarifini dinlemek ve (#26 gelince) bir sorun bildirmek.

1. **TalkBack, liste akışı:** Liste sekmesi → "Bina sayfasını aç" → bina sayfası → bir nokta → nokta detayı.
   - Her öğe anlamlı okunuyor mu, odak sırası görsel sırayla aynı mı?
   - Fotoğraf açıklaması okunuyor mu? Ölçümler "Eğim: %6,5" biçiminde mi?
2. **TalkBack, filtre:** "Asansör" çipini seç. "Asansör, onay kutusu, işaretli" ve ardından "… nokta gösteriliyor" okunuyor mu? "Temizle" çıkıyor mu, filtre uygulama yeniden açılınca korunuyor mu?
3. **TalkBack, en yakın (#17):** "Bana en yakın" → tür seçimi. Konum izni penceresi okunuyor mu? Sonuç ("En yakın asansör: …, zemin kat, 140 metre") duyuruluyor mu? Karttaki düğmelere ulaşılabiliyor mu?
4. **Konum izni reddi:** Uyarı okunuyor mu, "Ayarları aç" çalışıyor mu?
5. **TalkBack, harita işaretleri:** Haritada parmakla gezin. İşaretler "Rampa: Ana giriş rampası, Teknoloji Fakültesi, Zemin kat, Çalışıyor" gibi okunuyor mu?
6. **Büyük yazı:** Yazı boyutu ve ekran boyutu en büyük. Kartta, çiplerde, sekmelerde ve satırlarda kesilen ya da üst üste binen metin var mı? Harita kartı kaydırılabiliyor mu?
7. **Yatay ekran:** Tüm ekranlar kullanılabiliyor mu, içerik kaydırılabiliyor mu?
8. **Yüksek kontrast:** Metin okunabiliyor mu, seçili/seçili değil ayrımı belli mi, harita koyu stile geçiyor mu (K9)? Gri tonlama simülasyonunda (Geliştirici seçenekleri → Renk uzayı → Tek renkli) her şey anlaşılır mı?
9. **Çevrimdışı:** Veriler bir kez yüklendikten sonra uçak modu ve yeniden başlatma. "Bağlantı kurulamadı … kayıtlı veriler" bildirimi okunuyor mu, veriler ve daha önce açılan fotoğraflar görünüyor mu?
10. **Klavye / Switch Access:** Sekmeler, filtre ve liste arasında gezin. Odaktaki öğe görülebiliyor mu (K6)?
11. **QR / deep link:** `adb shell am start -a android.intent.action.VIEW -d "kampuserisim://bina/<slug>"` ile bina sayfası açılıyor mu, geri tuşu sekmelere dönüyor mu?
12. **Bilgi ekranı:** Arama, e-posta ve harita bağlantıları ilgili uygulamayı açıyor mu? KVKK metni başlıklarla gezilebiliyor mu?
13. **Eğim ölçer (preview build):** Mesajlar duyuruluyor mu? Korkuluk seçimi "Korkuluk, … radyo düğmesi, işaretli" okunuyor mu? Alan etiketleri okunuyor mu (K8)?
14. **Sorun bildir:** Nokta detayında "Sorun bildir"e girip formu yalnızca TalkBack ile doldur. Seçenekler "… radyo düğmesi, işaretli" okunuyor mu? Açıklama alanı "Açıklama, isteğe bağlı" diye okunuyor mu, sayaç güncelleniyor mu? Klavye açıkken Gönder'e ulaşılıyor mu? Başarı ve hata (aynı noktaya ikinci bildirim → "bugün zaten bildirim gönderdiniz") duyuruluyor mu? Hatadan sonra yazılan metin kaybolmuyor mu?

## 5. Cihaz testi bulguları

| # | Ekran | Senaryo | Bulgu | WCAG | Önem | Durum |
|---|---|---|---|---|---|---|
| | | | | | | |
