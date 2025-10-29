// Utilidad para obtener el label de un plan
export function getPlanLabel(plan) {
  switch ((plan || '').toLowerCase()) {
    case 'invitado': return 'Invitado';
    case 'iniciado': return 'Iniciado';
    case 'adepto': return 'Adepto';
    case 'maestro': return 'Maestro';
    default: return 'Invitado';
  }
}
