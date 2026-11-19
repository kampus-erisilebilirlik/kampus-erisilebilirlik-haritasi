import type { LatLng } from "react-native-maps";

const EARTH_RADIUS_M = 6_371_000;

// İki koordinat arası kuş uçuşu mesafe (metre), haversine formülü. Gerçek yürüme mesafesi #25'teki rotadan gelir
export function distanceMeters(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Konuma en yakın n öğe, yakından uzağa; #25 rota başlangıcı için de kullanılabilir
export function nearest<T extends { lat: number; lng: number }>(
  from: LatLng,
  items: T[],
  n = 1,
): (T & { distance: number })[] {
  return items
    .map((item) => ({ ...item, distance: distanceMeters(from, { latitude: item.lat, longitude: item.lng }) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}
