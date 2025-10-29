#!/bin/bash
# Elimina backups de postgres de más de 14 días para ahorrar espacio
dir_backup="/var/www/nebulosamagica/backups"
find "$dir_backup" -type f -name "backup_*.sql.gz" -mtime +14 -exec rm -f {} \;
echo "Backups antiguos eliminados."
