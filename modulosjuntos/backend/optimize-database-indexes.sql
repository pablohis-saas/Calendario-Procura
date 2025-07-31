-- Script para optimizar índices de la base de datos multi-tenant
-- Ejecutar en PostgreSQL para mejorar performance

-- Índices para consultas por organizacion_id
CREATE INDEX IF NOT EXISTS idx_pacientes_organizacion_id ON pacientes(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion_id ON usuarios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_consultorios_organizacion_id ON consultorios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_servicios_organizacion_id ON servicios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_citas_organizacion_id ON citas(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_cobros_organizacion_id ON cobros(organizacion_id);

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_pacientes_org_nombre ON pacientes(organizacion_id, nombre);
CREATE INDEX IF NOT EXISTS idx_citas_org_fecha ON citas(organizacion_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_cobros_org_fecha ON cobros(organizacion_id, fecha_creacion);

-- Índices para consultas por consultorio_id
CREATE INDEX IF NOT EXISTS idx_usuarios_consultorio_id ON usuarios(consultorio_id);
CREATE INDEX IF NOT EXISTS idx_citas_consultorio_id ON citas(consultorio_id);

-- Índices para Google Calendar
CREATE INDEX IF NOT EXISTS idx_usuarios_google_token ON usuarios(googleAccessToken) WHERE googleAccessToken IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_google_refresh ON usuarios(googleRefreshToken) WHERE googleRefreshToken IS NOT NULL;

-- Índices para disponibilidad y bloqueos
CREATE INDEX IF NOT EXISTS idx_disponibilidad_usuario_dia ON disponibilidadMedico(usuario_id, dia_semana);
CREATE INDEX IF NOT EXISTS idx_bloqueo_usuario_fecha ON bloqueoMedico(usuario_id, fecha_inicio, fecha_fin);

-- Análisis de estadísticas
ANALYZE; 