# Tasarım Rehberi

Issue #11. Figma ekranları ile uygulama kodu aynı kurallara dayanır.

- Değerlerin tek kaynağı [`app/src/theme/tokens.ts`](../../app/src/theme/tokens.ts). Figma'da bir değer değişirse önce oradaki karşılığı güncellenir.
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
- Telefonun yazı boyutu ayarı uygulamayı büyütür. Metin kutuları sabit yükseklikte çizilmez. Figma'da önemli ekranların **%200 yazı** varyantı da çizilir.
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
- **Figma çerçevesi:** 360 × 800 (Android).

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

Sıra, ekran okuyucunun okuma sırasıdır: Figma'da da yukarıdan aşağı aynı sırada çizilir. Her ekran için durumlar çizilir: yükleniyor, çevrimdışı (önbellekten), boş, hata.

### Kodda olanlar

| Ekran | Route | Issue | Yerleşim |
|---|---|---|---|
| Harita | `(tabs)/index` | #14, #16, #17 | Filtre çipleri → sonuç sayısı → "Bana en yakın" (tür seçimi, en yakın 3 sonuç) → (izin/konum uyarısı) → harita → seçim kartı |
| Liste | `(tabs)/liste` | #14, #16 | Filtre → bina başlığı (ad, puan, "Bina sayfasını aç") → nokta satırları; en sonda "Bina dışı noktalar". Boşsa "Bu filtreye uygun nokta yok" + "Filtreleri temizle" |
| Nokta detayı | `nokta/[id]` | #15 | Fotoğraf → tür, ad, bina bağlantısı, kat → durum + son güncelleme → rampa ölçümleri + TS 9111 uyarısı → sözlü tarif → kılavuz iz → eylemler (yol tarifi #17, rota #25, sorun bildir #26) |
| Bina sayfası (QR hedefi) | `bina/[slug]` | #15 | Büyük puan → özet → "Puan nasıl belirlenir?" → türe göre sayılar (bulunmayan tür dahil) → türe göre gruplu liste |
| Bilgi | `(tabs)/bilgi` | #19 | Birim (ara, e-posta, haritada göster) → hizmetler → haklar → uygulama hakkında → gizlilik özeti → Görünüm (yüksek kontrast) → sürüm |
| KVKK aydınlatma metni | `kvkk` | #19 | Başlıklı bölümler |
| Eğim ölçer (ekip) | `olcum` | #22 | Alper/Sadık'ın ekranı; aynı bileşenler kullanılır |

### Tasarlanacaklar

Wireframe'ler [`ekranlar/`](ekranlar) klasöründe SVG olarak duruyor ve Figma'ya sürükle-bırak ile düzenlenebilir katman olarak alınabiliyor. Renkler normal temadan; yüksek kontrast varyantı Figma'da token değiştirilerek çıkarılır.

**Basamaksız rota (#25):** [`ekranlar/rota.svg`](ekranlar/rota.svg)
- Nokta detayı ve harita kartındaki "Basamaksız rota" düğmesiyle açılır.
- Başlangıç: konum izni varsa en yakın yol düğümü, yoksa kullanıcı bir bina girişi seçer.
- Üstte özet: "Basamaksız rota · 320 metre". Süre verilmez; tekerlekli sandalye hızı kişiden kişiye değişir.
- Haritada rota çizgisi `primary` renginde ve 6dp kalınlıkta; başlangıç ve varış simgeli.
- Altında numaralı adım listesi (`path_edges.note`): "1. Kütüphane girişinden sağa, 40 metre, rampa". Liste ekran okuyucunun ana yoludur.
- **Rota yoksa:** "Bu noktaya kayıtlı basamaksız rota yok" mesajı ve "Yol tarifi al" (Google Haritalar) yedeği.

**Sorun bildir (#26):** [`ekranlar/sorun-bildir.svg`](ekranlar/sorun-bildir.svg)
- Nokta detayındaki "Sorun bildir" düğmesiyle açılır; nokta önceden seçilidir.
- Durum seçimi radyo grubu: Arızalı / Çalışıyor / Bilmiyorum; varsayılan "Arızalı".
- Açıklama en fazla 500 karakter; sayaç ("120 / 500") canlı bölge. Altında uyarı: "Kişisel bilgi yazmayın."
- "Gönder" birincil düğme; gönderilirken meşgul durumda.
- **Sonuç:** başarı ve hata (çok sık bildirim, aynı nokta bugün bildirildi vb., `lib/reports.ts`) kutuda gösterilir ve duyurulur. Üyelik yok, ad sorulmaz.

**Yönetici girişi ve paneli (#5):** [`ekranlar/yonetici.svg`](ekranlar/yonetici.svg)
- Giriş ekranı (`admin/giris`): e-posta, şifre, "Giriş yap". Normal kullanıcıya görünmez; Bilgi sekmesinin en altındaki sürüm satırına 3 saniye içinde 5 dokunuşla (#19) ya da `kampuserisim://admin` bağlantısıyla açılır.
- Panelde üç sekme var: **Bildirimler** (bekleyenler; nokta, bildirilen durum, açıklama, tarih; "Onayla" / "Reddet"), **Noktalar** (durumu elle değiştir) ve **Kullanım** (günlük açılış sayıları).
- Onaylanmayan bildirim nokta durumunu değiştirmez; onay penceresi bunu açıkça söyler.

## Figma dosya düzeni (öneri)

1. **Tokenlar:** renk stilleri (normal, yüksek kontrast), yazı stilleri, boşluk ve köşe değerleri. Adlar koddakiyle aynı (`primary`, `textMuted` …).
2. **Bileşenler:** yukarıdaki tablo; her bileşenin durumları (seçili, basılı, devre dışı, arızalı …).
3. **Ekranlar (normal):** kodda olanlar ekran görüntüsünden, tasarlanacaklar wireframe'den.
4. **Ekranlar (yüksek kontrast)** ve **%200 yazı** varyantları.
5. **Prototip:** kullanıcı testi (#7) görev senaryoları için tıklanabilir akış.

Kullanıcı testinden (#7) sonra değişen her karar önce Figma'ya, sonra `tokens.ts`'e ve bu belgeye işlenir.
