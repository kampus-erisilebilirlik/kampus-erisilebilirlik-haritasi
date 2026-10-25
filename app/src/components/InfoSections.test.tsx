import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";

import KvkkScreen from "@/app/kvkk";
import { privacySections, unitContact } from "@/lib/info";
import { createTapCounter } from "@/lib/secretTap";
import { useDataStore } from "@/store/data";
import { InfoSections } from "./InfoSections";
import { ADMIN_LOGIN_HREF, VersionFooter } from "./VersionFooter";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: unknown }) => children,
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  mockPush.mockClear();
  useDataStore.setState({ lastSyncedAt: null });
});

describe("InfoSections", () => {
  it("arama, e-posta ve haritayı bağlantı olarak açar", async () => {
    await render(<InfoSections />);
    await fireEvent.press(screen.getByRole("link", { name: "Ara: 0332 223 25 34, telefon veya faks" }));
    expect(Linking.openURL).toHaveBeenCalledWith("tel:03322232534");
    await fireEvent.press(screen.getByRole("link", { name: "E-posta gönder: engelsizyasam@selcuk.edu.tr" }));
    expect(Linking.openURL).toHaveBeenCalledWith("mailto:engelsizyasam@selcuk.edu.tr");
    await fireEvent.press(screen.getByRole("link", { name: "Birimi haritada göster, Google Haritalar açılır" }));
    expect(Linking.openURL).toHaveBeenCalledWith(unitContact.mapsUrl);
  });

  it("bölüm başlıklarını başlık rolüyle verir", async () => {
    await render(<InfoSections />);
    for (const name of ["Birimin hizmetleri", "Haklarınız", "Bu uygulama hakkında", "Gizlilik"]) {
      expect(screen.getByRole("header", { name })).toBeOnTheScreen();
    }
  });

  it("hakların kaynağını verir, resmî metne bağlantı tarayıcıda açılır", async () => {
    await render(<InfoSections />);
    expect(
      screen.getByRole("link", { name: "Kaynak: 5378 sayılı Engelliler Hakkında Kanun, tarayıcıda açılır" }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Kaynak: Yükseköğretim Kurumları Engelliler Danışma ve Koordinasyon Yönetmeliği"),
    ).toBeOnTheScreen();
  });

  it("verilerin son güncellenme zamanını gösterir", async () => {
    await render(<InfoSections />);
    expect(screen.getByText("Veriler henüz indirilmedi.")).toBeOnTheScreen();
    useDataStore.setState({ lastSyncedAt: "2026-10-25T09:30:00Z" });
    await render(<InfoSections />);
    expect(screen.getByText(/^Veriler en son 25 Ekim 2026/)).toBeOnTheScreen();
  });
});

describe("KVKK aydınlatma metni", () => {
  it("her bölümü başlıkla gösterir ve uygulama kodunu açıklar", async () => {
    await render(<KvkkScreen />);
    expect(screen.getAllByRole("header")).toHaveLength(privacySections.length);
    expect(screen.getByText(/konumunuz yalnızca telefonunuzda.*Sunucuya gönderilmez/)).toBeOnTheScreen();
    expect(screen.getByText(/uygulama silinince kaybolur/)).toBeOnTheScreen();
  });
});

describe("gizli yönetici girişi", () => {
  it("3 saniye içinde 5 dokunuşta tetiklenir", () => {
    let t = 0;
    const tap = createTapCounter(5, 3000, () => t);
    const results = [0, 500, 1000, 1500, 2000].map((at) => ((t = at), tap()));
    expect(results).toEqual([false, false, false, false, true]);
  });

  it("yavaş dokunuşları saymaz", () => {
    let t = 0;
    const tap = createTapCounter(5, 3000, () => t);
    const results = [0, 1000, 2000, 3000, 4000].map((at) => ((t = at), tap()));
    expect(results.every((r) => !r)).toBe(true);
  });

  it("sürüm satırına 5 dokunuş giriş ekranını açar", async () => {
    await render(<VersionFooter />);
    const version = screen.getByText(/^Sürüm /);
    for (let i = 0; i < 4; i++) await fireEvent.press(version);
    expect(mockPush).not.toHaveBeenCalled();
    await fireEvent.press(version);
    expect(mockPush).toHaveBeenCalledWith(ADMIN_LOGIN_HREF);
  });
});
