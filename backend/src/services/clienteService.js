import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarLog } from '../utils/logger.js';

export const listarClientes = async (q) => {
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
    take: 50,
  });
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
