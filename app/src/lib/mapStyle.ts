import type { MapStyleElement } from "react-native-maps";

// Yüksek kontrast harita altlığı (Google Haritalar, Android). userInterfaceStyle Android'de etkisiz olduğu için
// stil açıkça verilir. Siyah zemin, beyaz yazı ve beyaz kenarlı yollar/binalar; dikkat dağıtan işletme simgeleri gizli
export const highContrastMapStyle: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }, { weight: 3 }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#3A3A3A" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0B2A4A" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
