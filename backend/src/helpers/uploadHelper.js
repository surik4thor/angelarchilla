import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Tipos permitidos
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedDigitalTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp3'];

// Configuración de almacenamiento para imágenes y archivos digitales
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'products', 'images'));
  },
  filename: (req, file, cb) => {
    // Sanitizar nombre
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});
const digitalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'products', 'digital'));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

function imageFileFilter(req, file, cb) {
  if (!allowedImageTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de imagen no permitido'), false);
  }
  cb(null, true);
}
function digitalFileFilter(req, file, cb) {
  if (!allowedDigitalTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo digital no permitido'), false);
  }
  cb(null, true);
}

export const uploadImageMiddleware = multer({ storage: imageStorage, limits: { fileSize: 4 * 1024 * 1024 }, fileFilter: imageFileFilter });
export const uploadDigitalMiddleware = multer({ storage: digitalStorage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: digitalFileFilter });

// Optimización de imagen al subir
export async function optimizeImage(filePath) {
  const optimizedPath = filePath.replace(/(\.[^.]+)$/, '_opt$1');
  await sharp(filePath)
    .resize({ width: 1200 })
    .jpeg({ quality: 80 })
    .toFile(optimizedPath);
  return optimizedPath;
}

// Generar preview de archivo digital (PDF, audio, imagen)
export async function generatePreview(filePath, type = 'pdf') {
  // Para PDF: extraer primera página como imagen
  // Para audio: recortar primeros 30 segundos
  // Para imagen: reducir tamaño
  // Implementación básica, se puede ampliar según tipo
  const previewPath = filePath.replace(/(\.[^.]+)$/, '_preview$1');
  if (type === 'image') {
    await sharp(filePath)
      .resize({ width: 600 })
      .jpeg({ quality: 60 })
      .toFile(previewPath);
  }
  // Otros tipos: implementar según necesidad
  return previewPath;
}
