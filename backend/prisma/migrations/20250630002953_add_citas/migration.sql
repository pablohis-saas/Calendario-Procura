/*
  Warnings:

  - The values [EN_PROGRESO] on the enum `EstadoCita` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `duracion` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_cita` on the `citas` table. All the data in the column will be lost.
  - Added the required column `fecha_fin` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_inicio` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Made the column `consultorio_id` on table `citas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoCita_new" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO');
ALTER TABLE "citas" ALTER COLUMN "estado" TYPE "EstadoCita_new" USING ("estado"::text::"EstadoCita_new");
ALTER TYPE "EstadoCita" RENAME TO "EstadoCita_old";
ALTER TYPE "EstadoCita_new" RENAME TO "EstadoCita";
DROP TYPE "EstadoCita_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_consultorio_id_fkey";

-- AlterTable
ALTER TABLE "citas" DROP COLUMN "duracion",
DROP COLUMN "fecha_hora",
DROP COLUMN "tipo_cita",
ADD COLUMN     "color" TEXT DEFAULT '#3B82F6',
ADD COLUMN     "fecha_fin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fecha_inicio" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "consultorio_id" SET NOT NULL;

-- DropEnum
DROP TYPE "TipoCita";

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
