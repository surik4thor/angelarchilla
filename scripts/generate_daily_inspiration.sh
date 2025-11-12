#!/bin/bash

# Script para generar una nueva frase inspiradora diaria
# Se ejecuta automáticamente cada día a través de cron

echo "🌟 Generando nueva frase inspiradora para $(date +%Y-%m-%d)"

# Hacer petición al endpoint para generar/obtener la frase del día
RESPONSE=$(curl -s https://nebulosamagica.com/api/inspiration)

# Extraer el mensaje usando jq
INSPIRATION=$(echo "$RESPONSE" | jq -r '.inspiration' 2>/dev/null)
SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$SUCCESS" = "true" ] && [ "$INSPIRATION" != "null" ]; then
    # Limpiar comillas del mensaje
    CLEAN_MSG=$(echo "$INSPIRATION" | sed 's/"//g')
    echo "✅ Frase generada: $CLEAN_MSG"
    
    # Log del resultado
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Frase diaria: $CLEAN_MSG" >> /var/www/nebulosamagica/logs/daily-inspiration.log
    
    # Opcional: Notificar via Discord si está configurado
    if [ -f "/var/www/nebulosamagica/scripts/discord_notify.js" ]; then
        node /var/www/nebulosamagica/scripts/discord_notify.js "🌟 **Frase del día** 🌟\n$CLEAN_MSG\n\n_Generada para el $(date '+%d de %B, %Y')_"
    fi
else
    echo "❌ Error generando frase inspiradora"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Error: $RESPONSE" >> /var/www/nebulosamagica/logs/daily-inspiration.log
fi