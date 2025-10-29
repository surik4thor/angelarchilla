import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserUsageStats, SUBSCRIPTION_LIMITS } from '../middleware/subscriptionLimits.js';

const router = express.Router();

// Obtener estadísticas completas de uso del usuario
router.get('/usage-stats', authenticate, async (req, res) => {
  try {
    const userId = req.member.id;
    const userPlan = req.member.subscriptionPlan || 'INVITADO';
    const limits = SUBSCRIPTION_LIMITS[userPlan];

    // Obtener estadísticas de uso
    const usageStats = await getUserUsageStats(userId);
    
    if (!usageStats) {
      return res.status(500).json({ 
        error: 'Error interno',
        message: 'No se pudieron obtener las estadísticas de uso'
      });
    }

    // Calcular límites restantes
    const remainingLimits = {
      readingsDaily: null,
      readingsMonthly: null,
      dreamsDaily: null
    };

    if (limits.maxReadingsPerDay !== null) {
      remainingLimits.readingsDaily = Math.max(0, limits.maxReadingsPerDay - usageStats.readings.today);
    }

    if (limits.maxReadingsPerMonth !== null) {
      remainingLimits.readingsMonthly = Math.max(0, limits.maxReadingsPerMonth - usageStats.readings.thisMonth);
    }

    if (userPlan === 'MAESTRO') {
      // Límite generoso para sueños en plan MAESTRO (10 por día)
      remainingLimits.dreamsDaily = Math.max(0, 10 - usageStats.dreams.today);
    }

    res.json({
      success: true,
      userPlan,
      currentUsage: usageStats,
      limits: {
        maxReadingsPerDay: limits.maxReadingsPerDay,
        maxReadingsPerMonth: limits.maxReadingsPerMonth,
        hasDreams: limits.hasDreams,
        hasNatalCharts: limits.hasNatalCharts,
        hasPersonalizedHoroscopes: limits.hasPersonalizedHoroscopes,
        hasHistory: limits.hasHistory,
        hasPartnerSync: limits.hasPartnerSync
      },
      remaining: remainingLimits,
      features: {
        dreams: limits.hasDreams,
        natalCharts: limits.hasNatalCharts,
        personalizedHoroscopes: limits.hasPersonalizedHoroscopes,
        history: limits.hasHistory,
        partnerSync: limits.hasPartnerSync
      }
    });

  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ 
      error: 'Error interno',
      message: 'Error obteniendo estadísticas de uso'
    });
  }
});

// Obtener información de límites para el plan actual
router.get('/plan-info', authenticate, async (req, res) => {
  try {
    const userPlan = req.member.subscriptionPlan || 'INVITADO';
    const limits = SUBSCRIPTION_LIMITS[userPlan];

    if (!limits) {
      return res.status(500).json({ 
        error: 'Plan no válido',
        message: 'Tu plan de suscripción no es reconocido'
      });
    }

    res.json({
      success: true,
      plan: userPlan,
      limits: {
        maxReadingsPerDay: limits.maxReadingsPerDay,
        maxReadingsPerMonth: limits.maxReadingsPerMonth,
        hasDreams: limits.hasDreams,
        hasNatalCharts: limits.hasNatalCharts,
        hasPersonalizedHoroscopes: limits.hasPersonalizedHoroscopes,
        hasHistory: limits.hasHistory,
        hasPartnerSync: limits.hasPartnerSync
      },
      features: {
        dreams: {
          available: limits.hasDreams,
          requiredPlan: limits.hasDreams ? userPlan : 'MAESTRO'
        },
        natalCharts: {
          available: limits.hasNatalCharts,
          requiredPlan: limits.hasNatalCharts ? userPlan : 'ADEPTO'
        },
        personalizedHoroscopes: {
          available: limits.hasPersonalizedHoroscopes,
          requiredPlan: limits.hasPersonalizedHoroscopes ? userPlan : 'ADEPTO'
        },
        history: {
          available: limits.hasHistory,
          requiredPlan: limits.hasHistory ? userPlan : 'ADEPTO'
        },
        partnerSync: {
          available: limits.hasPartnerSync,
          requiredPlan: limits.hasPartnerSync ? userPlan : 'MAESTRO'
        }
      }
    });

  } catch (error) {
    console.error('Error getting plan info:', error);
    res.status(500).json({ 
      error: 'Error interno',
      message: 'Error obteniendo información del plan'
    });
  }
});

export default router;