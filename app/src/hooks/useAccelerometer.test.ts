import { act, renderHook } from "@testing-library/react-native";
import { Accelerometer } from "expo-sensors";

import { useAccelerometer } from "./useAccelerometer";

const mockRemove = jest.fn();
let mockEmit: (s: { x: number; y: number; z: number; timestamp: number }) => void = () => undefined;

jest.mock("expo-sensors", () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((listener) => {
      mockEmit = listener;
      return { remove: mockRemove };
    }),
  },
}));

describe("useAccelerometer", () => {
  it("50 Hz dinler ve ekrandan çıkınca dinlemeyi bırakır", async () => {
    const { unmount } = await renderHook(() => useAccelerometer());
    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(20);
    expect(Accelerometer.addListener).toHaveBeenCalledTimes(1);
    await unmount();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it("record süre dolunca toplanan örnekleri döner", async () => {
    const { result } = await renderHook(() => useAccelerometer());
    const now = jest.spyOn(Date, "now").mockReturnValue(1000);
    let samples: unknown[] = [];
    await act(async () => {
      const pending = result.current.record(2000);
      mockEmit({ x: 0, y: 0, z: 1, timestamp: 1 });
      now.mockReturnValue(3000);
      mockEmit({ x: 0, y: 0.1, z: 1, timestamp: 2 });
      samples = await pending;
    });
    expect(samples).toEqual([
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0.1, z: 1 },
    ]);
    now.mockRestore();
  });
});
