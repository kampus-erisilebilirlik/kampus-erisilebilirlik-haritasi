// Ana sayfa: tüm binaların puanlı listesi, her biri QR sayfasına bağlanır
"use strict";

fetchBuildings()
  .then((buildings) => document.getElementById("buildings").append(buildingList(buildings)))
  .catch(() => {
    document.getElementById("status").textContent = "Bina listesi şu an alınamadı. Sayfayı yenileyin.";
  });
