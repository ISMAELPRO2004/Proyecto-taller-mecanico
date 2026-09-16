import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarLog } from '../utils/logger.js';

export const listarMarcas = async () => {
  return prisma.marcaVehiculo.findMany({ orderBy: { nombre: 'asc' } });
};

export const crearMarca = async ({ nombre }, req) => {
  const marca = await prisma.marcaVehiculo.create({
    data: { nombre: nombre.trim() },
  });
  await registrarLog(req, 'CREAR MARCA VEHICULO', marca);
  return marca;
};

export const buscarPorPlaca = async (placa) => {
  const placaNorm = decodeURIComponent(placa).trim().toUpperCase();
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { placa: placaNorm },
    include: {
      marca: true,
      ordenes: {
        include: {
          cliente: { select: { id: true, nombreRazonSocial: true, numeroDocumento: true } },
        },
        orderBy: { fechaCreacion: 'desc' },
        take: 10,
      },
    },
  });

  if (!vehiculo) throw new AppError('Vehículo no encontrado', 404);
  return vehiculo;
};

export const upsertVehiculo = async (data, req) => {
  const placa = data.placa.trim().toUpperCase();
  const marca = await prisma.marcaVehiculo.findUnique({ where: { id: parseInt(data.marcaId) } });
  if (!marca) throw new AppError('Marca no encontrada', 404);

  const vehiculo = await prisma.vehiculo.upsert({
    where: { placa },
    update: {
      marcaId: parseInt(data.marcaId),
      modelo: data.modelo,
      horometro: data.horometro ?? null,
      kilometraje: data.kilometraje ?? null,
    },
    create: {
      placa,
      marcaId: parseInt(data.marcaId),
      modelo: data.modelo,
      horometro: data.horometro ?? null,
      kilometraje: data.kilometraje ?? null,
    },
    include: { marca: true },
  });

  await registrarLog(req, 'UPSERT VEHICULO', {
    placa: vehiculo.placa,
    marca: vehiculo.marca.nombre,
    modelo: vehiculo.modelo,
  });

  return vehiculo;
};
