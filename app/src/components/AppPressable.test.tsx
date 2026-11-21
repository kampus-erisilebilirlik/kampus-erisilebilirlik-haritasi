import { fireEvent, render, screen } from "@testing-library/react-native";

import { AppButton } from "./AppButton";
import { AppPressable } from "./AppPressable";
import { AppText } from "./AppText";

const ring = { outlineColor: "#0B57D0", outlineWidth: 3 };

describe("AppPressable", () => {
  it("odak gelince çerçeve çizer, odak gidince kaldırır", async () => {
    const onFocus = jest.fn();
    await render(
      <AppPressable accessibilityRole="button" accessibilityLabel="Detayı aç" onFocus={onFocus} style={{ padding: 8 }}>
        <AppText>Detayı aç</AppText>
      </AppPressable>,
    );
    const button = screen.getByRole("button", { name: "Detayı aç" });
    expect(button).not.toHaveStyle(ring);

    await fireEvent(button, "focus");
    expect(button).toHaveStyle({ ...ring, padding: 8 });
    expect(onFocus).toHaveBeenCalled();

    await fireEvent(button, "blur");
    expect(button).not.toHaveStyle(ring);
  });

  it("AppButton da odak çerçevesi alır", async () => {
    await render(<AppButton label="Yol tarifi al" />);
    const button = screen.getByRole("button", { name: "Yol tarifi al" });
    await fireEvent(button, "focus");
    expect(button).toHaveStyle(ring);
  });
});
