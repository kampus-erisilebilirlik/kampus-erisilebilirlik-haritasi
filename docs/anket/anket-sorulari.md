# İhtiyaç Anketi: Ön ve Son Anket

Issue #12. Ön-test / son-test tasarımı: ön anket hafta 5'te uygulama yokken durumu, son anket hafta 12'de (#20) uygulama kullanıldıktan sonraki durumu ölçer.

- **Ana ölçüt:** S2'de "Kolay" veya "Çok kolay" (4–5) diyenlerin oranı. Hedef: son ankette en az %70.
- **Kurallar:** anonim, en az 10 katılımcı, kişisel veri yok (ad, numara, e-posta, bölüm sorulmaz).
- **Karşılaştırma kuralı:** S1–S7 iki ankette **kelimesi kelimesine aynı** sorulur. Soru metni veya seçenekler değişirse karşılaştırma geçersiz olur. Bu yüzden iki form aynı script'le oluşturulur.

Soruların ilk taslağı issue'dadır; aşağıdaki metin o taslağın düzenlenmiş halidir ve ekip onayından geçmelidir.

## Formları oluşturma

Formlar elle kurulmaz; [`scripts/anket/create-forms.gs`](../../scripts/anket/create-forms.gs) kullanılır. Ortak sorular tek yerden geldiği için iki form birebir aynı olur.

1. https://script.google.com → **Yeni proje**
2. İçeriği silip `scripts/anket/create-forms.gs` dosyasını yapıştırın.
3. Fonksiyon listesinden `createOnAnket` seçiliyken **Çalıştır**. İlk seferde Google izin ister; script yalnızca sizin Drive'ınızda form oluşturur.
4. **Yürütme günlüğü**nde doldurma linki, düzenleme linki ve yanıt tablosu çıkar.
5. Formu **TalkBack ile baştan sona doldurun** (kabul kriteri), deneme yanıtını tablodan silin.
6. Son anket hafta 12'de aynı şekilde `createSonAnket` ile oluşturulur (#20).

Script şu ayarları kendisi yapar. Elle kurulursa aynıları yapılmalı:

- "E-posta adreslerini topla" **kapalı**.
- "Yanıtları 1 ile sınırla" **kapalı**: bu ayar Google girişini zorunlu kılar ve kimliği bağlar.
- Yanıt düzenleme kapalı; katılımcılar diğer yanıtların özetini göremez.
- Yalnızca onam sorusu zorunlu. Ölçek soruları ızgara/matris değil, her seçeneği yazılı çoktan seçmeli soru (ekran okuyucu için).

## Açıklama metni (formun başına)

> Bu anket, Selçuk Üniversitesi Teknoloji Fakültesi Topluma Hizmet Uygulamaları dersi kapsamında hazırlanan **Kampüs Erişilebilirlik Haritası** projesi içindir. Amacımız, kampüsteki rampa, asansör, engelli tuvaleti ve engelli otoparkı gibi alanları bulmanın sizin için ne kadar kolay olduğunu öğrenmektir.
>
> Anket anonimdir: adınız, e-posta adresiniz, öğrenci numaranız veya bölümünüz sorulmaz. Yanıtlar yalnızca proje ekibi tarafından görülür, toplu olarak (yüzde ve sayı şeklinde) raporlanır ve proje sonunda silinir. Katılım isteğe bağlıdır; istemediğiniz soruyu boş bırakabilir, istediğiniz an formu kapatabilirsiniz. Yaklaşık 2 dakika sürer.
>
> Lütfen açık uçlu soruya adınızı, telefonunuzu veya sizi tanıtacak bir bilgi yazmayın.

Son ankette ilk paragrafın sonuna şu cümle eklenir: "Bu anket, uygulamanın kullanıma sunulmasından sonraki durumu ölçmek içindir."

**Onam (zorunlu, tek onay kutusu):** "Yukarıdaki açıklamayı okudum ve ankete gönüllü olarak katılmayı kabul ediyorum." Teklif formunun etik kontrol listesi bilgilendirilmiş onam alınacağını söylüyor.

## Sorular

Ölçek seçenekleri (S2, S3): **1 – Çok zor · 2 – Zor · 3 – Ne kolay ne zor · 4 – Kolay · 5 – Çok kolay**

**S1. Kampüste hareket ederken aşağıdakilerden hangileri sizin için geçerli?** *(çoklu seçim)*
- Tekerlekli sandalye kullanıyorum
- Görme engelim var
- Yürüme güçlüğüm var
- Geçici bir kısıtlılığım var (kaza, ameliyat vb.)
- Engelli bir öğrenciye refakat ediyorum
- Diğer
- Belirtmek istemiyorum

**S2. Gideceğiniz binanın erişilebilir olup olmadığını önceden öğrenmek ne kadar kolay?** *(ölçek, ana ölçüt)*

**S3. Kampüste rampa, asansör veya engelli tuvaletini bulmak ne kadar kolay?** *(ölçek)*

**S4. Son bir ayda bir binaya gidip erişilebilir olmadığını yerinde öğrendiğiniz oldu mu?**
- Hiç olmadı · 1-2 kez · 3 kez veya daha fazla

**S5. Bu yüzden derse veya randevuya geç kaldığınız oldu mu?**
- Evet · Hayır

**S6. Arızalı asansör gibi durumları nereye bildireceğinizi biliyor musunuz?**
- Evet · Hayır

**S7. Böyle bir uygulamada en çok hangi bilgilere ihtiyaç duyarsınız?** *(çoklu seçim)*
- Rampaların yeri, eğimi ve genişliği
- Asansörlerin yeri ve çalışıp çalışmadığı
- Engelli tuvaletlerinin yeri
- Engelli otoparklarının yeri
- Merdivensiz (basamaksız) rota
- Ekran okuyucuyla okunabilen sözlü tarif ve kılavuz iz bilgisi
- Arızaları bildirme imkânı

**Son ankette ek soru: Kampüs Erişilebilirlik Haritası uygulamasını kullandınız mı?**
- Evet, düzenli olarak · Evet, birkaç kez · Hayır, ama bina girişindeki QR etiketini okuttum · Hayır, hiç kullanmadım

**Son soru (iki ankette de): Eklemek istedikleriniz** *(açık uçlu, isteğe bağlı)*

Ön anket 8 soru (S1–S7 ve açık uçlu soru), son anket 9 soru (ek soru dahil).

## Dağıtım

- **Duyuru:** Engelli Öğrenci Birimi aracılığıyla yapılır (#2). Duyuru metni:

  > Kampüste rampa, asansör ve engelli tuvaletini bulmak sizin için ne kadar kolay? Topluma Hizmet Uygulamaları dersi kapsamında Kampüs Erişilebilirlik Haritası'nı hazırlıyoruz. 2 dakikalık anonim anketimize katılın: **forms.gle/…** — Ad, numara veya e-posta sorulmaz. Ekran okuyucuyla doldurulabilir. İsterseniz birim aracılığıyla sözlü olarak da katılabilirsiniz.

- **Kısa link ve QR:** Duyuruya Google Forms'un kısa linki (`forms.gle/…`) ve büyük puntolu bir QR eklenir. QR'ın altında link açıkça yazılır.
- **Sözlü doldurma:** Görme engelli katılımcılar için birim aracılığıyla sözlü / yüz yüze doldurma sunulur. Ekip üyesi soruları okur, yanıtı katılımcının söylediği gibi forma girer ve kişiyle ilgili hiçbir not tutmaz.
- **Hedef:** en az 10 yanıt. Bir hafta sonra 10'un altındaysa geçici kısıtlılığı olanlar ve refakatçiler de dahil edilir (teklif formundaki risk önlemi).

## Kayıt

- Yanıtlar kapanınca CSV indirilir ve ekip Drive'ında **paylaşıma kapalı** bir klasörde tutulur. CSV repoya **konmaz**.
- Repoya yalnızca özet girer: `docs/anket/on-anket-ozet.md` (son ankette `son-anket-ozet.md`). Şablon:

  | Bilgi | Değer |
  |---|---|
  | Uygulama tarihleri | … – … |
  | Katılımcı sayısı | … |
  | S2 yanıtlayan / 4–5 diyen | … / … |
  | **Başlangıç değeri** (S2'de 4–5 oranı) | %… |
  | S3'te 4–5 oranı | %… |
  | S4–S6 dağılımı | … |
  | S7'de en çok seçilen 3 bilgi | … |

- Yanıt tablosu proje sonunda (#9) silinir, silme tarihi sonuç raporuna yazılır.

## Analiz notu (#20 için)

- **"Kolay buldum" oranı:** S2'de 4 veya 5 diyenlerin, S2'yi yanıtlayanlara oranı. Ön ve son anket için ayrı hesaplanıp karşılaştırılır. Boş bırakanlar paydaya girmez; kaç kişinin boş bıraktığı ayrıca yazılır.
- S1 kırılımı yalnızca toplam sayı olarak verilir. Kişiler tanınabilir hâle gelmesin diye küçük gruplar (≤2 kişi) ayrı raporlanmaz.
- Açık uçlu yanıtlar alıntılanırken kişiyi tanıtabilecek ayrıntı (bölüm, sınıf, olay tarihi vb.) çıkarılır.
- S7 yanıtları uygulamanın önceliklerini doğrulamak için kullanılır.
