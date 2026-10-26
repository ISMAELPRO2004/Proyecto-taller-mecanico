import { isAppError, NotFoundError } from '../utils/errors.js';
import { log } from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError('Ruta no encontrada'));
};

const esErrorPrisma = (err) => {
  const codigo = err?.code;
  return typeof codigo === 'string' && /^P\d{4}$/.test(codigo);
};

const esErrorConexion = (err) => {
  const codigo = err?.code;
  if (codigo === 'P1001' || codigo === 'P1002' || codigo === 'P1017' || codigo === 'ECONNREFUSED' || codigo === 'ETIMEDOUT' || codigo === 'ENOTFOUND') {
    return true;
  }
  const nombre = err?.name || '';
  return nombre.includes('PrismaClientInitialization') || nombre.includes('PrismaClientRustPanic');
};

const mensajePrisma = (err) => {
  if (esErrorConexion(err)) {
    return 'No se pudo conectar con la base de datos. Intenta de nuevo.';
  }
  if (err.code === 'P2002') {
    return 'Ya existe un registro con esos datos.';
  }
  if (err.code === 'P2025') {
    return 'El registro ya no existe.';
  }
  if (err.code === 'P2003') {
    return 'No se puede completar: hay datos relacionados.';
  }
  return 'Error al guardar o consultar datos.';
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const ruta = `${req.method} ${req.originalUrl}`;

  if (isAppError(err) || Number.isInteger(err.statusCode)) {
    const status = err.statusCode || 400;
    if (status >= 500) {
      log.error(`API ${ruta}`, err, { status });
    } else {
      log.warn(`API ${ruta} → ${status}`, { mensaje: err.message });
    }
    return res.status(status).json({
      message: err.message,
      error: err.message,
    });
  }

  if (esErrorConexion(err) || esErrorPrisma(err)) {
    log.error(`Prisma/BD ${ruta}`, err);
    return res.status(esErrorConexion(err) ? 503 : 400).json({
      message: mensajePrisma(err),
      error: mensajePrisma(err),
    });
  }

  log.error(`Error no controlado ${ruta}`, err);
  return res.status(500).json({
    message: 'Error interno del servidor',
    error: 'Error interno del servidor',
  });
};
