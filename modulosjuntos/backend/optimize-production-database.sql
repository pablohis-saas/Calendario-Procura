-- Script de optimización de base de datos para producción
-- Ejecutar en PostgreSQL para máxima performance

-- ========================================
-- 1. ÍNDICES CRÍTICOS PARA PERFORMANCE
-- ========================================

-- Índices para consultas por organizacion_id (multi-tenancy)
CREATE INDEX IF NOT EXISTS idx_pacientes_organizacion_id ON pacientes(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacion_id ON usuarios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_consultorios_organizacion_id ON consultorios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_servicios_organizacion_id ON servicios(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_citas_organizacion_id ON citas(organizacion_id);
CREATE INDEX IF NOT EXISTS idx_cobros_organizacion_id ON cobros(organizacion_id);

-- Índices compuestos para consultas frecuentes del dashboard
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

-- Índices para inventario (críticos para performance)
CREATE INDEX IF NOT EXISTS idx_movement_sede_created ON "Movement"("sedeId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_movement_sede_type ON "Movement"("sedeId", "type");
CREATE INDEX IF NOT EXISTS idx_stock_sede_product ON "StockBySede"("sedeId", "productId");
CREATE INDEX IF NOT EXISTS idx_expiration_sede_date ON "ProductExpiration"("sedeId", "expiryDate");
CREATE INDEX IF NOT EXISTS idx_product_category ON "Product"(category);
CREATE INDEX IF NOT EXISTS idx_product_name ON "Product"(name);

-- Índices para búsquedas de texto
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre_apellido ON pacientes USING gin(to_tsvector('spanish', nombre || ' ' || apellido));
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON "Product" USING gin(to_tsvector('spanish', name));

-- ========================================
-- 2. CONFIGURACIÓN DE POSTGRESQL
-- ========================================

-- Configurar parámetros para mejor performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Configurar para conexiones concurrentes
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET work_mem = '4MB';

-- ========================================
-- 3. PARTITIONING PARA TABLAS GRANDES
-- ========================================

-- Crear particiones para movimientos por fecha (si tienes muchos datos)
-- CREATE TABLE movement_partition_2024 PARTITION OF "Movement" 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- ========================================
-- 4. VACUUM Y ANALYZE
-- ========================================

-- Limpiar y actualizar estadísticas
VACUUM ANALYZE;
ANALYZE;

-- ========================================
-- 5. CONFIGURACIÓN DE CONNECTION POOLING
-- ========================================

-- Configurar PgBouncer (si lo usas)
-- [databases]
-- procura = host=localhost port=5432 dbname=procura

-- [pgbouncer]
-- pool_mode = transaction
-- max_client_conn = 1000
-- default_pool_size = 20

-- ========================================
-- 6. MONITORING Y MÉTRICAS
-- ========================================

-- Crear vistas para monitoreo
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Vista para monitorear uso de índices
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ========================================
-- 7. LIMPIEZA AUTOMÁTICA
-- ========================================

-- Crear función para limpiar logs antiguos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpiar movimientos de inventario más antiguos de 2 años
    DELETE FROM "Movement" 
    WHERE "createdAt" < NOW() - INTERVAL '2 years';
    
    -- Limpiar citas canceladas más antiguas de 1 año
    DELETE FROM citas 
    WHERE estado = 'CANCELADA' 
    AND fecha_inicio < NOW() - INTERVAL '1 year';
    
    -- Limpiar cobros más antiguos de 3 años
    DELETE FROM cobros 
    WHERE fecha_creacion < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;

-- Programar limpieza automática (ejecutar manualmente o con cron)
-- SELECT cleanup_old_data();

-- ========================================
-- 8. BACKUP Y RECOVERY
-- ========================================

-- Configurar backup automático
-- pg_dump -h localhost -U postgres -d procura --format=custom --file=/backup/procura_$(date +%Y%m%d_%H%M%S).backup

-- ========================================
-- 9. SECURITY
-- ========================================

-- Crear usuario específico para la aplicación
-- CREATE USER procura_app WITH PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE procura TO procura_app;
-- GRANT USAGE ON SCHEMA public TO procura_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO procura_app;

-- ========================================
-- 10. VERIFICACIÓN FINAL
-- ========================================

-- Verificar que todos los índices se crearon correctamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar estadísticas de tablas
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

PRINT '✅ Optimización de base de datos completada';
PRINT '📊 Ejecuta ANALYZE; después de cargar datos para actualizar estadísticas';
PRINT '🔍 Monitorea las vistas slow_queries e index_usage regularmente'; 