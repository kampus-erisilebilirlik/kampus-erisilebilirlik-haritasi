# Bina listesi

Saha çalışmasına girecek binalar. Hedef: **en az 8 bina, en az 60 nokta.** Liste Engelli Öğrenci Birimi görüşmesinden (#2) sonra kesinleşir. Kesinleşen liste [`binalar.csv`](binalar.csv) dosyasına da işlenir. Seed script'i (#23) binaları bu dosyadan okur.

## slug kuralı

`slug` URL'de ve QR linkinde (`/b/<slug>`, #27) kullanılan kısa addır. QR etiketleri basıldıktan sonra **değiştirilemez**.

- küçük harf, Türkçe karakter yok (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u)
- kelimeler tire ile ayrılır, boşluk yok
- "fakültesi" gibi ekler kısaltılmaz: `teknoloji-fakultesi`

## Önerilen binalar

Kat ve giriş sayıları ilk saha ziyaretinde doldurulacak (`?`).

| # | slug | Bina adı | Kat sayısı | Giriş sayısı | İçine girme izni gerekiyor mu? | Neden listede |
|---|---|---|---|---|---|---|
| 1 | teknoloji-fakultesi | Teknoloji Fakültesi | ? | ? | Evet | Ekibin fakültesi, başlangıç noktası |
| 2 | muhendislik-fakultesi | Mühendislik Fakültesi | ? | ? | Evet | Teknoloji Fak.'e komşu, yoğun kullanım |
| 3 | merkezi-kutuphane | Merkezi Kütüphane | ? | ? | Evet | Tüm öğrencilerin ortak kullandığı bina |
| 4 | yemekhane | Merkezi Yemekhane | ? | ? | Hayır | Her gün kullanılan ortak alan |
| 5 | rektorluk | Rektörlük | ? | ? | Evet | İdari işlemler |
| 6 | engelli-ogrenci-birimi | Engelli Öğrenci Birimi'nin bulunduğu bina | ? | ? | Evet | Hedef kitlenin doğrudan başvurduğu yer |
| 7 | derslik-binasi | Ortak derslik binası (adı kesinleşecek) | ? | ? | Evet | Ders için en çok girilen binalardan |
| 8 | saglik-merkezi | Sağlık Merkezi (Mediko) | ? | ? | Evet | Acil erişim ihtiyacı |

Not: 6 ve 7 numaralı binaların gerçek adları kesinleşince slug da gerçek ada göre yazılmalı (ör. `iletisim-fakultesi`).

## `binalar.csv` kolonları

| Kolon | Açıklama |
|---|---|
| slug, ad | Yukarıdaki tablodan |
| enlem, boylam | **Ana girişin** konumu (Google Haritalar'da uzun bas) |
| kat_sayisi | Zemin dahil kat sayısı |
| basamaksiz_giris | `evet` / `hayır`, en az bir girişten basamaksız girilebiliyor mu ([puanlama.md](puanlama.md)) |
| ozet | 1-2 cümle: "Ana girişte rampa var. Asansör 4 katın hepsine çıkıyor. Engelli tuvaleti zemin katta." |
| puan_elle | Boş bırakın. Puan nokta verisinden hesaplanır, yalnızca elle düzeltme gerekirse `green`/`yellow`/`red` |

## Onay

- [ ] Sadık
- [ ] Kaan
- [ ] Alper
