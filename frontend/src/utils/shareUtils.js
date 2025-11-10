/**
 * Utilidades para compartir la web de Nebulosa Mágica
 */

export const shareNebulosaMagica = (context = '') => {
  const shareData = {
    title: '🌟 Nebulosa Mágica - Tarot, Runas y Sueños',
    text: `Descubre el significado oculto de tu futuro con interpretaciones ${context} profesionales por IA. ¡Únete a Nebulosa Mágica!`,
    url: 'https://www.nebulosamagica.com'
  };

  if (navigator.share) {
    // Usar Web Share API si está disponible (móviles)
    navigator.share(shareData).catch((error) => {
      console.log('Error al compartir:', error);
      // Fallback a copiar enlace
      fallbackShare(context);
    });
  } else {
    // Fallback para escritorio
    fallbackShare(context);
  }
};

const fallbackShare = (context) => {
  // Copiar enlace al portapapeles
  navigator.clipboard.writeText('https://www.nebulosamagica.com').then(() => {
    alert(`🔗 ¡Enlace copiado al portapapeles!

Comparte https://www.nebulosamagica.com con tus amigos para que descubran ${context ? `las ${context}` : 'los misterios'} de Nebulosa Mágica.`);
  }).catch(() => {
    // Si no funciona el portapapeles, mostrar el enlace
    alert(`📱 ¡Comparte Nebulosa Mágica con tus amigos!

Enlace: https://www.nebulosamagica.com

¡Ayúdales a descubrir ${context ? `las ${context}` : 'los secretos del futuro'}!`);
  });
};

export default shareNebulosaMagica;