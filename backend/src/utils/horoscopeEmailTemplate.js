import fs from 'fs';
import path from 'path';

export function getHoroscopeEmailTemplate() {
  // Lee la ruta desde la variable de entorno .env
  const relPath = process.env.HOROSCOPE_EMAIL_HTML || 'backend/src/templates/horoscope_email_template.html';
  const absPath = path.resolve(process.cwd(), relPath);
  return fs.readFileSync(absPath, 'utf8');
}
