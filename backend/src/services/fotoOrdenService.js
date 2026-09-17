import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/errors.js';

const uploadsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const EXT_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const TIPOS_FOTO = ['registro', 'desarrollo'];

const carpetaOrden = (ordenId) => path.join(uploadsRoot, 'ordenes', String(ordenId));

const resolver = (rutaRelativa) => {
  if (!rutaRelativa || typeof rutaRelativa !== 'string') return null;
  const normalizada = rutaRelativa.replace(/\\/g, '/').replace(/^\/+/, '');
  if (normalizada.includes('..')) throw new AppError('Ruta de imagen inválida', 400);
  const abs = path.resolve(uploadsRoot, normalizada);
  if (!abs.startsWith(uploadsRoot + path.sep) && abs !== uploadsRoot) {
    throw new AppError('Ruta de imagen inválida', 400);
  }
  return abs;
};

export const guardarFotoArchivo = async (ordenId, tipo, file) => {
  if (!TIPOS_FOTO.includes(tipo)) throw new AppError('Tipo de foto inválido', 400);
  const ext = MIME_EXT[file?.mimetype];
  if (!ext) throw new AppError('Formato no permitido. Usa JPG, PNG o WEBP.', 400);
  if (!file.buffer?.length) throw new AppError('La imagen está vacía', 400);

  const dir = carpetaOrden(ordenId);
  await fs.mkdir(dir, { recursive: true });

  const anteriores = await fs.readdir(dir).catch(() => []);
  await Promise.all(
    anteriores
      .filter((nombre) => nombre.startsWith(`${tipo}.`))
      .map((nombre) => fs.unlink(path.join(dir, nombre)).catch(() => {}))
  );

  const archivo = `${tipo}.${ext}`;
  await fs.writeFile(path.join(dir, archivo), file.buffer);
  return `ordenes/${ordenId}/${archivo}`;
};

export const leerFotoArchivo = async (rutaRelativa) => {
  const abs = resolver(rutaRelativa);
  if (!abs) throw new AppError('Imagen no encontrada', 404);
  try {
    await fs.access(abs);
  } catch {
    throw new AppError('Imagen no encontrada', 404);
  }
  const ext = path.extname(abs).slice(1).toLowerCase();
  return { abs, mime: EXT_MIME[ext] || 'application/octet-stream' };
};

export const borrarFotoArchivo = async (rutaRelativa) => {
  const abs = resolver(rutaRelativa);
  if (!abs) return;
  await fs.unlink(abs).catch(() => {});
};

export const borrarCarpetaOrden = async (ordenId) => {
  await fs.rm(carpetaOrden(ordenId), { recursive: true, force: true });
};
