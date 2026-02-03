import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const auditLog = (accionDescripcion) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await prisma.logActividad.create({
            data: {
              usuarioId: req.user.id,
              ordenId: req.params.id ? parseInt(req.params.id) : null,
              accion: `${accionDescripcion} - Ruta: ${req.originalUrl}`,
            },
          });
        } catch (error) {
          console.error("Error al registrar auditoría:", error);
        }
      }
    });
    next();
  };
};