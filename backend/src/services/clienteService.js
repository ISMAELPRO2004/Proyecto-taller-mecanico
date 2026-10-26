import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { log } from '../utils/logger.js';
import { auditarCliente } from './auditoria/index.js';

const plantillaConsulta = (tipoDocumento, numeroDocumento, extra = {}) => ({
  id: null,
  tipoCliente: tipoDocumento === 'RUC' ? 'EMPRESA' : 'PERSONA',
  tipoDocumento,
  numeroDocumento,
  nombreRazonSocial: '',
  representante: '',
  celular: extra.celular || '',
  correo: '',
});

const cuerpoApisperu = (data) => (data?.data && typeof data.data === 'object' ? data.data : data) || {};

const nombreDesdeDni = (cuerpo) => [cuerpo.nombres, cuerpo.apellidoPaterno, cuerpo.apellidoMaterno]
  .map((p) => String(p || '').trim())
  .filter(Boolean)
  .join(' ')
  .replace(/\s+/g, ' ')
  .toUpperCase();

const celularDesdeRuc = (telefonos) => {
  const lista = Array.isArray(telefonos) ? telefonos : [];
  const movil = lista
    .map((t) => String(t || '').replace(/\D/g, ''))
    .find((t) => t.length === 9 && t.startsWith('9'));
  return movil || '';
};

const consultarApisperu = async (tipoDocumento, numeroDocumento) => {
  if (!env.apisperuToken) {
    return { fuente: 'manual', cliente: plantillaConsulta(tipoDocumento, numeroDocumento), mensaje: 'Consulta externa no configurada. Completa el nombre a mano.' };
  }

  const ruta = tipoDocumento === 'RUC' ? `ruc/${numeroDocumento}` : `dni/${numeroDocumento}`;
  let respuesta;
  try {
    respuesta = await fetch(`${env.apisperuBaseUrl}/${ruta}`, {
      headers: { Authorization: `Bearer ${env.apisperuToken}` },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    log.warn('APIsPeru: no se pudo consultar el documento', {
      tipoDocumento,
      mensaje: error.message,
    });
    return { fuente: 'manual', cliente: plantillaConsulta(tipoDocumento, numeroDocumento), mensaje: 'No se pudo consultar el documento. Completa el nombre a mano.' };
  }

  const data = await respuesta.json().catch(() => null);
  if (!respuesta.ok || data?.success === false) {
    log.warn('APIsPeru: documento sin datos o error HTTP', {
      tipoDocumento,
      status: respuesta.status,
    });
    return { fuente: 'manual', cliente: plantillaConsulta(tipoDocumento, numeroDocumento), mensaje: 'No se encontraron datos para ese documento. Completa el nombre a mano.' };
  }

  const cuerpo = cuerpoApisperu(data);
  if (tipoDocumento === 'DNI') {
    const nombre = nombreDesdeDni(cuerpo);
    if (!nombre) {
      return { fuente: 'manual', cliente: plantillaConsulta('DNI', numeroDocumento), mensaje: 'No se encontró el nombre. Complétalo a mano.' };
    }
    return {
      fuente: 'reniec',
      cliente: { ...plantillaConsulta('DNI', numeroDocumento), nombreRazonSocial: nombre },
    };
  }

  const razon = String(cuerpo.razonSocial || cuerpo.nombreComercial || '').trim().toUpperCase();
  if (!razon) {
    return { fuente: 'manual', cliente: plantillaConsulta('RUC', numeroDocumento), mensaje: 'No se encontró la razón social. Complétala a mano.' };
  }
  return {
    fuente: 'sunat',
    cliente: {
      ...plantillaConsulta('RUC', numeroDocumento, { celular: celularDesdeRuc(cuerpo.telefonos) }),
      nombreRazonSocial: razon,
    },
  };
};

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
  if (!existente) throw new NotFoundError('Cliente no encontrado');

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
    await auditarCliente.editar(req, existente, cliente);
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
  if (!cliente) throw new NotFoundError('Cliente no encontrado');
  if (cliente._count.ordenes > 0) {
    throw new AppError('No se puede eliminar: el cliente tiene órdenes asociadas.');
  }

  await prisma.cliente.delete({ where: { id: cliente.id } });
  await auditarCliente.eliminar(req, cliente);
  return { message: 'Cliente eliminado' };
};

export const buscarPorDocumento = async (numeroDocumento) => {
  const cliente = await prisma.cliente.findUnique({
    where: { numeroDocumento: String(numeroDocumento).trim() },
  });
  if (!cliente) throw new NotFoundError('Cliente no encontrado');
  return cliente;
};

export const consultarDocumento = async (tipo, numero) => {
  const tipoDocumento = tipo === 'RUC' ? 'RUC' : 'DNI';
  const numeroDocumento = String(numero || '').replace(/\D/g, '');

  const existente = await prisma.cliente.findUnique({
    where: { numeroDocumento },
  });
  if (existente) return { fuente: 'local', cliente: existente };

  return consultarApisperu(tipoDocumento, numeroDocumento);
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

  const anterior = await prisma.cliente.findUnique({
    where: { numeroDocumento: payload.numeroDocumento },
  });

  const cliente = await prisma.cliente.upsert({
    where: { numeroDocumento: payload.numeroDocumento },
    update: payload,
    create: payload,
  });

  await auditarCliente.guardar(req, { anterior, cliente });
  return cliente;
};
