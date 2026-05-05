# Page Support Technique — Spec Design
Date : 2026-05-05 | Projet : TechShop Manager

## Décisions clés
- Accordéon FAQ : Tailwind pur + useState (pas shadcn)
- Rate limiting : @Throttle NestJS (pas Redis)
- Email : nodemailer seul (pas @nestjs-modules/mailer)
- ticketId : séquence Prisma count() → TKT-YYYY-XXXX

## Fichiers
### Frontend
- `frontend/src/pages/support/SupportPage.tsx`
- `frontend/src/components/support/SupportForm.tsx`
- `frontend/src/components/support/FaqAccordion.tsx`
- `frontend/src/components/support/DeveloperCard.tsx`
- `frontend/src/lib/support.api.ts`
- `frontend/src/App.tsx` (route /support)
- `frontend/src/components/layout/AppLayout.tsx` (Sidebar + Header)

### Backend
- `backend/src/modules/support/support.module.ts`
- `backend/src/modules/support/support.controller.ts`
- `backend/src/modules/support/support.service.ts`
- `backend/src/modules/support/dto/ticket.dto.ts`
- `backend/src/modules/mailer/mailer.service.ts`
- `backend/src/modules/mailer/mailer.module.ts`
- `backend/src/app.module.ts` (import SupportModule)
- `backend/prisma/schema.prisma` (modèle SupportTicket)

## Modèle Prisma
```prisma
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
enum TicketType { BUG SUGGESTION QUESTION CONFIG URGENCE }
```

## API
POST /api/v1/support/ticket — multipart/form-data — JwtAuthGuard — @Throttle(3, 60)
