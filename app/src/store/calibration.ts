import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CalibrationState = {
  // Düz zeminde ölçülen açı (radyan), null: kalibrasyon yapılmadı
  offset: number | null;
  calibratedAt: string | null;
  setOffset: (offset: number) => void;
};

export const useCalibrationStore = create<CalibrationState>()(
  persist(
    (set) => ({
      offset: null,
      calibratedAt: null,
      setOffset: (offset) => set({ offset, calibratedAt: new Date().toISOString() }),
    }),
    {
      name: "slope-calibration-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
