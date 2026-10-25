import { render, screen } from "@testing-library/react-native";

import { ScoreBadge } from "./ScoreBadge";

describe("ScoreBadge", () => {
  it.each([
    ["green", "Erişilebilirlik puanı: Erişilebilir"],
    ["yellow", "Erişilebilirlik puanı: Kısmen erişilebilir"],
    ["red", "Erişilebilirlik puanı: Erişilebilir değil"],
  ] as const)("%s için erişilebilirlik etiketi verir", async (score, label) => {
    await render(<ScoreBadge score={score} />);
    expect(screen.getByLabelText(label)).toBeOnTheScreen();
  });
});
