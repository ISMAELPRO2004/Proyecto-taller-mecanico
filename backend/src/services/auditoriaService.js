import prisma from '../config/prisma.js';

export const listarLogs = async (query = {}) => {
  const {
    usuarioId,
    ordenId,
    accion,
    fechaDesde,
    fechaHasta,
    page = 1,
    limit = 50,
  } = query;

  const where = {};
  if (usuarioId) where.usuarioId = parseInt(usuarioId);
  if (ordenId) where.ordenId = parseInt(ordenId);
  if (accion) where.accion = { contains: accion, mode: 'insensitive' };
  if (fechaDesde || fechaHasta) {
    where.fecha = {};
    if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
    if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [total, logs] = await Promise.all([
    prisma.logActividad.count({ where }),
    prisma.logActividad.findMany({
      where,
      include: {
        usuario: { select: { username: true, nombreCompleto: true, rol: true } },
        orden: {
          select: {
            numeroOrden: true,
            clienteNombre: true,
            responsable: { select: { nombreCompleto: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      skip,
      take,
    }),
  ]);

  return {
    data: logs,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
  };
};
