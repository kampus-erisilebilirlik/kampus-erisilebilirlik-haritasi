// QR hedef sayfası (#27): ?s=<slug> binanın özeti, uygulamada aç (intent://) ve indirme
// QR linkleri &q=1 taşır; yalnızca onlar sayılır, paylaşılan bağlantı sayacı şişirmez
"use strict";

const params = new URLSearchParams(location.search);
const slug = (params.get("s") || "").trim().toLowerCase();
const fromQr = params.get("q") === "1";

const $ = (id) => document.getElementById(id);

// "2 asansör" gibi sayı; olmayan tür de yazılır, eksiklik de bir bilgidir
function facilityItems(points) {
  return POINT_TYPES.map(([type, label]) => {
    const ofType = points.filter((p) => p.type === type);
    if (ofType.length === 0) return el("li", { text: `${label}: yok` });
    const broken = ofType.filter((p) => p.status === "broken").length;
    const text = broken > 0 ? `${label}: ${ofType.length} (${broken} arızalı)` : `${label}: ${ofType.length}`;
    return el("li", { text });
  });
}

// Uygulama yüklüyse bina ekranı açılır (kampuserisim://bina/<slug>), değilse Chrome indirme sayfasına gider
function intentUrl(buildingSlug) {
  return (
    `intent://bina/${encodeURIComponent(buildingSlug)}#Intent;scheme=${APP_SCHEME};package=${APP_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(DOWNLOAD_URL)};end`
  );
}

// Sayaç sayfayı bekletmez; hata olursa sessizce geçilir. Aynı sekmede yenileme ikinci kez saymaz
function logVisit(buildingSlug) {
  const key = `qr-visit:${buildingSlug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // depolama kapalıysa yine say
  }
  api("rpc/log_qr_visit", { method: "POST", body: JSON.stringify({ p_slug: buildingSlug }) }).catch(() => {});
}

async function showNotFound() {
  $("title").textContent = "Bina bulunamadı";
  document.title = "Bina bulunamadı · Kampüs Erişilebilirlik Haritası";
  $("not-found").hidden = false;
  try {
    $("all-buildings").append(buildingList(await fetchBuildings()));
  } catch {
    // listeyi de alamazsak yalnızca mesaj ve indirme kalır
  }
}

async function main() {
  if (!slug) return showNotFound();

  const buildings = await api(`v_buildings?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name,score,summary`);
  const building = buildings[0];
  if (!building) return showNotFound();

  const points = await api(`v_points?building_id=eq.${building.id}&select=type,status`);

  $("title").textContent = building.name;
  document.title = `${building.name} · Kampüs Erişilebilirlik Haritası`;
  $("score").append(scoreBadge(building.score));
  $("summary").textContent = building.summary || "";
  $("facilities").append(...facilityItems(points));
  $("building").hidden = false;

  // intent:// yalnızca Android'de çalışır; diğerlerinde düğme gösterilmez. Otomatik yönlendirme yok:
  // ekran okuyucu kullanıcısı önce içeriği duyar
  if (/Android/i.test(navigator.userAgent)) {
    const open = $("open-app");
    open.href = intentUrl(building.slug);
    open.hidden = false;
  }

  if (fromQr) logVisit(building.slug);
}

main().catch(() => {
  $("title").textContent = "Bilgi yüklenemedi";
  $("status").textContent = "Bina bilgisi şu an alınamadı. İnternet bağlantınızı kontrol edip sayfayı yenileyin.";
});
