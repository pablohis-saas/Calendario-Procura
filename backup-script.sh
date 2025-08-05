#!/bin/bash

# Script de respaldo automático para Supabase
# Configurar con cron: 0 2 * * * /Users/paul/Bravo/backup-script.sh

# Configuración
BACKUP_DIR="/Users/paul/Bravo/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="supabase_backup_$DATE.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Rutas completas para cron
PG_DUMP="/opt/homebrew/bin/pg_dump"
GZIP="/usr/bin/gzip"

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Log de inicio
echo "$(date): Iniciando respaldo automático" >> "$LOG_FILE"

# Hacer respaldo
echo "$(date): Creando respaldo: $BACKUP_FILE" >> "$LOG_FILE"
$PG_DUMP postgresql://postgres:Garuesgay1808@db.xfcmnlysnptclkgxfeab.supabase.co:5432/postgres > "$BACKUP_DIR/$BACKUP_FILE" 2>> "$LOG_FILE"

# Verificar si el respaldo fue exitoso
if [ $? -eq 0 ]; then
    echo "$(date): Respaldo creado exitosamente" >> "$LOG_FILE"
    
    # Comprimir respaldo
    $GZIP "$BACKUP_DIR/$BACKUP_FILE"
    echo "$(date): Respaldo comprimido: $BACKUP_FILE.gz" >> "$LOG_FILE"
    
    # Mantener solo los últimos 7 respaldos
    cd "$BACKUP_DIR"
    ls -t *.sql.gz | tail -n +8 | xargs -r rm
    echo "$(date): Limpieza de respaldos antiguos completada" >> "$LOG_FILE"
    
    # Mostrar tamaño del respaldo
    BACKUP_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_FILE.gz" | awk '{print $5}')
    echo "$(date): Respaldo completado: $BACKUP_FILE.gz (Tamaño: $BACKUP_SIZE)" >> "$LOG_FILE"
else
    echo "$(date): ERROR - Fallo al crear el respaldo" >> "$LOG_FILE"
    exit 1
fi 