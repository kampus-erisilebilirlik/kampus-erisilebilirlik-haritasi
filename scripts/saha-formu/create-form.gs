// Saha veri formunu (#21) ve yanıt tablosunu oluşturur.
// Kullanım: script.google.com → Yeni proje → bu dosyayı yapıştır → createSahaFormu → Çalıştır.
// Soru başlıkları seed script'inin (#23) okuduğu CSV kolonlarıdır: değiştirmeyin.

const BINALAR = [
  'teknoloji-fakultesi',
  'muhendislik-fakultesi',
  'merkezi-kutuphane',
  'yemekhane',
  'rektorluk',
  'engelli-ogrenci-birimi',
  'derslik-binasi',
  'saglik-merkezi',
];

const NOKTA_KODU = /^[a-z0-9]+(-[a-z0-9]+)*-(ramp|elevator|toilet|parking|auto-door)-[0-9]+$/;
const ONDALIK = '^-?[0-9]+(\\.[0-9]+)?$';
const TAM_SAYI = '^-?[0-9]+$';

function createSahaFormu() {
  const form = FormApp.create('Kampüs Erişilebilirlik — Saha Veri Formu');
  form.setDescription(
    'Her yanıt bir nokta. Ölçüm yöntemi: docs/saha/olcum-yontemi.md. ' +
      'Fotoğrafta kişi olmamalı. Ondalık için yalnızca nokta kullanın (7.8).',
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(true);

  text(form, 'nokta_kodu', '<bina-slug>-<ramp|elevator|toilet|parking|auto-door>-<sıra>, ör. teknoloji-fakultesi-ramp-1', true)
    .setValidation(FormApp.createTextValidation().requireTextMatchesPattern(NOKTA_KODU.source).setHelpText('Biçim: teknoloji-fakultesi-ramp-1').build());
  list(form, 'bina_slug', '', BINALAR, true);
  choice(form, 'tur', '', ['rampa', 'asansör', 'tuvalet', 'otopark', 'otomatik kapı'], true);
  text(form, 'ad', 'Kısa tanım, ör. Ana giriş rampası', true);
  number(form, 'enlem', 'Google Haritalar\'da uzun bas → ilk sayı (38.0…)', true);
  number(form, 'boylam', 'İkinci sayı (32.5…)', true);
  integer(form, 'kat', '0 = zemin, -1 = bodrum', true);
  choice(form, 'durum', '', ['çalışıyor', 'arızalı', 'bilinmiyor'], true);
  text(form, 'foto_dosyasi', 'Nokta kodu + .jpg', true);
  form.addParagraphTextItem().setTitle('sozlu_tarif').setHelpText('Sabit referans → yön → mesafe → dokunsal/işitsel işaret').setRequired(true);
  choice(form, 'kilavuz_iz', 'Hissedilebilir kılavuz iz', ['var', 'yok', 'bilinmiyor'], true);

  form.addSectionHeaderItem().setTitle('Rampa ölçümleri').setHelpText('Yalnızca tür rampa ise doldurun.');
  number(form, 'rampa_egim_1', 'Eğim ölçer, rampanın başı (%)', false);
  number(form, 'rampa_egim_2', 'Ortası (%)', false);
  number(form, 'rampa_egim_3', 'Sonu (%)', false);
  number(form, 'rampa_yukseklik_cm', 'Toplam yükselme H (cm)', false);
  number(form, 'rampa_uzunluk_cm', 'Yatay uzunluk L (cm)', false);
  number(form, 'rampa_genislik_cm', 'En dar net genişlik (cm)', false);
  choice(form, 'korkuluk', '', ['iki tarafta', 'tek tarafta', 'yok'], false);

  form.addParagraphTextItem().setTitle('notlar');
  text(form, 'olcen', 'Ölçümü yapan (veri tabanına girmez)', true);

  const sheet = SpreadsheetApp.create('Saha Veri Formu (Yanıtlar)');
  // Türkçe yerel ayarda Sheets "7.8" gibi yanıtları tarih sanabilir; seed script'i noktalı sayı bekler
  sheet.setSpreadsheetLocale('en_US');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('Doldurma linki: ' + form.getPublishedUrl());
  Logger.log('Düzenleme linki: ' + form.getEditUrl());
  Logger.log('Yanıt tablosu: ' + sheet.getUrl());
}

function text(form, title, help, required) {
  return form.addTextItem().setTitle(title).setHelpText(help).setRequired(required);
}

function number(form, title, help, required) {
  return text(form, title, help, required).setValidation(
    FormApp.createTextValidation().requireTextMatchesPattern(ONDALIK).setHelpText('Sayı girin, ör. 7.8').build(),
  );
}

function integer(form, title, help, required) {
  return text(form, title, help, required).setValidation(
    FormApp.createTextValidation().requireTextMatchesPattern(TAM_SAYI).setHelpText('Tam sayı girin, ör. 0 veya -1').build(),
  );
}

function choice(form, title, help, options, required) {
  return form.addMultipleChoiceItem().setTitle(title).setHelpText(help).setChoiceValues(options).setRequired(required);
}

function list(form, title, help, options, required) {
  return form.addListItem().setTitle(title).setHelpText(help).setChoiceValues(options).setRequired(required);
}
