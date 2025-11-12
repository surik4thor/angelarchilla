#!/bin/bash

set -e

# Variables
FRONTEND_DIR="/var/www/NebulosaMagica/frontend"
NGINX_HTML_DIR="/usr/share/nginx/html"

echo "Limpiando archivos antiguos en $NGINX_HTML_DIR..."
find "$NGINX_HTML_DIR" -type f \( -name '*.js' -o -name '*.css' -o -name '*.map' \) -delete

echo "Instalando dependencias en $FRONTEND_DIR..."
cd "$FRONTEND_DIR"
npm install

echo "Ejecutando build de Vite..."
npm run build

if [ -d "dist" ]; then
  echo "Copiando archivos nuevos al directorio de Nginx..."
  cp -r dist/* "$NGINX_HTML_DIR/"
else
  echo "ERROR: No se encontró la carpeta dist después del build."
  exit 1
fi

echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo "Despliegue frontend completado."
