-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PROGRAMADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO');

-- CreateEnum
CREATE TYPE "TipoCita" AS ENUM ('CONSULTA_INICIAL', 'CONSULTA_SEGUIMIENTO', 'PROCEDIMIENTO', 'URGENCIA', 'OTRO');

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "duracion" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoCita" NOT NULL,
    "tipo_cita" "TipoCita" NOT NULL,
    "paciente_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "consultorio_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
