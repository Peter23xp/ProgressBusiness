-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('BUG', 'SUGGESTION', 'QUESTION', 'CONFIG', 'URGENCE');

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketRef" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "siteNom" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "sujet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "systemInfo" TEXT,
    "hasScreenshot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketRef_key" ON "support_tickets"("ticketRef");
