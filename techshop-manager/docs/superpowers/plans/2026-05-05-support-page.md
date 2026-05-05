# Support Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page /support avec formulaire de ticket, FAQ accordéon et card développeur, reliée à un module NestJS qui envoie un email via nodemailer et enregistre le ticket en base Prisma.

**Architecture:** Frontend = 3 composants indépendants (SupportForm, FaqAccordion, DeveloperCard) orchestrés par SupportPage. Backend = module NestJS autonome (SupportModule + MailerModule) avec Prisma pour la persistance et nodemailer pour l'envoi email. AppLayout modifié pour la navigation.

**Tech Stack:** React 18, React Hook Form 7, Zod 3, Tailwind CSS, NestJS 10, Prisma 5, nodemailer, multer (déjà installé)

---

## Task 1 : Prisma — modèle SupportTicket

**Files:**
- Modify: `backend/prisma/schema.prisma` (fin du fichier)

- [ ] **Step 1 : Ajouter le modèle et l'enum dans schema.prisma**

Ajouter à la fin de `backend/prisma/schema.prisma` :

```prisma
// ============================================
// SUPPORT TICKETS
// ============================================

enum TicketType {
  BUG
  SUGGESTION
  QUESTION
  CONFIG
  URGENCE
}

model SupportTicket {
  id            String     @id @default(uuid())
  ticketRef     String     @unique
  nom           String
  email         String
  siteNom       String
  role          String
  type          TicketType
  sujet         String
  description   String     @db.Text
  systemInfo    String?    @db.Text
  hasScreenshot Boolean    @default(false)
  createdAt     DateTime   @default(now())

  @@map("support_tickets")
}
```

- [ ] **Step 2 : Générer et appliquer la migration**

```bash
cd backend
npx prisma migrate dev --name add_support_ticket
```

Expected output : `✔ Generated Prisma Client`

- [ ] **Step 3 : Vérifier que le client Prisma contient le nouveau modèle**

```bash
npx prisma studio
```

Vérifier que la table `support_tickets` apparaît. Fermer Prisma Studio.

- [ ] **Step 4 : Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat(db): add SupportTicket model and TicketType enum"
```

---

## Task 2 : Backend — installer nodemailer

**Files:**
- Modify: `backend/package.json` (via npm install)
- Modify: `backend/.env` et `backend/.env.example`

- [ ] **Step 1 : Installer nodemailer**

```bash
cd backend
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Expected : `added N packages`

- [ ] **Step 2 : Ajouter les variables d'env dans `backend/.env`**

Ajouter à la fin de `backend/.env` :

```env
# === EMAIL SUPPORT ===
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=noreply@techshop.cd
MAIL_PASSWORD=<app_password_gmail>
MAIL_FROM="TechShop Manager <noreply@techshop.cd>"
SUPPORT_RECIPIENT=peter23xp@gmail.com
```

- [ ] **Step 3 : Ajouter les mêmes clés dans `backend/.env.example`** (valeurs vides)

```env
# === EMAIL SUPPORT ===
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM="TechShop Manager <noreply@techshop.cd>"
SUPPORT_RECIPIENT=
```

- [ ] **Step 4 : Commit**

```bash
git add backend/package.json backend/package-lock.json backend/.env.example
git commit -m "feat(deps): install nodemailer for support email"
```

---

## Task 3 : Backend — MailerModule

**Files:**
- Create: `backend/src/modules/mailer/mailer.service.ts`
- Create: `backend/src/modules/mailer/mailer.module.ts`

- [ ] **Step 1 : Créer `backend/src/modules/mailer/mailer.service.ts`**

```typescript
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface TicketEmailPayload {
  ticketRef: string;
  nom: string;
  email: string;
  siteNom: string;
  role: string;
  type: 'BUG' | 'SUGGESTION' | 'QUESTION' | 'CONFIG' | 'URGENCE';
  sujet: string;
  description: string;
  systemInfo?: Record<string, string>;
  screenshotBuffer?: Buffer;
  screenshotMimetype?: string;
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  BUG:        { label: 'Signalement de bug',         emoji: '🐛', color: '#B71C1C' },
  SUGGESTION: { label: "Suggestion d'amélioration",  emoji: '💡', color: '#1A6B3A' },
  QUESTION:   { label: "Question d'utilisation",     emoji: '❓', color: '#2E86C1' },
  CONFIG:     { label: 'Demande de configuration',   emoji: '🔧', color: '#E65100' },
  URGENCE:    { label: 'Urgence — Problème bloquant', emoji: '🚨', color: '#B71C1C' },
};

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly config: ConfigService) {}

  async sendSupportTicket(payload: TicketEmailPayload): Promise<void> {
    const host      = this.config.get<string>('MAIL_HOST');
    const port      = parseInt(this.config.get<string>('MAIL_PORT') ?? '587', 10);
    const secure    = this.config.get<string>('MAIL_SECURE') === 'true';
    const user      = this.config.get<string>('MAIL_USER');
    const pass      = this.config.get<string>('MAIL_PASSWORD');
    const from      = this.config.get<string>('MAIL_FROM');
    const recipient = this.config.get<string>('SUPPORT_RECIPIENT') ?? 'peter23xp@gmail.com';

    // En dev sans SMTP configuré → log dans la console
    if (!user || !pass || user === '' || pass === '<app_password_gmail>') {
      this.logger.warn('MAIL_USER/MAIL_PASSWORD non configurés — ticket loggé uniquement');
      this.logger.log(JSON.stringify(payload, null, 2));
      return;
    }

    const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

    const tc = TYPE_CONFIG[payload.type] ?? TYPE_CONFIG.QUESTION;
    const isUrgence = payload.type === 'URGENCE';

    const subjectPrefix = isUrgence ? '[URGENCE] TechShop Manager' : '[TechShop Support]';
    const subject = `${subjectPrefix} — ${tc.emoji} ${payload.sujet} (${payload.ticketRef})`;

    const systemInfoHtml = payload.systemInfo
      ? `<div style="padding:24px;border-bottom:1px solid #eee">
          <h2 style="color:#1E3A5F;margin:0 0 8px;font-size:16px">Informations système</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            ${Object.entries(payload.systemInfo).map(([k, v]) =>
              `<tr><td style="color:#666;padding:4px 0;width:160px">${k}</td><td>${v}</td></tr>`
            ).join('')}
          </table>
        </div>`
      : '';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)">
    <div style="background:#1E3A5F;padding:24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:20px">🛒 TechShop Manager — Support Technique</h1>
      <p style="color:#D6E4F0;margin:8px 0 0;font-size:14px">Ticket ${payload.ticketRef}</p>
    </div>
    <div style="padding:16px 24px;background:${tc.color};text-align:center">
      <span style="color:white;font-weight:bold;font-size:16px">${tc.emoji} ${tc.label}</span>
    </div>
    <div style="padding:24px;border-bottom:1px solid #eee">
      <h2 style="color:#1E3A5F;margin:0 0 16px;font-size:16px">Expéditeur</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#666;width:120px">Nom</td><td style="font-weight:bold">${payload.nom}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Email</td><td><a href="mailto:${payload.email}" style="color:#2E86C1">${payload.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#666">Site</td><td>${payload.siteNom}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Rôle</td><td>${payload.role}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Date</td><td>${new Date().toLocaleString('fr-CD')}</td></tr>
      </table>
    </div>
    <div style="padding:24px;border-bottom:1px solid #eee">
      <h2 style="color:#1E3A5F;margin:0 0 8px;font-size:16px">Sujet</h2>
      <p style="margin:0 0 20px;font-size:15px;font-weight:bold">${payload.sujet}</p>
      <h2 style="color:#1E3A5F;margin:0 0 8px;font-size:16px">Description</h2>
      <div style="background:#f9f9f9;border-left:4px solid #2E86C1;padding:16px;border-radius:0 4px 4px 0;white-space:pre-wrap">${payload.description}</div>
    </div>
    ${systemInfoHtml}
    <div style="padding:20px 24px;background:#f5f5f5;text-align:center">
      <p style="margin:0;color:#666;font-size:12px">
        Répondez directement à cet email pour contacter l'expéditeur.<br>
        TechShop Manager — Goma, RDC — Développé par
        <a href="https://peterakilimali.site" style="color:#2E86C1">Peter Akilimali</a>
      </p>
    </div>
  </div>
</body></html>`;

    const attachments: nodemailer.SendMailOptions['attachments'] = [];
    if (payload.screenshotBuffer) {
      attachments.push({
        filename: `screenshot-${payload.ticketRef}.${payload.screenshotMimetype?.split('/')[1] ?? 'png'}`,
        content: payload.screenshotBuffer,
        contentType: payload.screenshotMimetype ?? 'image/png',
      });
    }

    try {
      await transporter.sendMail({
        from,
        to: recipient,
        replyTo: payload.email,
        subject,
        html,
        attachments,
        ...(isUrgence ? { priority: 'high' } : {}),
      });
      this.logger.log(`Ticket ${payload.ticketRef} envoyé à ${recipient}`);
    } catch (err) {
      this.logger.error('Échec envoi email support', err);
      throw new InternalServerErrorException({ code: 'ERR_EMAIL_SEND', message: "Échec d'envoi de l'email" });
    }
  }
}
```

- [ ] **Step 2 : Créer `backend/src/modules/mailer/mailer.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
```

- [ ] **Step 3 : Commit**

```bash
git add backend/src/modules/mailer/
git commit -m "feat(mailer): add MailerModule with nodemailer support"
```

---

## Task 4 : Backend — SupportModule (DTO + Service + Controller)

**Files:**
- Create: `backend/src/modules/support/dto/ticket.dto.ts`
- Create: `backend/src/modules/support/support.service.ts`
- Create: `backend/src/modules/support/support.controller.ts`
- Create: `backend/src/modules/support/support.module.ts`

- [ ] **Step 1 : Créer `backend/src/modules/support/dto/ticket.dto.ts`**

```typescript
import { IsString, IsEmail, IsEnum, MinLength, MaxLength, IsOptional } from 'class-validator';

export enum TicketTypeDto {
  BUG        = 'BUG',
  SUGGESTION = 'SUGGESTION',
  QUESTION   = 'QUESTION',
  CONFIG     = 'CONFIG',
  URGENCE    = 'URGENCE',
}

export class CreateTicketDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nom: string;

  @IsEmail()
  email: string;

  @IsString()
  siteNom: string;

  @IsString()
  role: string;

  @IsEnum(TicketTypeDto)
  type: TicketTypeDto;

  @IsString()
  @MinLength(5)
  @MaxLength(150)
  sujet: string;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  systemInfo?: string;
}
```

- [ ] **Step 2 : Créer `backend/src/modules/support/support.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { CreateTicketDto } from './dto/ticket.dto';
import { TicketType } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async createTicket(
    dto: CreateTicketDto,
    screenshotBuffer?: Buffer,
    screenshotMimetype?: string,
  ) {
    const year  = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count({
      where: { ticketRef: { startsWith: `TKT-${year}` } },
    });
    const ticketRef = `TKT-${year}-${String(count + 1).padStart(4, '0')}`;

    let systemInfoParsed: Record<string, string> | undefined;
    if (dto.systemInfo) {
      try { systemInfoParsed = JSON.parse(dto.systemInfo); } catch { /* ignore */ }
    }

    await this.prisma.supportTicket.create({
      data: {
        ticketRef,
        nom:          dto.nom,
        email:        dto.email,
        siteNom:      dto.siteNom,
        role:         dto.role,
        type:         dto.type as TicketType,
        sujet:        dto.sujet,
        description:  dto.description,
        systemInfo:   dto.systemInfo,
        hasScreenshot: !!screenshotBuffer,
      },
    });

    await this.mailer.sendSupportTicket({
      ticketRef,
      nom:         dto.nom,
      email:       dto.email,
      siteNom:     dto.siteNom,
      role:        dto.role,
      type:        dto.type as 'BUG' | 'SUGGESTION' | 'QUESTION' | 'CONFIG' | 'URGENCE',
      sujet:       dto.sujet,
      description: dto.description,
      systemInfo:  systemInfoParsed,
      screenshotBuffer,
      screenshotMimetype,
    });

    return {
      success: true,
      ticketId: ticketRef,
      message: 'Votre message a bien été reçu. Peter Akilimali vous répondra dans les meilleurs délais.',
    };
  }
}
```

- [ ] **Step 3 : Créer `backend/src/modules/support/support.controller.ts`**

```typescript
import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.AGENT)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('screenshot', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  }))
  createTicket(
    @Body() dto: CreateTicketDto,
    @UploadedFile() screenshot?: Express.Multer.File,
  ) {
    return this.supportService.createTicket(
      dto,
      screenshot?.buffer,
      screenshot?.mimetype,
    );
  }
}
```

- [ ] **Step 4 : Créer `backend/src/modules/support/support.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
```

- [ ] **Step 5 : Enregistrer SupportModule dans `backend/src/app.module.ts`**

Ajouter l'import en haut :
```typescript
import { SupportModule } from './modules/support/support.module';
```

Ajouter dans le tableau `imports` du `@Module` :
```typescript
SupportModule,
```

- [ ] **Step 6 : Vérifier que le backend compile**

```bash
cd backend
npm run build
```

Expected : `Successfully compiled`

- [ ] **Step 7 : Commit**

```bash
git add backend/src/modules/support/ backend/src/app.module.ts
git commit -m "feat(support): add SupportModule with ticket creation and email"
```

---

## Task 5 : Frontend — API client support

**Files:**
- Create: `frontend/src/lib/support.api.ts`

- [ ] **Step 1 : Créer `frontend/src/lib/support.api.ts`**

```typescript
import { api } from './api';

export interface TicketResponse {
  success: boolean;
  ticketId: string;
  message: string;
}

export interface CreateTicketPayload {
  nom: string;
  email: string;
  siteNom: string;
  role: string;
  type: 'BUG' | 'SUGGESTION' | 'QUESTION' | 'CONFIG' | 'URGENCE';
  sujet: string;
  description: string;
  systemInfo?: string;
  screenshot?: File;
}

export const supportApi = {
  createTicket: (payload: CreateTicketPayload) => {
    const form = new FormData();
    form.append('nom',         payload.nom);
    form.append('email',       payload.email);
    form.append('siteNom',     payload.siteNom);
    form.append('role',        payload.role);
    form.append('type',        payload.type);
    form.append('sujet',       payload.sujet);
    form.append('description', payload.description);
    if (payload.systemInfo) form.append('systemInfo', payload.systemInfo);
    if (payload.screenshot)  form.append('screenshot', payload.screenshot);
    return api.post<TicketResponse>('/support/ticket', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/src/lib/support.api.ts
git commit -m "feat(support): add support API client"
```

---

## Task 6 : Frontend — DeveloperCard

**Files:**
- Create: `frontend/src/components/support/DeveloperCard.tsx`

- [ ] **Step 1 : Créer `frontend/src/components/support/DeveloperCard.tsx`**

```tsx
import { Globe, Mail, MessageCircle, Linkedin, Github } from 'lucide-react';

function getAvailabilityStatus() {
  const gomaTime = new Date(Date.now() + 2 * 3600 * 1000);
  const hour = gomaTime.getUTCHours();
  const day  = gomaTime.getUTCDay(); // 0=dim, 6=sam
  if (day >= 1 && day <= 5 && hour >= 8 && hour < 18) {
    return { label: 'Probablement disponible', color: 'bg-green-500' };
  }
  if (day === 6 && hour >= 9 && hour < 13) {
    return { label: 'Disponibilité réduite', color: 'bg-amber-400' };
  }
  return { label: 'Hors disponibilité — réponse sous 24h', color: 'bg-red-400' };
}

export function DeveloperCard() {
  const status = getAvailabilityStatus();

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6 space-y-5">
      {/* Avatar + nom */}
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-white text-2xl font-extrabold select-none"
          style={{ background: '#1E3A5F' }}
          aria-hidden
        >
          PA
        </div>
        <div>
          <p className="text-[15px] font-bold text-primary">Peter Akilimali</p>
          <p className="text-[12px] text-text-muted">Développeur Full-Stack</p>
          <p className="text-[11px] text-text-subtle">Concepteur de TechShop Manager</p>
        </div>
        {/* Badge disponibilité */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${status.color}`} />
          <span className="text-[11px] text-text-muted">{status.label}</span>
        </div>
      </div>

      <hr className="border-border" />

      {/* Contacts */}
      <div className="space-y-2.5">
        <a
          href="https://peterakilimali.site"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[13px] text-text hover:text-primary-accent transition-colors"
        >
          <Globe size={15} className="text-text-muted flex-shrink-0" />
          peterakilimali.site
        </a>
        <a
          href="mailto:peter23xp@gmail.com"
          className="flex items-center gap-3 text-[13px] text-text hover:text-primary-accent transition-colors"
          title="Ouvrir votre client email"
        >
          <Mail size={15} className="text-text-muted flex-shrink-0" />
          peter23xp@gmail.com
        </a>
        <a
          href="https://wa.me/243902238740"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[13px] text-text hover:text-primary-accent transition-colors"
        >
          <MessageCircle size={15} className="flex-shrink-0" style={{ color: '#25D366' }} />
          +243 902 238 740
        </a>
        <a
          href="https://www.linkedin.com/in/peterakilimali"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[13px] text-text hover:text-primary-accent transition-colors"
        >
          <Linkedin size={15} className="flex-shrink-0" style={{ color: '#0A66C2' }} />
          @peterakilimali
        </a>
        <a
          href="https://github.com/peter23xp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[13px] text-text hover:text-primary-accent transition-colors"
        >
          <Github size={15} className="flex-shrink-0" style={{ color: '#181717' }} />
          peter23xp
        </a>
      </div>

      <hr className="border-border" />

      {/* Horaires */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
          ⏰ Disponibilité (heure locale RDC)
        </p>
        <p className="text-[12px] text-text">Lun – Ven : 8h00 – 18h00</p>
        <p className="text-[12px] text-text">Sam : 9h00 – 13h00</p>
        <p className="text-[11px] text-text-muted italic">Délai de réponse habituel : &lt; 24h</p>
      </div>

      <hr className="border-border" />

      {/* CTA */}
      <div className="flex gap-2">
        <a
          href="https://wa.me/243902238740"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#25D366' }}
        >
          <MessageCircle size={13} />
          WhatsApp
        </a>
        <a
          href="https://www.linkedin.com/in/peterakilimali"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#0A66C2' }}
        >
          <Linkedin size={13} />
          LinkedIn
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/src/components/support/DeveloperCard.tsx
git commit -m "feat(support): add DeveloperCard with contacts and availability status"
```

---

## Task 7 : Frontend — FaqAccordion

**Files:**
- Create: `frontend/src/components/support/FaqAccordion.tsx`

- [ ] **Step 1 : Créer `frontend/src/components/support/FaqAccordion.tsx`**

```tsx
import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

type FaqCategory = 'TOUS' | 'CONNEXION' | 'CLIENTS' | 'STOCKS' | 'VENTES' | 'TECHNIQUE';

interface FaqItem {
  id: string;
  categorie: Exclude<FaqCategory, 'TOUS'>;
  question: string;
  reponse: string;
}

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  TOUS: 'Tout', CONNEXION: 'Connexion', CLIENTS: 'Clients',
  STOCKS: 'Stocks', VENTES: 'Ventes', TECHNIQUE: 'Technique',
};

const CATEGORY_COLORS: Record<Exclude<FaqCategory, 'TOUS'>, string> = {
  CONNEXION: 'bg-blue-100 text-blue-700',
  CLIENTS:   'bg-violet-100 text-violet-700',
  STOCKS:    'bg-amber-100 text-amber-700',
  VENTES:    'bg-green-100 text-green-700',
  TECHNIQUE: 'bg-slate-100 text-slate-600',
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'c1', categorie: 'CONNEXION',
    question: "J'ai oublié mon mot de passe, comment le réinitialiser ?",
    reponse: "Depuis la page de connexion, cliquez sur Mot de passe oublié ?. Entrez votre numéro de téléphone enregistré. Vous recevrez un code OTP par SMS valable 10 minutes. Saisissez ce code puis définissez votre nouveau mot de passe. Si vous ne recevez pas le SMS, vérifiez que votre numéro est correct ou contactez votre Gérant de site.",
  },
  {
    id: 'c2', categorie: 'CONNEXION',
    question: "Mon compte est bloqué après plusieurs tentatives de connexion.",
    reponse: "Pour des raisons de sécurité, le compte est temporairement bloqué pendant 15 minutes après 5 tentatives incorrectes. Un compte à rebours s'affiche sur la page de connexion. Après expiration, vous pouvez réessayer normalement. Si le problème persiste, contactez votre Gérant ou l'administrateur.",
  },
  {
    id: 'c3', categorie: 'CONNEXION',
    question: "Je suis déconnecté automatiquement, est-ce normal ?",
    reponse: "Oui. La session expire après 8 heures d'inactivité pour des raisons de sécurité. Si vous avez coché « Se souvenir de moi » lors de la connexion, la session est prolongée à 30 jours et la reconnexion est automatique.",
  },
  {
    id: 'cl1', categorie: 'CLIENTS',
    question: "Comment enregistrer un nouveau client ?",
    reponse: "Depuis la liste des clients, cliquez sur + Nouveau Client. Le processus se fait en 4 étapes : 1. Récit — Informations personnelles + paiement. 2. Formation — Validation par un Formateur. 3. Fiche — Paiement de la fiche client. 4. Activation — Génération du code parrain + SMS de bienvenue. Un client ne peut effectuer d'achats qu'après l'étape 4.",
  },
  {
    id: 'cl2', categorie: 'CLIENTS',
    question: "Le numéro de téléphone que je veux saisir est déjà utilisé.",
    reponse: "Le numéro de téléphone est l'identifiant unique d'un client dans tout le système. Si ce numéro est déjà enregistré, une fiche client existe déjà. Cliquez sur le lien Voir la fiche qui apparaît sous le champ pour accéder directement à ce client.",
  },
  {
    id: 'cl3', categorie: 'CLIENTS',
    question: "Qu'est-ce que le code parrain et comment ça fonctionne ?",
    reponse: "Le code parrain (format TSG-XXXX) est généré automatiquement lors de l'activation d'un client (étape 4). Ce code est unique et permanent. Quand un nouveau client s'inscrit avec ce code, il devient le filleul de ce parrain. À l'activation du filleul, le parrain reçoit automatiquement une récompense configurée par l'administrateur.",
  },
  {
    id: 'cl4', categorie: 'CLIENTS',
    question: "Comment modifier le numéro de téléphone d'un client ?",
    reponse: "Le numéro de téléphone est non modifiable si le client a déjà effectué au moins une transaction. C'est une mesure de sécurité pour garantir la traçabilité des paiements. Si la modification est vraiment nécessaire, contactez l'administrateur système (Super Admin).",
  },
  {
    id: 's1', categorie: 'STOCKS',
    question: "Comment transférer du stock d'un site à un autre ?",
    reponse: "Depuis le module Stocks, cliquez sur ⇄ Transfert. Sélectionnez le site source, le site destinataire, le produit et la quantité. Après confirmation, le stock de votre site est immédiatement décrémenté. Le Gérant du site destinataire doit confirmer la réception pour que son stock soit mis à jour.",
  },
  {
    id: 's2', categorie: 'STOCKS',
    question: "Un produit affiche 0 en stock mais je suis sûr qu'il en reste.",
    reponse: "Vérifiez dans Stocks → Détail produit l'historique des mouvements récents. Si le stock système est incorrect, un Gérant peut corriger via Stocks → Inventaire physique : entrez la quantité réelle comptée, le système calculera et appliquera l'ajustement.",
  },
  {
    id: 's3', categorie: 'STOCKS',
    question: "Comment modifier le seuil d'alerte d'un produit ?",
    reponse: "Depuis la page Stocks, cliquez sur un produit pour accéder à sa fiche. Dans le tableau Stock par site, cliquez sur l'icône ⚙ à droite de votre site. Une fenêtre s'ouvre pour modifier le seuil. Une fois enregistré, les alertes se recalculent automatiquement.",
  },
  {
    id: 'v1', categorie: 'VENTES',
    question: "Comment annuler une vente enregistrée par erreur ?",
    reponse: "Depuis Ventes → Historique, retrouvez la vente et cliquez sur Initier un retour. Ce bouton est disponible pendant 7 jours après la vente. Sélectionnez les articles à retourner, le motif et le mode de remboursement. Le stock est automatiquement remis et les points de fidélité sont ajustés au prorata.",
  },
  {
    id: 'v2', categorie: 'VENTES',
    question: "L'application est hors-ligne, puis-je quand même enregistrer une vente ?",
    reponse: "Oui. TechShop Manager fonctionne sans connexion internet. En mode hors-ligne, les ventes sont enregistrées localement dans votre navigateur. Quand la connexion revient, la synchronisation se fait automatiquement en arrière-plan. Une bannière orange indique le mode hors-ligne.",
  },
  {
    id: 'v3', categorie: 'VENTES',
    question: "La remise fidélité ne s'applique pas à mon client.",
    reponse: "La remise s'applique quand : le client est sélectionné à la caisse (pas de vente anonyme), le client est au statut ACTIF (onboarding complété), et le client a un niveau ≥ Argent (Bronze = 0% de remise). Si ces conditions sont remplies, vérifiez la configuration dans Fidélité → Config.",
  },
  {
    id: 't1', categorie: 'TECHNIQUE',
    question: "L'application est lente ou ne répond plus.",
    reponse: "Essayez dans cet ordre : 1. Vider le cache : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac). 2. Vérifier la connexion internet. 3. Vider les données locales dans les Paramètres du navigateur. 4. Changer de navigateur (l'app est optimisée pour Chrome et Firefox). Si le problème persiste, utilisez le formulaire ci-dessus.",
  },
  {
    id: 't2', categorie: 'TECHNIQUE',
    question: "Comment imprimer un reçu depuis l'application ?",
    reponse: "Depuis Ventes → Détail d'une vente, cliquez sur Imprimer le reçu. La fenêtre d'impression s'ouvre. Sélectionnez votre imprimante thermique (58mm ou 80mm). Vous pouvez aussi envoyer le reçu par SMS en cliquant sur Partager par SMS.",
  },
  {
    id: 't3', categorie: 'TECHNIQUE',
    question: "Mes données ne sont pas à jour après avoir changé de site.",
    reponse: "Quand vous changez de site dans le sélecteur, les données se rechargent automatiquement. Si les données semblent encore anciennes, cliquez sur le bouton Actualiser (icône ⟳) ou appuyez sur F5. Le délai de mise à jour est de 2 minutes maximum.",
  },
];

export function FaqAccordion() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('TOUS');
  const [openId, setOpenId]   = useState<string | null>(null);
  const [search, setSearch]   = useState('');
  const debouncedSearch       = useDebounce(search, 200);

  const filtered = useMemo(() => {
    let items = FAQ_ITEMS;
    if (activeCategory !== 'TOUS') {
      items = items.filter((i) => i.categorie === activeCategory);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (i) => i.question.toLowerCase().includes(q) || i.reponse.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeCategory, debouncedSearch]);

  const categories: FaqCategory[] = ['TOUS', 'CONNEXION', 'CLIENTS', 'STOCKS', 'VENTES', 'TECHNIQUE'];

  return (
    <div className="bg-white rounded-xl border border-border shadow-card p-6 space-y-5">
      <div>
        <h2 className="text-[15px] font-bold text-primary">FAQ — Questions fréquentes</h2>
        <p className="text-[12px] text-text-muted mt-0.5">{FAQ_ITEMS.length} questions répondues</p>
      </div>

      {/* Recherche */}
      <input
        type="search"
        placeholder="Rechercher dans la FAQ…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-accent/30 focus:border-primary-accent transition"
      />

      {/* Filtres catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-full px-3 py-1 text-[12px] font-medium transition-colors',
              activeCategory === cat
                ? 'bg-primary-accent text-white'
                : 'bg-slate-100 text-text-muted hover:bg-slate-200',
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Accordéon */}
      {filtered.length === 0 ? (
        <p className="text-center text-[13px] text-text-muted py-8">
          Aucune question ne correspond à votre recherche.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="flex items-center justify-between w-full px-4 py-3 text-left bg-white hover:bg-slate-50 transition-colors"
                aria-expanded={openId === item.id}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                    CATEGORY_COLORS[item.categorie],
                  )}>
                    {CATEGORY_LABELS[item.categorie]}
                  </span>
                  <span className="text-[13px] font-medium text-text truncate">{item.question}</span>
                </div>
                <ChevronDown
                  size={15}
                  className={cn(
                    'flex-shrink-0 ml-2 text-text-muted transition-transform duration-200',
                    openId === item.id && 'rotate-180',
                  )}
                />
              </button>
              {openId === item.id && (
                <div className="px-4 pb-4 pt-1 text-[13px] text-text-muted leading-relaxed border-t border-border bg-slate-50/50">
                  {item.reponse}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/src/components/support/FaqAccordion.tsx
git commit -m "feat(support): add FaqAccordion with 16 questions and category filter"
```

---

## Task 8 : Frontend — SupportForm

**Files:**
- Create: `frontend/src/components/support/SupportForm.tsx`

- [ ] **Step 1 : Créer `frontend/src/components/support/SupportForm.tsx`**

```tsx
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertTriangle, CheckCircle, RefreshCw, X, Paperclip } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { supportApi } from '@/lib/support.api';
import { getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur', DIRECTEUR_REGIONAL: 'Directeur Régional',
  GERANT: 'Gérant', AGENT: 'Agent Commercial', FORMATEUR: 'Formateur', CLIENT: 'Client',
};

const TICKET_TYPES = [
  { value: 'BUG',        label: 'Signalement de bug',          emoji: '🐛' },
  { value: 'SUGGESTION', label: "Suggestion d'amélioration",   emoji: '💡' },
  { value: 'QUESTION',   label: "Question d'utilisation",      emoji: '❓' },
  { value: 'CONFIG',     label: 'Demande de configuration',    emoji: '🔧' },
  { value: 'URGENCE',    label: 'Urgence — Problème bloquant', emoji: '🚨' },
] as const;

const schema = z.object({
  nom:          z.string().min(2, 'Min 2 caractères').max(100),
  email:        z.string().email('Email invalide'),
  type:         z.enum(['BUG', 'SUGGESTION', 'QUESTION', 'CONFIG', 'URGENCE']),
  sujet:        z.string().min(5, 'Min 5 caractères').max(150),
  description:  z.string().min(20, 'Min 20 caractères').max(2000),
  includeSystem: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    const m = ua.match(/Chrome\/([\d]+)/);
    return m ? `Chrome ${m[1]}` : 'Chrome';
  }
  if (ua.includes('Firefox')) { const m = ua.match(/Firefox\/([\d]+)/); return m ? `Firefox ${m[1]}` : 'Firefox'; }
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Navigateur inconnu';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows NT 10')) return 'Windows 11/10';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Système inconnu';
}

interface SuccessState { ticketId: string; email: string; }

export function SupportForm() {
  const { user } = useAuthStore();
  const [screenshot, setScreenshot]     = useState<File | null>(null);
  const [screenshotPreview, setPreview] = useState<string | null>(null);
  const [success, setSuccess]           = useState<SuccessState | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom:           user?.name ?? '',
      email:         (user as any)?.email ?? '',
      type:          'BUG',
      sujet:         '',
      description:   '',
      includeSystem: true,
    },
  });

  const selectedType    = watch('type');
  const description     = watch('description');
  const includeSystem   = watch('includeSystem');
  const isUrgence       = selectedType === 'URGENCE';

  const systemInfo = {
    Navigateur:   detectBrowser(),
    'Système':    detectOS(),
    'Version app': import.meta.env.VITE_APP_VERSION ?? 'v1.0.0',
    Site:         user?.siteName ?? '—',
    Rôle:         user?.role ?? '—',
    Connexion:    navigator.onLine ? 'En ligne' : 'Hors-ligne',
    Résolution:   `${window.screen.width}×${window.screen.height}`,
    'Date/Heure': new Date().toLocaleString('fr-CD'),
    'Page':       window.location.pathname,
  };

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      supportApi.createTicket({
        nom:          values.nom,
        email:        values.email,
        siteNom:      user?.siteName ?? '—',
        role:         ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '—',
        type:         values.type,
        sujet:        values.sujet,
        description:  values.description,
        systemInfo:   values.includeSystem ? JSON.stringify(systemInfo) : undefined,
        screenshot:   screenshot ?? undefined,
      }),
    onSuccess: (res, values) => {
      setSuccess({ ticketId: res.data.ticketId, email: values.email });
    },
  });

  const handleFileChange = (file: File | null) => {
    setScreenshotError(null);
    if (!file) { setScreenshot(null); setPreview(null); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setScreenshotError('Format invalide. Acceptés : JPG, PNG, WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('Fichier trop grand. Max 5 MB');
      return;
    }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-card p-8 flex flex-col items-center text-center gap-5">
        <CheckCircle size={56} className="text-success" />
        <div>
          <h2 className="text-[18px] font-bold text-primary">Message envoyé !</h2>
          <p className="text-[13px] text-text-muted mt-1">
            Votre message a bien été reçu. Peter Akilimali vous répondra dans les meilleurs délais
            à l'adresse : <strong>{success.email}</strong>
          </p>
        </div>
        <div className="rounded-lg bg-primary-light border border-primary-accent/20 px-5 py-3">
          <p className="text-[11px] text-text-muted uppercase tracking-wide font-bold">Référence de votre ticket</p>
          <p className="text-[20px] font-extrabold font-mono text-primary-accent mt-0.5">{success.ticketId}</p>
        </div>
        <p className="text-[12px] text-text-muted">
          En attendant, vous pouvez aussi contacter Peter directement via WhatsApp ou LinkedIn.
        </p>
        <div className="flex gap-3">
          <a href="/dashboard" className="btn-secondary text-[13px]">← Retour à l'accueil</a>
          <button
            type="button"
            className="btn-primary text-[13px]"
            onClick={() => { setSuccess(null); reset(); setScreenshot(null); setPreview(null); }}
          >
            Envoyer un autre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-card">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
          <Send size={15} className="text-primary-accent" />
        </div>
        <h2 className="font-bold text-primary">Envoyer un message</h2>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-5" noValidate>

        {/* Nom + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="sf-nom">Votre nom *</label>
            <input id="sf-nom" {...register('nom')} />
            {errors.nom && <p className="form-error">{errors.nom.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sf-email">Votre email *</label>
            <input id="sf-email" type="email" {...register('email')} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
        </div>

        {/* Site + Rôle (readonly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Votre site</label>
            <input value={user?.siteName ?? '—'} disabled className="opacity-60 cursor-not-allowed bg-slate-50" readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Votre rôle</label>
            <input value={ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '—'} disabled className="opacity-60 cursor-not-allowed bg-slate-50" readOnly />
          </div>
        </div>

        {/* Type de demande */}
        <div className="form-group">
          <p className="form-label">Type de demande *</p>
          <div className="space-y-2 mt-1">
            {TICKET_TYPES.map((t) => (
              <label key={t.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value={t.value}
                  {...register('type')}
                  className="accent-primary-accent"
                />
                <span className="text-[13px]">{t.emoji} {t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Alerte urgence */}
        {isUrgence && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-warning font-medium">
              Pour les urgences bloquantes, contactez directement Peter via WhatsApp au
              <a href="https://wa.me/243902238740" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                +243 902 238 740
              </a>{' '}pour une réponse immédiate.
            </p>
          </div>
        )}

        {/* Sujet */}
        <div className="form-group">
          <label className="form-label" htmlFor="sf-sujet">Sujet *</label>
          <input id="sf-sujet" {...register('sujet')} placeholder="Décrivez brièvement le problème" maxLength={150} />
          {errors.sujet && <p className="form-error">{errors.sujet.message}</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <div className="flex items-center justify-between">
            <label className="form-label" htmlFor="sf-description">Description *</label>
            <span className={cn('text-[11px]', description.length > 1900 ? 'text-danger' : 'text-text-subtle')}>
              {description.length} / 2000
            </span>
          </div>
          <textarea
            id="sf-description"
            rows={5}
            maxLength={2000}
            placeholder="Décrivez votre problème en détail. Indiquez les étapes pour reproduire le problème."
            className="resize-y"
            {...register('description')}
          />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        {/* Screenshot */}
        <div className="form-group">
          <p className="form-label">Capture d'écran <span className="text-text-subtle font-normal">(optionnel)</span></p>
          {screenshotPreview ? (
            <div className="flex items-center gap-3">
              <img src={screenshotPreview} alt="Aperçu" className="h-20 w-20 rounded-lg object-cover border border-border" />
              <button
                type="button"
                onClick={() => { setScreenshot(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="flex items-center gap-1 text-[12px] text-danger hover:underline"
              >
                <X size={13} /> Supprimer
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary-accent hover:bg-primary-light/20 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0] ?? null); }}
            >
              <Paperclip size={20} className="text-text-muted" />
              <p className="text-[12px] text-text-muted">Cliquer ou glisser une image ici</p>
              <p className="text-[11px] text-text-subtle">Max 5 MB — JPG, PNG, WebP</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {screenshotError && <p className="form-error">{screenshotError}</p>}
        </div>

        {/* Infos système */}
        <div className="form-group">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('includeSystem')} className="accent-primary-accent" />
            <span className="text-[13px] font-medium text-text">Inclure les informations système <span className="text-text-muted font-normal">(recommandé)</span></span>
          </label>
          {includeSystem && (
            <div className="mt-2 rounded-lg bg-slate-50 border border-border px-4 py-3 space-y-1">
              {Object.entries(systemInfo).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[11px]">
                  <span className="text-text-muted w-28 flex-shrink-0">{k}</span>
                  <span className="text-text font-mono">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Erreur API */}
        {mutation.isError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3" role="alert">
            <AlertTriangle size={14} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-danger">{getErrorMessage(mutation.error)}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className={cn('btn-primary w-full text-[14px] py-3 flex items-center justify-center gap-2', isUrgence && 'bg-danger border-danger hover:bg-red-700')}
        >
          {mutation.isPending
            ? <><RefreshCw size={15} className="animate-spin" /> Envoi en cours…</>
            : isUrgence ? '🚨 ENVOYER EN URGENCE' : <><Send size={15} /> Envoyer le message</>
          }
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/src/components/support/SupportForm.tsx
git commit -m "feat(support): add SupportForm with validation, screenshot upload and system info"
```

---

## Task 9 : Frontend — SupportPage

**Files:**
- Create: `frontend/src/pages/support/SupportPage.tsx`

- [ ] **Step 1 : Créer `frontend/src/pages/support/SupportPage.tsx`**

```tsx
import { HelpCircle } from 'lucide-react';
import { SupportForm } from '@/components/support/SupportForm';
import { DeveloperCard } from '@/components/support/DeveloperCard';
import { FaqAccordion } from '@/components/support/FaqAccordion';

export default function SupportPage() {
  return (
    <div className="space-y-8 animate-fade-up">

      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light" aria-hidden>
          <HelpCircle size={20} className="text-primary-accent" />
        </div>
        <div>
          <h1 className="text-page-title text-primary">Support technique</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Besoin d'aide ? Contactez le développeur de TechShop Manager.
          </p>
        </div>
      </div>

      {/* Grille principale : formulaire + card développeur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card développeur en premier sur mobile */}
        <div className="md:hidden">
          <DeveloperCard />
        </div>

        {/* Formulaire — col-span-2 */}
        <div className="md:col-span-2">
          <SupportForm />
        </div>

        {/* Card développeur — col-span-1 (desktop seulement) */}
        <div className="hidden md:block">
          <DeveloperCard />
        </div>
      </div>

      {/* FAQ — pleine largeur */}
      <FaqAccordion />
    </div>
  );
}
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/src/pages/support/SupportPage.tsx
git commit -m "feat(support): add SupportPage orchestrating form, developer card and FAQ"
```

---

## Task 10 : Frontend — Navigation (AppLayout + Route)

**Files:**
- Modify: `frontend/src/components/layout/AppLayout.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1 : Ajouter HelpCircle dans les imports de `AppLayout.tsx`**

Localiser la ligne d'import lucide-react (ligne 4 environ) et ajouter `HelpCircle` :

```typescript
import {
  LayoutDashboard, Users, ShoppingCart, Receipt, Package,
  GitBranch, Star, BarChart2, Settings, User, Building2,
  SlidersHorizontal, UserCog, LogOut, ChevronDown, Menu,
  X, Zap, Clock, CreditCard, RotateCcw, HelpCircle,
} from 'lucide-react';
```

- [ ] **Step 2 : Ajouter le lien Support dans la Sidebar de `AppLayout.tsx`**

Après le bloc `{showSettings && ...}` (fin du `<nav>`), avant la fermeture de `</nav>`, ajouter :

```tsx
{/* Support */}
<NavSection label="Aide" />
<div className="space-y-0.5 px-2 pb-2">
  <NavLink
    to="/support"
    onClick={onClose}
    data-tutorial="sidebar-nav-support"
    className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
  >
    <span className="sidebar-icon"><HelpCircle size={16} /></span>
    <span>Support technique</span>
  </NavLink>
</div>
```

- [ ] **Step 3 : Ajouter le lien Support dans le Header de `AppLayout.tsx`**

Dans la fonction `Header`, remplacer le bouton de déconnexion existant par un groupe avec le lien support :

Localiser le `<div className="flex items-center gap-3 flex-shrink-0">` du côté droit du header et ajouter le bouton support juste avant le bouton déconnexion :

```tsx
<button
  type="button"
  onClick={() => navigate('/support')}
  className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[13px]
             font-medium text-text-muted hover:border-primary-accent hover:text-primary-accent
             hover:bg-primary-light transition-colors duration-150
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent"
  title="Support technique"
>
  <HelpCircle size={14} aria-hidden />
  <span className="hidden lg:inline">Support</span>
</button>
```

- [ ] **Step 4 : Ajouter la route /support dans `frontend/src/App.tsx`**

Ajouter l'import lazy en haut avec les autres imports de pages :

```typescript
const SupportPage = lazy(() => import('@/pages/support/SupportPage'));
```

Ajouter la route dans le bloc des routes App (après `settings/general`) :

```tsx
{/* Support */}
<Route path="support" element={<SupportPage />} />
```

- [ ] **Step 5 : Vérifier que le frontend compile**

```bash
cd frontend
npm run build
```

Expected : `✓ built in Xs`

- [ ] **Step 6 : Commit**

```bash
git add frontend/src/components/layout/AppLayout.tsx frontend/src/App.tsx
git commit -m "feat(support): add /support route and navigation links in sidebar and header"
```

---

## Task 11 : Vérification end-to-end

- [ ] **Step 1 : Démarrer le backend**

```bash
cd backend
npm run start:dev
```

Expected : `Application is running on: http://localhost:3000`

- [ ] **Step 2 : Démarrer le frontend**

```bash
cd frontend
npm run dev
```

Expected : `Local: http://localhost:5173`

- [ ] **Step 3 : Vérifier la navigation**

- Ouvrir `http://localhost:5173` et se connecter avec `+243902238740` / `Admin@2025`
- Vérifier que le lien "Support technique" apparaît dans la Sidebar (section "Aide")
- Vérifier que le bouton "Support" apparaît dans le Header (desktop)
- Naviguer vers `/support`

- [ ] **Step 4 : Vérifier le rendu de la page**

- La card développeur est visible avec tous les liens (WhatsApp, LinkedIn, GitHub, email, site web)
- Le badge de disponibilité s'affiche (vert/jaune/rouge selon l'heure)
- La FAQ affiche 16 questions avec les filtres par catégorie
- Le formulaire est pré-rempli avec le nom et l'email de l'utilisateur connecté
- Les champs Site et Rôle sont disabled

- [ ] **Step 5 : Tester le formulaire**

- Sélectionner le type "Urgence" → vérifier l'alerte orange et le texte du bouton "🚨 ENVOYER EN URGENCE"
- Saisir un sujet + description (min 20 chars)
- Cocher la checkbox "Inclure les infos système" → vérifier l'affichage des infos
- Joindre une image PNG → vérifier l'aperçu thumbnail
- Soumettre → vérifier l'écran de confirmation avec le ticketRef (TKT-2025-0001)

- [ ] **Step 6 : Vérifier en base**

```bash
cd backend
npx prisma studio
```

Vérifier que la table `support_tickets` contient le ticket créé.

- [ ] **Step 7 : Commit final**

```bash
git add -A
git commit -m "feat(support): complete support page implementation"
```
