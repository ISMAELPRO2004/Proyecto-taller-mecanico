import { AppError, NotFoundError } from '../../utils/errors.js';

export const includeOrdenLista = {
  cliente: true,
  vehiculo: { include: { marca: true } },
  responsable: { select: { id: true, nombreCompleto: true, rol: true } },
  creador: { select: { id: true, nombreCompleto: true, rol: true } },
};

export const includeOrdenDetalle = {
  ...includeOrdenLista,
  materiales: { include: { material: true } },
  servicios: { include: { servicio: true } },
  terceros: { include: { tercero: true } },
};

const normalizarClienteInput = (cliente) => {
  const numero = String(cliente.numeroDocumento ?? '').replace(/\D/g, '');
  return {
    tipoCliente: cliente.tipoCliente,
    tipoDocumento: cliente.tipoDocumento,
    numeroDocumento: numero || null,
    nombreRazonSocial: cliente.nombreRazonSocial.trim(),
    representante: cliente.representante?.trim() || null,
    celular: cliente.celular?.trim() || null,
    correo: cliente.correo?.trim() || null,
  };
};

export const upsertCliente = async (tx, clienteInput, { actualizarDatos = false } = {}) => {
  const data = normalizarClienteInput(clienteInput);
  const id = clienteInput.id ? parseInt(clienteInput.id, 10) : null;
  let existente = null;
  if (id) existente = await tx.cliente.findUnique({ where: { id } });
  if (!existente && data.numeroDocumento) {
    existente = await tx.cliente.findUnique({ where: { numeroDocumento: data.numeroDocumento } });
  }
  if (existente) {
    if (!actualizarDatos) return { cliente: existente, eraNuevo: false, seActualizo: false, anterior: null };
    if (data.numeroDocumento) {
      const otro = await tx.cliente.findUnique({ where: { numeroDocumento: data.numeroDocumento } });
      if (otro && otro.id !== existente.id) throw new AppError('Ese documento ya pertenece a otro cliente.');
    }
    const cliente = await tx.cliente.update({
      where: { id: existente.id },
      data: {
        tipoCliente: data.tipoCliente,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        nombreRazonSocial: data.nombreRazonSocial,
        representante: data.representante,
        celular: data.celular,
        correo: data.correo,
      },
    });
    return { cliente, eraNuevo: false, seActualizo: true, anterior: existente };
  }
  const cliente = await tx.cliente.create({ data });
  return { cliente, eraNuevo: true, seActualizo: false, anterior: null };
};

export const upsertVehiculo = async (tx, vehiculoInput, { actualizarDatos = false } = {}) => {
  const placa = vehiculoInput.placa.trim().toUpperCase();
  const marcaId = parseInt(vehiculoInput.marcaId);
  const marca = await tx.marcaVehiculo.findUnique({ where: { id: marcaId } });
  if (!marca) throw new NotFoundError('Marca de vehículo no encontrada');

  const existente = await tx.vehiculo.findUnique({
    where: { placa },
    include: { marca: true },
  });
  if (existente) {
    if (!actualizarDatos) return { vehiculo: existente, eraNuevo: false, seActualizo: false, anterior: null };
    const vehiculo = await tx.vehiculo.update({
      where: { placa },
      data: {
        marcaId,
        modelo: vehiculoInput.modelo,
        horometro: vehiculoInput.horometro ?? null,
        kilometraje: vehiculoInput.kilometraje ?? null,
      },
      include: { marca: true },
    });
    return { vehiculo, eraNuevo: false, seActualizo: true, anterior: existente };
  }

  const vehiculo = await tx.vehiculo.create({
    data: {
      placa,
      marcaId,
      modelo: vehiculoInput.modelo,
      horometro: vehiculoInput.horometro ?? null,
      kilometraje: vehiculoInput.kilometraje ?? null,
    },
    include: { marca: true },
  });
  return { vehiculo, eraNuevo: true, seActualizo: false, anterior: null };
};

export const siguienteNumeroOrden = async (tx) => {
  const year = new Date().getFullYear();
  const contador = await tx.contadorOrden.upsert({
    where: { anio: year },
    create: { anio: year, contador: 1 },
    update: { contador: { increment: 1 } },
  });
  return `OT-${year}-${contador.contador.toString().padStart(4, '0')}`;
};
