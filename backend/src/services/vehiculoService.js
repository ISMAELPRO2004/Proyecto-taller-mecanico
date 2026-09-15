import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';

export const buscarPorPlaca = async (placa) => {
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { placa: placa.toUpperCase() },
  });

  if (!vehiculo) throw new AppError('Vehículo no encontrado', 404);
  return vehiculo;
};
