import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { pointTypeSchema, type Point, type PointType } from "@/lib/schemas";
import { useDataStore } from "./data";

export type Filters = {
  // Boş: tüm türler
  types: PointType[];
  // Arızalıları gizle
  onlyWorking: boolean;
};

type FilterState = Filters & {
  toggleType: (type: PointType) => void;
  setOnlyWorking: (value: boolean) => void;
  clear: () => void;
};

// Harita ve liste aynı filtreyi kullanır; seçim uygulama kapanıp açılınca korunur
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      types: [],
      onlyWorking: false,
      toggleType: (type) =>
        set((s) => ({ types: s.types.includes(type) ? s.types.filter((t) => t !== type) : [...s.types, type] })),
      setOnlyWorking: (onlyWorking) => set({ onlyWorking }),
      clear: () => set({ types: [], onlyWorking: false }),
    }),
    {
      name: "filters-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ types, onlyWorking }) => ({ types, onlyWorking }),
      // Kayıtlı veride artık geçerli olmayan tür varsa atılır
      merge: (persisted, current) => {
        const saved = persisted as Partial<Filters> | undefined;
        return {
          ...current,
          types: (saved?.types ?? []).filter((t) => pointTypeSchema.safeParse(t).success),
          onlyWorking: saved?.onlyWorking === true,
        };
      },
    },
  ),
);

export function filterPoints(points: Point[], { types, onlyWorking }: Filters): Point[] {
  return points.filter(
    (p) => (types.length === 0 || types.includes(p.type)) && (!onlyWorking || p.status !== "broken"),
  );
}

export const isFilterActive = ({ types, onlyWorking }: Filters) => types.length > 0 || onlyWorking;

// Harita ve liste filtrelenmiş noktaları buradan alır
export function useFilteredPoints(): Point[] {
  const points = useDataStore((s) => s.points);
  const types = useFilterStore((s) => s.types);
  const onlyWorking = useFilterStore((s) => s.onlyWorking);
  return useMemo(() => filterPoints(points, { types, onlyWorking }), [points, types, onlyWorking]);
}
