import { DEFAULT_FROM_EMAIL } from "../../config/mail";
import type { Mail, MailTransport } from "../mail";

export interface PoshtarConfig {
  apiUrl: string;
  apiKey: string;
}

export function poshtarTransport({ apiUrl, apiKey }: PoshtarConfig): MailTransport {
  return {
    async send(mail: Mail) {
      const response = await fetch(`${apiUrl}/v1/messages`, {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from: DEFAULT_FROM_EMAIL, ...mail }),
      });
      if (!response.ok) {
        throw new Error(`Поштар відповів ${response.status}`);
      }
    },
  };
}
