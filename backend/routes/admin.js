import express from 'express';
import { authenticate, requireAdmin } from '../src/middleware/auth.js';
import prisma from '../src/prismaClient.js';
import jwt from 'jsonwebtoken';
import { generateBusinessPlanManual } from '../src/controllers/productController.js';
const router = express.Router();
// Endpoint de producción para borrar usuario por DELETE (ID string/cuid)
router.delete('/delete-user/:id', async (req, res) => {
    const userId = req.params.id;
    console.log('Intentando eliminar usuario (DELETE):', userId);
    try {
        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });
        console.log('Usuario eliminado (DELETE):', deletedUser);
        res.json({ message: 'Usuario eliminado correctamente', deletedUser });
    } catch (error) {
        console.error('Error al eliminar usuario (DELETE):', error);
        res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
    }
});
// ENDPOINT DE PRUEBA: Eliminar usuario por GET (solo para depuración)
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si es admin
    if (user.role !== 'ADMIN' && user.email !== 'surik4thor@icloud.com') {
      return res.status(403).json({ error: 'Acceso denegado - Se requieren permisos de administrador' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware admin:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ==========================================
// RUTAS DE ADMINISTRACIÓN
// ==========================================

// POST /api/admin/business-plan/generate - Lanzar plan comercial IA manualmente
router.post('/business-plan/generate', requireAdmin, generateBusinessPlanManual);

// GET /api/admin/users - Obtener todos los usuarios
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        subscriptionPlan: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            readings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        readingsCount: user._count.readings
      }))
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/stats - Obtener estadísticas del sistema
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalReadings,
      totalCards,
      totalRunes,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.reading.count(),
      prisma.tarotCard.count(),
      prisma.rune.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          username: true,
          email: true,
          createdAt: true,
          role: true
        }
      })
    ]);

    res.json({
      success: true,
      totalUsers,
      totalAdmins,
      totalReadings,
      totalCards: totalCards + totalRunes,
      recentUsers
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/users/:id - Eliminar usuario
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('--- ELIMINAR USUARIO ---');
    console.log('ID recibido:', id);
    console.log('Usuario autenticado:', req.user?.id, req.user?.email, req.user?.role);

    if (!id || typeof id !== 'string') {
      console.log('ID inválido:', id);
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario existe
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });
    console.log('Resultado búsqueda usuario:', userToDelete);

    if (!userToDelete) {
      console.log('Usuario no encontrado para id:', id);
      return res.status(404).json({ error: 'Usuario no encontrado', id });
    }

    // No permitir que se elimine a sí mismo
    if (id === req.user.id) {
      console.log('Intento de auto-eliminación:', id);
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo', id });
    }

    // No permitir eliminar al super admin
    if (userToDelete.email === 'surik4thor@icloud.com') {
      console.log('Intento de eliminar super admin:', id);
      return res.status(400).json({ error: 'No se puede eliminar al administrador principal', id });
    }

    // Eliminar usuario (las lecturas se eliminarán en cascada)
    await prisma.user.delete({
      where: { id }
    });
    console.log('Usuario eliminado correctamente:', id);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// PUT /api/admin/users/:id/role - Actualizar rol de usuario
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Debe ser USER o ADMIN' });
    }

    // Verificar que el usuario existe
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir cambiar el rol del super admin
    if (userToUpdate.email === 'surik4thor@icloud.com') {
      return res.status(400).json({ error: 'No se puede cambiar el rol del administrador principal' });
    }

    // Actualizar rol
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        subscriptionPlan: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: `Rol actualizado a ${role} exitosamente`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/users/:id/plan - Actualizar plan de suscripción
router.put('/users/:id/plan', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!['INVITADO', 'INICIADO', 'ADEPTO', 'MAESTRO'].includes(plan)) {
      return res.status(400).json({ error: 'Plan inválido' });
    }

    // Verificar que el usuario existe
    const userToUpdate = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar plan
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { subscriptionPlan: plan },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        subscriptionPlan: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: `Plan actualizado a ${plan} exitosamente`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/system/status - Estado del sistema
router.get('/system/status', requireAdmin, async (req, res) => {
  try {
    // Verificar conexión a base de datos
    const dbStatus = await prisma.$queryRaw`SELECT 1`;
    
    // Contar elementos en base de datos
    const [userCount, cardCount, runeCount] = await Promise.all([
      prisma.user.count(),
      prisma.tarotCard.count(),
      prisma.rune.count()
    ]);

    res.json({
      success: true,
      database: {
        status: 'connected',
        users: userCount,
        tarotCards: cardCount,
        runes: runeCount,
        total: cardCount + runeCount
      },
      server: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estado del sistema:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      database: { status: 'error' },
      server: { status: 'error' }
    });
  }
});

// GET /api/admin/logs - Obtener logs de actividad (simulado)
router.get('/logs', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Por ahora simulamos logs básicos
    // En una implementación real, estos vendrían de un sistema de logging
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Sistema iniciado correctamente',
        source: 'server'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: 'INFO',
        message: 'Base de datos conectada',
        source: 'database'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        level: 'INFO',
        message: 'Usuario admin autenticado',
        source: 'auth'
      }
    ];

    res.json({
      success: true,
      logs: mockLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockLogs.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE BLOG
// ==========================================

// GET /api/admin/blog/posts - Obtener posts del blog
router.get('/blog/posts', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      prisma.blogPost?.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { username: true, email: true }
          }
        }
      }) || [],
      prisma.blogPost?.count() || 0
    ]);

    res.json({
      success: true,
      posts: posts || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/blog/posts - Crear nuevo post
router.post('/blog/posts', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      tags,
      status = 'draft',
      featuredImage,
      seoTitle,
      seoDescription
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Título y contenido son requeridos' });
    }

    const post = await prisma.blogPost?.create({
      data: {
        title,
        content,
        excerpt,
        tags: tags || [],
        status,
        featuredImage,
        seoTitle,
        seoDescription,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { username: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Post creado exitosamente',
      post
    });
  } catch (error) {
    console.error('Error creando post:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// Deck Cards Management
// ==========================

// GET /api/admin/decks/:deckId/cards - listar cartas del mazo
router.get('/decks/:deckId/cards', requireAdmin, async (req, res) => {
  try {
    const { deckId } = req.params;
    const cards = await prisma.tarotCard.findMany({ where: { deckId } });
    res.json({ success: true, cards });
  } catch (error) {
    console.error('Error listing deck cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/decks/:deckId/cards - crear una carta en el mazo
router.post('/decks/:deckId/cards', requireAdmin, async (req, res) => {
  try {
    const { deckId } = req.params;
    const { name, cardNumber, arcana, suit, meaning, reversedMeaning, keywords, imageUrl, deckType, prompt } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });

    const card = await prisma.tarotCard.create({
      data: {
        name,
        cardNumber: cardNumber || null,
        arcana: (arcana || 'TAROT').toString(),
        suit: suit || null,
        meaning: meaning || '',
        reversedMeaning: reversedMeaning || '',
        keywords: keywords || [],
        imageUrl: imageUrl || '',
        deckType: deckType || 'CUSTOM',
        deckId: deckId,
        prompt: prompt || ''
      }
    });

    res.json({ success: true, card });
  } catch (error) {
    console.error('Error creating deck card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/decks/:deckId/cards/:cardId - actualizar carta
router.put('/decks/:deckId/cards/:cardId', requireAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    const updateData = req.body;
    const card = await prisma.tarotCard.update({ where: { id: cardId }, data: updateData });
    res.json({ success: true, card });
  } catch (error) {
    console.error('Error updating deck card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/decks/:deckId/cards/:cardId - borrar carta
router.delete('/decks/:deckId/cards/:cardId', requireAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    await prisma.tarotCard.delete({ where: { id: cardId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck card:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/decks/:deckId/cards/bulk - subir CSV o JSON bulk (stub)
router.post('/decks/:deckId/cards/bulk', requireAdmin, async (req, res) => {
  try {
    // Para simplificar: aceptar body.cards = [{...}, {...}]
    const { deckId } = req.params;
    const { cards } = req.body;
    if (!Array.isArray(cards)) return res.status(400).json({ error: 'Se requiere un array cards' });

    const created = [];
    for (const c of cards) {
      const newCard = await prisma.tarotCard.create({ data: { ...c, deckId } });
      created.push(newCard);
    }

    res.json({ success: true, createdCount: created.length, created });
  } catch (error) {
    console.error('Error bulk creating cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/decks/:deckId/cards/bulk-zip - subir CSV + ZIP con imágenes
const upload = multer({ dest: path.join(process.cwd(), 'tmp/uploads') });
router.post('/decks/:deckId/cards/bulk-zip', requireAdmin, upload.fields([{ name: 'csv' }, { name: 'images' }]), async (req, res) => {
  try {
    const { deckId } = req.params;
    const csvFile = req.files['csv']?.[0];
    const imagesFile = req.files['images']?.[0];

    if (!csvFile) return res.status(400).json({ error: 'CSV requerido' });

    // Leer CSV (básico usando split lines y JSON.parse for simplicity if JSON rows)
    const csvContent = fs.readFileSync(csvFile.path, 'utf8');
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
      return obj;
    });

    // Extraer imágenes si ZIP provisto
    const extractedDir = path.join(process.cwd(), 'tmp', `extracted-${Date.now()}`);
    if (imagesFile) {
      fs.mkdirSync(extractedDir, { recursive: true });
      const zip = new AdmZip(imagesFile.path);
      zip.extractAllTo(extractedDir, true);
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'cards');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const created = [];
    for (const r of rows) {
      // r should have name, meaning, imageName, arcana, suit
      let imageUrl = '';
      if (r.imageName && imagesFile) {
        const candidate = path.join(extractedDir, r.imageName);
        if (fs.existsSync(candidate)) {
          const outName = `${Date.now()}-${Math.random().toString(36).substr(2,8)}${path.extname(r.imageName)}`;
          const outPath = path.join(uploadsDir, outName);
          // Optimize with sharp
          await sharp(candidate).resize(800).jpeg({ quality: 80 }).toFile(outPath);
          imageUrl = `/uploads/cards/${outName}`;
        }
      }

      const cardData = {
        name: r.name || r.title || 'Sin nombre',
        cardNumber: r.cardNumber || null,
        arcana: (r.arcana || 'TAROT').toString(),
        suit: r.suit || null,
        meaning: r.meaning || '',
        reversedMeaning: r.reversedMeaning || '',
        keywords: (r.keywords || '').split(';').map(k => k.trim()).filter(Boolean),
        imageUrl: imageUrl || (r.imageUrl || ''),
        deckType: r.deckType || 'CUSTOM',
        deckId: deckId,
        prompt: r.prompt || ''
      };

      const c = await prisma.tarotCard.create({ data: cardData });
      created.push(c);
    }

    // Cleanup temp files
    try { fs.unlinkSync(csvFile.path); } catch (e) {}
    if (imagesFile) { try { fs.unlinkSync(imagesFile.path); } catch (e) {} }

    res.json({ success: true, createdCount: created.length, created });
  } catch (error) {
    console.error('Error bulk-zip creating cards:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/blog/posts/:id - Actualizar post
router.put('/blog/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'ID de post inválido' });
    }

    const {
      title,
      content,
      excerpt,
      tags,
      status,
      featuredImage,
      seoTitle,
      seoDescription
    } = req.body;

    const updatedPost = await prisma.blogPost?.update({
      where: { id: postId },
      data: {
        title,
        content,
        excerpt,
        tags: tags || [],
        status,
        featuredImage,
        seoTitle,
        seoDescription,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { username: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error actualizando post:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/blog/posts/:id - Eliminar post
router.delete('/blog/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'ID de post inválido' });
    }

    await prisma.blogPost?.delete({
      where: { id: postId }
    });

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE TIENDA
// ==========================================

// GET /api/admin/shop/products - Obtener productos
router.get('/shop/products', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product?.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }) || [],
      prisma.product?.count() || 0
    ]);

    res.json({
      success: true,
      products: products || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/shop/products - Crear producto
router.post('/shop/products', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      sku,
      category,
      tags,
      status = 'active',
      inventory,
      weight,
      images,
      seoTitle,
      seoDescription
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    const product = await prisma.product?.create({
      data: {
        name,
        description,
        price,
        compareAtPrice,
        sku,
        category,
        tags: tags || [],
        status,
        inventory: inventory || 0,
        weight,
        images: images || [],
        seoTitle,
        seoDescription
      }
    });

    res.json({
      success: true,
      message: 'Producto creado exitosamente',
      product
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/shop/products/:id - Actualizar producto
router.put('/shop/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const updateData = { ...req.body };
    delete updateData.id;

    const updatedProduct = await prisma.product?.update({
      where: { id: productId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/shop/products/:id - Eliminar producto
router.delete('/shop/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    await prisma.product?.delete({
      where: { id: productId }
    });

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE STRIPE (Simulación)
// ==========================================

// GET /api/admin/stripe/stats - Estadísticas de Stripe
router.get('/stripe/stats', requireAdmin, async (req, res) => {
  try {
    // Datos simulados para desarrollo
    const stats = {
      monthlyRevenue: 245000, // en centavos
      revenueGrowth: 12.5,
      activeCustomers: 89,
      customerGrowth: 7,
      activeSubscriptions: 34,
      subscriptionGrowth: 15.2,
      monthlyPayments: 156,
      successRate: 97.8
    };

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error obteniendo stats de Stripe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/stripe/customers - Clientes de Stripe
router.get('/stripe/customers', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Datos simulados
    const customers = [
      {
        id: 'cus_1',
        name: 'María García',
        email: 'maria@example.com',
        created: Date.now() / 1000 - 86400 * 30,
        subscription: { plan: 'Premium', status: 'active' },
        totalSpent: 89000
      },
      {
        id: 'cus_2',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        created: Date.now() / 1000 - 86400 * 45,
        subscription: null,
        totalSpent: 2500
      }
    ];

    res.json({
      success: true,
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: customers.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE CASHFLOW
// ==========================================

// GET /api/admin/cashflow/stats - Estadísticas de cashflow
router.get('/cashflow/stats', requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Datos simulados
    const stats = {
      totalRevenue: 345000, // en centavos
      totalExpenses: 89000,
      revenueGrowth: 15.2,
      expenseGrowth: 8.5,
      monthlyData: [
        { month: 'Ene', income: 25000, expenses: 8000 },
        { month: 'Feb', income: 28000, expenses: 7500 },
        { month: 'Mar', income: 32000, expenses: 9200 },
        { month: 'Abr', income: 29000, expenses: 8800 },
        { month: 'May', income: 35000, expenses: 9500 }
      ],
      expensesByCategory: [
        { name: 'hosting', amount: 25000 },
        { name: 'advertising', amount: 35000 },
        { name: 'software', amount: 18000 },
        { name: 'other', amount: 11000 }
      ]
    };

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error obteniendo stats de cashflow:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/cashflow/income - Ingresos
router.get('/cashflow/income', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    
    // Datos simulados
    const income = [
      {
        id: 1,
        date: new Date().toISOString(),
        description: 'Suscripción Premium - María García',
        source: 'Stripe',
        amount: 2900 // en centavos
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        description: 'Lectura personalizada - Juan Pérez',
        source: 'PayPal',
        amount: 3500
      }
    ];

    res.json({
      success: true,
      income,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: income.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/cashflow/expenses - Gastos
router.get('/cashflow/expenses', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    
    // Datos simulados
    const expenses = [
      {
        id: 1,
        date: new Date().toISOString(),
        description: 'Hosting Vercel Pro',
        category: 'hosting',
        amount: 2000, // en centavos
        recurring: true,
        notes: 'Plan mensual'
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        description: 'Google Ads Campaign',
        category: 'advertising',
        amount: 15000,
        recurring: false,
        notes: 'Campaña Q1 2024'
      }
    ];

    res.json({
      success: true,
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: expenses.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/cashflow/expenses - Crear gasto
router.post('/cashflow/expenses', requireAdmin, async (req, res) => {
  try {
    const {
      description,
      amount,
      category,
      date,
      recurring = false,
      notes
    } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ error: 'Descripción y cantidad son requeridos' });
    }

    // En una implementación real, esto se guardaría en base de datos
    const expense = {
      id: Date.now(),
      description,
      amount: parseInt(amount),
      category,
      date: date || new Date().toISOString(),
      recurring,
      notes,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Gasto creado exitosamente',
      expense
    });
  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/cashflow/expenses/:id - Actualizar gasto
router.put('/cashflow/expenses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Simulación de actualización
    const updatedExpense = {
      id: parseInt(id),
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/cashflow/expenses/:id - Eliminar gasto
router.delete('/cashflow/expenses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTAS DE UPLOAD
// ==========================================

// POST /api/admin/upload - Subir archivos
router.post('/upload', requireAdmin, async (req, res) => {
  try {
    // En una implementación real, aquí se manejaría la subida de archivos
    // usando multer, cloudinary, AWS S3, etc.
    
    const { type = 'general' } = req.body;
    
    // Simulación de URL de archivo subido
    const mockUrl = `https://res.cloudinary.com/arcana-club/${type}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      url: mockUrl,
      type
    });
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// Endpoint raíz para el panel admin: /api/admin
router.get('/', requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin API disponible', user: req.user });
});

export default router;