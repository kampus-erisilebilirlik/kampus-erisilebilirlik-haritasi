import { getSupabase } from "./supabase";

const BUCKET = "point-photos";

// Bucket herkese açık; adres istek atmadan üretilir
export function photoUrl(path: string): string {
  return getSupabase().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
