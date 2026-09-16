import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarLog } from '../utils/logger.js';

export const listarMarcas = async () => {
  return prisma.marcaVehiculo.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { vehiculos: true } } },
  });
};

export const actualizarMarca = async (id, { nombre }, req) => {
  const anterior = await prisma.marcaVehiculo.findUnique({ where: { id: parseInt(id) } });
  if (!anterior) throw new AppError('Marca no encontrada', 404);

  try {
    const marca = await prisma.marcaVehiculo.update({
      where: { id: parseInt(id) },
      data: { nombre: nombre.trim() },
    });
    await registrarLog(req, 'EDITAR MARCA', marca, anterior);
    return marca;
  } catch {
    throw new AppError('Ya existe una marca con ese nombre.');
  }
};

export const eliminarMarca = async (id, req) => {
  const marca = await prisma.marcaVehiculo.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { vehiculos: true } } },
  });
  if (!marca) throw new AppError('Marca no encontrada', 404);
  if (marca._count.vehiculos > 0) {
    throw new AppError('No se puede eliminar: hay vehículos con esta marca.');
  }

  await prisma.marcaVehiculo.delete({ where: { id: marca.id } });
  await registrarLog(req, 'ELIMINAR MARCA', null, marca);
  return { message: 'Marca eliminada' };
};

export const listarVehiculos = async () => {
  return prisma.vehiculo.findMany({
    include: {
      marca: true,
      _count: { select: { ordenes: true } },
    },
    orderBy: { placa: 'asc' },
  });
};

export const actualizarVehiculo = async (placa, data, req) => {
  const placaNorm = decodeURIComponent(placa).trim().toUpperCase();
  const anterior = await prisma.vehiculo.findUnique({ where: { placa: placaNorm } });
  if (!anterior) throw new AppError('Vehículo no encontrado', 404);

  const marca = await prisma.marcaVehiculo.findUnique({ where: { id: parseInt(data.marcaId) } });
  if (!marca) throw new AppError('Marca no encontrada', 404);

  const vehiculo = await prisma.vehiculo.update({
    where: { placa: placaNorm },
    data: {
      marcaId: parseInt(data.marcaId),
      modelo: data.modelo,
      horometro: data.horometro ?? null,
      kilometraje: data.kilometraje ?? null,
    },
    include: { marca: true },
  });

  await registrarLog(req, 'EDITAR VEHICULO', vehiculo, anterior);
  return vehiculo;
};

export const eliminarVehiculo = async (placa, req) => {
  const placaNorm = decodeURIComponent(placa).trim().toUpperCase();
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { placa: placaNorm },
    include: { _count: { select: { ordenes: true } }, marca: true },
  });
  if (!vehiculo) throw new AppError('Vehículo no encontrado', 404);
  if (vehiculo._count.ordenes > 0) {
    throw new AppError('No se puede eliminar: el vehículo tiene órdenes asociadas.');
  }

  await prisma.vehiculo.delete({ where: { placa: placaNorm } });
  await registrarLog(req, 'ELIMINAR VEHICULO', null, vehiculo);
  return { message: 'Vehículo eliminado' };
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
