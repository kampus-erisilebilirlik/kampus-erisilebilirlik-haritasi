import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  buildingSchema,
  pathEdgeSchema,
  pathNodeSchema,
  pointSchema,
  type Building,
  type PathEdge,
  type PathNode,
  type Point,
} from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase";

export type DataStatus = "idle" | "loading" | "ready" | "error";

type DataState = {
  buildings: Building[];
  points: Point[];
  pathNodes: PathNode[];
  pathEdges: PathEdge[];
  status: DataStatus;
  error: string | null;
  lastSyncedAt: string | null;
  load: () => Promise<void>;
};

type Snapshot = Pick<DataState, "buildings" | "points" | "pathNodes" | "pathEdges">;

export async function fetchSnapshot(): Promise<Snapshot> {
  const supabase = getSupabase();
  const [buildings, points, pathNodes, pathEdges] = await Promise.all([
    supabase.from("v_buildings").select("*"),
    supabase.from("v_points").select("*"),
    supabase.from("v_path_nodes").select("*"),
    supabase.from("path_edges").select("id, from_node, to_node, length_m"),
  ]);
  const failed = [buildings, points, pathNodes, pathEdges].find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  return {
    buildings: z.array(buildingSchema).parse(buildings.data),
    points: z.array(pointSchema).parse(points.data),
    pathNodes: z.array(pathNodeSchema).parse(pathNodes.data),
    pathEdges: z.array(pathEdgeSchema).parse(pathEdges.data),
  };
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      buildings: [],
      points: [],
      pathNodes: [],
      pathEdges: [],
      status: "idle",
      error: null,
      lastSyncedAt: null,
      load: async () => {
        if (get().status === "loading") return;
        set({ status: "loading", error: null });
        try {
          const snapshot = await fetchSnapshot();
          set({ ...snapshot, status: "ready", lastSyncedAt: new Date().toISOString() });
        } catch (e) {
          // Önbellekteki veri ekranda kalır; yalnızca durum hataya döner
          set({ status: "error", error: e instanceof Error ? e.message : String(e) });
        }
      },
    }),
    {
      name: "data-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ buildings, points, pathNodes, pathEdges, lastSyncedAt }) => ({
        buildings,
        points,
        pathNodes,
        pathEdges,
        lastSyncedAt,
      }),
    },
  ),
);
