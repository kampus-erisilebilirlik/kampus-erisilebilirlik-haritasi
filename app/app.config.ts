import type { ConfigContext, ExpoConfig } from "expo/config";

const mapsKey = process.env.GOOGLE_MAPS_API_KEY;

// Anahtarsız Android build'de harita açılışta "API key not found" ile çöker; EAS'te build baştan durdurulur
if (process.env.EAS_BUILD === "true" && process.env.EAS_BUILD_PLATFORM === "android" && !mapsKey) {
  throw new Error("GOOGLE_MAPS_API_KEY tanımlı değil: EAS ortam değişkeni olarak ekleyin (README)");
}

// app.json'a Android Google Maps anahtarını ekler. Anahtar repoya girmez: yerelde app/.env.local,
// EAS build'de GOOGLE_MAPS_API_KEY ortam değişkeni. config yayıldığı için `eas init` app.json'a yazabilir
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [...(config.plugins ?? []), ["react-native-maps", { androidGoogleMapsApiKey: mapsKey }]],
});
