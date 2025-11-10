// Utilidad para obtener el label de un plan
export function getPlanLabel(plan) {
  switch ((plan || '').toLowerCase()) {
    case 'free': return 'Free';
    case 'premium': return 'Premium';
    // Legacy support (mantener por compatibilidad)
    case 'invitado': return 'Free';
    case 'iniciado': return 'Premium';
    case 'adepto': return 'Premium';
    case 'maestro': return 'Premium';
    default: return 'Free';
  }
}
