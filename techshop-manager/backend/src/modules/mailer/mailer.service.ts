import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SupportTicketMailData {
  ticketRef: string;
  nom: string;
  email: string;
  siteNom: string;
  role: string;
  type: string;
  sujet: string;
  description: string;
  systemInfo?: string;
  hasScreenshot: boolean;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');

    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('MAIL_PORT') ?? 587,
        secure: config.get<string>('MAIL_SECURE') === 'true',
        auth: { user, pass: config.get<string>('MAIL_PASS') ?? '' },
      });
    }
  }

  async sendSupportTicket(data: SupportTicketMailData): Promise<void> {
    const from = this.config.get<string>('MAIL_FROM') ?? 'noreply@techshop.local';
    const to   = this.config.get<string>('MAIL_SUPPORT_TO') ?? 'support@techshop.local';

    const TYPE_LABELS: Record<string, string> = {
      BUG: 'Bug', SUGGESTION: 'Suggestion', QUESTION: 'Question',
      CONFIG: 'Configuration', URGENCE: 'Urgence',
    };

    const subject = `[${data.ticketRef}] ${TYPE_LABELS[data.type] ?? data.type} — ${data.sujet}`;

    const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1E3A5F;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0">Nouveau ticket support</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:14px">${data.ticketRef}</p>
  </div>
  <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#64748b;width:140px">Nom</td><td style="padding:6px 0;font-weight:600">${data.nom}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0">${data.email}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Site</td><td style="padding:6px 0">${data.siteNom}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Rôle</td><td style="padding:6px 0">${data.role}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Type</td><td style="padding:6px 0">${TYPE_LABELS[data.type] ?? data.type}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Sujet</td><td style="padding:6px 0;font-weight:600">${data.sujet}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
    <p style="font-size:13px;color:#64748b;margin:0 0 8px">Description</p>
    <p style="font-size:14px;white-space:pre-wrap;margin:0">${data.description}</p>
    ${data.systemInfo ? `
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
    <p style="font-size:13px;color:#64748b;margin:0 0 8px">Informations système</p>
    <pre style="font-size:12px;background:#f1f5f9;padding:12px;border-radius:6px;overflow:auto">${data.systemInfo}</pre>` : ''}
    ${data.hasScreenshot ? '<p style="font-size:13px;color:#2E86C1;margin:12px 0 0">📎 Une capture d\'écran a été jointe.</p>' : ''}
  </div>
</div>`;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html });
        this.logger.log(`Support email sent: ${data.ticketRef}`);
      } catch (err) {
        this.logger.error(`Failed to send support email: ${(err as Error).message}`);
      }
    } else {
      this.logger.warn(`SMTP not configured — ticket ${data.ticketRef} logged only`);
      this.logger.log(`[TICKET] ${subject} | ${data.email}`);
    }
  }
}
