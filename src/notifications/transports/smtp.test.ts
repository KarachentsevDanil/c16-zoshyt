import { afterEach, describe, expect, it, vi } from "vitest";
import { smtpTransport } from "./smtp";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("smtpTransport", () => {
  it("з --dry-run лише друкує лист у консоль", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await smtpTransport("smtp://127.0.0.1:1").send(
      { to: "student1@example.com", subject: "Тема", text: "Текст" },
      { dryRun: true },
    );

    expect(log).toHaveBeenCalledWith("[dry-run] student1@example.com: Тема\nТекст");
  });
});
