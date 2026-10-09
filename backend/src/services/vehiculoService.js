import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarEventos } from '../utils/logger.js';
import {
  eventoNuevo,
  eventoCambio,
  eventoBorrado,
  filasPresentes,
  filasDeVehiculo,
  cambiosDeVehiculo,
} from '../utils/eventosAuditoria.js';

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
    await registrarEventos(req, [
      eventoCambio('EDITAR MARCA', marca.nombre, cambiosDeMarca(anterior, marca)),
    ]);
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
  await registrarEventos(req, [
    eventoBorrado('ELIMINAR MARCA', marca.nombre, filasPresentes([['Nombre', marca.nombre]])),
  ]);
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
  const anterior = await prisma.vehiculo.findUnique({
    where: { placa: placaNorm },
    include: { marca: true },
  });
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

  await registrarEventos(req, [
    eventoCambio('EDITAR VEHÍCULO', vehiculo.placa, cambiosDeVehiculo(anterior, vehiculo)),
  ]);
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
  await registrarEventos(req, [
    eventoBorrado('ELIMINAR VEHÍCULO', vehiculo.placa, filasDeVehiculo(vehiculo)),
  ]);
  return { message: 'Vehículo eliminado' };
};

export const crearMarca = async ({ nombre }, req) => {
  const marca = await prisma.marcaVehiculo.create({
    data: { nombre: nombre.trim() },
  });
  await registrarEventos(req, [
    eventoNuevo('CREAR MARCA', marca.nombre, filasPresentes([['Nombre', marca.nombre]])),
  ]);
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

  await registrarEventos(req, [
    anterior
      ? eventoCambio('EDITAR VEHÍCULO', vehiculo.placa, cambiosDeVehiculo(anterior, vehiculo))
      : eventoNuevo('CREAR VEHÍCULO', vehiculo.placa, filasDeVehiculo(vehiculo)),
  ]);

  return vehiculo;
};

const cambiosDeMarca = (antes, despues) => {
  if (antes.nombre === despues.nombre) return [];
  return [{ etiqueta: 'Nombre', de: antes.nombre, a: despues.nombre }];
};
