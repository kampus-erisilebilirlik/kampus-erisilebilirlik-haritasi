import { z } from "zod";

import { getClientToken } from "./clientToken";
import { pointStatusSchema, type PointStatus } from "./schemas";
import { getSupabase } from "./supabase";

export const MAX_DESCRIPTION_LENGTH = 500;

const messages: Record<string, string> = {
  rate_limited: "Kısa sürede çok fazla bildirim gönderdiniz. Lütfen daha sonra tekrar deneyin.",
  duplicate: "Bu nokta için bugün zaten bildirim gönderdiniz. Teşekkürler!",
  global_limit: "Şu anda bildirim alınamıyor, lütfen daha sonra deneyin.",
  description_too_long: `Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir.`,
  // PostgreSQL foreign key ihlali: nokta bu arada silinmiş
  "23503": "Bu nokta artık kayıtlı değil. Haritayı yenileyip tekrar deneyin.",
};

const fallback = "Bildirim gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.";

// submit_report'un raise ettiği kodu (PostgREST'te error.message) ya da PostgreSQL hata kodunu kullanıcı mesajına çevirir
export function reportErrorMessage(code: string | undefined): string {
  return (code && messages[code]) || fallback;
}

export const reportInputSchema = z
  .object({
    pointId: z.string().min(1),
    status: pointStatusSchema,
    description: z
      .string()
      .trim()
      .max(MAX_DESCRIPTION_LENGTH, { error: messages.description_too_long }),
  })
  // "Bilgi yanlış" (unknown) seçilince neyin yanlış olduğu yazılmadan bildirim işe yaramaz
  .refine((v) => v.status !== "unknown" || v.description.length > 0, {
    error: "Bilginin neresinin yanlış olduğunu açıklamaya yazın.",
    path: ["description"],
  });

export type SubmitReportInput = {
  pointId: string;
  status: PointStatus;
  description: string;
};

export type SubmitReportResult = { ok: true } | { ok: false; message: string };

// Gönderimden önce formda gösterilecek doğrulama hatası; geçerliyse null
export function validateReport(input: SubmitReportInput): string | null {
  const result = reportInputSchema.safeParse(input);
  return result.success ? null : (result.error.issues[0]?.message ?? fallback);
}

export async function submitReport(input: SubmitReportInput): Promise<SubmitReportResult> {
  const parsed = reportInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? fallback };
  const { pointId, status, description } = parsed.data;
  try {
    const { error } = await getSupabase().rpc("submit_report", {
      p_point_id: pointId,
      p_reported_status: status,
      p_description: description,
      p_client_token: await getClientToken(),
    });
    if (!error) return { ok: true };
    return { ok: false, message: reportErrorMessage(messages[error.message] ? error.message : error.code) };
  } catch {
    return { ok: false, message: fallback };
  }
}
