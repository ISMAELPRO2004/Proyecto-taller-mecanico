import { isAppError, NotFoundError } from '../utils/errors.js';

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError('Ruta no encontrada'));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (isAppError(err) || Number.isInteger(err.statusCode)) {
    const status = err.statusCode || 400;
    return res.status(status).json({
      message: err.message,
      error: err.message,
    });
  }

  console.error('❌ Error:', err.message);
  return res.status(500).json({
    message: 'Error interno del servidor',
    error: 'Error interno del servidor',
  });
};
