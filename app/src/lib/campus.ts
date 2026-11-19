import type { LatLng, Region } from "react-native-maps";

// Selçuk Üniversitesi Alaeddin Keykubat Yerleşkesi (OpenStreetMap sınırları); veri gelene kadar başlangıç bölgesi
export const CAMPUS_REGION: Region = {
  latitude: 38.0236,
  longitude: 32.5054,
  latitudeDelta: 0.033,
  longitudeDelta: 0.025,
};

// Kampüsün tamamı ekrana sığdıktan sonra daha fazla uzaklaşmak işe yaramaz
export const CAMPUS_MIN_ZOOM = 13;

// Sınırın yerleşke ve kayıtların çevresinde bıraktığı pay (~1 km)
const BOUNDS_MARGIN_DEG = 0.01;

// Haritanın kaydırılabileceği alan: yerleşke ve tüm kayıtları kapsayan kutu, çevresinde pay.
// Kampüs dışında kalan bir kayıt da erişilebilir kalsın diye sabit değil veriden hesaplanır
export function mapBounds(coordinates: LatLng[]): { northEast: LatLng; southWest: LatLng } {
  const halfLat = CAMPUS_REGION.latitudeDelta / 2;
  const halfLng = CAMPUS_REGION.longitudeDelta / 2;
  const lats = [
    CAMPUS_REGION.latitude - halfLat,
    CAMPUS_REGION.latitude + halfLat,
    ...coordinates.map((c) => c.latitude),
  ];
  const lngs = [
    CAMPUS_REGION.longitude - halfLng,
    CAMPUS_REGION.longitude + halfLng,
    ...coordinates.map((c) => c.longitude),
  ];
  return {
    northEast: { latitude: Math.max(...lats) + BOUNDS_MARGIN_DEG, longitude: Math.max(...lngs) + BOUNDS_MARGIN_DEG },
    southWest: { latitude: Math.min(...lats) - BOUNDS_MARGIN_DEG, longitude: Math.min(...lngs) - BOUNDS_MARGIN_DEG },
  };
}

// Seçim id ile tutulur; veri yenilenince güncel kayıt store'dan okunur, silinen kayıt seçimi düşürür
export type MapSelection = { kind: "building" | "point"; id: string };

export const toLatLng = ({ lat, lng }: { lat: number; lng: number }): LatLng => ({ latitude: lat, longitude: lng });
