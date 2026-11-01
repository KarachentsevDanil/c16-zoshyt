import nodemailer from "nodemailer";
import { DEFAULT_FROM_EMAIL } from "../../config/mail";
import type { Mail, MailTransport, SendOptions } from "../mail";

export function smtpTransport(smtpUrl: string): MailTransport {
  const transporter = nodemailer.createTransport(smtpUrl);

  return {
    async send(mail: Mail, { dryRun }: SendOptions) {
      if (dryRun) {
        console.log(`[dry-run] ${mail.to}: ${mail.subject}\n${mail.text}`);
        return;
      }
      await transporter.sendMail({ from: DEFAULT_FROM_EMAIL, ...mail });
    },
  };
}
