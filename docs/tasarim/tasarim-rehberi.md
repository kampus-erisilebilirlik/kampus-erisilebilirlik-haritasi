# Tasarım Rehberi

Issue #11. Ekran tasarımları ayrı bir tasarım aracında değil, doğrudan bu repoda tutulur:
- Kodda olan ekranların tasarımı kodun kendisidir. Bu belge kurallarını ve yerleşimini anlatır.
- Henüz kodlanmamış ekranların taslakları [`ekranlar/`](ekranlar) klasöründe SVG olarak durur.

Kaynaklar:
- Değerlerin tek kaynağı [`app/src/theme/tokens.ts`](../../app/src/theme/tokens.ts). Bir değer değişecekse önce orada değişir, sonra bu belge ve taslaklar güncellenir.
- [`tokens.test.ts`](../../app/src/theme/tokens.test.ts) yeni renklerin kontrastını CI'da denetler: metin ≥4.5:1, kenarlık ≥3:1.
- Erişilebilirlik kuralları ve test protokolü: [`docs/erisilebilirlik/denetim.md`](../erisilebilirlik/denetim.md).

Rehber, açık PR'lar birleştikten sonraki durumu anlatır. Harita, liste ve bilgi ekranı `main`'de. Henüz açık olanlar:
- Kenarlık rengi #80868F, `tokens.test.ts` ve denetim belgesi: #57 (#18)
- Nokta ve bina detayı: #55 (#15)
- Filtre: #56 (#16)
- "Bana en yakın": #17

## Temel kurallar

Kurallar teklif formunun "Kullanıcıya uygunluk" bölümünden gelir.

- Dokunulabilir her öğe en az **48 × 48 dp** (`minTouchSize`).
- Bilgi **yalnızca renkle verilmez**: puan, durum ve seçim her zaman simge şekli veya metinle de belli olur.
- **Sade Türkçe.** Düğme metni eylemi söyler ("Yol tarifi al", "Detayı aç"), "Tamam" gibi belirsiz metin kullanılmaz.
- Ana işlevlere sekme dahil **en fazla iki dokunuşla** ulaşılır.
- Telefonun yazı boyutu ayarı uygulamayı büyütür. Metin kutuları sabit yükseklikte çizilmez. Her taslakta ekranın **%200 yazıda** nasıl davrandığı yazılır.
- Her ekranın **normal** ve **yüksek kontrast** varyantı vardır.
- Ekran yönü kilitli değildir: yatayda da kullanılabilmeli (telefon tekerlekli sandalyeye sabitlenmiş olabilir).
- Üyelik yoktur; yönetici girişi dışında hiçbir ekranda hesap istenmez.

## Renk tokenları

| Token | Normal | Yüksek kontrast | Kullanım |
|---|---|---|---|
| `background` | #FFFFFF | #000000 | Sayfa zemini, kart zemini |
| `surface` | #F3F5F8 | #121212 | Liste satırı, bilgi kutusu |
| `text` | #1A1C1E | #FFFFFF | Ana metin |
| `textMuted` | #4A5058 | #E0E0E0 | İkincil metin |
| `primary` | #0B57D0 | #FFD60A | Birincil düğme, bağlantı, seçili öğe |
| `onPrimary` | #FFFFFF | #000000 | Birincil düğme üstündeki metin |
| `border` | #80868F | #FFFFFF | Kenarlık, ayırıcı, anahtarın kapalı izi |
| `focus` | #0B57D0 | #FFD60A | Klavye odağı (henüz kullanılmıyor, bkz. WCAG K6) |
| `status.working` / `score.green` | #1B6E33 | #5CE08A | Çalışıyor / erişilebilir |
| `status.broken` / `score.red` | #B3261E | #FF8A80 | Arızalı / erişilebilir değil |
| `status.unknown` / `score.unknown` | #4A5058 | #E0E0E0 | Durumu bilinmiyor / henüz ölçülmedi (bilerek renksiz gri) |
| `score.yellow` | #8A5300 | #FFD60A | Kısmen erişilebilir |

Kontrast oranları için bkz. `denetim.md`.

## Yazı ve ölçüler

| Rol (`AppText variant`) | Boyut / satır (sp) | Kalınlık | Kullanım | Ekran okuyucu |
|---|---|---|---|---|
| `title` | 24 / 32 | 700 | Ekran ve büyük bölüm başlığı | başlık |
| `heading` | 20 / 28 | 600 | Bölüm başlığı, kart başlığı | başlık |
| `body` | 16 / 24 | 400 | Gövde metni | — |
| `label` | 14 / 20 | 600 | Rozet, düğme, kısa etiket | — |

- **Boşluklar:** 4 / 8 / 16 / 24 / 32 dp (`xs` … `xl`).
- **Köşe yarıçapı:** 6 dp (rozet), 12 dp (kart, düğme).
- **Taslak çerçevesi:** 360 × 800 dp (Android).

## Simgeler

Tür simgeleri Material Community Icons'tan, arayüz, durum ve puan simgeleri Ionicons'tan (`@expo/vector-icons`). Kaynak: `app/src/lib/icons.ts`.

| Anlam | Simge |
|---|---|
| Rampa / asansör / engelli tuvaleti / engelli otoparkı / otomatik kapı | `slope-uphill` / `elevator-passenger` / `toilet` / `parking` / `door-sliding` |
| Bina | `office-building` |
| Çalışıyor / arızalı / bilinmiyor | `checkmark-circle` / `close-circle` / `help-circle` |
| Puan yeşil / sarı / kırmızı / henüz ölçülmedi | `checkmark-circle` / `alert-circle` / `close-circle` / `help-circle` |
| TS 9111 uygun / uygun değil | `checkmark-circle` / `warning` |

## Bileşenler

| Bileşen | Görünüm | Not |
|---|---|---|
| `AppButton` | Birincil (dolu `primary`) ve ikincil (çerçeveli). En az 48dp, köşe 12. | Basılıyken %80, devre dışıyken %50 opaklık |
| `StatusBadge` / `ScoreBadge` | Renkli çerçeve + simge + metin | Tek parça okunur: "Durum: Çalışıyor" |
| `FilterBar` | Yatay kayan çipler: türler, "Sadece çalışanlar", filtre etkinse "Temizle" (yüksekliği 48dp, tam yuvarlak). Seçili çip dolu ve onay işaretli. Altında sonuç sayısı. | Onay kutusu; sonuç duyurulur |
| `PointRow` | `surface` kart: tür simgesi, ad, tür · bina · kat, durum rozeti, sağda ok | Bağlantı; "tür, ad, bina, kat, durum" |
| `ScoreExplanation` | Açılır-kapanır "Puan nasıl belirlenir?"; bu binanın puanı işaretli | Düğme, açık/kapalı durumu okunur |
| `SelectionCard` | Haritanın altında kart: başlık + kapat düğmesi, özet, eylemler. En fazla %75 yükseklik, içerik kayar. | Seçim duyurulur |
| `InfoRow` | Üstte küçük etiket, altta değer, alt çizgi | "Etiket: değer" |
| `Ts9111Notice` | 2px çerçeveli kutu, simge, başlık ve "ön tespit" uyarısı | — |
| `SyncStatus` | Yükleniyor / çevrimdışı metni, "Tekrar dene" | Canlı bölge |
| Harita işareti | Nokta: 36dp daire, tür simgesi, çerçeve durum renginde, arızada köşe simgesi. Bina: 42dp kare, puan renginde çerçeve ve köşe simgesi. Seçili: 4px `primary` çerçeve. | Başlığı TalkBack okur |

## Ekranlar

Sıra, ekran okuyucunun okuma sırasıdır; taslaklar da yukarıdan aşağı bu sırada çizilir. Veri gösteren her ekranın yükleniyor, çevrimdışı (önbellekten), boş ve hata durumları vardır.

### Ortak durumlar

| Durum | Görünüm | Kaynak |
|---|---|---|
| İlk açılış / yükleniyor | Önbellek yoksa "Veriler güncelleniyor…"; önbellek varsa kayıtlı veri hemen gösterilir, yenileme arkada sürer | `SyncStatus` (#13) |
| İnternet yok | Önbellek varsa "Bağlantı kurulamadı. … tarihli kayıtlı veriler gösteriliyor."; yoksa "Bağlantı kurulamadı ve kayıtlı veri yok. İnternet bağlantınızı kontrol edin." Altında "Tekrar dene" | `SyncStatus` (#13) |
| Konum izni reddedildi | Konumun neden gerektiği ve sunucuya gönderilmediği; "Ayarları aç" ve "Listeden bina seçerek devam et". Konum alınamazsa "Tekrar dene" | `NearestPanel` (#17) |
| Boş sonuç | "Bu filtreye uygun nokta yok." ve "Filtreleri temizle" | Liste (#16) |
| Bulunamadı | "Bina bulunamadı" ve "Haritaya dön"; "Nokta bulunamadı. Silinmiş olabilir." | Detay ekranları (#15) |

Bu durumlar uyarı rengiyle değil, metin ve düğmeyle anlatılır; canlı bölge olarak duyurulur.

### Kodda olanlar

| Ekran | Route | Issue | Yerleşim |
|---|---|---|---|
| Harita | `(tabs)/index` | #14, #16, #17 | Filtre çipleri → sonuç sayısı → "Bana en yakın" (tür seçimi, en yakın 3 sonuç) → (izin/konum uyarısı) → harita → seçim kartı |
| Liste | `(tabs)/liste` | #14, #16 | Filtre → bina başlığı (ad, puan, "Bina sayfasını aç") → nokta satırları; en sonda "Bina dışı noktalar". Boşsa "Bu filtreye uygun nokta yok" + "Filtreleri temizle" |
| Nokta detayı | `nokta/[id]` | #15 | Fotoğraf → tür, ad, bina bağlantısı, kat → durum + son güncelleme → rampa ölçümleri + TS 9111 uyarısı → sözlü tarif → kılavuz iz → eylemler (yol tarifi #17, rota #25, "Sorun bildir" ve arızalıysa "Bu nokta düzeldi mi? Bildirin" #26) |
| Sorun bildir | `bildir/[pointId]` | #26 | Başlık "Sorun bildir: {nokta}" → "Ne oldu?" radyo grubu (Çalışmıyor / arızalı · Çalışıyor ya da Tekrar çalışıyor · Bilgi yanlış) → açıklama + "0 / 500" sayacı + kişisel bilgi uyarısı → (hata kutusu) → Gönder / Tekrar dene → anonimlik notu. Başarıda sonuç kutusu + "Noktaya dön". Nokta detayındaki "Sorun bildir" ile açılır, ön seçim "arızalı"; arızalı noktadaki "Bu nokta düzeldi mi? Bildirin" ile "çalışıyor". "Bilgi yanlış"ta açıklama zorunlu |
| Bina sayfası (QR hedefi) | `bina/[slug]` | #15 | Büyük puan → özet → "Puan nasıl belirlenir?" → türe göre sayılar (bulunmayan tür dahil) → türe göre gruplu liste |
| Bilgi | `(tabs)/bilgi` | #19 | Birim (ara, e-posta, haritada göster) → hizmetler → haklar → uygulama hakkında → gizlilik özeti → Görünüm (yüksek kontrast) → sürüm |
| KVKK aydınlatma metni | `kvkk` | #19 | Başlıklı bölümler |
| Eğim ölçer (ekip) | `olcum` | #22 | Alper/Sadık'ın ekranı; aynı bileşenler kullanılır |

Bu ekranların varyantları uygulamanın içinde:
- **Yüksek kontrast:** Bilgi → Görünüm.
- **%200 yazı:** Android'in yazı boyutu ayarı.
- **Yatay ekran:** telefonu çevirmek.

Cihazda [`denetim.md`](../erisilebilirlik/denetim.md)'deki protokolle kontrol edilirler (#18).

### Tasarlanacaklar

Taslaklar [`ekranlar/`](ekranlar) klasöründe SVG olarak durur; tarayıcıda açılır ve katmanları adlandırılmıştır.
- Her ekranın normal tema ve yüksek kontrast (`-yuksek-kontrast.svg`) dosyası vardır.
- Yüksek kontrast dosyasında renkler yukarıdaki tablodaki karşılıklarıyla değiştirilir. Harita alanı `lib/mapStyle.ts`'teki koyu stile uyar: siyah zemin, beyaz kenarlı binalar.
- %200 yazıdaki davranış her ekranın altında yazılıdır.

**Basamaksız rota (#25):** [`ekranlar/rota.svg`](ekranlar/rota.svg), [yüksek kontrast](ekranlar/rota-yuksek-kontrast.svg)
- Nokta detayı ve harita kartındaki "Basamaksız rota" düğmesiyle açılır.
- Başlangıç: konum izni varsa en yakın yol düğümü, yoksa kullanıcı bir bina girişi seçer.
- Üstte özet: "Basamaksız rota · 320 metre". Süre verilmez; tekerlekli sandalye hızı kişiden kişiye değişir.
- Haritada rota çizgisi `primary` renginde ve 6dp kalınlıkta; başlangıç ve varış simgeli.
- Altında numaralı adım listesi (`path_edges.note`): "1. Kütüphane girişinden sağa, 40 metre, rampa". Liste ekran okuyucunun ana yoludur.
- **Rota yoksa:** "Bu noktaya kayıtlı basamaksız rota yok" mesajı ve "Yol tarifi al" (Google Haritalar) yedeği.
- **%200 yazıda:** başlık ve özet birden çok satıra kırılır. Harita alanı ekran yüksekliğinin en fazla %40'ı olur. Adım listesi ve "Yol tarifi al" düğmesi sayfayla birlikte kayar. Adım numarası daireleri yazıyla birlikte büyür.

**Yönetici girişi ve paneli (#5):** [`ekranlar/yonetici.svg`](ekranlar/yonetici.svg), [yüksek kontrast](ekranlar/yonetici-yuksek-kontrast.svg)
- Giriş ekranı (`admin/giris`): e-posta, şifre, "Giriş yap". Normal kullanıcıya görünmez; Bilgi sekmesinin en altındaki sürüm satırına 3 saniye içinde 5 dokunuşla (#19) ya da `kampuserisim://admin` bağlantısıyla açılır.
- Panelde üç sekme var: **Bildirimler** (bekleyenler; nokta, bildirilen durum, açıklama, tarih; "Onayla" / "Reddet"), **Noktalar** (durumu elle değiştir) ve **Kullanım** (günlük açılış sayıları).
- Onaylanmayan bildirim nokta durumunu değiştirmez; onay penceresi bunu açıkça söyler.
- **%200 yazıda:** sekmeler yan yana sığmazsa alt alta dizilir. Bildirim kartında "Onayla" ve "Reddet" alt alta geçer. Kart metni kesilmez, liste kayar.

## Tasarım nasıl değişir

1. Renk, yazı veya ölçü değişikliği önce `tokens.ts`'te yapılır. `tokens.test.ts` kontrastı denetler; geçmeyen renk birleşmez.
2. Aynı PR'da bu belge ve etkilenen taslaklar güncellenir. Yüksek kontrast taslağı da normal taslakla birlikte değişir.
3. Ekip onayı PR incelemesiyle verilir.
4. Bir taslak ekran kodlanınca "Kodda olanlar" tablosuna taşınır ve SVG dosyaları silinir. Bundan sonra tasarımın kaynağı koddur.
5. Kullanıcı testinin (#7) bulguları da aynı yoldan işlenir.

**Prototip:** Kodda olan akışlar (harita → nokta → bina, filtre, "Bana en yakın") preview APK'da denenir; kullanıcı testi (#7) bu sürümle yapılır. Rota ve sorun bildir akışları kodlanana kadar taslaklardan anlatılır.
