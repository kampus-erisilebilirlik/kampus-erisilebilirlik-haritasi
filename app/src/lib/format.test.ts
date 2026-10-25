import { formatDate, formatNumber, yesNo } from "./format";

describe("format", () => {
  it("tarihi Türkçe ay adıyla yazar", () => {
    expect(formatDate("2026-10-25T12:00:00Z")).toBe("25 Ekim 2026");
  });

  it("ondalığı virgülle yazar", () => {
    expect(formatNumber(6.5)).toBe("6,5");
    expect(formatNumber(8)).toBe("8");
  });

  it("girilmemiş değeri 'yok' saymaz", () => {
    expect(yesNo(null)).toBe("Bilinmiyor");
    expect(yesNo(true)).toBe("Var");
    expect(yesNo(false)).toBe("Yok");
  });
});
