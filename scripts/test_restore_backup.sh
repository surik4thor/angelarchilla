#!/bin/bash
# Prueba restauración de backup de Postgres en entorno de staging/test
# ¡NO ejecutar en producción!

BACKUP_FILE="$1"
TEST_DB="arcana_db_restore_test"
DB_USER="arcana"

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: $0 <backup_file.sql.gz>"
  exit 1
fi

echo "Creando base de datos temporal $TEST_DB..."
sudo -u postgres dropdb --if-exists "$TEST_DB"
sudo -u postgres createdb "$TEST_DB" -O "$DB_USER"

echo "Restaurando backup en $TEST_DB..."
gunzip -c "$BACKUP_FILE" | sudo -u postgres psql "$TEST_DB"

if [ $? -eq 0 ]; then
  echo "Restauración completada con éxito en $TEST_DB."
else
  echo "Error en la restauración."
fi
