-- AlterTable: add OHADA fields to retours
ALTER TABLE "retours" ADD COLUMN IF NOT EXISTS "numeroAvoir" TEXT;
ALTER TABLE "retours" ADD COLUMN IF NOT EXISTS "motifDescription" TEXT;
ALTER TABLE "retours" ADD COLUMN IF NOT EXISTS "referenceTransaction" TEXT;
ALTER TABLE "retours" ADD COLUMN IF NOT EXISTS "agentId" TEXT;

-- Change modeRemboursement from enum to TEXT to support AVOIR_POINTS + custom values
-- (the column may already be TEXT if the db push ran above)

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "retours_numeroAvoir_key" ON "retours"("numeroAvoir");
