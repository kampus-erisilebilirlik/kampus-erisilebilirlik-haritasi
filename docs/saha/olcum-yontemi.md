# Ölçüm yöntemi

Herkes **aynı yöntemle** ölçmeli, yoksa veriler karşılaştırılamaz. Sahaya çıkmadan önce bu sayfayı okuyun ve #21'e 👍 bırakın.

## Ekipman

- Kılıfsız telefon, eğim ölçer ekranı (#22) kurulu
- Düz çıta, en az 50 cm (alüminyum su terazisi ideal)
- Şerit metre, en az 5 m
- Şarj aleti / powerbank
- Saha formu linki ([saha-formu.md](saha-formu.md))

## Eğim: telefonla (#22)

1. Telefonu **kılıfından çıkarın**. Kılıf telefonu çıtaya göre eğik oturtur.
2. Her saha gününün başında ve telefon değiştiğinde **düz zeminde kalibrasyon** yapın (koridor, mermer zemin). Eğim ölçerde "Kalibre et"e basın, telefonu çıtanın üzerine koyun, 2 saniye dokunmayın.
3. Çıtayı rampanın üzerine **rampa yönünde** koyun. Telefonu çıtanın üzerine ekran yukarı bakacak ve **uzun kenarı rampa yönünde** olacak şekilde yerleştirin.
4. Rampanın **başı, ortası ve sonu** olmak üzere 3 noktadan ölçün. "Telefon hareket etti" uyarısı çıkarsa o ölçümü tekrarlayın.
5. Üç değeri forma yazın (`rampa_egim_1/2/3`). Veri tabanına üçünün **medyanı** girer (#23).

Rampa ortasında sahanlık (düz bölüm) varsa her kol ayrı rampa sayılır ve ayrı nokta kodu alır (`...-ramp-1`, `...-ramp-2`).

## Eğim: şerit metreyle doğrulama

Telefon ölçümünü kontrol etmek için her rampada:

- **H:** rampanın başı ile sonu arasındaki toplam yükseklik farkı (cm). Çıtayı üst uçtan yatay tutup (su terazisiyle) alt uçtaki zemine olan dikey mesafeyi ölçün. Rampa uzunsa birkaç parçada ölçüp toplayın.
- **L:** rampanın yatay uzunluğu (cm). Rampa yüzeyi boyunca ölçülen değer de kullanılabilir, %10'un altındaki eğimlerde fark %0,5'ten azdır.

```
eğim % = H / L × 100
```

Örnek: H = 45 cm, L = 600 cm → %7,5.

Telefon medyanı ile H/L sonucu arasındaki fark **%1'den büyükse** ölçümü tekrarlayın. Tekrarda da büyükse ikisini de forma yazın ve `notlar`a "telefon/metre uyuşmuyor" yazın.

## Genişlik

İki korkuluk veya duvar arasındaki **en dar net mesafe** (cm). Korkuluk varsa korkuluğun iç yüzünden ölçün.

## Kapı eşiği ve engeller

Rampa başında/sonunda eşik, ızgara, çukur gibi engeller varsa yüksekliğini cm olarak `notlar`a yazın. Basamaksız güzergâh kaydında (#24) hangi yükseklikteki eşiğin yolu kestiği TS 9111'den alınacak ([ts9111.md](ts9111.md), "Diğer" tablosu). Değer doğrulanana kadar 2 cm **geçici** olarak kullanılır.

## Fotoğraf kuralları

- **Kadrajda kişi olmasın.** Gerekirse bekleyin. Biri girdiyse fotoğrafı silip tekrar çekin.
- Yatay çekim
- Noktanın tamamı ve çevresi görünsün (rampanın başı ve sonu, asansörün kapısı ve butonları)
- Gün ışığında, flaşsız
- Dosya adı = nokta kodu: `teknoloji-fakultesi-ramp-1.jpg`
- Ortak Drive klasörüne yükleyin: `saha-fotograflari/<bina-slug>/`

## Doğrulama

Eğim ölçer ekranının (#22) doğruluğu için iki test yapılır. Sonuçlar buraya yazılır.

### Bilinen eğim testi

Masanın bir ayağının altına bilinen yükseklikte kitap koyun, eğimi H/L ile hesaplayın ve telefonla karşılaştırın. Kabul: fark ≤ %1.

| Deneme | H (cm) | L (cm) | H/L (%) | Telefon medyanı (%) | Fark |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

### İki telefon testi

Aynı rampayı iki farklı telefonla ölçün.

| Rampa | Telefon A (model) | Telefon B (model) | Fark |
|---|---|---|---|
| | | | |
