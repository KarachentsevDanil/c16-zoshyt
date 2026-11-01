import type { MailTransport } from "./mail";
import { poshtarTransport } from "./transports/poshtar";

export function createTransport(): MailTransport {
  return poshtarTransport({
    apiUrl: process.env.POSHTAR_API_URL ?? "",
    apiKey: process.env.POSHTAR_API_KEY ?? "",
  });
}
