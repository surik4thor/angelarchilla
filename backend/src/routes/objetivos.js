
import { PrismaClient } from '@prisma/client';
import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Propuesta automática de objetivos por IA
router.get('/proponer', authenticate, requireAdmin, async (req, res) => {
  try {
    const { getObjetivosPropuestos } = await import('../services/objetivosAI.js');
    const objetivosPropuestos = await getObjetivosPropuestos();
    res.json({ success: true, objetivos: objetivosPropuestos });
  } catch (error) {
    console.error('Error en /objetivos/proponer:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudo generar la propuesta de objetivos automáticamente. Intenta de nuevo más tarde o contacta con soporte.'
    });
  }
});

// Obtener objetivos actuales
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const objetivos = await prisma.objetivo.findMany();
    res.json({ success: true, objetivos });
  } catch (error) {
    console.error('Error en /objetivos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener los objetivos. Por favor, inténtalo de nuevo más tarde o contacta con soporte.'
    });
  }
});

// Actualizar o crear objetivos
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { objetivos } = req.body;
    if (!Array.isArray(objetivos)) return res.status(400).json({ success: false, message: 'El formato de los objetivos enviados no es válido.' });
    // Actualizar o crear cada objetivo
    const results = [];
    for (const obj of objetivos) {
      const updated = await prisma.objetivo.upsert({
        where: { clave: obj.clave },
        update: { valor: obj.valor, descripcion: obj.descripcion },
        create: { clave: obj.clave, valor: obj.valor, descripcion: obj.descripcion }
      });
      results.push(updated);
    }
    res.json({ success: true, objetivos: results });
  } catch (error) {
    console.error('Error en POST /objetivos:', error);
    res.status(500).json({
      success: false,
      message: 'No se pudieron guardar los objetivos. Por favor, revisa los datos e inténtalo de nuevo. Si el problema continúa, contacta con soporte.'
    });
  }
});

export default router;
