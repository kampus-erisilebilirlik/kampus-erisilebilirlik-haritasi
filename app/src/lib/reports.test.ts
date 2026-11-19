import { getSupabase } from "./supabase";
import { reportErrorMessage, submitReport, validateReport } from "./reports";

jest.mock("./supabase", () => ({ getSupabase: jest.fn() }));
jest.mock("./clientToken", () => ({
  getClientToken: jest.fn(async () => "11111111-1111-4111-8111-111111111111"),
}));

function mockRpc(result: { error: { message: string; code?: string } | null } | Error) {
  const rpc = jest.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  jest.mocked(getSupabase).mockReturnValue({ rpc } as unknown as ReturnType<typeof getSupabase>);
  return rpc;
}

const input = { pointId: "p1", status: "broken", description: "  Asansör çalışmıyor  " } as const;

describe("submitReport", () => {
  it("RPC'yi token ve kırpılmış açıklamayla çağırır", async () => {
    const rpc = mockRpc({ error: null });
    expect(await submitReport(input)).toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith("submit_report", {
      p_point_id: "p1",
      p_reported_status: "broken",
      p_description: "Asansör çalışmıyor",
      p_client_token: "11111111-1111-4111-8111-111111111111",
    });
  });

  it.each([
    ["rate_limited", "Kısa sürede çok fazla bildirim gönderdiniz. Lütfen daha sonra tekrar deneyin."],
    ["duplicate", "Bu nokta için bugün zaten bildirim gönderdiniz. Teşekkürler!"],
    ["global_limit", "Şu anda bildirim alınamıyor, lütfen daha sonra deneyin."],
  ])("%s hatasını Türkçe mesaja çevirir", async (code, message) => {
    mockRpc({ error: { message: code } });
    expect(await submitReport(input)).toEqual({ ok: false, message });
  });

  it("nokta silinmişse (foreign key) bunu söyler", async () => {
    mockRpc({ error: { message: 'insert or update on table "issue_reports" violates foreign key', code: "23503" } });
    expect(await submitReport(input)).toEqual({
      ok: false,
      message: "Bu nokta artık kayıtlı değil. Haritayı yenileyip tekrar deneyin.",
    });
  });

  it("geçersiz girdide RPC'yi çağırmaz", async () => {
    const rpc = mockRpc({ error: null });
    const result = await submitReport({ pointId: "p1", status: "unknown", description: "   " });
    expect(result).toEqual({ ok: false, message: "Bilginin neresinin yanlış olduğunu açıklamaya yazın." });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("ağ hatasında genel mesaj döner", async () => {
    mockRpc(new Error("Network request failed"));
    const result = await submitReport(input);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain("İnternet bağlantınızı");
  });
});

describe("validateReport", () => {
  it("açıklama isteğe bağlıdır", () => {
    expect(validateReport({ pointId: "p1", status: "broken", description: "" })).toBeNull();
  });

  it("bilgi yanlış seçilince açıklama zorunludur", () => {
    expect(validateReport({ pointId: "p1", status: "unknown", description: "" })).toBe(
      "Bilginin neresinin yanlış olduğunu açıklamaya yazın.",
    );
    expect(validateReport({ pointId: "p1", status: "unknown", description: "Kat yanlış" })).toBeNull();
  });

  it("500 karakteri aşan açıklamayı reddeder, baştaki/sondaki boşluk sayılmaz", () => {
    expect(validateReport({ pointId: "p1", status: "broken", description: "a".repeat(501) })).toBe(
      "Açıklama en fazla 500 karakter olabilir.",
    );
    expect(validateReport({ pointId: "p1", status: "broken", description: ` ${"a".repeat(500)} ` })).toBeNull();
  });
});

describe("reportErrorMessage", () => {
  it("bilinmeyen kod için genel mesaj döner", () => {
    expect(reportErrorMessage("something_else")).toBe(reportErrorMessage(undefined));
  });
});
