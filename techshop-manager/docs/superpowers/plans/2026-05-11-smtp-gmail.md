# Migration SMS → Gmail SMTP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les stubs SMS (console.log) par de vrais emails transactionnels via Gmail SMTP : OTP reset mot de passe, mot de passe temporaire admin, et activation compte onboarding.

**Architecture:** `MailerService` existant est étendu avec 3 nouvelles méthodes. `AuthModule` et `UsersModule` importent `MailerModule` pour injecter `MailerService`. Aucune nouvelle librairie — `nodemailer` est déjà installé. Pour le reset : si l'utilisateur n'a pas d'email, `BadRequestException` avec message "contacter admin".

**Tech Stack:** NestJS 10, nodemailer (déjà installé), Gmail SMTP App Password, Prisma 5

---

## Fichiers touchés

| Action | Fichier |
|--------|---------|
| Modify | `backend/src/modules/mailer/mailer.service.ts` |
| Modify | `backend/src/modules/auth/auth.module.ts` |
| Modify | `backend/src/modules/auth/auth.service.ts` |
| Modify | `backend/src/modules/users/users.module.ts` |
| Modify | `backend/src/modules/users/users.service.ts` |
| Modify | `backend/.env.example` |

---

## Task 1 : Étendre MailerService avec 3 nouvelles méthodes

**Files:**
- Modify: `backend/src/modules/mailer/mailer.service.ts`

- [ ] **Step 1 : Remplacer le contenu complet de mailer.service.ts**

```typescript
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
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');
    this.from = config.get<string>('MAIL_FROM') ?? 'Progress Business <noreply@progressbusiness.cd>';

    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('MAIL_PORT') ?? 587,
        secure: config.get<string>('MAIL_SECURE') === 'true',
        auth: { user, pass: config.get<string>('MAIL_PASS') ?? '' },
      });
    }
  }

  // ── Méthode interne d'envoi ────────────────────────────────────────
  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP non configuré — email non envoyé à ${to} | ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email envoyé à ${to} | ${subject}`);
    } catch (err) {
      this.logger.error(`Échec envoi email à ${to}: ${(err as Error).message}`);
    }
  }

  // ── Template de base ───────────────────────────────────────────────
  private wrap(content: string): string {
    return `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:#1E3A5F;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="margin:0;font-size:18px">Progress Business</h2>
    <p style="margin:4px 0 0;opacity:.7;font-size:13px">Système de Gestion Commercial — RDC</p>
  </div>
  <div style="background:#f8fafc;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    ${content}
  </div>
  <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:16px">
    Progress Business · Goma · Bukavu · Kinshasa — RDC<br>
    Ce message est automatique, ne pas répondre.
  </p>
</div>`;
  }

  // ── 1. OTP Reset mot de passe ─────────────────────────────────────
  async sendOtpResetPassword(to: string, nom: string, otp: string, maskedPhone: string): Promise<void> {
    const html = this.wrap(`
      <h3 style="margin:0 0 8px;color:#1E3A5F;font-size:17px">Réinitialisation du mot de passe</h3>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px">
        Bonjour <strong>${nom}</strong>, voici votre code de vérification pour le compte associé au numéro <strong>${maskedPhone}</strong>.
      </p>
      <div style="background:#1E3A5F;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Code OTP</p>
        <p style="color:#ffffff;font-size:40px;font-weight:900;letter-spacing:10px;margin:0;font-family:monospace">${otp}</p>
      </div>
      <p style="color:#64748b;font-size:13px;margin:0 0 8px">
        ⏱ Ce code est valide pendant <strong>10 minutes</strong>.
      </p>
      <p style="color:#64748b;font-size:13px;margin:0">
        Si vous n'avez pas fait cette demande, ignorez cet email. Votre compte reste sécurisé.
      </p>
    `);
    await this.send(to, 'Votre code de réinitialisation — Progress Business', html);
  }

  // ── 2. Mot de passe temporaire (reset admin) ──────────────────────
  async sendTempPassword(to: string, nom: string, telephone: string, tempPassword: string): Promise<void> {
    const html = this.wrap(`
      <h3 style="margin:0 0 8px;color:#1E3A5F;font-size:17px">Votre nouveau mot de passe</h3>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px">
        Bonjour <strong>${nom}</strong>, un administrateur a réinitialisé votre mot de passe.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
        <tr>
          <td style="padding:10px 12px;background:#f1f5f9;border-radius:6px 6px 0 0;color:#64748b;width:140px">Téléphone</td>
          <td style="padding:10px 12px;background:#f1f5f9;border-radius:6px 6px 0 0;font-family:monospace;font-weight:600">${telephone}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#e2e8f0;color:#64748b">Mot de passe temp.</td>
          <td style="padding:10px 12px;background:#e2e8f0;font-family:monospace;font-weight:700;font-size:16px;color:#1E3A5F">${tempPassword}</td>
        </tr>
      </table>
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:16px">
        <p style="color:#92400e;font-size:13px;margin:0;font-weight:600">
          ⚠ Changez ce mot de passe dès votre première connexion.
        </p>
      </div>
      <p style="color:#64748b;font-size:13px;margin:0">
        Si vous n'attendiez pas cette action, contactez immédiatement votre responsable.
      </p>
    `);
    await this.send(to, 'Votre mot de passe a été réinitialisé — Progress Business', html);
  }

  // ── 3. Activation compte client (onboarding) ──────────────────────
  async sendActivationBienvenue(to: string, nomClient: string, codeParrain: string, siteNom: string): Promise<void> {
    const html = this.wrap(`
      <h3 style="margin:0 0 8px;color:#1E3A5F;font-size:17px">Bienvenue chez Progress Business !</h3>
      <p style="color:#64748b;font-size:14px;margin:0 0 24px">
        Bonjour <strong>${nomClient}</strong>, votre compte client est maintenant <strong style="color:#1A6B3A">actif</strong>.
      </p>
      <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="color:#166534;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;font-weight:600">Votre code parrain</p>
        <p style="color:#15803d;font-size:32px;font-weight:900;letter-spacing:6px;margin:0;font-family:monospace">${codeParrain}</p>
        <p style="color:#166534;font-size:12px;margin:8px 0 0">Partagez ce code pour parrainer vos proches et gagner des récompenses</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px">
        <tr>
          <td style="padding:8px 12px;background:#f1f5f9;border-radius:6px;color:#64748b">Site</td>
          <td style="padding:8px 12px;background:#f1f5f9;font-weight:600">${siteNom}</td>
        </tr>
      </table>
      <p style="color:#64748b;font-size:13px;margin:0">
        Vous bénéficiez désormais du programme de fidélité Bronze → Platine.<br>
        Chaque achat vous rapporte des points et des remises exclusives.
      </p>
    `);
    await this.send(to, `Bienvenue — Votre compte Progress Business est actif`, html);
  }

  // ── Support ticket (existant — inchangé) ──────────────────────────
  async sendSupportTicket(data: SupportTicketMailData): Promise<void> {
    const to = this.config.get<string>('MAIL_SUPPORT_TO') ?? 'support@progressbusiness.cd';

    const TYPE_LABELS: Record<string, string> = {
      BUG: 'Bug', SUGGESTION: 'Suggestion', QUESTION: 'Question',
      CONFIG: 'Configuration', URGENCE: 'Urgence',
    };

    const subject = `[${data.ticketRef}] ${TYPE_LABELS[data.type] ?? data.type} — ${data.sujet}`;

    const html = this.wrap(`
      <h3 style="margin:0 0 8px;color:#1E3A5F;font-size:17px">Nouveau ticket support</h3>
      <p style="color:#64748b;font-size:13px;margin:0 0 16px">${data.ticketRef}</p>
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
    `);

    await this.send(to, subject, html);
  }
}
```

- [ ] **Step 2 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add backend/src/modules/mailer/mailer.service.ts
git commit -m "feat: extend MailerService with OTP, temp password, and activation email templates"
```

---

## Task 2 : Câbler MailerModule dans AuthModule + AuthService

**Files:**
- Modify: `backend/src/modules/auth/auth.module.ts`
- Modify: `backend/src/modules/auth/auth.service.ts`

- [ ] **Step 1 : Importer MailerModule dans AuthModule**

Remplacer le contenu de `backend/src/modules/auth/auth.module.ts` :

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    PassportModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '8h') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 2 : Modifier auth.service.ts — injecter MailerService et câbler forgotPassword**

Remplacer le contenu de `backend/src/modules/auth/auth.service.ts` :

```typescript
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/login.dto';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { otpHash: string; expiresAt: Date; attempts: number }>();
  private resetTokenStore = new Map<string, { phone: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailer: MailerService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ telephone: dto.identifier }, { email: dto.identifier }] },
      include: { site: { select: { id: true, nom: true } } },
    });

    if (!user) {
      throw new UnauthorizedException({
        error: { code: 'INVALID_CREDENTIALS', message: 'Téléphone ou mot de passe incorrect' },
      });
    }

    if (user.bloqueJusquA && user.bloqueJusquA > new Date()) {
      throw new UnauthorizedException({
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Compte bloqué',
          unlocksAt: user.bloqueJusquA.toISOString(),
        },
      });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      const attempts = user.tentativesConnexion + 1;
      const bloqueJusquA =
        attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null;
      await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: { tentativesConnexion: attempts, bloqueJusquA },
      });
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Téléphone ou mot de passe incorrect',
          attemptsLeft: MAX_ATTEMPTS - attempts,
        },
      });
    }

    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { tentativesConnexion: 0, bloqueJusquA: null, derniereConnexion: new Date() },
    });

    const payload = { sub: user.id, role: user.role, siteId: user.siteId };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '8h'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: dto.rememberMe ? '30d' : '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        name: user.nom,
        siteId: user.siteId ?? null,
        siteName: user.site?.nom ?? null,
      },
    };
  }

  async refreshToken(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedException({
        error: { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh token manquant' },
      });
    }
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      }) as { sub: string; role: string; siteId?: string };

      const accessToken = this.jwt.sign(
        { sub: payload.sub, role: payload.role, siteId: payload.siteId },
        { expiresIn: this.config.get('JWT_EXPIRES_IN', '8h') },
      );
      return { accessToken, newRefreshToken: null };
    } catch {
      throw new UnauthorizedException({
        error: { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh token invalide ou expiré' },
      });
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { telephone: dto.phone },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'PHONE_NOT_FOUND', message: 'Aucun compte trouvé pour ce numéro' },
      });
    }

    if (!user.email) {
      throw new BadRequestException({
        error: {
          code: 'NO_EMAIL',
          message: 'Aucun email associé à ce compte. Contactez votre administrateur pour en ajouter un.',
        },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60000);
    this.otpStore.set(dto.phone, { otpHash, expiresAt, attempts: 0 });

    const maskedPhone = dto.phone.slice(0, 7) + ' *** ' + dto.phone.slice(-4);
    const maskedEmail = user.email.replace(/(.{2}).+(@.+)/, '$1***$2');

    await this.mailer.sendOtpResetPassword(user.email, user.nom, otp, maskedPhone);

    return { success: true, maskedPhone, maskedEmail, expiresIn: 600, retryAfter: 120 };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const entry = this.otpStore.get(dto.phone);

    if (!entry || entry.expiresAt < new Date()) {
      this.otpStore.delete(dto.phone);
      throw new BadRequestException({
        error: { code: 'OTP_EXPIRED', message: 'Code OTP expiré. Demandez un nouveau code.' },
      });
    }

    if (entry.attempts >= 3) {
      this.otpStore.delete(dto.phone);
      throw new BadRequestException({
        error: {
          code: 'TOO_MANY_OTP_ATTEMPTS',
          message: 'Trop de tentatives invalides. Recommencez.',
        },
      });
    }

    const valid = await bcrypt.compare(dto.otp, entry.otpHash);
    if (!valid) {
      this.otpStore.set(dto.phone, { ...entry, attempts: entry.attempts + 1 });
      throw new BadRequestException({
        error: {
          code: 'INVALID_OTP',
          message: 'Code incorrect.',
          attemptsLeft: 3 - (entry.attempts + 1),
        },
      });
    }

    this.otpStore.delete(dto.phone);

    const resetToken = crypto.randomUUID();
    this.resetTokenStore.set(resetToken, {
      phone: dto.phone,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });

    return { success: true, resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const entry = this.resetTokenStore.get(dto.resetToken);

    if (!entry || entry.expiresAt < new Date()) {
      this.resetTokenStore.delete(dto.resetToken);
      throw new BadRequestException({
        error: {
          code: 'RESET_TOKEN_EXPIRED',
          message: 'Session expirée. Recommencez la réinitialisation.',
        },
      });
    }

    const user = await this.prisma.utilisateur.findFirst({
      where: { telephone: entry.phone },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'ERR_NOT_FOUND', message: 'Utilisateur introuvable' },
      });
    }

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (sameAsOld) {
      throw new BadRequestException({
        error: {
          code: 'PASSWORD_ALREADY_USED',
          message: 'Ce mot de passe a déjà été utilisé. Choisissez-en un nouveau.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { passwordHash, tentativesConnexion: 0, bloqueJusquA: null },
    });

    this.resetTokenStore.delete(dto.resetToken);

    return { success: true, message: 'Mot de passe mis à jour avec succès.' };
  }
}
```

- [ ] **Step 3 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add backend/src/modules/auth/auth.module.ts backend/src/modules/auth/auth.service.ts
git commit -m "feat: wire MailerService into AuthService — send OTP via email on forgot-password"
```

---

## Task 3 : Câbler MailerModule dans UsersModule + UsersService

**Files:**
- Modify: `backend/src/modules/users/users.module.ts`
- Modify: `backend/src/modules/users/users.service.ts`

- [ ] **Step 1 : Importer MailerModule dans UsersModule**

Remplacer le contenu de `backend/src/modules/users/users.module.ts` :

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 2 : Injecter MailerService dans UsersService et câbler resetPassword**

Dans `backend/src/modules/users/users.service.ts`, modifier les imports et le constructor, puis la méthode `resetPassword` :

**Imports à ajouter en haut du fichier** (après les imports existants) :
```typescript
import { MailerService } from '../mailer/mailer.service';
```

**Constructor — remplacer :**
```typescript
constructor(private prisma: PrismaService) {}
```
**Par :**
```typescript
constructor(
  private prisma: PrismaService,
  private mailer: MailerService,
) {}
```

**Méthode `resetPassword` — remplacer entièrement :**
```typescript
async resetPassword(id: string) {
  const user = await this.prisma.utilisateur.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Utilisateur introuvable' });
  }

  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await this.prisma.utilisateur.update({
    where: { id },
    data: { passwordHash, tentativesConnexion: 0, bloqueJusquA: null },
  });

  if (user.email) {
    await this.mailer.sendTempPassword(user.email, user.nom, user.telephone, tempPassword);
  } else {
    console.log(`[RESET PASSWORD — pas d'email] ${user.telephone}: ${tempPassword}`);
  }

  return {
    success: true,
    message: user.email
      ? 'Mot de passe temporaire envoyé par email'
      : 'Mot de passe temporaire généré (utilisateur sans email — voir logs)',
    ...(process.env.NODE_ENV !== 'production' && { tempPassword }),
  };
}
```

- [ ] **Step 3 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add backend/src/modules/users/users.module.ts backend/src/modules/users/users.service.ts
git commit -m "feat: wire MailerService into UsersService — send temp password via email on admin reset"
```

---

## Task 4 : Câbler l'email d'activation dans le service onboarding

**Files:**
- Modify: `backend/src/modules/clients/clients.service.ts` (méthode `activerClient`)

- [ ] **Step 1 : Trouver la méthode d'activation dans clients.service.ts**

Ouvrir `backend/src/modules/clients/clients.service.ts` et chercher la méthode qui génère le code parrain (`codeParrain`, `TSG-`, `activerClient` ou `ACTIVATION`).

- [ ] **Step 2 : Injecter MailerService dans ClientsModule**

Dans `backend/src/modules/clients/clients.module.ts`, ajouter l'import :
```typescript
import { MailerModule } from '../mailer/mailer.module';
```
Et l'ajouter dans le tableau `imports: [MailerModule]`.

- [ ] **Step 3 : Injecter MailerService dans ClientsService**

Dans `backend/src/modules/clients/clients.service.ts`, ajouter l'import :
```typescript
import { MailerService } from '../mailer/mailer.service';
```

Ajouter `private mailer: MailerService` dans le constructor.

- [ ] **Step 4 : Envoyer l'email après génération du code parrain**

Dans la méthode qui active le client et génère `codeParrain`, après l'update Prisma, ajouter :

```typescript
// Envoi email de bienvenue si le client a un email
if (client.email) {
  await this.mailer.sendActivationBienvenue(
    client.email,
    client.nom,
    codeParrain,        // variable contenant TSG-XXXX
    site?.nom ?? 'Progress Business',
  );
}
```

- [ ] **Step 5 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add backend/src/modules/clients/clients.service.ts backend/src/modules/clients/clients.module.ts
git commit -m "feat: send activation welcome email with parrain code after onboarding step 4"
```

---

## Task 5 : Mettre à jour .env.example + frontend (message d'erreur OTP)

**Files:**
- Modify: `backend/.env.example`
- Modify: `frontend/src/pages/auth/ResetPasswordPage.tsx` (afficher `maskedEmail` dans la confirmation)

- [ ] **Step 1 : Mettre à jour .env.example**

Remplacer la section SMS par la section EMAIL dans `backend/.env.example` :

```
# === EMAIL (Gmail SMTP) ===
# Utiliser un App Password Gmail (compte Google > Sécurité > Mots de passe des applications)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=votre@gmail.com
MAIL_PASS=xxxx_xxxx_xxxx_xxxx
MAIL_FROM=Progress Business <votre@gmail.com>
MAIL_SUPPORT_TO=support@votre@gmail.com
```

Supprimer ou commenter la section SMS Africa's Talking :
```
# === SMS (Africa's Talking) — remplacé par Gmail SMTP ===
# AT_API_KEY=<non utilisé>
# AT_USERNAME=<non utilisé>
# SMS_SENDER_ID=ProgressBiz
```

- [ ] **Step 2 : Vérifier ResetPasswordPage.tsx côté frontend**

Ouvrir `frontend/src/pages/auth/ResetPasswordPage.tsx`. Dans l'étape qui affiche la confirmation après `forgotPassword`, si la réponse contient `maskedEmail`, afficher :
> *"Un code a été envoyé à l'adresse **ma@***.com** associée au numéro XXXX *** XXXX."*

Si le champ `maskedEmail` n'est pas utilisé actuellement, l'ajouter dans le message de confirmation de l'étape 1 du flux reset.

- [ ] **Step 3 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add backend/.env.example frontend/src/pages/auth/ResetPasswordPage.tsx
git commit -m "feat: update env.example for Gmail SMTP, show maskedEmail in reset password UI"
```

---

## Task 6 : Vérification finale + push

- [ ] **Step 1 : Compiler le backend pour vérifier les types**

```bash
cd "D:\PETER\Progress app\techshop-manager\backend"
npx tsc --noEmit
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Step 2 : Configurer le .env de prod sur Render**

Sur le dashboard Render → Environment Variables, ajouter/mettre à jour :
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=<ton_email_gmail>
MAIL_PASS=<app_password_16_caracteres>
MAIL_FROM=Progress Business <ton_email_gmail>
MAIL_SUPPORT_TO=<email_support>
```

> **Comment obtenir un App Password Gmail :**
> 1. Aller sur myaccount.google.com → Sécurité
> 2. Activer la validation en 2 étapes si pas déjà fait
> 3. Chercher "Mots de passe des applications"
> 4. Créer un mot de passe pour "Autre (nom personnalisé)" → "Progress Business"
> 5. Copier le code de 16 caractères généré

- [ ] **Step 3 : Pousser vers main**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git push origin main
```

- [ ] **Step 4 : Tester en prod**

Tester le flux complet :
1. `POST /api/v1/auth/forgot-password` avec un numéro dont l'utilisateur a un email → vérifier réception email OTP
2. `POST /api/v1/auth/forgot-password` avec un numéro sans email → vérifier erreur `NO_EMAIL` avec message "contacter admin"
3. Reset MDP admin (`PATCH /api/v1/users/:id/reset-password`) → vérifier réception email MDP temp
