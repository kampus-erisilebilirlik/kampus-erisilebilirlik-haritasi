import * as SecureStore from "expo-secure-store";

import { createClientTokenGetter } from "./clientToken";

const mockStore = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
}));

// jest-expo'nun native mock'u UUID üretmez; Node'un Web Crypto'su kullanılır
jest.mock("expo-crypto", () => ({
  randomUUID: () => (globalThis as unknown as { crypto: { randomUUID(): string } }).crypto.randomUUID(),
}));

const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);

beforeEach(() => {
  mockStore.clear();
  jest.clearAllMocks();
});

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("getClientToken", () => {
  it("ilk çağrıda UUID üretip saklar, sonra aynısını döndürür", async () => {
    const getClientToken = createClientTokenGetter();
    const first = await getClientToken();
    expect(first).toMatch(uuidPattern);
    expect(await getClientToken()).toBe(first);
    expect(setItemAsync).toHaveBeenCalledTimes(1);
  });

  it("uygulama yeniden açıldığında saklanan kodu kullanır", async () => {
    mockStore.set("client_token", "11111111-1111-4111-8111-111111111111");
    expect(await createClientTokenGetter()()).toBe("11111111-1111-4111-8111-111111111111");
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  it("eşzamanlı çağrılar tek kod üretir", async () => {
    const getClientToken = createClientTokenGetter();
    const [a, b] = await Promise.all([getClientToken(), getClientToken()]);
    expect(a).toBe(b);
    expect(setItemAsync).toHaveBeenCalledTimes(1);
  });

  it("saklanan kod okunamazsa yenisini üretir", async () => {
    getItemAsync.mockRejectedValueOnce(new Error("decrypt failed"));
    expect(await createClientTokenGetter()()).toMatch(uuidPattern);
  });

  it("kaydetme başarısız olursa sonraki çağrıda tekrar dener", async () => {
    setItemAsync.mockRejectedValueOnce(new Error("keystore busy"));
    const getClientToken = createClientTokenGetter();
    await expect(getClientToken()).rejects.toThrow("keystore busy");
    expect(await getClientToken()).toMatch(uuidPattern);
  });
});
