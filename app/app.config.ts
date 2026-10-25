import type { ConfigContext, ExpoConfig } from "expo/config";

// app.json'a Android Google Maps anahtarını ekler. Anahtar repoya girmez: yerelde app/.env.local,
// EAS build'de GOOGLE_MAPS_API_KEY ortam değişkeni. config yayıldığı için `eas init` app.json'a yazabilir
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [
    ...(config.plugins ?? []),
    ["react-native-maps", { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY }],
  ],
});
