/*
  Warnings:

  - You are about to drop the column `alergenos` on the `InventoryUsageDetail` table. All the data in the column will be lost.
  - You are about to drop the column `cantidad` on the `InventoryUsageDetail` table. All the data in the column will be lost.
  - You are about to drop the column `frasco` on the `InventoryUsageDetail` table. All the data in the column will be lost.
  - You are about to drop the column `nombreProducto` on the `InventoryUsageDetail` table. All the data in the column will be lost.
  - You are about to drop the column `subtipo` on the `InventoryUsageDetail` table. All the data in the column will be lost.
  - You are about to drop the column `usageId` on the `InventoryUsageDetail` table. All the data in the column will be lost.
  - Added the required column `sedeId` to the `InventoryUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InventoryUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `InventoryUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryUsageId` to the `InventoryUsageDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `InventoryUsageDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `InventoryUsageDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `InventoryUsageDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCost` to the `InventoryUsageDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InventoryUsageDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryUsageDetail" DROP CONSTRAINT "InventoryUsageDetail_usageId_fkey";

-- AlterTable
ALTER TABLE "InventoryUsage" ADD COLUMN     "sedeId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InventoryUsageDetail" DROP COLUMN "alergenos",
DROP COLUMN "cantidad",
DROP COLUMN "frasco",
DROP COLUMN "nombreProducto",
DROP COLUMN "subtipo",
DROP COLUMN "usageId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doses" INTEGER,
ADD COLUMN     "frascoLevel" INTEGER,
ADD COLUMN     "inventoryUsageId" TEXT NOT NULL,
ADD COLUMN     "movementId" TEXT,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "quantity" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalCost" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "unitCost" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "units" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

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
