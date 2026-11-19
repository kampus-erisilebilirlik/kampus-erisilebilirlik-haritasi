import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";

import type { Nearby } from "@/lib/nearby";
import { useDataStore } from "@/store/data";
import { NearestPanel } from "./NearestPanel";

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

const handlers = { onChoose: jest.fn(), onSelect: jest.fn(), onRetry: jest.fn(), onClose: jest.fn() };

const nearby = (id: string, distance: number) =>
  ({ id, name: id, type: "elevator", status: "working", building_id: null, floor: 0, distance }) as Nearby;

beforeEach(() => {
  jest.clearAllMocks();
  useDataStore.setState({ buildings: [] });
});

describe("NearestPanel", () => {
  it("tür seçimini sunar", async () => {
    await render(<NearestPanel state={{ step: "choose" }} {...handlers} />);
    expect(screen.getByRole("header", { name: "Hangi türü arıyorsunuz?" })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Engelli tuvaleti" }));
    expect(handlers.onChoose).toHaveBeenCalledWith("toilet");
  });

  it("sonuçları mesafeyle listeler, düşük doğrulukta not gösterir", async () => {
    await render(
      <NearestPanel
        state={{
          step: "result",
          accuracyM: 120,
          result: { kind: "found", type: "elevator", items: [nearby("A", 137), nearby("B", 410)] },
        }}
        {...handlers}
      />,
    );
    expect(screen.getByRole("header", { name: "En yakın asansörler" })).toBeOnTheScreen();
    expect(screen.getByText(/Konum hassasiyeti düşük \(yaklaşık 120 metre\)/)).toBeOnTheScreen();
    const second = screen.getByRole("button", { name: "2. Asansör, B, Zemin kat, Durum: Çalışıyor, 410 metre" });
    await fireEvent.press(second);
    expect(handlers.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "B" }));
  });

  it("izin reddinde ayarları ve listeyi önerir", async () => {
    jest.spyOn(Linking, "openSettings").mockResolvedValue(undefined);
    await render(<NearestPanel state={{ step: "problem", reason: "denied" }} {...handlers} />);
    expect(screen.getByText(/konumunuz yalnızca telefonda kullanılır, sunucuya gönderilmez/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole("button", { name: "Ayarları aç" }));
    expect(Linking.openSettings).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Listeden bina seçerek devam et" })).toBeOnTheScreen();
  });

  it("konum alınamazsa yeniden denetir", async () => {
    await render(<NearestPanel state={{ step: "problem", reason: "unavailable" }} {...handlers} />);
    await fireEvent.press(screen.getByRole("button", { name: "Tekrar dene" }));
    expect(handlers.onRetry).toHaveBeenCalled();
  });
});
