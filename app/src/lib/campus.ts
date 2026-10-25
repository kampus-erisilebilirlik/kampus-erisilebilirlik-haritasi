import type { LatLng, Region } from "react-native-maps";

// Selçuk Üniversitesi Alaeddin Keykubat Yerleşkesi (OpenStreetMap sınırları); veri gelene kadar başlangıç bölgesi
export const CAMPUS_REGION: Region = {
  latitude: 38.0236,
  longitude: 32.5054,
  latitudeDelta: 0.033,
  longitudeDelta: 0.025,
};

// Seçim id ile tutulur; veri yenilenince güncel kayıt store'dan okunur, silinen kayıt seçimi düşürür
export type MapSelection = { kind: "building" | "point"; id: string };

export const toLatLng = ({ lat, lng }: { lat: number; lng: number }): LatLng => ({ latitude: lat, longitude: lng });
