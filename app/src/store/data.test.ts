import { getSupabase } from "@/lib/supabase";
import { useDataStore } from "./data";

jest.mock("@/lib/supabase", () => ({ getSupabase: jest.fn() }));

const building = {
  id: "b1",
  slug: "teknoloji-fakultesi",
  name: "Teknoloji Fakültesi",
  summary: "",
  score: "green",
  lat: 38.02,
  lng: 32.51,
  updated_at: "2026-10-01T00:00:00Z",
};

type Response = { data: unknown[] | null; error: { message: string } | null };

function mockTables(responses: Record<string, Response>) {
  jest.mocked(getSupabase).mockReturnValue({
    from: (table: string) => ({ select: () => Promise.resolve(responses[table]) }),
  } as unknown as ReturnType<typeof getSupabase>);
}

const empty: Response = { data: [], error: null };

beforeEach(() => {
  useDataStore.setState({ buildings: [], points: [], pathNodes: [], pathEdges: [], status: "idle", error: null, lastSyncedAt: null });
});

describe("useDataStore.load", () => {
  it("tüm tabloları çekip store'a yazar", async () => {
    mockTables({
      v_buildings: { data: [building], error: null },
      v_points: empty,
      v_path_nodes: empty,
      path_edges: { data: [{ id: "e1", from_node: "n1", to_node: "n2", length_m: "12.5" }], error: null },
    });
    await useDataStore.getState().load();
    const state = useDataStore.getState();
    expect(state.status).toBe("ready");
    expect(state.buildings).toHaveLength(1);
    expect(state.pathEdges[0]?.length_m).toBe(12.5);
    expect(state.lastSyncedAt).not.toBeNull();
  });

  it("hata olursa önbellekteki veriyi korur", async () => {
    useDataStore.setState({ buildings: [{ ...building, score: "green" }], lastSyncedAt: "2026-10-20T10:00:00Z" });
    mockTables({
      v_buildings: { data: null, error: { message: "Network request failed" } },
      v_points: empty,
      v_path_nodes: empty,
      path_edges: empty,
    });
    await useDataStore.getState().load();
    const state = useDataStore.getState();
    expect(state.status).toBe("error");
    expect(state.error).toBe("Network request failed");
    expect(state.buildings).toHaveLength(1);
    expect(state.lastSyncedAt).toBe("2026-10-20T10:00:00Z");
  });

  it("null kolonlu satırı reddeder", async () => {
    mockTables({
      v_buildings: { data: [{ ...building, lat: null }], error: null },
      v_points: empty,
      v_path_nodes: empty,
      path_edges: empty,
    });
    await useDataStore.getState().load();
    expect(useDataStore.getState().status).toBe("error");
  });
});
