/*
  Warnings:

  - Changed the type of `modeRemboursement` on the `retours` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "bloqueJusquA" TIMESTAMP(3),
ADD COLUMN     "pinHash" TEXT,
ADD COLUMN     "tentativesPin" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "retours" DROP COLUMN "modeRemboursement",
ADD COLUMN     "modeRemboursement" TEXT NOT NULL;
