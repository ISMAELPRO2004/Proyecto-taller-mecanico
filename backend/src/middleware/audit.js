export const auditLog = (accionDescripcion) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && !req.logManualRealizado) {
        // Si llegamos aquí, un controller mutó datos sin llamar a registrarLog.
        // Solo loguear en consola para detectarlo durante desarrollo.
        console.warn(
          `⚠️  [AUDIT] Acción sin log manual detectada: ${accionDescripcion} | ` +
          `Usuario: ${req.user?.id} | Ruta: ${req.method} ${req.originalUrl}`
        );
      }
    });
    next();
  };
};