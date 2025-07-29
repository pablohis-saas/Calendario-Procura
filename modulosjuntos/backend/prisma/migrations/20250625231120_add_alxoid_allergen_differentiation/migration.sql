-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AlxoidType') THEN
    CREATE TYPE "AlxoidType" AS ENUM ('A', 'B');
  END IF;
END$$;

-- AlterTable
ALTER TABLE "Allergen" ADD COLUMN     "alxoidType" "AlxoidType",
ADD COLUMN     "isAlxoidExclusive" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Allergen_alxoidType_idx" ON "Allergen"("alxoidType");

-- CreateIndex
CREATE INDEX "Allergen_isAlxoidExclusive_idx" ON "Allergen"("isAlxoidExclusive");
