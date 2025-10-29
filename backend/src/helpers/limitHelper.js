// Helper para gestión de límites de lecturas

const membershipLimits = {
  invitado: { daily: 1, dailyDreams: 1 },
  iniciado: { monthly: 5, dailyDreams: 2 },
  adepto: { monthly: 20, dailyDreams: 5 },
  maestro: { monthly: Infinity, dailyDreams: Infinity },
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
