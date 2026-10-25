import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("geçerli değerleri kabul eder", () => {
    const result = parseEnv({
      EXPO_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "x".repeat(40),
    });
    expect(result.ok).toBe(true);
  });

  it("eksik değişkenleri adıyla bildirir", () => {
    const result = parseEnv({ EXPO_PUBLIC_SUPABASE_URL: "geçersiz", EXPO_PUBLIC_SUPABASE_ANON_KEY: undefined });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("EXPO_PUBLIC_SUPABASE_URL");
    expect(result.message).toContain("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  });
});
