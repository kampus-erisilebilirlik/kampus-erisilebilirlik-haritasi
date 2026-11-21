import * as Location from "expo-location";

import { useLocationStore } from "./useLocation";

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
  useLocationStore.setState({ permission: "unknown", locating: false, last: null });
});

describe("useLocationStore.locate", () => {
  it("izin reddedilirse konum istemez", async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ granted: false } as never);
    expect(await useLocationStore.getState().locate()).toEqual({ ok: false, reason: "denied" });
    expect(useLocationStore.getState().permission).toBe("denied");
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("ön plan konumunu dengeli doğrulukla alır ve doğruluğu verir", async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ granted: true } as never);
    jest
      .mocked(Location.getCurrentPositionAsync)
      .mockResolvedValue({ coords: { latitude: 38.02, longitude: 32.51, accuracy: 75 } } as never);
    const result = await useLocationStore.getState().locate();
    expect(result).toEqual({ ok: true, position: { latitude: 38.02, longitude: 32.51 }, accuracyM: 75 });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: Location.Accuracy.Balanced });
    expect(useLocationStore.getState()).toMatchObject({ permission: "granted", locating: false });
  });

  it("konum servisi hata verirse 'unavailable' döner ve beklemeyi bitirir", async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ granted: true } as never);
    jest.mocked(Location.getCurrentPositionAsync).mockRejectedValue(new Error("Location services are disabled"));
    expect(await useLocationStore.getState().locate()).toEqual({ ok: false, reason: "unavailable" });
    expect(useLocationStore.getState().locating).toBe(false);
  });
});

describe("useLocationStore.checkPermission", () => {
  it("izin önceden verildiyse sormadan işaretler", async () => {
    jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue({ granted: true } as never);
    expect(await useLocationStore.getState().checkPermission()).toBe("granted");
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });
});
