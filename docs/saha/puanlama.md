# Bina puanlama kuralı

Her bina haritada üç renkten biriyle gösterilir (`buildings.score`). Kural ekipçe onaylanır. Seed script'i (#23) puanı bu kurala göre nokta verisinden **otomatik** hesaplar, böylece veri güncellendikçe puan da güncel kalır.

## Kural (öneri)

| Puan | Koşul |
|---|---|
| 🟢 **Erişilebilir** (`green`) | Basamaksız giriş var **ve** bina çok katlıysa çalışan asansör var **ve** çalışan engelli tuvaleti var |
| 🟡 **Kısmen** (`yellow`) | Basamaksız giriş var ama asansör veya tuvaletten biri eksik ya da arızalı |
| 🔴 **Erişilemez** (`red`) | Basamaksız giriş yok |

Tanımlar:

- **Basamaksız giriş:** binaya en az bir girişten basamak veya 2 cm'den yüksek eşik olmadan girilebiliyor. Rampa ile girilen giriş de basamaksız sayılır. `binalar.csv` dosyasında `basamaksiz_giris` kolonuna `evet` / `hayır` yazılır.
- **Çok katlı:** `kat_sayisi` > 1. Tek katlı binada asansör aranmaz.
- **Çalışan:** saha formunda `durum = çalışıyor`. `bilinmiyor` çalışıyor sayılmaz.

Hesap (seed script'inin uyguladığı):

```
basamaksız giriş yok                    → red
çok katlı ve çalışan asansör yok        → yellow
çalışan tuvalet yok                     → yellow
diğer                                   → green
```

## Elle düzeltme

Kural bir binada gerçeği yansıtmıyorsa (ör. asansör var ama yalnızca bir kata çıkıyor) `binalar.csv` dosyasında `puan_elle` kolonuna `green` / `yellow` / `red` yazılır. Bu değer hesaplananın yerine geçer. Nedeni `ozet` alanında açıklanmalı.

## Onay

- [ ] Sadık
- [ ] Kaan
- [ ] Alper
