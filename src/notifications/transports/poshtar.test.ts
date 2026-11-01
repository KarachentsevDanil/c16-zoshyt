import { afterEach, describe, expect, it, vi } from "vitest";
import { poshtarTransport } from "./poshtar";

const mail = { to: "student1@example.com", subject: "Тема", text: "Текст" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("poshtarTransport", () => {
  it("передає лист в API провайдера з ключем акаунта", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    await poshtarTransport({ apiUrl: "http://poshtar.test", apiKey: "test-key" }).send(mail, {
      dryRun: false,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://poshtar.test/v1/messages");
    expect(init.headers).toMatchObject({ authorization: "Bearer test-key" });
    expect(JSON.parse(init.body as string)).toEqual({ from: "", ...mail });
  });

  it("кидає помилку, якщо провайдер відмовив", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    const transport = poshtarTransport({ apiUrl: "http://poshtar.test", apiKey: "wrong" });

    await expect(transport.send(mail, { dryRun: false })).rejects.toThrow("Поштар відповів 401");
  });
});
