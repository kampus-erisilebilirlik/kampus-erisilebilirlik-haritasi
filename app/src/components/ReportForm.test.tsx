import { fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";

import { submitReport } from "@/lib/reports";
import type { Point } from "@/lib/schemas";
import { ReportForm, SUCCESS_MESSAGE } from "./ReportForm";

jest.mock("@/lib/reports", () => ({
  ...jest.requireActual<typeof import("@/lib/reports")>("@/lib/reports"),
  submitReport: jest.fn(),
}));

const point = { id: "p1", name: "Ana asansör", type: "elevator", status: "working" } as Point;
const onDone = jest.fn();

beforeEach(() => {
  jest.mocked(submitReport).mockReset();
  onDone.mockReset();
  jest
    .spyOn(AccessibilityInfo, "announceForAccessibility")
    .mockClear()
    .mockImplementation(() => undefined);
});

const sendButton = (name: string | RegExp = "Gönder") => screen.getByRole("button", { name });

describe("ReportForm", () => {
  it("seçenekleri radyo grubu olarak verir, ön seçim işaretli", async () => {
    await render(<ReportForm point={point} initialStatus="broken" onDone={onDone} />);
    // Grup View erişilebilir öğe olmadığı için rolüyle sorgulanamaz; etiketi ve rolü doğrudan denetlenir
    expect(screen.getByLabelText("Ne oldu?")).toHaveProp("accessibilityRole", "radiogroup");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Çalışmıyor / arızalı" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Çalışıyor" })).not.toBeChecked();
    expect(sendButton()).toBeEnabled();
  });

  it("arızalı noktada 'Tekrar çalışıyor' der", async () => {
    await render(<ReportForm point={{ ...point, status: "broken" }} initialStatus="working" onDone={onDone} />);
    expect(screen.getByRole("radio", { name: "Tekrar çalışıyor" })).toBeChecked();
  });

  it("bilgi yanlış seçilince açıklama yazılana kadar Gönder pasif", async () => {
    await render(<ReportForm point={point} initialStatus="broken" onDone={onDone} />);
    await fireEvent.press(screen.getByRole("radio", { name: "Bilgi yanlış (yer, kat, tarif)" }));
    expect(sendButton()).toBeDisabled();
    expect(screen.getByText("Bilginin neresinin yanlış olduğunu açıklamaya yazın.")).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText("Açıklama, zorunlu"), "Kat yanlış yazılmış");
    expect(sendButton()).toBeEnabled();
  });

  it("karakter sayacını günceller", async () => {
    await render(<ReportForm point={point} initialStatus="broken" onDone={onDone} />);
    expect(screen.getByText("0 / 500")).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText("Açıklama, isteğe bağlı"), "Kapı açılmıyor");
    expect(screen.getByText("14 / 500")).toBeOnTheScreen();
  });

  it("başarıda teşekkür eder ve duyurur", async () => {
    jest.mocked(submitReport).mockResolvedValue({ ok: true });
    await render(<ReportForm point={point} initialStatus="broken" onDone={onDone} />);
    await fireEvent.changeText(screen.getByLabelText("Açıklama, isteğe bağlı"), "Kapı açılmıyor");
    await fireEvent.press(sendButton());
    expect(submitReport).toHaveBeenCalledWith({ pointId: "p1", status: "broken", description: "Kapı açılmıyor" });
    expect(await screen.findByText("Bildiriminiz alındı")).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(SUCCESS_MESSAGE);
    await fireEvent.press(screen.getByRole("button", { name: "Noktaya dön" }));
    expect(onDone).toHaveBeenCalled();
  });

  it("hatada mesajı gösterir, form verisini korur ve tekrar denetir", async () => {
    jest
      .mocked(submitReport)
      .mockResolvedValueOnce({ ok: false, message: "Bu nokta için bugün zaten bildirim gönderdiniz. Teşekkürler!" })
      .mockResolvedValueOnce({ ok: true });
    await render(<ReportForm point={point} initialStatus="broken" onDone={onDone} />);
    await fireEvent.changeText(screen.getByLabelText("Açıklama, isteğe bağlı"), "Kapı açılmıyor");
    await fireEvent.press(sendButton());

    expect(await screen.findByText("Gönderilemedi")).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      "Gönderilemedi. Bu nokta için bugün zaten bildirim gönderdiniz. Teşekkürler!",
    );
    expect(screen.getByLabelText("Açıklama, isteğe bağlı")).toHaveDisplayValue("Kapı açılmıyor");

    await fireEvent.press(sendButton("Tekrar dene"));
    expect(submitReport).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("Bildiriminiz alındı")).toBeOnTheScreen();
  });

  it("gönderim sürerken ikinci dokunuş yeni istek açmaz", async () => {
    let resolve: (v: { ok: true }) => void = () => undefined;
    jest.mocked(submitReport).mockReturnValue(new Promise((r) => (resolve = r)));
    await render(<ReportForm point={point} initialStatus="broken" onDone={onDone} />);
    await fireEvent.press(sendButton());
    expect(sendButton("Gönderiliyor…")).toBeDisabled();
    await fireEvent.press(sendButton("Gönderiliyor…"));
    expect(submitReport).toHaveBeenCalledTimes(1);
    resolve({ ok: true });
    expect(await screen.findByText("Bildiriminiz alındı")).toBeOnTheScreen();
  });
});
