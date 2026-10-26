import { openDirections } from "@/lib/directions";
import { AppButton } from "./AppButton";

// Etiket uygulamadan çıkılacağını söyler (#17)
export function DirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  return (
    <AppButton
      label="Google Haritalar'da yol tarifi al (uygulama dışına çıkar)"
      variant="secondary"
      accessibilityHint="Yürüyüş yol tarifini Google Haritalar'da açar"
      onPress={() => void openDirections(lat, lng)}
    />
  );
}
