/*
  Warnings:

  - You are about to drop the column `nombre_concepto` on the `cobro_conceptos` table. All the data in the column will be lost.
  - Added the required column `servicio_id` to the `cobro_conceptos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cobro_conceptos" DROP COLUMN "nombre_concepto",
ADD COLUMN     "servicio_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "cobro_conceptos" ADD CONSTRAINT "cobro_conceptos_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
