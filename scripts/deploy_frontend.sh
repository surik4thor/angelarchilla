#!/bin/bash
set -e

echo "Construyendo frontend con buildx..."
docker buildx bake frontend --set *.cache-from=type=local,src=.buildx-cache --set *.cache-to=type=local,dest=.buildx-cache,mode=max --load

echo "Reiniciando Nginx..."
echo "Recreando contenedor nginx con la nueva imagen..."
docker compose up -d --force-recreate nginx

echo "Despliegue completo. Solo se sirven los assets nuevos."
