#!/bin/bash

echo "🔧 PRUEBA COMPLETA - Todas las rutas API corregidas"
echo "=================================================="
echo ""

# Obtener token fresco
echo "🔑 Obteniendo token de autenticación..."
TOKEN_RESPONSE=$(curl -s -X POST https://nebulosamagica.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"surik4thor@icloud.com","password":"admin123"}')

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error: No se pudo obtener token de autenticación"
  exit 1
fi

echo "✅ Token obtenido correctamente"
echo ""

# Array de pruebas a realizar
declare -a tests=(
  "GET|/api/auth/me|Obtener perfil de usuario"
  "PUT|/api/auth/profile|Actualizar perfil"
  "PUT|/api/auth/notifications|Actualizar notificaciones"
  "DELETE|/api/auth/avatar|Eliminar avatar"
  "PUT|/api/auth/password|Cambiar contraseña"
  "GET|/api/readings/history|Historial de lecturas"
  "GET|/api/dreams/history|Historial de sueños"
  "POST|/api/stats|Guardar estadísticas anónimas"
)

echo "🧪 EJECUTANDO PRUEBAS DE RUTAS..."
echo ""

success_count=0
total_tests=${#tests[@]}

for test in "${tests[@]}"; do
  IFS='|' read -r method route description <<< "$test"
  
  echo "📍 Probando: $method $route ($description)"
  
  case $method in
    "GET")
      response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "https://nebulosamagica.com$route" \
        -H "Authorization: Bearer $TOKEN")
      ;;
    "PUT")
      case $route in
        "/api/auth/profile")
          response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "https://nebulosamagica.com$route" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{"username":"TestUser"}')
          ;;
        "/api/auth/notifications")
          response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "https://nebulosamagica.com$route" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{"preferences":{"email":true}}')
          ;;
        "/api/auth/password")
          response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "https://nebulosamagica.com$route" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d '{"currentPassword":"wrongpass","newPassword":"newpass123"}')
          ;;
      esac
      ;;
    "DELETE")
      response=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "https://nebulosamagica.com$route" \
        -H "Authorization: Bearer $TOKEN")
      ;;
    "POST")
      case $route in
        "/api/stats")
          response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://nebulosamagica.com$route" \
            -H "Content-Type: application/json" \
            -d '{"fechaNac":"1990-01-01","genero":"masculino"}')
          ;;
      esac
      ;;
  esac
  
  if [ "$response" = "401" ]; then
    echo "   ❌ Error 401 (Unauthorized) - Problema de autenticación"
  elif [ "$response" = "405" ]; then
    echo "   ❌ Error 405 (Method Not Allowed) - Ruta no existe o método incorrecto"
  elif [ "$response" = "404" ]; then
    echo "   ❌ Error 404 (Not Found) - Endpoint no encontrado"
  elif [[ "$response" =~ ^[23] ]]; then
    echo "   ✅ Éxito ($response)"
    ((success_count++))
  else
    echo "   ⚠️  Respuesta: $response"
  fi
done

echo ""
echo "📊 RESUMEN:"
echo "   ✅ Pruebas exitosas: $success_count/$total_tests"
echo "   📈 Porcentaje de éxito: $(( (success_count * 100) / total_tests ))%"
echo ""

if [ $success_count -eq $total_tests ]; then
  echo "🎉 ¡TODAS LAS RUTAS FUNCIONAN CORRECTAMENTE!"
  echo "   Los errores 401/405 deberían estar completamente resueltos"
else
  echo "⚠️  Algunas rutas aún tienen problemas"
  echo "   Revisar la configuración de las rutas que fallaron"
fi

echo ""
echo "🔍 PARA VERIFICAR EN EL FRONTEND:"
echo "1. Recargar completamente la página (Ctrl+F5)"
echo "2. Abrir DevTools (F12) → Network"
echo "3. Intentar editar el perfil"
echo "4. Verificar que no aparezcan errores 401/405"