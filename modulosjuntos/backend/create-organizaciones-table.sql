-- Script para crear tabla organizaciones y agregar campos organizacion_id
-- Ejecutar con cuidado para no perder datos

-- 1. Crear tabla organizaciones
CREATE TABLE IF NOT EXISTS organizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(20),
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  color_primario VARCHAR(7) DEFAULT '#3B82F6',
  color_secundario VARCHAR(7) DEFAULT '#1F2937',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear organización por defecto
INSERT INTO organizaciones (nombre, email, telefono) 
VALUES ('Organización por Defecto', 'default@procura.com', '000-000-0000')
ON CONFLICT DO NOTHING;

-- 3. Agregar columna organizacion_id a usuarios (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'organizacion_id') THEN
    ALTER TABLE usuarios ADD COLUMN organizacion_id UUID;
  END IF;
END $$;

-- 4. Agregar columna organizacion_id a consultorios (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultorios' AND column_name = 'organizacion_id') THEN
    ALTER TABLE consultorios ADD COLUMN organizacion_id UUID;
  END IF;
END $$;

-- 5. Agregar columna organizacion_id a pacientes (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'organizacion_id') THEN
    ALTER TABLE pacientes ADD COLUMN organizacion_id UUID;
  END IF;
END $$;

-- 6. Agregar columna organizacion_id a servicios (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicios' AND column_name = 'organizacion_id') THEN
    ALTER TABLE servicios ADD COLUMN organizacion_id UUID;
  END IF;
END $$;

-- 7. Asignar organización por defecto a datos existentes
UPDATE usuarios 
SET organizacion_id = (SELECT id FROM organizaciones WHERE nombre = 'Organización por Defecto' LIMIT 1)
WHERE organizacion_id IS NULL;

UPDATE consultorios 
SET organizacion_id = (SELECT id FROM organizaciones WHERE nombre = 'Organización por Defecto' LIMIT 1)
WHERE organizacion_id IS NULL;

UPDATE pacientes 
SET organizacion_id = (SELECT id FROM organizaciones WHERE nombre = 'Organización por Defecto' LIMIT 1)
WHERE organizacion_id IS NULL;

UPDATE servicios 
SET organizacion_id = (SELECT id FROM organizaciones WHERE nombre = 'Organización por Defecto' LIMIT 1)
WHERE organizacion_id IS NULL;

-- 8. Hacer las columnas organizacion_id NOT NULL después de asignar valores
ALTER TABLE usuarios ALTER COLUMN organizacion_id SET NOT NULL;
ALTER TABLE consultorios ALTER COLUMN organizacion_id SET NOT NULL;
ALTER TABLE pacientes ALTER COLUMN organizacion_id SET NOT NULL;
ALTER TABLE servicios ALTER COLUMN organizacion_id SET NOT NULL;

-- 9. Agregar foreign keys
ALTER TABLE usuarios 
ADD CONSTRAINT fk_usuarios_organizacion 
FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id);

ALTER TABLE consultorios 
ADD CONSTRAINT fk_consultorios_organizacion 
FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id);

ALTER TABLE pacientes 
ADD CONSTRAINT fk_pacientes_organizacion 
FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id);

ALTER TABLE servicios 
ADD CONSTRAINT fk_servicios_organizacion 
FOREIGN KEY (organizacion_id) REFERENCES organizaciones(id);

-- 10. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion_id ON usuarios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_consultorios_organizacion_id ON consultorios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_organizacion_id ON pacientes(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_servicios_organizacion_id ON servicios(organizacion_id);

-- 11. Crear índices compuestos para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_pacientes_org_nombre ON pacientes(organizacion_id, nombre);
CREATE INDEX IF NOT EXISTS idx_usuarios_org_email ON usuarios(organizacion_id, email);
CREATE INDEX IF NOT EXISTS idx_servicios_org_nombre ON servicios(organizacion_id, nombre);

-- 12. Agregar constraints únicos por organización
ALTER TABLE usuarios 
ADD CONSTRAINT unique_usuario_email_organizacion 
UNIQUE (email, organizacion_id);

ALTER TABLE pacientes 
ADD CONSTRAINT unique_paciente_email_organizacion 
UNIQUE (email, organizacion_id);

-- Verificar que todo se creó correctamente
SELECT 
  'organizaciones' as tabla,
  COUNT(*) as registros
FROM organizaciones
UNION ALL
SELECT 
  'usuarios con organizacion' as tabla,
  COUNT(*) as registros
FROM usuarios 
WHERE organizacion_id IS NOT NULL
UNION ALL
SELECT 
  'consultorios con organizacion' as tabla,
  COUNT(*) as registros
FROM consultorios 
WHERE organizacion_id IS NOT NULL
UNION ALL
SELECT 
  'pacientes con organizacion' as tabla,
  COUNT(*) as registros
FROM pacientes 
WHERE organizacion_id IS NOT NULL
UNION ALL
SELECT 
  'servicios con organizacion' as tabla,
  COUNT(*) as registros
FROM servicios 
WHERE organizacion_id IS NOT NULL; 