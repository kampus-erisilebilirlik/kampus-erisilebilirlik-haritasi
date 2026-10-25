// Ön ve son ihtiyaç anketini (#12, #20) Google Forms'ta oluşturur.
// Kullanım: script.google.com → Yeni proje → bu dosyayı yapıştır → createOnAnket (hafta 5) veya createSonAnket (hafta 12) → Çalıştır.
// 1–7. sorular iki ankette aynı diziden gelir: ön/son karşılaştırması için metinleri burada değiştirmeyin (docs/anket/anket-sorulari.md).

const ACIKLAMA =
  'Bu anket, Selçuk Üniversitesi Teknoloji Fakültesi Topluma Hizmet Uygulamaları dersi kapsamında hazırlanan ' +
  'Kampüs Erişilebilirlik Haritası projesi içindir. Amacımız, kampüsteki rampa, asansör, engelli tuvaleti ve engelli ' +
  'otoparkı gibi alanları bulmanın sizin için ne kadar kolay olduğunu öğrenmektir.';

const SON_ANKET_EKI = ' Bu anket, uygulamanın kullanıma sunulmasından sonraki durumu ölçmek içindir.';

const GIZLILIK =
  '\n\nAnket anonimdir: adınız, e-posta adresiniz, öğrenci numaranız veya bölümünüz sorulmaz. Yanıtlar yalnızca proje ' +
  'ekibi tarafından görülür, toplu olarak (yüzde ve sayı şeklinde) raporlanır ve proje sonunda silinir. Katılım isteğe ' +
  'bağlıdır; istemediğiniz soruyu boş bırakabilir, istediğiniz an formu kapatabilirsiniz. Yaklaşık 2 dakika sürer.' +
  '\n\nLütfen açık uçlu soruya adınızı, telefonunuzu veya sizi tanıtacak bir bilgi yazmayın.';

const ONAM = 'Yukarıdaki açıklamayı okudum ve ankete gönüllü olarak katılmayı kabul ediyorum.';

// Izgara/matris yerine her seçeneği yazılı tek seçim: ekran okuyucu her seçeneği anlamıyla okur
const OLCEK = ['1 – Çok zor', '2 – Zor', '3 – Ne kolay ne zor', '4 – Kolay', '5 – Çok kolay'];

// İki ankette birebir aynı sorulan sorular (1–7). 2. soru ana ölçüttür
const ORTAK = [
  {
    tip: 'coklu',
    baslik: 'Kampüste hareket ederken aşağıdakilerden hangileri sizin için geçerli?',
    secenekler: [
      'Tekerlekli sandalye kullanıyorum',
      'Görme engelim var',
      'Yürüme güçlüğüm var',
      'Geçici bir kısıtlılığım var (kaza, ameliyat vb.)',
      'Engelli bir öğrenciye refakat ediyorum',
      'Diğer',
      'Belirtmek istemiyorum',
    ],
  },
  {
    tip: 'tek',
    baslik: 'Gideceğiniz binanın erişilebilir olup olmadığını önceden öğrenmek ne kadar kolay?',
    secenekler: OLCEK,
  },
  { tip: 'tek', baslik: 'Kampüste rampa, asansör veya engelli tuvaletini bulmak ne kadar kolay?', secenekler: OLCEK },
  {
    tip: 'tek',
    baslik: 'Son bir ayda bir binaya gidip erişilebilir olmadığını yerinde öğrendiğiniz oldu mu?',
    secenekler: ['Hiç olmadı', '1-2 kez', '3 kez veya daha fazla'],
  },
  { tip: 'tek', baslik: 'Bu yüzden derse veya randevuya geç kaldığınız oldu mu?', secenekler: ['Evet', 'Hayır'] },
  {
    tip: 'tek',
    baslik: 'Arızalı asansör gibi durumları nereye bildireceğinizi biliyor musunuz?',
    secenekler: ['Evet', 'Hayır'],
  },
  {
    tip: 'coklu',
    baslik: 'Böyle bir uygulamada en çok hangi bilgilere ihtiyaç duyarsınız?',
    secenekler: [
      'Rampaların yeri, eğimi ve genişliği',
      'Asansörlerin yeri ve çalışıp çalışmadığı',
      'Engelli tuvaletlerinin yeri',
      'Engelli otoparklarının yeri',
      'Merdivensiz (basamaksız) rota',
      'Ekran okuyucuyla okunabilen sözlü tarif ve kılavuz iz bilgisi',
      'Arızaları bildirme imkânı',
    ],
  },
];

const KULLANIM = {
  tip: 'tek',
  baslik: 'Kampüs Erişilebilirlik Haritası uygulamasını kullandınız mı?',
  secenekler: [
    'Evet, düzenli olarak',
    'Evet, birkaç kez',
    'Hayır, ama bina girişindeki QR etiketini okuttum',
    'Hayır, hiç kullanmadım',
  ],
};

const ACIK_UCLU = { tip: 'acik', baslik: 'Eklemek istedikleriniz' };

function createOnAnket() {
  createAnket('Kampüs Erişilebilirlik — Ön Anket', ACIKLAMA + GIZLILIK, ORTAK.concat([ACIK_UCLU]));
}

function createSonAnket() {
  createAnket('Kampüs Erişilebilirlik — Son Anket', ACIKLAMA + SON_ANKET_EKI + GIZLILIK, ORTAK.concat([KULLANIM, ACIK_UCLU]));
}

function createAnket(baslik, aciklama, sorular) {
  const form = FormApp.create(baslik);
  form.setDescription(aciklama);
  // Kimliği bağlayan her şey kapalı: e-posta yok, Google hesabı gerektiren "1 yanıt" sınırı yok
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setPublishingSummary(false);
  form.setShowLinkToRespondAgain(false);

  form.addCheckboxItem().setTitle('Onam').setChoiceValues([ONAM]).setRequired(true);

  sorular.forEach((soru, i) => {
    const title = i + 1 + '. ' + soru.baslik;
    if (soru.tip === 'tek') {
      form.addMultipleChoiceItem().setTitle(title).setChoiceValues(soru.secenekler);
    } else if (soru.tip === 'coklu') {
      form.addCheckboxItem().setTitle(title).setChoiceValues(soru.secenekler);
    } else {
      form.addParagraphTextItem().setTitle(title).setHelpText('İsteğe bağlı. Sizi tanıtacak bilgi yazmayın.');
    }
  });

  const sheet = SpreadsheetApp.create(baslik + ' (Yanıtlar)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('Doldurma linki: ' + form.getPublishedUrl());
  Logger.log('Düzenleme linki: ' + form.getEditUrl());
  Logger.log('Yanıt tablosu (yalnızca ekiple paylaşın, CSV repoya konmaz): ' + sheet.getUrl());
}
