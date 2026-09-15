import { isAppError } from './errors.js';

/**
 * Envuelve handlers async y mapea AppError / errores genéricos a respuestas HTTP.
 * Mantiene shapes de respuesta cercanos a los controllers originales.
 */
export const asyncHandler = (fn, { defaultStatus = 400, useMessageKey = true } = {}) => {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      if (isAppError(error)) {
        const body = useMessageKey
          ? { message: error.message }
          : { error: error.message };
        return res.status(error.statusCode).json(body);
      }

      console.error('❌ Error:', error.message);
      const body = useMessageKey
        ? { message: error.message, error: error.message }
        : { error: error.message };
      return res.status(defaultStatus).json(body);
    }
  };
};
