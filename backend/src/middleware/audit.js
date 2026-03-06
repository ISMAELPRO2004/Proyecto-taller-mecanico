import prisma from '../config/prisma.js';

export const auditLog = (accionDescripcion) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      // CONDICIÓN: Solo registra si la respuesta fue exitosa Y NO se hizo un log manual
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && !req.logManualRealizado) {
        try {
          const esRutaDeOrden = req.originalUrl.includes('ordenes');
          
          await prisma.logActividad.create({
            data: {
              usuarioId: req.user.id,
              accion: accionDescripcion, // Usamos la descripción limpia sin la URL
              ordenId: esRutaDeOrden && req.params.id ? parseInt(req.params.id) : null
            }
          });
        } catch (error) {
          console.error("⚠️ Error en auditoría global:", error.message);
        }
      }
    });
    next();
  };
};