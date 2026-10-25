import { getClientToken } from "./clientToken";
import type { PointStatus } from "./schemas";
import { getSupabase } from "./supabase";

export const MAX_DESCRIPTION_LENGTH = 500;

const messages: Record<string, string> = {
  rate_limited: "Kısa sürede çok fazla bildirim gönderdiniz. Lütfen daha sonra tekrar deneyin.",
  duplicate: "Bu nokta için bugün zaten bildirim gönderdiniz. Teşekkürler!",
  global_limit: "Şu anda bildirim alınamıyor, lütfen daha sonra deneyin.",
  description_too_long: `Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir.`,
};

const fallback = "Bildirim gönderilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.";

// submit_report'un raise ettiği kodu (PostgREST'te error.message) kullanıcı mesajına çevirir
export function reportErrorMessage(code: string | undefined): string {
  return (code && messages[code]) || fallback;
}

export type SubmitReportInput = {
  pointId: string;
  status: PointStatus;
  description: string;
};

export type SubmitReportResult = { ok: true } | { ok: false; message: string };

export async function submitReport({ pointId, status, description }: SubmitReportInput): Promise<SubmitReportResult> {
  try {
    const { error } = await getSupabase().rpc("submit_report", {
      p_point_id: pointId,
      p_reported_status: status,
      p_description: description.trim(),
      p_client_token: await getClientToken(),
    });
    return error ? { ok: false, message: reportErrorMessage(error.message) } : { ok: true };
  } catch {
    return { ok: false, message: fallback };
  }
}
