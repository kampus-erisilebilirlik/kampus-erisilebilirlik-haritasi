# QR hedef sayfası (#27)

GitHub Pages'te `web/` yayınlanır (`.github/workflows/pages.yml`, `main`'e `web/**` değişikliği gelince).

| Sayfa | Adres |
|---|---|
| Ana sayfa | `https://kampus-erisilebilirlik.github.io/kampus-erisilebilirlik-haritasi/` |
| Bina sayfası | `.../b/?s=<slug>` |
| QR etiketindeki bağlantı | `.../b/?s=<slug>&q=1` |

- `&q=1` yalnızca QR etiketlerinde bulunur: ziyaret `qr_visits` tablosunda sayılır (gün + bina, IP/cihaz yok). Aynı sekmede yenileme ikinci kez sayılmaz.
- QR'lar basıldıktan sonra adres değişemez (#28).
- "Uygulamada aç" yalnızca Android'de görünür: `intent://bina/<slug>` uygulama yüklüyse bina ekranını açar, değilse indirme sayfasına gider. Sayfa kendiliğinden yönlendirmez.
- `config.js` repoda yok. Yayında `SUPABASE_URL` / `SUPABASE_ANON_KEY` repo secret'larından üretilir.

## Yerelde deneme

```sh
cp web/config.example.js web/config.js   # URL ve anon anahtarı yazın
python3 -m http.server -d web 8000       # http://localhost:8000/b/?s=teknoloji-fakultesi
```
