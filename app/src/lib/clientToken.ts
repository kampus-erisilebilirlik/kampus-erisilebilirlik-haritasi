import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Rastgele, kimliksiz uygulama kodu: kişiyi veya cihazı tanımlamaz, uygulama silinince kaybolur
const KEY = "client_token";

async function readOrCreate(): Promise<string> {
  try {
    const stored = await SecureStore.getItemAsync(KEY);
    if (stored) return stored;
  } catch {
    // Anahtar çözülemezse (ör. yedekten geri yükleme) yeni kod üretilir
  }
  const token = Crypto.randomUUID();
  await SecureStore.setItemAsync(KEY, token);
  return token;
}

// Eşzamanlı ilk çağrılar aynı promise'i paylaşır, böylece tek kod üretilir
export function createClientTokenGetter(): () => Promise<string> {
  let pending: Promise<string> | undefined;
  return () => {
    pending ??= readOrCreate().catch((e: unknown) => {
      pending = undefined;
      throw e;
    });
    return pending;
  };
}

export const getClientToken = createClientTokenGetter();
