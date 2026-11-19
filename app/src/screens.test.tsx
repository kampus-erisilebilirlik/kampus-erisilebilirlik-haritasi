import { fireEvent, render, screen } from "@testing-library/react-native";

import BuildingScreen from "@/app/bina/[slug]";
import ReportScreen from "@/app/bildir/[pointId]";
import PointScreen from "@/app/nokta/[id]";
import type { Building, Point } from "@/lib/schemas";
import { useDataStore } from "@/store/data";

// Route dosyaları src/app dışındaki bu testten render edilir; yönlendirici ve Supabase taklit edilir
const mockParams = jest.fn();
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams(),
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
  Stack: { Screen: () => null },
  Link: ({ children }: { children: unknown }) => children,
}));
jest.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    storage: { from: () => ({ getPublicUrl: (path: string) => ({ data: { publicUrl: `https://x/${path}` } }) }) },
  }),
}));

const building: Building = {
  id: "b1",
  slug: "teknoloji-fakultesi",
  name: "Teknoloji Fakültesi",
  summary: "Ana girişte rampa var.",
  score: "yellow",
  lat: 38.02,
  lng: 32.51,
  updated_at: "2026-10-20T10:00:00Z",
};

const ramp: Point = {
  id: "p1",
  building_id: "b1",
  type: "ramp",
  name: "Ana giriş rampası",
  status: "working",
  floor: 0,
  lat: 38.02,
  lng: 32.51,
  photo_path: "teknoloji-fakultesi/p1.jpg",
  verbal_directions: "",
  ramp_slope_pct: 6.5,
  ramp_width_cm: 120,
  ramp_has_handrail: null,
  has_tactile_paving: false,
  ts9111_compliant: false,
  updated_at: "2026-10-25T09:00:00Z",
};

beforeEach(() => {
  useDataStore.setState({
    buildings: [building],
    points: [ramp, { ...ramp, id: "p2", name: "Arka rampa", status: "broken", photo_path: null }],
    status: "ready",
  });
});

describe("nokta detayı", () => {
  it("fotoğraf açıklaması, ölçümler ve TS 9111 uyarısını gösterir", async () => {
    mockParams.mockReturnValue({ id: "p1" });
    await render(<PointScreen />);
    expect(screen.getByLabelText("Fotoğraf: Rampa, Ana giriş rampası, Teknoloji Fakültesi")).toBeOnTheScreen();
    expect(screen.getByRole("link", { name: "Bina: Teknoloji Fakültesi" })).toBeOnTheScreen();
    expect(screen.getByText("Zemin kat")).toBeOnTheScreen();
    expect(screen.getByText("Son güncelleme: 25 Ekim 2026")).toBeOnTheScreen();
    expect(screen.getByLabelText("Kılavuz iz (hissedilebilir yüzey): Yok")).toBeOnTheScreen();
    expect(screen.getByLabelText("Eğim: %6,5")).toBeOnTheScreen();
    expect(screen.getByLabelText("Korkuluk: Bilinmiyor")).toBeOnTheScreen();
    expect(
      screen.getByLabelText(
        /^TS 9111 \(Türk erişilebilirlik standardı\) ölçütlerini karşılamıyor\. Saha ölçümüne dayanan ön tespittir/,
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole("header", { name: "Sözlü tarif" })).toBeOnTheScreen();
    expect(screen.getByText("Bu nokta için sözlü tarif henüz eklenmedi.")).toBeOnTheScreen();
  });

  it("korkuluk taraf sayısı biliniyorsa onu yazar", async () => {
    useDataStore.setState({ points: [{ ...ramp, ramp_handrail_sides: 1 }] });
    mockParams.mockReturnValue({ id: "p1" });
    await render(<PointScreen />);
    expect(screen.getByLabelText("Korkuluk: Tek tarafta")).toBeOnTheScreen();
  });

  it("bilinmeyen nokta için bulunamadı der", async () => {
    mockParams.mockReturnValue({ id: "yok" });
    await render(<PointScreen />);
    expect(screen.getByText("Nokta bulunamadı. Silinmiş olabilir.")).toBeOnTheScreen();
  });

  it("veri yüklenirken bulunamadı demez", async () => {
    useDataStore.setState({ points: [], buildings: [], status: "loading" });
    mockParams.mockReturnValue({ id: "p1" });
    await render(<PointScreen />);
    expect(screen.queryByText("Nokta bulunamadı. Silinmiş olabilir.")).toBeNull();
  });
});

describe("nokta detayından sorun bildirme", () => {
  it("her noktada Sorun bildir, arızalıda ayrıca 'düzeldi mi' düğmesi var", async () => {
    mockParams.mockReturnValue({ id: "p1" });
    const { unmount } = await render(<PointScreen />);
    expect(screen.getByRole("button", { name: "Sorun bildir" })).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Bu nokta düzeldi mi? Bildirin" })).toBeNull();
    await unmount();

    mockParams.mockReturnValue({ id: "p2" });
    await render(<PointScreen />);
    expect(screen.getByRole("button", { name: "Bu nokta düzeldi mi? Bildirin" })).toBeOnTheScreen();
  });
});

describe("sorun bildir ekranı", () => {
  it("noktanın adını başlıkta verir, durum parametresiyle ön seçim yapar", async () => {
    mockParams.mockReturnValue({ pointId: "p2", durum: "working" });
    await render(<ReportScreen />);
    expect(screen.getByRole("header", { name: "Sorun bildir: Arka rampa" })).toBeOnTheScreen();
    expect(screen.getByRole("radio", { name: "Tekrar çalışıyor" })).toBeChecked();
  });

  it("geçersiz durum parametresinde 'arızalı' seçili gelir", async () => {
    mockParams.mockReturnValue({ pointId: "p1", durum: "x" });
    await render(<ReportScreen />);
    expect(screen.getByRole("radio", { name: "Çalışmıyor / arızalı" })).toBeChecked();
  });

  it("nokta yoksa bulunamadı der", async () => {
    mockParams.mockReturnValue({ pointId: "yok" });
    await render(<ReportScreen />);
    expect(screen.getByText("Nokta bulunamadı. Silinmiş olabilir.")).toBeOnTheScreen();
  });
});

describe("bina sayfası", () => {
  it("puanı, türe göre sayıları, arızalıları ve bulunmayan türleri gösterir", async () => {
    mockParams.mockReturnValue({ slug: "teknoloji-fakultesi" });
    await render(<BuildingScreen />);
    expect(screen.getByLabelText("Erişilebilirlik puanı: Kısmen erişilebilir")).toBeOnTheScreen();
    expect(screen.getByLabelText("Rampa: 2 (1 arızalı)")).toBeOnTheScreen();
    expect(screen.getByLabelText("Engelli tuvaleti: Bulunmuyor")).toBeOnTheScreen();
    expect(screen.getByRole("header", { name: "Rampalar (2)" })).toBeOnTheScreen();
    expect(
      screen.getByLabelText("Rampa, Ana giriş rampası, Teknoloji Fakültesi, Zemin kat, Durum: Çalışıyor"),
    ).toBeOnTheScreen();
  });

  it("puan kuralını açılınca gösterir ve bu binanınkini işaretler", async () => {
    mockParams.mockReturnValue({ slug: "teknoloji-fakultesi" });
    await render(<BuildingScreen />);
    const toggle = screen.getByRole("button", { name: "Puan nasıl belirlenir?" });
    expect(toggle).toBeCollapsed();
    await fireEvent.press(toggle);
    expect(screen.getByRole("button", { name: "Puan nasıl belirlenir?" })).toBeExpanded();
    expect(screen.getByLabelText(/^Kısmen erişilebilir \(bu bina\): Basamaksız giriş var/)).toBeOnTheScreen();
  });

  it("bilinmeyen bina için haritaya dönüş sunar", async () => {
    mockParams.mockReturnValue({ slug: "yok" });
    await render(<BuildingScreen />);
    expect(screen.getByText("Bina bulunamadı.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Haritaya dön" })).toBeOnTheScreen();
  });
});
