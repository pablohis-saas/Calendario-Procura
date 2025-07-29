-- CreateEnum
CREATE TYPE "TipoTratamiento" AS ENUM ('INMUNOTERAPIA', 'PRUEBAS', 'GAMMAGLOBULINA', 'VACUNAS_PEDIATRICAS', 'MEDICAMENTOS_EXTRAS', 'CONSULTA');

-- CreateTable
CREATE TABLE "InventoryUsage" (
    "id" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "tipoTratamiento" "TipoTratamiento" NOT NULL,
    "observaciones" TEXT,
    "tuvoReaccion" BOOLEAN NOT NULL,
    "descripcionReaccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryUsageDetail" (
    "id" TEXT NOT NULL,
    "usageId" TEXT NOT NULL,
    "subtipo" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "frasco" TEXT,
    "alergenos" TEXT[],

    CONSTRAINT "InventoryUsageDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InventoryUsageDetail" ADD CONSTRAINT "InventoryUsageDetail_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "InventoryUsage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
