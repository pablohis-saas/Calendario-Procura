#!/bin/bash

# Script para gestionar respaldos de la base de datos
BACKUP_DIR="/Users/paul/Bravo/backups"
LOG_FILE="$BACKUP_DIR/backup.log"

echo "🗄️  GESTOR DE RESPALDOS - BRAVO SYSTEM"
echo "======================================"

# Función para mostrar respaldos disponibles
show_backups() {
    echo ""
    echo "📁 RESPALDOS DISPONIBLES:"
    echo "------------------------"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.sql.gz | awk '{print $9, $5, $6, $7, $8}' | while read file size date time; do
            filename=$(basename "$file")
            echo "📄 $filename ($size) - $date $time"
        done
    else
        echo "❌ No hay respaldos disponibles"
    fi
}

# Función para crear respaldo manual
create_backup() {
    echo ""
    echo "🔄 Creando respaldo manual..."
    /Users/paul/Bravo/backup-script.sh
    echo "✅ Respaldo completado"
}

# Función para mostrar logs
show_logs() {
    echo ""
    echo "📋 ÚLTIMOS LOGS DE RESPALDO:"
    echo "---------------------------"
    if [ -f "$LOG_FILE" ]; then
        tail -20 "$LOG_FILE"
    else
        echo "❌ No hay archivo de log disponible"
    fi
}

# Función para restaurar respaldo
restore_backup() {
    echo ""
    echo "🔄 RESTAURAR RESPALDO"
    echo "---------------------"
    
    # Mostrar respaldos disponibles
    echo "Respaldos disponibles:"
    ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | nl
    
    if [ $? -ne 0 ]; then
        echo "❌ No hay respaldos disponibles"
        return
    fi
    
    echo ""
    read -p "Selecciona el número del respaldo a restaurar: " backup_num
    
    # Obtener el archivo seleccionado
    backup_file=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | sed -n "${backup_num}p")
    
    if [ -z "$backup_file" ]; then
        echo "❌ Número de respaldo inválido"
        return
    fi
    
    echo ""
    echo "⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual"
    read -p "¿Estás seguro? (sí/no): " confirm
    
    if [ "$confirm" = "sí" ] || [ "$confirm" = "si" ] || [ "$confirm" = "yes" ]; then
        echo "🔄 Restaurando respaldo: $(basename "$backup_file")"
        
        # Descomprimir y restaurar
        gunzip -c "$backup_file" | psql postgresql://postgres:Garuesgay1808@db.xfcmnlysnptclkgxfeab.supabase.co:5432/postgres
        
        if [ $? -eq 0 ]; then
            echo "✅ Respaldo restaurado exitosamente"
        else
            echo "❌ Error al restaurar el respaldo"
        fi
    else
        echo "❌ Restauración cancelada"
    fi
}

# Función para verificar estado del cron
check_cron() {
    echo ""
    echo "⏰ ESTADO DEL CRON JOB:"
    echo "----------------------"
    
    cron_job=$(crontab -l 2>/dev/null | grep backup-script.sh)
    
    if [ -n "$cron_job" ]; then
        echo "✅ Cron job configurado:"
        echo "   $cron_job"
    else
        echo "❌ No hay cron job configurado"
    fi
    
    # Verificar si cron está ejecutándose
    if pgrep -x "cron" > /dev/null; then
        echo "✅ Servicio cron activo"
    else
        echo "❌ Servicio cron no está ejecutándose"
    fi
}

# Menú principal
while true; do
    echo ""
    echo "🔧 OPCIONES DISPONIBLES:"
    echo "1. Ver respaldos disponibles"
    echo "2. Crear respaldo manual"
    echo "3. Ver logs de respaldo"
    echo "4. Restaurar respaldo"
    echo "5. Verificar estado del cron"
    echo "6. Salir"
    echo ""
    read -p "Selecciona una opción (1-6): " choice
    
    case $choice in
        1) show_backups ;;
        2) create_backup ;;
        3) show_logs ;;
        4) restore_backup ;;
        5) check_cron ;;
        6) echo "👋 ¡Hasta luego!"; exit 0 ;;
        *) echo "❌ Opción inválida" ;;
    esac
done 