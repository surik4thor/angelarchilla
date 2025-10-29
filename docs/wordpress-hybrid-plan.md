# Plan de Migración Híbrida: WordPress + React App

## Fase 1: WordPress como Escaparate (2-3 semanas)

### Instalación WordPress
```bash
# Nuevo dominio o subdirectorio
wp.nebulosamagica.com  # WordPress
app.nebulosamagica.com # Tu aplicación React actual
```

### Estructura WordPress:
- **Homepage**: Landing page optimizada para SEO
- **Blog**: Artículos esotéricos (mejor SEO que React)
- **Tienda**: WooCommerce para productos físicos
- **Páginas**: Sobre nosotros, contacto, legal

## Fase 2: Integración Visual (1 semana)

### Tema WordPress personalizado que replique tu diseño:
```php
// header.php - mismo diseño que React
<header class="header-animated-bg">
  <nav class="main-nav">
    <a href="/">🏠 Inicio</a>
    <a href="/blog">📖 Blog</a>
    <a href="/tienda">🛒 Tienda</a>
    <a href="/app/tarot">🃏 Tarot</a>  <!-- Enlace a React -->
    <a href="/app/runas">ᚱ Runas</a>  <!-- Enlace a React -->
  </nav>
</header>
```

### CSS compartido:
- Exportar tus estilos actuales a WordPress
- Misma paleta de colores y tipografías
- Componentes visuales idénticos

## Fase 3: Proxy Nginx (1 día)

### Configuración nginx:
```nginx
server {
    server_name nebulosamagica.com;
    
    # WordPress para contenido estático
    location / {
        proxy_pass http://wordpress:80;
    }
    
    # Tu app React para funcionalidades
    location /app/ {
        proxy_pass http://frontend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API sigue igual
    location /api/ {
        proxy_pass http://backend:5050/api/;
    }
}
```

## Fase 4: Autenticación Unificada (1 semana)

### Single Sign-On entre WordPress y React:
```php
// WordPress: functions.php
function sync_user_to_react($user_id) {
    $user = get_user_by('id', $user_id);
    
    // Crear usuario en tu API
    wp_remote_post('https://nebulosamagica.com/api/auth/wp-sync', [
        'body' => [
            'email' => $user->user_email,
            'wp_user_id' => $user_id,
            'token' => wp_create_nonce('sync_user_' . $user_id)
        ]
    ]);
}
```

## Ventajas de esta Solución:

### ✅ **Para el usuario final:**
- **Experiencia transparente**: Navega como si fuera una sola web
- **URLs limpias**: `/blog/articulo` y `/app/tarot` 
- **Diseño unificado**: Mismo header, footer, estilos
- **SEO mejorado**: WordPress para contenido, React para apps

### ✅ **Para desarrollo:**
- **Menos errores**: WordPress maneja lo simple, React lo complejo
- **Mantenimiento separado**: Arreglas blog sin tocar lecturas
- **Escalabilidad**: Cada parte crece independiente
- **Respaldos**: WordPress tiene backup automático

### ✅ **Migración gradual:**
1. **Semana 1-2**: Instalar WordPress, replicar diseño
2. **Semana 3**: Migrar blog y productos
3. **Semana 4**: Configurar proxy y SSO
4. **Semana 5**: Testing y optimización

## Costos Estimados:
- **Desarrollo**: 1 mes
- **Hosting adicional**: ~10€/mes WordPress
- **Mantenimiento**: Reducido (WordPress auto-updates)
- **Riesgo**: Bajo (no tocas funcionalidad crítica)