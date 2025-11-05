# 🔮 Nebulosa Mágica - Documentación Completa

**Plataforma de Servicios Espirituales con Inteligencia Artificial**  
*Versión: 4.0.0 - Producción Completa*  
*Actualizado: 5 Noviembre 2025*

---

## 🚀 **ESTADO ACTUAL - EN PRODUCCIÓN**

✅ **Sistema 100% operativo** en https://nebulosamagica.com  
✅ **Estructura de planes 3-tier implementada y funcionando**  
✅ **Panel admin operativo** con gestión completa  
✅ **Pagos Stripe configurados** correctamente  
✅ **Sistema de suscripciones** completamente funcional  

---

## 📖 **Documentación Principal**

| Documento | Descripción | Estado |
|-----------|-------------|---------|
| 📊 [**ESTADO-ACTUAL.md**](./ESTADO-ACTUAL.md) | Estado completo del sistema y funcionalidades | ✅ Actualizado |
| 🔄 [**MIGRACION-3TIER.md**](./MIGRACION-3TIER.md) | Proceso de migración a 3 planes | ✅ Completado |
| 🛠️ [**SISTEMAS-IMPLEMENTADOS.md**](./SISTEMAS-IMPLEMENTADOS.md) | Detalles técnicos de todas las funcionalidades | ✅ Actualizado |
| 📝 [**CHANGELOG.md**](./CHANGELOG.md) | Historial de cambios y actualizaciones | ✅ Actualizado |

Una aplicación web completa que ofrece lecturas de tarot, runas, interpretación de sueños, cartas natales y horóscopos personalizados utilizando IA especializada.

## 🎯 **Funcionalidades Principales**

### **🔮 Servicios Espirituales**
- ✅ **Tarot Multi-Baraja**: 5 tipos diferentes (Rider-Waite, Marsella, Ángeles, Egipcio, Gitano)
- ✅ **Runas Elder Futhark**: Múltiples spreads y metodologías
- ✅ **Interpretación de Sueños**: Análisis IA con calendario (Plan PREMIUM)
- ✅ **Cartas Natales**: Cálculos astronómicos precisos (Plan PREMIUM)
- ✅ **Horóscopos Personalizados**: Tránsitos planetarios en tiempo real

### **🧠 Personalidades IA Especializadas**
- **🔮 Madame Celestina**: Experta en Tarot (todas las barajas)
- **⚡ Björn el Sabio**: Maestro de Runas Elder Futhark
- **🌙 Morfeo**: Intérprete de sueños y simbolismo onírico
- **⭐ Celeste**: Astróloga para cartas natales y horóscopos

### **� Sistema de Suscripciones (3-Tier)**
| Plan | Precio | Características Principales | Estado |
|------|--------|---------------------------|---------|
| **🌟 INVITADO** | €0.00 | 3 lecturas/mes, Baraja básica | ✅ Activo |
| **✨ ESENCIAL** | €4.99/mes | 15 lecturas/mes, Todas las barajas, Historial | ✅ Activo |
| **🔮 PREMIUM** | €9.99/mes | Ilimitado + Sueños + Cartas Natales | ✅ Activo |

---

## ⚙️ **Arquitectura Técnica**

### **🖥️ Backend (Node.js + Express)**
| Componente | Tecnología | Estado | Versión |
|------------|------------|--------|---------|
| **Runtime** | Node.js + Express | ✅ Operativo | v18+ |
| **Base de Datos** | PostgreSQL + Prisma ORM | ✅ Operativo | Latest |
| **Autenticación** | JWT + middleware req.member | ✅ Operativo | - |
| **Pagos** | Stripe API v4 + webhooks | ✅ Operativo | v4.x |
| **IA** | OpenAI GPT-4 | ✅ Operativo | v4 |
| **Servidor** | Ubuntu VPS + PM2 + Nginx | ✅ Operativo | - |

### **🌐 Frontend (JavaScript Vanilla)**
| Componente | Tecnología | Estado | Observaciones |
|------------|------------|--------|---------------|
| **Build Tool** | Vite | ✅ Operativo | Hot reload |
| **PWA** | Service Workers | ✅ Operativo | Installable |
| **UI/UX** | CSS + Vanilla JS | ✅ Operativo | Responsive |
| **Estado** | LocalStorage + JWT | ✅ Operativo | Session mgmt |

### **🔧 Servicios Integrados**
- **📊 Análisis IA**: Patrones de uso y comportamiento
- **🔔 Notificaciones**: Sistema automatizado via Discord
- **⚡ Admin Panel**: Dashboard completo de gestión
- **🌌 Astronomía**: Cálculos planetarios precisos
- **📈 Métricas**: Monitoreo y analytics

---

## 🚀 **Setup y Desarrollo**

### **📋 Prerrequisitos**
```bash
✅ Node.js 18+
✅ PostgreSQL 14+
✅ OpenAI API Key
✅ Stripe Live/Test Keys
```

### **🔧 Instalación Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurar todas las variables de entorno
npx prisma generate
npx prisma db push
npm run dev  # Puerto 3000
```

### **🎨 Instalación Frontend**
```bash
cd frontend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev  # Puerto 5173
```

### **🔐 Variables de Entorno (.env)**
```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5432/nebulosamagica"

# OpenAI GPT-4
OPENAI_API_KEY="sk-proj-..."

# Stripe Payments
STRIPE_SECRET_KEY="sk_live_..." # o sk_test_ para pruebas
STRIPE_WEBHOOK_SECRET="whsec_..."

# JWT Authentication
JWT_SECRET="tu-secreto-super-seguro-jwt"
```

---

## � **Estado Actual del Sistema**

### **🎯 Progreso Global: 100% ✅ EN PRODUCCIÓN**

| Módulo | Estado | Última Actualización | Versión |
|--------|--------|---------------------|---------|
| **🔮 Sistema de Lecturas** | ✅ Operativo | 2024-10-29 | v3.0 |
| **💳 Suscripciones Stripe** | ✅ Operativo | 2024-10-29 | 3-Tier |
| **⚙️ Panel Admin** | ✅ Operativo | 2024-10-29 | v2.1 |
| **🎭 Personalidades IA** | ✅ Operativo | 2024-10-28 | v1.5 |
| **🌐 Infraestructura** | ✅ Operativo | 2024-10-29 | SSL + PM2 |

### **✅ Funcionalidades Completadas**
- [x] **Sistema 3-Tier**: INVITADO/ESENCIAL/PREMIUM 
- [x] **5 Barajas de Tarot**: Completas con IA especializada
- [x] **Runas Elder Futhark**: Múltiples spreads
- [x] **Cartas Natales**: Cálculos astronómicos precisos
- [x] **Sueños**: Análisis IA con calendario (PREMIUM)
- [x] **Stripe Integration**: Checkout + webhooks operativos
- [x] **Admin Panel**: CRUD completo + activación trials
- [x] **Límites por Plan**: Middleware funcionando perfectamente
- [x] **SSL + Nginx**: Configuración optimizada en producción

---

## 🎯 **API Endpoints Principales**

### **🔐 Autenticación** 
```http
POST /api/auth/register     # Registro usuario
POST /api/auth/login        # Inicio sesión
GET  /api/auth/me          # Perfil actual
```

### **🔮 Lecturas Espirituales**
```http
POST /api/tarot/reading     # Nueva lectura Tarot (5 barajas)
POST /api/runes/reading     # Nueva lectura Runas
POST /api/dreams/reading    # Análisis sueños (PREMIUM)
POST /api/astro/natal       # Carta natal (PREMIUM)
GET  /api/horoscope/daily   # Horóscopo diario
```

### **� Suscripciones**  
```http
POST /api/subscription/create-checkout  # Crear sesión Stripe
POST /api/subscription/webhook         # Webhook Stripe
GET  /api/subscription/status          # Estado suscripción
```

### **⚙️ Admin Panel**
```http
GET    /api/admin/users           # Listar usuarios
PUT    /api/admin/user/:id        # Actualizar usuario  
POST   /api/admin/activate-trial  # Activar trial PREMIUM
GET    /api/admin/stats           # Estadísticas sistema
```

---

## 📁 **Estructura del Proyecto**

```bash
nebulosamagica/
├── 🖥️  backend/
│   ├── src/
│   │   ├── controllers/      # Lógica negocio (auth, readings, admin)
│   │   ├── services/         # IA + Astrología + Stripe
│   │   ├── routes/           # Endpoints API (/auth, /tarot, /admin)
│   │   ├── middleware/       # Auth JWT + Límites planes
│   │   └── aiAssistant/      # 4 Personalidades IA especializadas
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo datos (User, Reading, Subscription)
│   │   └── migrations/       # Migraciones DB
│   └── uploads/              # Archivos subidos usuarios
│
├── 🌐 frontend/
│   ├── src/                  # JavaScript Vanilla + Vite
│   ├── public/               # Assets estáticos + PWA
│   └── dist/                 # Build producción
│
├── 🛠️  scripts/              # Scripts deploy + monitoring + backups  
└── 📚 docs/                  # Documentación consolidada
```

---

## 🔐 **Seguridad y Performance**

### **🛡️ Medidas de Seguridad Implementadas**
- ✅ **JWT Authentication**: Tokens seguros con expiración
- ✅ **Rate Limiting**: Protección contra ataques DDoS  
- ✅ **Input Validation**: Sanitización completa de datos
- ✅ **HTTPS + SSL**: Let's Encrypt con renovación automática
- ✅ **CORS**: Configuración restrictiva por dominio
- ✅ **SQL Injection**: Prevención via Prisma ORM

### **⚡ Optimizaciones de Performance**  
- ✅ **Caching**: Redis para consultas frecuentes
- ✅ **CDN**: Assets estáticos optimizados
- ✅ **Gzip**: Compresión automática Nginx
- ✅ **DB Indexing**: Índices PostgreSQL optimizados
- ✅ **API Rate Limits**: Control uso por usuario/plan

---

## 📞 **Contacto y Soporte**

### **🌐 Producción**
- **URL**: [https://nebulosamagica.com](https://nebulosamagica.com)
- **Status**: ✅ Operativo 24/7
- **SSL**: ✅ Let's Encrypt válido

### **🛠️ Desarrollo**
- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`  
- **Admin Panel**: `/admin` (requiere rol ADMIN)

### **📊 Monitoreo**
- **PM2**: `pm2 status` para estado servicios
- **Logs**: `/var/www/nebulosamagica/backend/logs/`
- **DB**: PostgreSQL con backups automáticos

---

## 🚀 **Deploy y Mantenimiento**

### **📋 Scripts de Deploy**
```bash
# Deploy completo frontend + backend
./scripts/clean_build_deploy_frontend.sh

# Solo frontend  
./scripts/deploy_frontend.sh

# Backup automático
./scripts/cleanup_old_backups.sh
```

### **🔍 Comandos Útiles PM2**
```bash
pm2 restart nebulosa-backend    # Reiniciar backend
pm2 logs nebulosa-backend      # Ver logs tiempo real  
pm2 monit                      # Monitor recursos
```

---

## 📝 **Licencia y Derechos**

**© 2024 Nebulosa Mágica - Todos los derechos reservados**  
Proyecto propietario bajo licencia comercial exclusiva.

---

## ✨ **Experiencia Nebulosa Mágica**

> *"Donde la sabiduría ancestral se encuentra con la inteligencia artificial para revelar los misterios del cosmos"*

**🔮 Descubre tu destino en [nebulosamagica.com](https://nebulosamagica.com)**

---
*Última actualización: 29 Octubre 2024 - Sistema 100% operativo en producción*