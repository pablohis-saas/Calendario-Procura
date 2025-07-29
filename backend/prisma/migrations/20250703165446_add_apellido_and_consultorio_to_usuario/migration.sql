/*
  Warnings:

  - Added the required column `apellido` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultorio_id` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AlxoidType" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'COMPLEX');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('ML', 'PIECE');

-- CreateEnum
CREATE TYPE "TipoTratamiento" AS ENUM ('INMUNOTERAPIA', 'PRUEBAS', 'GAMMAGLOBULINA', 'VACUNAS_PEDIATRICAS', 'MEDICAMENTOS_EXTRAS', 'CONSULTA');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'NURSE', 'SECRETARY');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "consultorio_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Allergen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alxoidType" "AlxoidType",
    "isAlxoidExclusive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryUsage" (
    "id" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "tipoTratamiento" "TipoTratamiento" NOT NULL,
    "observaciones" TEXT,
    "tuvoReaccion" BOOLEAN NOT NULL,
    "descripcionReaccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sedeId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InventoryUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryUsageDetail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doses" INTEGER,
    "frascoLevel" INTEGER,
    "inventoryUsageId" TEXT NOT NULL,
    "movementId" TEXT,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "units" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryUsageDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "unit" "ProductUnit" NOT NULL,
    "description" TEXT,
    "costPerUnit" DECIMAL(10,2) NOT NULL,
    "minStockLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAllergen" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "mlPerDose" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductExpiration" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductExpiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sede" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBySede" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockBySede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "amountSupplied" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "sedeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Allergen_alxoidType_idx" ON "Allergen"("alxoidType");

-- CreateIndex
CREATE INDEX "Allergen_isAlxoidExclusive_idx" ON "Allergen"("isAlxoidExclusive");

-- CreateIndex
CREATE INDEX "Allergen_name_idx" ON "Allergen"("name");

-- CreateIndex
CREATE INDEX "InventoryUsage_sedeId_idx" ON "InventoryUsage"("sedeId");

-- CreateIndex
CREATE INDEX "InventoryUsage_userId_idx" ON "InventoryUsage"("userId");

-- CreateIndex
CREATE INDEX "InventoryUsageDetail_inventoryUsageId_idx" ON "InventoryUsageDetail"("inventoryUsageId");

-- CreateIndex
CREATE INDEX "InventoryUsageDetail_movementId_idx" ON "InventoryUsageDetail"("movementId");

-- CreateIndex
CREATE INDEX "InventoryUsageDetail_productId_idx" ON "InventoryUsageDetail"("productId");

-- CreateIndex
CREATE INDEX "Movement_batchNumber_idx" ON "Movement"("batchNumber");

-- CreateIndex
CREATE INDEX "Movement_createdAt_idx" ON "Movement"("createdAt");

-- CreateIndex
CREATE INDEX "Movement_expiryDate_idx" ON "Movement"("expiryDate");

-- CreateIndex
CREATE INDEX "Movement_productId_idx" ON "Movement"("productId");

-- CreateIndex
CREATE INDEX "Movement_sedeId_idx" ON "Movement"("sedeId");

-- CreateIndex
CREATE INDEX "Movement_userId_idx" ON "Movement"("userId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "ProductAllergen_allergenId_idx" ON "ProductAllergen"("allergenId");

-- CreateIndex
CREATE INDEX "ProductAllergen_productId_idx" ON "ProductAllergen"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAllergen_productId_allergenId_key" ON "ProductAllergen"("productId", "allergenId");

-- CreateIndex
CREATE INDEX "ProductExpiration_batchNumber_idx" ON "ProductExpiration"("batchNumber");

-- CreateIndex
CREATE INDEX "ProductExpiration_expiryDate_idx" ON "ProductExpiration"("expiryDate");

-- CreateIndex
CREATE INDEX "ProductExpiration_productId_idx" ON "ProductExpiration"("productId");

-- CreateIndex
CREATE INDEX "ProductExpiration_sedeId_idx" ON "ProductExpiration"("sedeId");

-- CreateIndex
CREATE INDEX "StockBySede_productId_idx" ON "StockBySede"("productId");

-- CreateIndex
CREATE INDEX "StockBySede_sedeId_idx" ON "StockBySede"("sedeId");

-- CreateIndex
CREATE UNIQUE INDEX "StockBySede_productId_sedeId_key" ON "StockBySede"("productId", "sedeId");

-- CreateIndex
CREATE INDEX "Supplier_invoiceNumber_idx" ON "Supplier"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_sedeId_idx" ON "User"("sedeId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUsage" ADD CONSTRAINT "InventoryUsage_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUsage" ADD CONSTRAINT "InventoryUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUsageDetail" ADD CONSTRAINT "InventoryUsageDetail_inventoryUsageId_fkey" FOREIGN KEY ("inventoryUsageId") REFERENCES "InventoryUsage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUsageDetail" ADD CONSTRAINT "InventoryUsageDetail_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUsageDetail" ADD CONSTRAINT "InventoryUsageDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAllergen" ADD CONSTRAINT "ProductAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "Allergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAllergen" ADD CONSTRAINT "ProductAllergen_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductExpiration" ADD CONSTRAINT "ProductExpiration_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductExpiration" ADD CONSTRAINT "ProductExpiration_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBySede" ADD CONSTRAINT "StockBySede_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBySede" ADD CONSTRAINT "StockBySede_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
