import { render, screen } from "@testing-library/react-native";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["working", "Durum: Çalışıyor"],
    ["broken", "Durum: Arızalı"],
    ["unknown", "Durum: Durumu bilinmiyor"],
  ] as const)("%s için erişilebilirlik etiketi verir", async (status, label) => {
    await render(<StatusBadge status={status} />);
    expect(screen.getByLabelText(label)).toBeOnTheScreen();
  });
});
