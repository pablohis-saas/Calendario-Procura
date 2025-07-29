/*
  Warnings:

  - You are about to drop the column `cobroId` on the `cobro_conceptos` table. All the data in the column will be lost.
  - You are about to drop the column `consultorioId` on the `cobro_conceptos` table. All the data in the column will be lost.
  - You are about to drop the column `nombreConcepto` on the `cobro_conceptos` table. All the data in the column will be lost.
  - You are about to drop the column `precioUnitario` on the `cobro_conceptos` table. All the data in the column will be lost.
  - You are about to drop the column `pacienteId` on the `cobros` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `cobros` table. All the data in the column will be lost.
  - You are about to drop the column `cobroId` on the `historial_cobros` table. All the data in the column will be lost.
  - You are about to drop the column `detallesAntes` on the `historial_cobros` table. All the data in the column will be lost.
  - You are about to drop the column `detallesDespues` on the `historial_cobros` table. All the data in the column will be lost.
  - You are about to drop the column `tipoCambio` on the `historial_cobros` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `historial_cobros` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `historial_cobros` table. All the data in the column will be lost.
  - You are about to drop the column `consultorioId` on the `precios_consultorio` table. All the data in the column will be lost.
  - You are about to drop the column `nombreConcepto` on the `precios_consultorio` table. All the data in the column will be lost.
  - You are about to drop the column `precioUnitario` on the `precios_consultorio` table. All the data in the column will be lost.
  - Added the required column `cobro_id` to the `cobro_conceptos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultorio_id` to the `cobro_conceptos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_concepto` to the `cobro_conceptos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_unitario` to the `cobro_conceptos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paciente_id` to the `cobros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `cobros` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `cobros` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `metodo_pago` on the `cobros` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `cobro_id` to the `historial_cobros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detalles_despues` to the `historial_cobros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_cambio` to the `historial_cobros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `historial_cobros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellido` to the `pacientes` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `pacientes` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `concepto` to the `precios_consultorio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultorio_id` to the `precios_consultorio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio` to the `precios_consultorio` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rol` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCobro" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "cobro_conceptos" DROP CONSTRAINT "cobro_conceptos_cobroId_fkey";

-- DropForeignKey
ALTER TABLE "cobro_conceptos" DROP CONSTRAINT "cobro_conceptos_consultorioId_fkey";

-- DropForeignKey
ALTER TABLE "cobros" DROP CONSTRAINT "cobros_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "cobros" DROP CONSTRAINT "cobros_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "historial_cobros" DROP CONSTRAINT "historial_cobros_cobroId_fkey";

-- DropForeignKey
ALTER TABLE "historial_cobros" DROP CONSTRAINT "historial_cobros_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "precios_consultorio" DROP CONSTRAINT "precios_consultorio_consultorioId_fkey";

-- AlterTable
ALTER TABLE "cobro_conceptos" DROP COLUMN "cobroId",
DROP COLUMN "consultorioId",
DROP COLUMN "nombreConcepto",
DROP COLUMN "precioUnitario",
ADD COLUMN     "cobro_id" TEXT NOT NULL,
ADD COLUMN     "consultorio_id" TEXT NOT NULL,
ADD COLUMN     "nombre_concepto" TEXT NOT NULL,
ADD COLUMN     "precio_unitario" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "cobros" DROP COLUMN "pacienteId",
DROP COLUMN "usuarioId",
ADD COLUMN     "paciente_id" TEXT NOT NULL,
ADD COLUMN     "usuario_id" TEXT NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoCobro" NOT NULL,
DROP COLUMN "metodo_pago",
ADD COLUMN     "metodo_pago" "MetodoPago" NOT NULL;

-- AlterTable
ALTER TABLE "historial_cobros" DROP COLUMN "cobroId",
DROP COLUMN "detallesAntes",
DROP COLUMN "detallesDespues",
DROP COLUMN "tipoCambio",
DROP COLUMN "updated_at",
DROP COLUMN "usuarioId",
ADD COLUMN     "cobro_id" TEXT NOT NULL,
ADD COLUMN     "detalles_antes" JSONB,
ADD COLUMN     "detalles_despues" JSONB NOT NULL,
ADD COLUMN     "tipo_cambio" "TipoCambio" NOT NULL,
ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pacientes" ADD COLUMN     "apellido" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "documento_identidad" DROP NOT NULL;

-- AlterTable
ALTER TABLE "precios_consultorio" DROP COLUMN "consultorioId",
DROP COLUMN "nombreConcepto",
DROP COLUMN "precioUnitario",
ADD COLUMN     "concepto" TEXT NOT NULL,
ADD COLUMN     "consultorio_id" TEXT NOT NULL,
ADD COLUMN     "precio" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "rol",
ADD COLUMN     "rol" "Rol" NOT NULL;

-- DropEnum
DROP TYPE "FormaPago";

-- DropEnum
DROP TYPE "TipoCobro";

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_base" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "precios_consultorio" ADD CONSTRAINT "precios_consultorio_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobro_conceptos" ADD CONSTRAINT "cobro_conceptos_cobro_id_fkey" FOREIGN KEY ("cobro_id") REFERENCES "cobros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobro_conceptos" ADD CONSTRAINT "cobro_conceptos_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cobros" ADD CONSTRAINT "historial_cobros_cobro_id_fkey" FOREIGN KEY ("cobro_id") REFERENCES "cobros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cobros" ADD CONSTRAINT "historial_cobros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
