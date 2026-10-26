import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

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
  if (normalizada.includes('..')) throw new BadRequestError('Ruta de imagen inválida');
  const abs = path.resolve(uploadsRoot, normalizada);
  if (!abs.startsWith(uploadsRoot + path.sep) && abs !== uploadsRoot) {
    throw new BadRequestError('Ruta de imagen inválida');
  }
  return abs;
};

export const guardarFotoArchivo = async (ordenId, tipo, file) => {
  if (!TIPOS_FOTO.includes(tipo)) throw new BadRequestError('Tipo de foto inválido');
  const ext = MIME_EXT[file?.mimetype];
  if (!ext) throw new BadRequestError('Formato no permitido. Usa JPG, PNG o WEBP.');
  if (!file.buffer?.length) throw new BadRequestError('La imagen está vacía');

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

/** Copia una foto vigente para el historial de auditoría (no se sobrescribe). */
export const copiarFotoAuditoria = async (ordenId, tipo, origenRelativo, sufijo = 'antes') => {
  const origen = resolver(origenRelativo);
  if (!origen) return null;
  try {
    await fs.access(origen);
  } catch {
    return null;
  }
  const ext = path.extname(origen).slice(1).toLowerCase() || 'jpg';
  const dir = path.join(uploadsRoot, 'auditoria', 'fotos', String(ordenId));
  await fs.mkdir(dir, { recursive: true });
  const nombre = `${Date.now()}-${tipo}-${sufijo}.${ext}`;
  const destino = path.join(dir, nombre);
  await fs.copyFile(origen, destino);
  return `auditoria/fotos/${ordenId}/${nombre}`;
};

export const copiarBufferAuditoria = async (ordenId, tipo, file, sufijo = 'nueva') => {
  const ext = MIME_EXT[file?.mimetype];
  if (!ext || !file.buffer?.length) return null;
  const dir = path.join(uploadsRoot, 'auditoria', 'fotos', String(ordenId));
  await fs.mkdir(dir, { recursive: true });
  const nombre = `${Date.now()}-${tipo}-${sufijo}.${ext}`;
  await fs.writeFile(path.join(dir, nombre), file.buffer);
  return `auditoria/fotos/${ordenId}/${nombre}`;
};

export const esRutaAuditoria = (rutaRelativa) => {
  const normalizada = String(rutaRelativa || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return normalizada.startsWith('auditoria/fotos/');
};

export const leerFotoArchivo = async (rutaRelativa) => {
  const abs = resolver(rutaRelativa);
  if (!abs) throw new NotFoundError('Imagen no encontrada');
  try {
    await fs.access(abs);
  } catch {
    throw new NotFoundError('Imagen no encontrada');
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
