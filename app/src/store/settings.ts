import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      highContrast: false,
      setHighContrast: (highContrast) => set({ highContrast }),
    }),
    {
      name: "settings-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
