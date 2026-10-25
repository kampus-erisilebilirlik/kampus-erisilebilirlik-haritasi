// Bilgi ekranı içeriği. Birim bilgileri resmî sayfadan (selcuk.edu.tr/birim/index/5477, 2026-10-25'te okundu);
// #2 görüşmesinde birimden teyit alınmalı. Sayfa üç numarayı "iletişim/faks" başlığıyla birlikte veriyor
export const unitContact = {
  name: "Engelli Öğrenci Birimi Koordinatörlüğü",
  address: "Prof. Dr. Erol Güngör Kütüphanesi, Alaeddin Keykubat Yerleşkesi, 42250 Selçuklu / Konya",
  email: "engelsizyasam@selcuk.edu.tr",
  phones: ["0332 223 25 34", "0332 352 09 63", "0332 352 80 72"],
  web: "https://selcuk.edu.tr/birim/index/5477",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Selçuk Üniversitesi Prof. Dr. Erol Güngör Kütüphanesi",
  )}`,
};

// Birimin sayfasındaki form ve uygulama başlıklarından
export const unitServices: string[] = [
  "Sınavlarda ek süre uygulamaları",
  "Erişilebilir kitap talebi",
  "Sesli betimleme hizmeti talebi",
  "İşaret dili tercümanı talebi",
  "Akran desteği başvurusu",
];

// Her madde kaynağıyla; bağlantı yalnızca doğrulanmış resmî metne verilir. Birime onaylatılacak (#2)
export const rights: { text: string; source: string; url?: string }[] = [
  {
    text: "Kamu binalarının ve açık alanların engelli bireylerin erişebileceği şekilde düzenlenmesi zorunludur.",
    source: "5378 sayılı Engelliler Hakkında Kanun",
    url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5378&MevzuatTur=1&MevzuatTertip=5",
  },
  {
    text: "Üniversitelerde engelli öğrencilerin eğitim hayatını kolaylaştırmak için engelli öğrenci birimleri kurulur; YÖK “Engelsiz Üniversite” çalışmalarıyla erişilebilirliği öncelikli konular arasında görür.",
    source: "Yükseköğretim Kurumları Engelliler Danışma ve Koordinasyon Yönetmeliği",
  },
  {
    text: "Derslerde ve sınavlarda ihtiyaç duyduğunuz düzenlemeler (ör. sınavlarda ek süre) için Engelli Öğrenci Birimi Koordinatörlüğü'ne başvurabilirsiniz.",
    source: "Selçuk Üniversitesi Engelli Öğrenci Birimi",
    url: "https://selcuk.edu.tr/birim/index/5477",
  },
];

export const repoUrl = "https://github.com/kampus-erisilebilirlik/kampus-erisilebilirlik-haritasi";

export const about = {
  project:
    "Selçuk Üniversitesi Teknoloji Fakültesi Bilgisayar Mühendisliği Bölümü, Topluma Hizmet Uygulamaları dersi kapsamında geliştirilen açık kaynak bir projedir.",
  team: "Sadık Bilal Şan (koordinatör), Alper Şimşek, Kaan Uzavcı",
  advisor: "Prof. Dr. Nurettin Doğan",
  measurements:
    "Noktalar ekip tarafından sahada toplanmıştır. Rampa ölçümleri ve TS 9111 (Türk erişilebilirlik standardı) değerlendirmeleri ön tespit niteliğindedir, kesin denetim değildir.",
  score:
    "Bina puanı; basamaksız giriş, gerekiyorsa çalışan asansör ve çalışan engelli tuvaleti olup olmamasına göre belirlenir. Kural her binanın sayfasında açıklanır.",
};

// KVKK aydınlatma metni (#19). Uygulamanın gerçek davranışıyla birebir aynı tutulmalı; danışmana onaylatılacak
export const privacySections: { title: string; body: string }[] = [
  {
    title: "Veri sorumlusu",
    body: "Kampüs Erişilebilirlik Haritası proje ekibi (Selçuk Üniversitesi Teknoloji Fakültesi). Uygulama Engelli Öğrenci Birimi Koordinatörlüğü'ne devredildiğinde veri sorumlusu birim olur.",
  },
  {
    title: "Toplanmayan veriler",
    body: "Uygulama üyelik istemez. Adınız, e-posta adresiniz, telefon numaranız, öğrenci numaranız, cihaz kimliğiniz ve konumunuz toplanmaz.",
  },
  {
    title: "Konum",
    body: "Konum izni verirseniz konumunuz yalnızca telefonunuzda, en yakın noktayı ve rotayı bulmak için kullanılır. Sunucuya gönderilmez ve saklanmaz. İzni istediğiniz zaman telefon ayarlarından kapatabilirsiniz.",
  },
  {
    title: "Sorun bildirimleri",
    body: "Bir sorun bildirdiğinizde seçtiğiniz nokta, bildirdiğiniz durum ve isteğe bağlı kısa açıklama kaydedilir. Kötüye kullanımı sınırlamak için uygulama ilk bildirimde rastgele, kimliksiz bir kod üretir ve telefonunuzda saklar. Bu kod sizi veya cihazınızı tanımlamaz, uygulama silinince kaybolur ve yalnızca bildirim sayısını sınırlamak için kullanılır. Lütfen açıklamaya kişisel bilgi yazmayın.",
  },
  {
    title: "Kullanım istatistiği",
    body: "Uygulamanın kaç kez açıldığı yalnızca günlük toplam sayı olarak tutulur. Bu kayıt kişiyi veya cihazı tanımlayan hiçbir bilgi içermez.",
  },
  {
    title: "Telefonda saklananlar",
    body: "İnternet olmadan da kullanabilmeniz için son indirilen bina ve nokta bilgileri ile fotoğraflar telefonunuzda saklanır. Görünüm ve filtre tercihleriniz de telefonda kalır. Uygulamayı kaldırdığınızda hepsi silinir.",
  },
  {
    title: "Sunucu ve üçüncü taraflar",
    body: "Erişilebilirlik verileri, fotoğraflar ve bildirimler Supabase altyapısında (Frankfurt, Almanya) saklanır. Sunucu altyapısı, her internet hizmetinde olduğu gibi teknik güvenlik amacıyla istek kayıtlarını (ör. IP adresi) sınırlı bir süre tutabilir; bu kayıtlar kişileri tanımak için kullanılmaz. Harita altlığı ve yol tarifi Google Haritalar tarafından sağlanır; bu hizmetler için Google'ın gizlilik politikası geçerlidir.",
  },
  {
    title: "Saklama ve haklarınız",
    body: "Bildirimler, ilgili sorunun takibi için saklanır. 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesindeki haklarınızla ilgili soru ve başvurularınızı Engelli Öğrenci Birimi Koordinatörlüğü'nün e-posta adresine iletebilirsiniz.",
  },
];
