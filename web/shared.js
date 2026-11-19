// QR sayfası ve ana sayfanın ortak yardımcıları. Supabase'e kütüphanesiz, anon anahtarla (yalnızca okuma) bağlanır
"use strict";

const REPO_URL = "https://github.com/kampus-erisilebilirlik/kampus-erisilebilirlik-haritasi";
const DOWNLOAD_URL = `${REPO_URL}/releases/latest`;
const APP_SCHEME = "kampuserisim";
const APP_PACKAGE = "tr.edu.selcuk.kampuserisim";

// app/src/lib/labels.ts ile aynı metinler
const SCORE = {
  green: { label: "Erişilebilir", icon: "✓" },
  yellow: { label: "Kısmen erişilebilir", icon: "!" },
  red: { label: "Erişilebilir değil", icon: "✕" },
  unknown: { label: "Henüz ölçülmedi", icon: "?" },
};

const POINT_TYPES = [
  ["ramp", "Rampa"],
  ["elevator", "Asansör"],
  ["toilet", "Engelli tuvaleti"],
  ["parking", "Engelli otoparkı"],
  ["auto_door", "Otomatik kapı"],
];

// config.js yayınlama sırasında repo secret'larından üretilir (.github/workflows/pages.yml)
function config() {
  const c = window.KAMPUS_CONFIG;
  if (!c || !c.supabaseUrl || !c.anonKey) throw new Error("config.js eksik");
  return c;
}

async function api(path, options = {}) {
  const { supabaseUrl, anonKey } = config();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}

function fetchBuildings() {
  return api("v_buildings?select=slug,name,score&order=name");
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) node.append(child);
  return node;
}

function scoreOf(score) {
  return SCORE[score] || SCORE.unknown;
}

// Renk tek başına bilgi taşımaz: ikon + metin birlikte
function scoreBadge(score) {
  const s = scoreOf(score);
  return el("span", { class: `badge score-${SCORE[score] ? score : "unknown"}` }, [
    el("span", { class: "badge-icon", "aria-hidden": "true", text: s.icon }),
    el("span", { text: s.label }),
  ]);
}

// Bina listesi; QR sayfasında "bina bulunamadı" durumunda ve ana sayfada kullanılır
function buildingList(buildings) {
  return el(
    "ul",
    { class: "building-list" },
    buildings.map((b) =>
      el("li", {}, [
        el("a", { href: `${pagesRoot()}b/?s=${encodeURIComponent(b.slug)}` }, [
          el("span", { text: b.name }),
          el("span", { class: `score score-${SCORE[b.score] ? b.score : "unknown"}`, text: scoreOf(b.score).label }),
        ]),
      ]),
    ),
  );
}

// Sayfalar alt dizinde yayınlanır (/kampus-erisilebilirlik-haritasi/); bağlantılar bulunulan sayfaya göre
function pagesRoot() {
  return location.pathname.includes("/b/") ? "../" : "";
}
