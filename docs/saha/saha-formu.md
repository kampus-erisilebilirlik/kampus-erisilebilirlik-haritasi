# Saha veri formu

Sahada telefondan doldurulan form. **Her yanıt bir nokta.** Yanıtlar Google Sheets'e düşer, Sheets CSV olarak indirilip seed script'ine (#23) verilir. Bu yüzden soru başlıkları aşağıdaki **alan adlarıyla birebir aynı** olmalı. Başlık değişirse script satırı okuyamaz.

## Formu oluşturma (5 dakika)

Formu elle kurmak yerine hazır script'i kullanın. Böylece başlıklar ve seçenekler hatasız olur.

1. https://script.google.com → **Yeni proje**
2. İçeriği silip [`scripts/saha-formu/create-form.gs`](../../scripts/saha-formu/create-form.gs) dosyasını yapıştırın
3. Üstteki fonksiyon listesinden `createSahaFormu` seçili iken **Çalıştır**. İlk seferde Google izin ister: hesabınızı seçin → Gelişmiş → "güvenli olmayan sayfaya git" → İzin ver (script sizin yazdığınız, sadece sizin Drive'ınızda form oluşturur)
4. **Yürütme günlüğü**nde iki link çıkar: formu doldurma linki ve yanıt tablosu. Doldurma linkini ekiple paylaşın, telefonda ana ekrana ekleyin.
5. Form ekibe açılmadan önce bir noktada **deneme** yapın (kabul kriteri) ve deneme satırını tablodan silin.

Bina listesi değişirse `BINALAR` dizisini güncelleyip script'i tekrar çalıştırın (yeni form oluşur) ya da formda `bina_slug` sorusunun seçeneklerini elle düzeltin.

## Alanlar

Elle tablo tutmak gerekirse aynı başlıklarla [`saha-formu-sablon.csv`](saha-formu-sablon.csv) kullanılabilir.

| Alan | Zorunlu | Açıklama | Örnek |
|---|---|---|---|
| nokta_kodu | ✔ | `<bina-slug>-<tür kodu>-<sıra>`. Tür kodları aşağıda | `teknoloji-fakultesi-ramp-1` |
| bina_slug | ✔ | Listeden seç ([binalar.md](binalar.md)) | teknoloji-fakultesi |
| tur | ✔ | rampa / asansör / tuvalet / otopark / otomatik kapı | rampa |
| ad | ✔ | Kısa tanım | Ana giriş rampası |
| enlem | ✔ | Google Haritalar'da noktaya uzun bas → üstte çıkan ilk sayı | 38.02xxxx |
| boylam | ✔ | İkinci sayı | 32.51xxxx |
| kat | ✔ | 0 = zemin, -1 = bodrum, 1 = birinci kat | 0 |
| durum | ✔ | çalışıyor / arızalı / bilinmiyor | çalışıyor |
| foto_dosyasi | ✔ | Fotoğraf adı = nokta kodu + `.jpg` | teknoloji-fakultesi-ramp-1.jpg |
| sozlu_tarif | ✔ | Görme engelli biri için adım adım tarif (aşağıya bakın) | "Ana girişin solunda, kaldırımdan 5 adım ileride" |
| kilavuz_iz | ✔ | var / yok / bilinmiyor | yok |
| rampa_egim_1 | rampa | Eğim ölçerden 1. ölçüm, rampanın başı (%) (#22) | 7.8 |
| rampa_egim_2 | rampa | 2. ölçüm, ortası | 8.1 |
| rampa_egim_3 | rampa | 3. ölçüm, sonu | 7.9 |
| rampa_yukseklik_cm | rampa | Toplam yükselme H, şerit metreyle | 45 |
| rampa_uzunluk_cm | rampa | Yatay uzunluk L | 600 |
| rampa_genislik_cm | rampa | En dar yerden net genişlik | 110 |
| korkuluk | rampa | iki tarafta / tek tarafta / yok | tek tarafta |
| notlar | | Diğer gözlemler | Rampa sonunda kapı eşiği 3 cm |
| olcen | ✔ | Ölçümü yapanın adı (sadece ekip içi, veri tabanına girmez) | Alper |

"rampa" yazan alanlar yalnızca tür rampa ise zorunlu. Ondalık ayırıcı olarak **nokta** kullanın (`7.8`). Virgül de kabul edilir ama karışıklığı önlemek için nokta tercih edin.

### Tür kodları (nokta_kodu içinde)

| tur | kod | Veri tabanı (`point_type`) |
|---|---|---|
| rampa | `ramp` | ramp |
| asansör | `elevator` | elevator |
| tuvalet | `toilet` | toilet |
| otopark | `parking` | parking |
| otomatik kapı | `auto-door` | auto_door |

Sıra numarası bina ve tür içinde 1'den başlar: `merkezi-kutuphane-elevator-1`, `merkezi-kutuphane-elevator-2`. Aynı kod iki kez kullanılırsa seed script'i ikinci satırı ilkinin **güncellemesi** sayar. Bu yüzden kodları sahada not edin, tekrar etmeyin.

## Sözlü tarif nasıl yazılır?

1. **Sabit bir referanstan başla:** ana giriş, merdiven başı, danışma
2. **Yön ver:** sağ / sol / düz. "Kuzey" gibi pusula yönleri kullanma
3. **Mesafeyi söyle:** adım veya metre
4. **Ayırt edici dokunsal ve işitsel işaretleri ekle:** kapı tokmağı, zemin değişimi (halı → mermer), kabartma levha, asansör sesi, çeşme
5. Kısa cümleler, her cümlede tek hareket

Örnek: "Ana girişten girince sağa dönün. Koridorda yaklaşık 15 adım ilerleyin. Sağdaki ikinci kapı engelli tuvaleti, kapıda kabartma levha var."

Tarifi yerinde yazın, sonra bir ekip arkadaşına gözü kapalı okutup yolu bulabiliyor mu diye test edin (#23).
