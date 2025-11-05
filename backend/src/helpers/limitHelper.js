// Helper para gestión de límites de lecturas

const membershipLimits = {
  invitado: { monthly: 3, dailyDreams: 1 },      // 3 lecturas mensuales para INVITADO
  esencial: { monthly: 15, dailyDreams: 2 },     // 15 lecturas mensuales para ESENCIAL  
  iniciado: { monthly: 15, dailyDreams: 2 },     // Legacy: mapea a ESENCIAL
  premium: { monthly: Infinity, dailyDreams: Infinity }, // Ilimitado para PREMIUM
  adepto: { monthly: Infinity, dailyDreams: Infinity },  // Legacy: mapea a PREMIUM
  maestro: { monthly: Infinity, dailyDreams: Infinity }, // Legacy: mapea a PREMIUM
};

export function getLimits(plan = 'invitado') {
  return membershipLimits[plan.toLowerCase()] || membershipLimits['invitado'];
}

export function isMaestroOrTrial(member) {
  if (!member) return false;
  const isMaestro = (member.subscriptionPlan || '').toUpperCase() === 'MAESTRO';
  const isTrial = member.trialActive && member.trialExpiry && new Date() < new Date(member.trialExpiry);
  return isMaestro || isTrial;
}
