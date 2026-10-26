import { log } from '../utils/logger.js';

export const auditLog = (accionDescripcion) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && !req.logManualRealizado) {
        // El servicio cambió datos sin llamar a services/auditoria.
        // Solo loguear en consola para detectarlo durante desarrollo.
        log.warn('Acción de escritura sin log de auditoría', {
          accion: accionDescripcion,
          usuarioId: req.user?.id,
          ruta: `${req.method} ${req.originalUrl}`,
        });
      }
    });
    next();
  };
};