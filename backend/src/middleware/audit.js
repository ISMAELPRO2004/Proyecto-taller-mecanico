import prisma from '../config/prisma.js';

export const auditLog = (accionDescripcion) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      // Solo registramos si la operación fue exitosa (200-299)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await prisma.logActividad.create({
            data: {
              usuarioId: req.user.id,
              accion: `${accionDescripcion} - Ruta: ${req.originalUrl}`,
              // Si hay un ID de orden en la URL, lo asociamos
              ordenId: req.params.id ? parseInt(req.params.id) : null
            }
          });
        } catch (error) {
          console.error("Error en log de auditoría:", error);
        }
      }
    });
    next();
  };
};