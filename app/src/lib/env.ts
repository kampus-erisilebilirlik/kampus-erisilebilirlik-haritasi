import { z } from "zod";

const schema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export type Env = z.infer<typeof schema>;

export type EnvResult = { ok: true; env: Env } | { ok: false; message: string };

export function parseEnv(raw: Record<string, string | undefined>): EnvResult {
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, env: result.data };
  const keys = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
  return {
    ok: false,
    message: `Eksik veya geçersiz ortam değişkenleri: ${keys.join(", ")}. app/.env.local dosyasını .env.example dosyasına göre doldurun.`,
  };
}

// Expo yalnızca doğrudan process.env.EXPO_PUBLIC_X erişimlerini derleme anında değiştirir
export const envResult = parseEnv({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});
