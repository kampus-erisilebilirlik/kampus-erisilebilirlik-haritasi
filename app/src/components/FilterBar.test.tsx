import { fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";

import type { Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";
import { useFilterStore } from "@/store/filters";
import { FilterBar, resultMessage } from "./FilterBar";

const point = (id: string, type: Point["type"], status: Point["status"]) => ({ id, type, status }) as Point;

beforeEach(() => {
  // React Native'in Jest kurulumunda announceForAccessibility zaten mock; önceki testin çağrıları temizlenir
  jest
    .spyOn(AccessibilityInfo, "announceForAccessibility")
    .mockClear()
    .mockImplementation(() => undefined);
  useFilterStore.setState({ types: [], onlyWorking: false });
  useDataStore.setState({
    points: [point("1", "elevator", "working"), point("2", "elevator", "broken"), point("3", "ramp", "working")],
  });
});

describe("FilterBar", () => {
  it("türleri onay kutusu olarak verir, başta hiçbiri işaretli değil", async () => {
    await render(<FilterBar />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    expect(screen.getByRole("checkbox", { name: "Asansör" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Engelli tuvaleti" })).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Filtreleri temizle" })).toBeNull();
    expect(screen.getByText("3 nokta gösteriliyor")).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it("dokunulan türü işaretler, sonucu duyurur ve Temizle çıkar", async () => {
    await render(<FilterBar />);
    await fireEvent.press(screen.getByRole("checkbox", { name: "Asansör" }));
    expect(screen.getByRole("checkbox", { name: "Asansör" })).toBeChecked();
    expect(screen.getByText("2 nokta gösteriliyor")).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenLastCalledWith("2 nokta gösteriliyor");

    await fireEvent.press(screen.getByRole("checkbox", { name: "Sadece çalışanlar" }));
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenLastCalledWith("1 nokta gösteriliyor");

    await fireEvent.press(screen.getByRole("button", { name: "Filtreleri temizle" }));
    expect(useFilterStore.getState()).toMatchObject({ types: [], onlyWorking: false });
    expect(screen.queryByRole("button", { name: "Filtreleri temizle" })).toBeNull();
  });

  it("veri yenilenince duyuru yapmaz", async () => {
    await render(<FilterBar />);
    useDataStore.setState({ points: [point("1", "elevator", "working")] });
    expect(await screen.findByText("1 nokta gösteriliyor")).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it("sonuç yoksa bunu söyler", () => {
    expect(resultMessage(0)).toBe("Bu filtreye uygun nokta yok");
  });
});
