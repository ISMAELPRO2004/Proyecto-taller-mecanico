import prisma from '../config/prisma.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { auditarMarca, auditarVehiculo } from './auditoria/index.js';

export const listarMarcas = async () => {
  return prisma.marcaVehiculo.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { vehiculos: true } } },
  });
};

export const actualizarMarca = async (id, { nombre }, req) => {
  const anterior = await prisma.marcaVehiculo.findUnique({ where: { id: parseInt(id) } });
  if (!anterior) throw new NotFoundError('Marca no encontrada');

  try {
    const marca = await prisma.marcaVehiculo.update({
      where: { id: parseInt(id) },
      data: { nombre: nombre.trim() },
    });
    await auditarMarca.editar(req, anterior, marca);
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
  if (!marca) throw new NotFoundError('Marca no encontrada');
  if (marca._count.vehiculos > 0) {
    throw new AppError('No se puede eliminar: hay vehículos con esta marca.');
  }

  await prisma.marcaVehiculo.delete({ where: { id: marca.id } });
  await auditarMarca.eliminar(req, marca);
  return { message: 'Marca eliminada' };
};

export const sugerirVehiculos = async (q) => {
  const texto = String(q || '').trim();
  const compacto = texto.replace(/[^A-Za-z0-9]/g, '');
  if (compacto.length < 2) return [];

  return prisma.vehiculo.findMany({
    where: {
      OR: [
        { placa: { contains: texto, mode: 'insensitive' } },
        { placa: { contains: compacto, mode: 'insensitive' } },
        { modelo: { contains: texto, mode: 'insensitive' } },
        { marca: { nombre: { contains: texto, mode: 'insensitive' } } },
      ],
    },
    select: {
      placa: true,
      modelo: true,
      marca: { select: { nombre: true } },
    },
    orderBy: { placa: 'asc' },
    take: 8,
  });
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
  const anterior = await prisma.vehiculo.findUnique({
    where: { placa: placaNorm },
    include: { marca: true },
  });
  if (!anterior) throw new NotFoundError('Vehículo no encontrado');

  const marca = await prisma.marcaVehiculo.findUnique({ where: { id: parseInt(data.marcaId) } });
  if (!marca) throw new NotFoundError('Marca no encontrada');

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

  await auditarVehiculo.editar(req, anterior, vehiculo);
  return vehiculo;
};

export const eliminarVehiculo = async (placa, req) => {
  const placaNorm = decodeURIComponent(placa).trim().toUpperCase();
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { placa: placaNorm },
    include: { _count: { select: { ordenes: true } }, marca: true },
  });
  if (!vehiculo) throw new NotFoundError('Vehículo no encontrado');
  if (vehiculo._count.ordenes > 0) {
    throw new AppError('No se puede eliminar: el vehículo tiene órdenes asociadas.');
  }

  await prisma.vehiculo.delete({ where: { placa: placaNorm } });
  await auditarVehiculo.eliminar(req, vehiculo);
  return { message: 'Vehículo eliminado' };
};

export const crearMarca = async ({ nombre }, req) => {
  const marca = await prisma.marcaVehiculo.create({
    data: { nombre: nombre.trim() },
  });
  await auditarMarca.crear(req, marca);
  return marca;
};

export const buscarPorPlaca = async (placa) => {
  const placaNorm = decodeURIComponent(placa).trim().toUpperCase();
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { placa: placaNorm },
    include: {
      marca: true,
      ordenes: {
        where: { estado: { in: ['TERMINADO', 'CANCELADO'] } },
        include: {
          cliente: true,
        },
        orderBy: { fechaCreacion: 'desc' },
        take: 10,
      },
    },
  });

  if (!vehiculo) throw new NotFoundError('Vehículo no encontrado');
  return vehiculo;
};

export const upsertVehiculo = async (data, req) => {
  const placa = data.placa.trim().toUpperCase();
  const marca = await prisma.marcaVehiculo.findUnique({ where: { id: parseInt(data.marcaId) } });
  if (!marca) throw new NotFoundError('Marca no encontrada');

  const anterior = await prisma.vehiculo.findUnique({
    where: { placa },
    include: { marca: true },
  });

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

  await auditarVehiculo.guardar(req, { anterior, vehiculo });

  return vehiculo;
};
