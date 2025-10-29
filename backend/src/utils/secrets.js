// Utilidad para leer secretos desde Docker secrets o process.env
import fs from 'fs';

export function getSecret(secretName, fallback = null) {
  try {
    return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8').trim();
  } catch (err) {
    return fallback || process.env[secretName];
  }
}
