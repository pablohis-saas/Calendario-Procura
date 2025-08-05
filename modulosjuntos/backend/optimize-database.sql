-- Script de optimización de base de datos para mejorar rendimiento
-- Ejecutar en PostgreSQL

-- 1. Índices para mejorar consultas de usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion_id ON usuarios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_consultorio_id ON usuarios(consultorio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email_organizacion ON usuarios(email, organizacion_id);

-- 2. Índices para consultas de pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_organizacion_id ON pacientes(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_email_organizacion ON pacientes(email, organizacion_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre_apellido ON pacientes(nombre, apellido);

-- 3. Índices para consultas de cobros
CREATE INDEX IF NOT EXISTS idx_cobros_paciente_id ON cobros(paciente_id);
CREATE INDEX IF NOT EXISTS idx_cobros_usuario_id ON cobros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cobros_fecha_cobro ON cobros(fecha_cobro DESC);
CREATE INDEX IF NOT EXISTS idx_cobros_estado ON cobros(estado);

-- 4. Índices para conceptos de cobro
CREATE INDEX IF NOT EXISTS idx_cobro_conceptos_cobro_id ON cobro_conceptos(cobro_id);
CREATE INDEX IF NOT EXISTS idx_cobro_conceptos_servicio_id ON cobro_conceptos(servicio_id);
CREATE INDEX IF NOT EXISTS idx_cobro_conceptos_consultorio_id ON cobro_conceptos(consultorio_id);

-- 5. Índices para servicios
CREATE INDEX IF NOT EXISTS idx_servicios_organizacion_id ON servicios(organizacion_id);

-- 6. Índices para consultorios
CREATE INDEX IF NOT EXISTS idx_consultorios_organizacion_id ON consultorios(organizacion_id);

-- 7. Índices para historial de cobros
CREATE INDEX IF NOT EXISTS idx_historial_cobros_cobro_id ON historial_cobros(cobro_id);
CREATE INDEX IF NOT EXISTS idx_historial_cobros_created_at ON historial_cobros(created_at DESC);

-- 8. Índices para métodos de pago
CREATE INDEX IF NOT EXISTS idx_metodos_pago_cobro_cobro_id ON metodos_pago_cobro(cobro_id);

-- 9. Índices para citas
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_usuario_id ON citas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_citas_consultorio_id ON citas(consultorio_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_inicio ON citas(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_fin ON citas(fecha_fin);

-- 10. Índices para disponibilidad médica
CREATE INDEX IF NOT EXISTS idx_disponibilidad_medico_usuario_id ON disponibilidad_medico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_medico_dia_semana ON disponibilidad_medico(dia_semana);

-- 11. Índices para bloqueos médicos
CREATE INDEX IF NOT EXISTS idx_bloqueo_medico_usuario_id ON bloqueo_medico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_bloqueo_medico_fecha_inicio ON bloqueo_medico(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_bloqueo_medico_fecha_fin ON bloqueo_medico(fecha_fin);

-- 12. Configuraciones de PostgreSQL para mejor rendimiento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 13. Configuraciones específicas para consultas
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- 14. Habilitar estadísticas de consultas
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 15. Crear vistas materializadas para consultas frecuentes
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_cobros_detallados AS
SELECT 
    c.id,
    c.fecha_cobro,
    c.monto_total,
    c.estado,
    c.notas,
    p.nombre as paciente_nombre,
    p.apellido as paciente_apellido,
    p.organizacion_id,
    u.nombre as usuario_nombre,
    u.apellido as usuario_apellido,
    STRING_AGG(s.nombre || ' (' || cc.cantidad || ')', ', ') as conceptos,
    STRING_AGG(mpc.metodo_pago, ', ') as metodos_pago
FROM cobros c
JOIN pacientes p ON c.paciente_id = p.id
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN cobro_conceptos cc ON c.id = cc.cobro_id
LEFT JOIN servicios s ON cc.servicio_id = s.id
LEFT JOIN metodos_pago_cobro mpc ON c.id = mpc.cobro_id
GROUP BY c.id, c.fecha_cobro, c.monto_total, c.estado, c.notas, 
         p.nombre, p.apellido, p.organizacion_id, u.nombre, u.apellido;

-- 16. Índices para la vista materializada
CREATE INDEX IF NOT EXISTS idx_mv_cobros_organizacion_id ON mv_cobros_detallados(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_mv_cobros_fecha_cobro ON mv_cobros_detallados(fecha_cobro DESC);

-- 17. Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_cobros_materialized_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_cobros_detallados;
END;
$$ LANGUAGE plpgsql;

-- 18. Configurar actualización automática de estadísticas
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 3;
ALTER SYSTEM SET autovacuum_naptime = '1min';

-- 19. Configuraciones para conexiones
ALTER SYSTEM SET tcp_keepalives_idle = 600;
ALTER SYSTEM SET tcp_keepalives_interval = 30;
ALTER SYSTEM SET tcp_keepalives_count = 3;

-- 20. Configuraciones de logging para debugging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries que tomen más de 1 segundo
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Comentario: Después de ejecutar este script, reiniciar PostgreSQL:
-- sudo systemctl restart postgresql
-- o
-- brew services restart postgresql (en macOS) 