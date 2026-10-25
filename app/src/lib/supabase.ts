import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { envResult } from "./env";

let client: SupabaseClient<Database> | undefined;

// Kök layout env hatasını yakalayıp bu fonksiyonun hiç çağrılmamasını sağlar
export function getSupabase(): SupabaseClient<Database> {
  if (!envResult.ok) throw new Error(envResult.message);
  client ??= createClient<Database>(
    envResult.env.EXPO_PUBLIC_SUPABASE_URL,
    envResult.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    },
  );
  return client;
}
