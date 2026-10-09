import { AppError } from '../../utils/errors.js';

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

const normalizarClienteInput = (cliente) => ({
  tipoCliente: cliente.tipoCliente,
  tipoDocumento: cliente.tipoDocumento,
  numeroDocumento: String(cliente.numeroDocumento).trim(),
  nombreRazonSocial: cliente.nombreRazonSocial.trim(),
  representante: cliente.representante?.trim() || null,
  celular: cliente.celular?.trim() || null,
  correo: cliente.correo?.trim() || null,
});

export const upsertCliente = async (tx, clienteInput, { actualizarDatos = false } = {}) => {
  const data = normalizarClienteInput(clienteInput);
  const existente = await tx.cliente.findUnique({ where: { numeroDocumento: data.numeroDocumento } });
  if (existente) {
    if (!actualizarDatos) return { cliente: existente, eraNuevo: false, seActualizo: false, anterior: null };
    const cliente = await tx.cliente.update({
      where: { id: existente.id },
      data: {
        tipoCliente: data.tipoCliente,
        tipoDocumento: data.tipoDocumento,
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
  if (!marca) throw new AppError('Marca de vehículo no encontrada', 404);

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
