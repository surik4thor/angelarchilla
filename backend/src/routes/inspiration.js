import express from 'express';
import { getDailyInspiration, getInspirationHistory } from '../controllers/inspirationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// GET /api/inspiration - Obtener frase inspiradora del día (pública)
router.get('/', getDailyInspiration);

// GET /api/inspiration/history - Obtener historial (solo admin)
router.get('/history', authenticate, requireAdmin, getInspirationHistory);

// POST /api/inspiration/generate - Forzar nueva generación (solo admin)
router.post('/generate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Eliminar frase existente si existe
    await prisma.dailyInspiration.deleteMany({
      where: { date: targetDate }
    });
    
    // Forzar nueva generación
    const { getDailyInspiration } = await import('../controllers/inspirationController.js');
    
    // Simular req para la función
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        res.json({
          success: true,
          message: `Nueva frase generada para ${targetDate}`,
          data
        });
      }
    };
    
    await getDailyInspiration(mockReq, mockRes);
  } catch (error) {
    console.error('Error forzando generación:', error);
    res.status(500).json({
      success: false,
      error: 'Error forzando nueva generación'
    });
  }
});

export default router;