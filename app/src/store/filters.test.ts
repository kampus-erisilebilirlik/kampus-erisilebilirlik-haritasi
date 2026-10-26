import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Point } from "@/lib/schemas";
import { filterPoints, isFilterActive, useFilterStore } from "./filters";

const p = (type: Point["type"], status: Point["status"]) => ({ type, status }) as Point;
const points = [p("ramp", "working"), p("ramp", "broken"), p("elevator", "unknown"), p("toilet", "working")];

beforeEach(() => {
  useFilterStore.setState({ types: [], onlyWorking: false });
});

describe("filterPoints", () => {
  it("boş filtre tüm noktaları döndürür", () => {
    expect(filterPoints(points, { types: [], onlyWorking: false })).toHaveLength(4);
  });

  it("birden fazla türü birlikte gösterir", () => {
    const result = filterPoints(points, { types: ["ramp", "elevator"], onlyWorking: false });
    expect(result.map((x) => x.type)).toEqual(["ramp", "ramp", "elevator"]);
  });

  it("sadece çalışanlar arızalıları gizler, durumu bilinmeyenleri bırakır", () => {
    const result = filterPoints(points, { types: [], onlyWorking: true });
    expect(result.map((x) => x.status)).toEqual(["working", "unknown", "working"]);
  });

  it("tür ve durumu birlikte uygular", () => {
    expect(filterPoints(points, { types: ["ramp"], onlyWorking: true })).toEqual([p("ramp", "working")]);
  });
});

describe("useFilterStore", () => {
  it("türü açıp kapatır, temizle sıfırlar", () => {
    const { toggleType, setOnlyWorking, clear } = useFilterStore.getState();
    toggleType("elevator");
    toggleType("toilet");
    setOnlyWorking(true);
    expect(useFilterStore.getState()).toMatchObject({ types: ["elevator", "toilet"], onlyWorking: true });
    expect(isFilterActive(useFilterStore.getState())).toBe(true);
    toggleType("elevator");
    expect(useFilterStore.getState().types).toEqual(["toilet"]);
    clear();
    expect(useFilterStore.getState()).toMatchObject({ types: [], onlyWorking: false });
    expect(isFilterActive(useFilterStore.getState())).toBe(false);
  });

  it("seçimi telefonda saklar", async () => {
    useFilterStore.getState().toggleType("parking");
    const saved = JSON.parse((await AsyncStorage.getItem("filters-v1")) ?? "{}");
    expect(saved.state).toEqual({ types: ["parking"], onlyWorking: false });
  });

  it("kayıtlı veride geçersiz tür varsa atar", async () => {
    await AsyncStorage.setItem(
      "filters-v1",
      JSON.stringify({ state: { types: ["ramp", "helikopter"], onlyWorking: true }, version: 0 }),
    );
    await useFilterStore.persist.rehydrate();
    expect(useFilterStore.getState()).toMatchObject({ types: ["ramp"], onlyWorking: true });
  });
});
