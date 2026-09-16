import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarLog } from '../utils/logger.js';

export const listarClientes = async (q, { todos = false } = {}) => {
  const where = q
    ? {
      OR: [
        { numeroDocumento: { contains: q, mode: 'insensitive' } },
        { nombreRazonSocial: { contains: q, mode: 'insensitive' } },
        { celular: { contains: q } },
      ],
    }
    : {};

  return prisma.cliente.findMany({
    where,
    orderBy: { nombreRazonSocial: 'asc' },
    ...(todos ? {} : { take: 50 }),
    include: { _count: { select: { ordenes: true } } },
  });
};

export const actualizarCliente = async (id, data, req) => {
  const existente = await prisma.cliente.findUnique({ where: { id: parseInt(id) } });
  if (!existente) throw new AppError('Cliente no encontrado', 404);

  const payload = {
    tipoCliente: data.tipoCliente,
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: String(data.numeroDocumento).trim(),
    nombreRazonSocial: data.nombreRazonSocial.trim(),
    representante: data.representante?.trim() || null,
    celular: data.celular?.trim() || null,
    correo: data.correo?.trim() || null,
  };

  try {
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: payload,
    });
    await registrarLog(req, 'EDITAR CLIENTE', payload, existente);
    return cliente;
  } catch {
    throw new AppError('No se pudo actualizar. El documento puede estar en uso.');
  }
};

export const eliminarCliente = async (id, req) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { ordenes: true } } },
  });
  if (!cliente) throw new AppError('Cliente no encontrado', 404);
  if (cliente._count.ordenes > 0) {
    throw new AppError('No se puede eliminar: el cliente tiene órdenes asociadas.');
  }

  await prisma.cliente.delete({ where: { id: cliente.id } });
  await registrarLog(req, 'ELIMINAR CLIENTE', null, cliente);
  return { message: 'Cliente eliminado' };
};

export const buscarPorDocumento = async (numeroDocumento) => {
  const cliente = await prisma.cliente.findUnique({
    where: { numeroDocumento: String(numeroDocumento).trim() },
  });
  if (!cliente) throw new AppError('Cliente no encontrado', 404);
  return cliente;
};

export const crearOActualizarCliente = async (data, req) => {
  const payload = {
    tipoCliente: data.tipoCliente,
    tipoDocumento: data.tipoDocumento,
    numeroDocumento: String(data.numeroDocumento).trim(),
    nombreRazonSocial: data.nombreRazonSocial.trim(),
    representante: data.representante?.trim() || null,
    celular: data.celular?.trim() || null,
    correo: data.correo?.trim() || null,
  };

  const cliente = await prisma.cliente.upsert({
    where: { numeroDocumento: payload.numeroDocumento },
    update: payload,
    create: payload,
  });

  await registrarLog(req, 'UPSERT CLIENTE', payload);
  return cliente;
};
