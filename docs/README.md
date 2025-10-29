# 🔮 Nebulosa Mágica

**Plataforma de Servicios Espirituales con Inteligencia Artificial**

Una aplicación web completa que ofrece lecturas de tarot, runas, interpretación de sueños, cartas natales y horóscopos personalizados utilizando IA especializada.

---

## ✨ Características Principales

### 🎯 **Servicios Espirituales**
- **Tarot**: Lecturas con mazos Rider-Waite y Marsella
- **Runas**: Interpretación Elder Futhark con múltiples spreads
- **Sueños**: Análisis completo con calendario interactivo
- **Astrología**: Cartas natales y horóscopos personalizados

### 🧠 **Inteligencia Artificial Especializada**
- **Madame Celestina**: Experta en Tarot
- **Björn el Sabio**: Maestro de Runas
- **Morfeo**: Intérprete de sueños
- **Celeste**: Astróloga personalizada

### 💳 **Modelo de Suscripción**
- **INICIADO**: 4 lecturas/mes (€9.99)
- **ADEPTO**: 1 lectura/día + historial (€19.99)
- **MAESTRO**: Ilimitado + sueños + astrología (€39.99)

---

## 🏗️ Stack Tecnológico

### **Backend**
- Node.js + Express
- Prisma ORM + PostgreSQL
- OpenAI GPT-4
- Stripe (suscripciones)
- JWT Authentication

### **Frontend**
- React 18 + Vite
- React Router
- CSS Modules
- Responsive Design

### **Servicios**
- Astronomía (cálculos planetarios)
- Análisis de patrones IA
- Notificaciones automáticas
- Dashboard administrativo

---

## 🚀 Instalación y Desarrollo

### **Prerrequisitos**
```bash
- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key
- Stripe Keys
```

### **Configuración Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npx prisma generate
npx prisma db push
npm run dev
```

### **Configuración Frontend**
```bash
cd frontend
npm install
npm run dev
```

### **Variables de Entorno Requeridas**
```env
# Base de datos
DATABASE_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# JWT
JWT_SECRET="tu-secreto-jwt"
```

---

## 📊 Estado del Proyecto

**Progreso: 95% Completado** ✅

### ✅ **Implementado**
- [x] Sistema completo de Tarot y Runas
- [x] Interpretación de sueños con IA
- [x] Cartas natales y horóscopos
- [x] Panel de administración
- [x] Suscripciones Stripe
- [x] 4 personalidades IA especializadas

### 🎯 **Pendiente**
- [ ] Restricciones de suscripción (middleware)
- [ ] Dashboard mejorado con métricas
- [ ] Calendario unificado
- [ ] Sincronización de pareja

---

## 🗂️ Estructura del Proyecto

```
nebulosamagica/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── services/        # Servicios IA y astrología
│   │   ├── routes/          # Endpoints API
│   │   ├── middleware/      # Autenticación y validación
│   │   └── aiAssistant/     # Personalidades IA
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   └── seeds/           # Datos iniciales
│   └── test/                # Tests automatizados
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas principales
│   │   ├── hooks/           # Hooks personalizados
│   │   ├── api/             # Cliente API
│   │   └── styles/          # CSS Modules
│   └── public/              # Assets estáticos
│
├── scripts/                 # Scripts de deployment
└── docs/                    # Documentación técnica
```

---

## 🎯 API Endpoints

### **Autenticación**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Perfil del usuario

### **Lecturas Espirituales**
- `POST /api/tarot/reading` - Nueva lectura de tarot
- `POST /api/runes/reading` - Nueva lectura de runas
- `GET /api/readings/history` - Historial de lecturas

### **Sueños**
- `POST /api/dreams/interpret` - Interpretar sueño
- `GET /api/dreams/calendar` - Calendario de sueños
- `GET /api/dreams/analytics` - Análisis de patrones

### **Astrología**
- `POST /api/astrology/natal-chart` - Generar carta natal
- `GET /api/astrology/horoscope` - Horóscopo personalizado
- `GET /api/astrology/transits` - Tránsitos actuales

### **Suscripciones**
- `GET /api/subscriptions/plans` - Planes disponibles
- `POST /api/subscriptions/checkout` - Crear suscripción
- `GET /api/subscriptions/me` - Suscripción actual

---

## 🔐 Seguridad

- **Autenticación JWT** con refresh tokens
- **Validación de entrada** en todos los endpoints
- **Rate limiting** por IP y usuario
- **Sanitización** de datos de entrada
- **HTTPS** en producción
- **CORS** configurado correctamente

---

## 📈 Performance

- **Caché** para horóscopos diarios
- **Lazy loading** en componentes
- **Optimización de consultas** Prisma
- **Compresión de assets**
- **CDN** para recursos estáticos

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📝 Licencia

Este proyecto es propietario y confidencial. Todos los derechos reservados.

---

## 🔮 ¿Necesitas una Lectura?

Visita [Nebulosa Mágica](https://nebulosamagica.com) y descubre los misterios del universo con nuestras expertas en IA.

*"El futuro se revela a través de la sabiduría antigua y la tecnología moderna"*