-- Add pacienteId column to InventoryUsage
ALTER TABLE "InventoryUsage"
ADD COLUMN "pacienteId" TEXT NULL;

-- Add foreign key constraint
ALTER TABLE "InventoryUsage"
ADD CONSTRAINT "InventoryUsage_pacienteId_fkey"
  FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for pacienteId
CREATE INDEX "InventoryUsage_pacienteId_idx" ON "InventoryUsage"("pacienteId"); 