import * as Location from "expo-location";
import type { LatLng } from "react-native-maps";
import { create } from "zustand";

export type Permission = "unknown" | "granted" | "denied";

export type Fix = { position: LatLng; accuracyM: number | null };

export type LocateResult = ({ ok: true } & Fix) | { ok: false; reason: "denied" | "unavailable" };

// Doğruluk bundan kötüyse kullanıcıya "Konum hassasiyeti düşük" notu gösterilir (#17)
export const LOW_ACCURACY_M = 50;

type LocationState = {
  permission: Permission;
  locating: boolean;
  // Son alınan konum yalnızca bellekte; persist edilmez, sunucuya ve loga gönderilmez
  last: Fix | null;
  // İzin önceden verildiyse sormadan öğrenir (haritada konum noktası, listede mesafe sırası)
  checkPermission: () => Promise<Permission>;
  // İzin yoksa ister (yalnızca ön plan); açılışta değil, kullanıcı bir işlem başlatınca çağrılır
  locate: () => Promise<LocateResult>;
};

export const useLocationStore = create<LocationState>()((set) => ({
  permission: "unknown",
  locating: false,
  last: null,
  checkPermission: async () => {
    try {
      const { granted } = await Location.getForegroundPermissionsAsync();
      const permission = granted ? "granted" : "unknown";
      if (granted) set({ permission });
      return permission;
    } catch {
      return "unknown";
    }
  },
  locate: async () => {
    set({ locating: true });
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      set({ permission: granted ? "granted" : "denied" });
      if (!granted) return { ok: false, reason: "denied" };
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const fix: Fix = {
        position: { latitude: coords.latitude, longitude: coords.longitude },
        accuracyM: coords.accuracy ?? null,
      };
      set({ last: fix });
      return { ok: true, ...fix };
    } catch {
      return { ok: false, reason: "unavailable" };
    } finally {
      set({ locating: false });
    }
  },
}));

// #17 ve #25 aynı konum kaynağını kullanır
export function useLocation() {
  const permission = useLocationStore((s) => s.permission);
  const locating = useLocationStore((s) => s.locating);
  const last = useLocationStore((s) => s.last);
  const checkPermission = useLocationStore((s) => s.checkPermission);
  const locate = useLocationStore((s) => s.locate);
  return { permission, locating, last, checkPermission, locate };
}
