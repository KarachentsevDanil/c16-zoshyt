export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export interface SendOptions {
  dryRun: boolean;
}

export interface MailTransport {
  send(mail: Mail, options: SendOptions): Promise<void>;
}
