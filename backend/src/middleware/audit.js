import prisma from '../config/prisma.js';

export const auditLog = (accionDescripcion) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          // Detectamos si la ruta es de órdenes para vincular el ID
          const esRutaDeOrden = req.originalUrl.includes('ordenes');
          
          await prisma.logActividad.create({
            data: {
              usuarioId: req.user.id,
              accion: `${accionDescripcion} - URL: ${req.originalUrl}`,
              // Solo vinculamos si es una orden, sino guardamos null
              ordenId: esRutaDeOrden && req.params.id ? parseInt(req.params.id) : null
            }
          });
        } catch (error) {
          // Si falla el log, lo vemos en consola para depurar
          console.error("⚠️ Error en auditoría:", error.message);
        }
      }
    });
    next();
  };
};