import { Linking } from "react-native";

// Google Haritalar yürüyüş tarifi. Uygulama yüklü değilse adres tarayıcıda açılır; başlangıç noktasını
// Google Haritalar kendisi belirler, bu uygulama konumu hiçbir yere göndermez
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function openDirections(lat: number, lng: number): Promise<void> {
  return Linking.openURL(directionsUrl(lat, lng));
}
