import { PrismaClient } from '@prisma/client';
import * as llmService from '../services/llmService.js';
import astroService from '../services/astroService.js';

const prisma = new PrismaClient();

class PersonalizedHoroscopeController {
  /**
   * Generar horóscopo personalizado basado en carta natal y tránsitos actuales
   */
  static async generatePersonalizedHoroscope(req, res) {
    try {
      const userId = req.member?.id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Verificar suscripción activa
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Obtener carta natal del usuario
      const natalChart = await prisma.natalChart.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!natalChart) {
        return res.status(404).json({
          success: false,
          error: 'Carta natal no encontrada. Calcula tu carta natal primero.'
        });
      }

      // Verificar límites diarios para usuarios free
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!user.isPremium) {
        const horoscopeCount = await prisma.personalizedHoroscope.count({
          where: {
            userId: userId,
            createdAt: {
              gte: today
            }
          }
        });

        if (horoscopeCount >= 1) {
          return res.status(429).json({
            success: false,
            error: 'Límite diario alcanzado. Mejora a Premium para horóscopos ilimitados.',
            limit: 'daily_limit_reached'
          });
        }
      }

      // Calcular tránsitos actuales
      const currentTransits = astroService.default.calculateCurrentTransits
        ? astroService.default.calculateCurrentTransits(natalChart.planetPositions, new Date())
        : astroService.calculateCurrentTransits(natalChart.planetPositions, new Date());

      // Generar horóscopo personalizado con IA
      const horoscopeContent = await llmService.generatePersonalizedHoroscope(
        natalChart,
        currentTransits,
        user.zodiacSign || natalChart.zodiacSign
      );

      // Guardar en base de datos
      const personalizedHoroscope = await prisma.personalizedHoroscope.create({
        data: {
          userId: userId,
          natalChartId: natalChart.id,
          content: horoscopeContent.content,
          transits: JSON.stringify(currentTransits),
          zodiacSign: user.zodiacSign || astroService.getZodiacSign(natalChart.planetPositions.Sun),
          date: new Date()
        }
      });

      res.json({
        success: true,
        horoscope: {
          id: personalizedHoroscope.id,
          content: personalizedHoroscope.content,
          transits: currentTransits,
          zodiacSign: personalizedHoroscope.zodiacSign,
          date: personalizedHoroscope.date
        }
      });

    } catch (error) {
      console.error('Error generando horóscopo personalizado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de horóscopos personalizados
   */
  static async getHoroscopeHistory(req, res) {
    try {
      const userId = req.member?.id || req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const horoscopes = await prisma.personalizedHoroscope.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit,
        include: {
          natalChart: true
        }
      });

      const total = await prisma.personalizedHoroscope.count({
        where: { userId: userId }
      });

      const horoscopesWithParsedTransits = horoscopes.map(h => ({
        ...h,
        transits: JSON.parse(h.transits || '[]')
      }));

      res.json({
        success: true,
        horoscopes: horoscopesWithParsedTransits,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de horóscopos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener horóscopo específico por ID
   */
  static async getHoroscopeById(req, res) {
    try {
      const userId = req.member?.id || req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const horoscope = await prisma.personalizedHoroscope.findFirst({
        where: {
          id: parseInt(id),
          userId: userId
        },
        include: {
          natalChart: true
        }
      });

      if (!horoscope) {
        return res.status(404).json({
          success: false,
          error: 'Horóscopo no encontrado'
        });
      }

      res.json({
        success: true,
        horoscope: {
          ...horoscope,
          transits: JSON.parse(horoscope.transits || '[]')
        }
      });

    } catch (error) {
      console.error('Error obteniendo horóscopo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar horóscopo personalizado
   */
  static async deleteHoroscope(req, res) {
    try {
      const userId = req.member?.id || req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const horoscope = await prisma.personalizedHoroscope.findFirst({
        where: {
          id: parseInt(id),
          userId: userId
        }
      });

      if (!horoscope) {
        return res.status(404).json({
          success: false,
          error: 'Horóscopo no encontrado'
        });
      }

      await prisma.personalizedHoroscope.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Horóscopo eliminado correctamente'
      });

    } catch (error) {
      console.error('Error eliminando horóscopo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de horóscopos personalizados
   */
  static async getHoroscopeStats(req, res) {
    try {
      const userId = req.member?.id || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const total = await prisma.personalizedHoroscope.count({
        where: { userId: userId }
      });

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthCount = await prisma.personalizedHoroscope.count({
        where: {
          userId: userId,
          createdAt: { gte: thisMonth }
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await prisma.personalizedHoroscope.count({
        where: {
          userId: userId,
          createdAt: { gte: today }
        }
      });

      res.json({
        success: true,
        stats: {
          total,
          thisMonth: thisMonthCount,
          today: todayCount,
          hasNatalChart: await prisma.natalChart.findFirst({
            where: { userId: userId }
          }) !== null
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default PersonalizedHoroscopeController;