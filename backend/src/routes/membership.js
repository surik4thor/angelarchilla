import express from 'express';
import { config } from '../config/config.js';

const router = express.Router();

// Endpoint público para obtener los planes y precios
router.get('/plans', (req, res) => {
  const plans = [
    {
      name: 'Invitado',
      priceMonthly: 0,
      priceAnnual: 0,
      stripeIdMonthly: null,
      stripeIdAnnual: null,
      description: '3 lecturas al mes (tarot y runas). Acceso básico a cartas y horóscopo. Sin historial.'
    },
    {
      name: 'Iniciado',
      priceMonthly: config.membership.iniciado.priceMonthly,
      priceAnnual: config.membership.iniciado.priceAnnual,
      stripeIdMonthly: config.membership.iniciado.stripeIdMonthly,
      stripeIdAnnual: config.membership.iniciado.stripeIdAnnual,
      description: '6 lecturas al mes (opciones completas), horóscopo diario personalizado. Acceso al historial.'
    },
    {
      name: 'Adepto',
      priceMonthly: config.membership.adepto.priceMonthly,
      priceAnnual: config.membership.adepto.priceAnnual,
      stripeIdMonthly: config.membership.adepto.stripeIdMonthly,
      stripeIdAnnual: config.membership.adepto.stripeIdAnnual,
      description: '12 lecturas al mes (opciones completas), horóscopo diario personalizado y de pareja. Historial y promociones exclusivas.'
    },
    {
      name: 'Maestro',
      priceMonthly: config.membership.maestro.priceMonthly,
      priceAnnual: config.membership.maestro.priceAnnual,
      stripeIdMonthly: config.membership.maestro.stripeIdMonthly,
      stripeIdAnnual: config.membership.maestro.stripeIdAnnual,
      description: 'Lecturas ilimitadas, beneficios exclusivos, prioridad en el club, etiqueta en perfil público. Acceso al historial.'
    }
  ];
  res.json(plans);
});

export default router;
