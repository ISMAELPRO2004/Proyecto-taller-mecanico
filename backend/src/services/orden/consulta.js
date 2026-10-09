import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { includeOrdenLista, includeOrdenDetalle } from './comun.js';

export const listarOrdenes = async () => {
  return prisma.ordenTrabajo.findMany({
    include: includeOrdenLista,
    orderBy: { fechaCreacion: 'desc' },
  });
};

export const obtenerOrdenPorId = async (id) => {
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: includeOrdenDetalle,
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  return orden;
};
