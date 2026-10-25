# Basamaksız yol ağı (#24)

Google Haritalar kampüsteki merdivensiz yolları bilmez. Ekip 8 binayı birbirine bağlayan basamaksız yolları yürüyerek kaydeder, temiz bir çizgi ağı olarak `yol-agi.geojson` dosyasına çizer. Script bu dosyayı **graf**a (düğümler + kenarlar) çevirip veri tabanına yazar, rota algoritması (#25) da bunu kullanır.

Düğüm: kavşak, bina girişi, rampa başı. Kenar: iki düğüm arasındaki yürünebilir yol parçası (metre). Metro haritası gibi: duraklar düğüm, aradaki hatlar kenar.

## 1. Sahada kayıt

- Telefona GPS iz uygulaması kurun: **Geo Tracker** veya **OsmAnd** (ikisi de GPX dışa aktarır)
- Binalar arasındaki **merdivensiz** yolları yürüyerek kaydedin. Tekerlekli sandalye veya bebek arabasıyla gerçekten geçilebilmeli
- **Kenar olarak eklenmeyenler:** kaldırım rampası olmayan geçiş, 2 cm'den yüksek eşik, çok dik eğim, dar geçit. Bunların yerini ve fotoğrafını (kişi olmadan) not edin, eksiklik raporuna (#8) girecek
- Her kaydı iki ucuna göre adlandırın: `teknoloji-kutuphane.gpx`

## 2. geojson.io'da temiz çizim

GPS ±5-10 m sapar. İzi doğrudan kullanmayın, **rehber** olarak kullanıp üzerine temiz çizgiler çizin.

1. https://geojson.io → GPX dosyasını sürükleyip bırakın
2. Sol alttan altlığı **Satellite** yapın
3. Çizgi aracıyla yolları uydu görüntüsüne ve GPX izine göre yeniden çizin. Çizim bitince GPX katmanının özelliklerini silin ya da GPX çizgilerini silin (yalnızca sizin çizgileriniz kalmalı)

**Kurallar** (script bunları kontrol eder):

- Her çizgi **iki kavşak**, **kavşak ile bina girişi** veya **kavşak ile nokta** (rampa başı vb.) arasında olur
- Çizgiler kavşakta **aynı noktada** bitip başlar. 3 m'den yakın uçlar birleştirilir, daha uzaktakiler birleştirilmez
- Bir yol diğerinin **ortasından** ayrılıyorsa (T kavşak) ana çizgiyi o noktada ikiye bölün. Bölmezseniz yollar bağlanmaz, script uyarır
- Bina girişindeki çizgi ucu, `binalar.csv`'deki giriş koordinatına veya o girişteki rampa/otomatik kapı noktasına **10 m'den yakın** olmalı

**Özellikler** (sağ paneldeki tablo, her çizgi için):

| Özellik | Açıklama |
|---|---|
| `note` | Ekran okuyucu için kısa açıklama: "Kütüphane önündeki geniş yaya yolu" |

**Geçilemeyen yerler:** İşaret (marker) aracıyla bir nokta koyun ve `engel` özelliği ekleyin: "Kaldırım rampası yok, 15 cm basamak". Bu noktalar graf'a girmez, eksiklik raporu listesine girer.

4. **Save → GeoJSON** ile indirip `docs/saha/yol-agi.geojson` olarak kaydedin. Bu dosya repoya girer (kişisel veri yok)

## 3. Grafa çevirme

`pnpm seed` (#23) daha önce çalıştırılmış olmalı: düğümler noktalara veri tabanındaki id'leriyle bağlanır.

```bash
cd scripts/seed
pnpm import-paths --dry-run --engeller ../../docs/saha/engeller.md   # kontrol + engel listesi
pnpm import-paths                                                   # yazar
```

Script:

1. Her çizginin iki ucunu düğüm yapar (3 m içindekileri birleştirir), uzunluğu çizgi boyunca haversine ile hesaplar
2. 10 m içindeki en yakın noktaya (`points`) ve bina girişine bağlar → `point_id`, `building_id`
3. Kontrol eder: graf tek parça mı, her bina ana ağa bağlı mı, T kavşak, boş `note`. **Bağlantı sorunu varsa yazmaz** ve bağlı olmayan düğümlerin koordinatlarını listeler
4. Eski grafı silip yenisini **tek transaction**'da yazar (`replace_path_graph`). Kenarlar bir kez yazılır, rota algoritması iki yönde kullanır

## 4. Kontrol

- [ ] `--dry-run` sorunsuz: "Bağlantı sorunları" yok
- [ ] Haritada (#14) geliştirici modunda tüm kenarları çizdirip gözle kontrol
- [ ] `engeller.md` üretildi ve #8'e eklendi
