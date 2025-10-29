// src/middleware/secrets.js
// Utilidad para exponer los secrets de Docker Swarm o variables de entorno

import fs from 'fs';

export function getSecret(secretName, fallback = null) {
  // Intenta leer el secret desde /run/secrets (Swarm)
  try {
    const value = fs.readFileSync(`/run/secrets/${secretName}`, 'utf8').trim();
    if (value) return value;
  } catch (e) {
    // Si no existe, intenta desde process.env
    if (process.env[secretName]) return process.env[secretName];
  }
  // Si no existe, retorna el fallback
  return fallback;
}
