import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { calcularTotalOrden } from '../utils/money.js';
import { registrarLog } from '../utils/logger.js';

const includeOrdenLista = {
  cliente: true,
  vehiculo: { include: { marca: true } },
  responsable: { select: { id: true, nombreCompleto: true, rol: true } },
  creador: { select: { id: true, nombreCompleto: true, rol: true } },
};

const includeOrdenDetalle = {
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

const upsertCliente = async (tx, clienteInput) => {
  const data = normalizarClienteInput(clienteInput);
  return tx.cliente.upsert({
    where: { numeroDocumento: data.numeroDocumento },
    update: {
      tipoCliente: data.tipoCliente,
      tipoDocumento: data.tipoDocumento,
      nombreRazonSocial: data.nombreRazonSocial,
      representante: data.representante,
      celular: data.celular,
      correo: data.correo,
    },
    create: data,
  });
};

const upsertVehiculo = async (tx, vehiculoInput) => {
  const placa = vehiculoInput.placa.trim().toUpperCase();
  const marcaId = parseInt(vehiculoInput.marcaId);
  const marca = await tx.marcaVehiculo.findUnique({ where: { id: marcaId } });
  if (!marca) throw new AppError('Marca de vehículo no encontrada', 404);

  return tx.vehiculo.upsert({
    where: { placa },
    update: {
      marcaId,
      modelo: vehiculoInput.modelo,
      horometro: vehiculoInput.horometro ?? null,
      kilometraje: vehiculoInput.kilometraje ?? null,
    },
    create: {
      placa,
      marcaId,
      modelo: vehiculoInput.modelo,
      horometro: vehiculoInput.horometro ?? null,
      kilometraje: vehiculoInput.kilometraje ?? null,
    },
    include: { marca: true },
  });
};

const siguienteNumeroOrden = async (tx) => {
  const year = new Date().getFullYear();
  const contador = await tx.contadorOrden.upsert({
    where: { anio: year },
    create: { anio: year, contador: 1 },
    update: { contador: { increment: 1 } },
  });
  return `OT-${year}-${contador.contador.toString().padStart(4, '0')}`;
};

/** Crear borrador OT (recepción) → estado EN_ESPERA */
export const crearBorradorOrden = async (data, req) => {
  const resultado = await prisma.$transaction(async (tx) => {
    const cliente = await upsertCliente(tx, data.cliente);
    const vehiculo = await upsertVehiculo(tx, data.vehiculo);
    const numeroOrden = await siguienteNumeroOrden(tx);

    const orden = await tx.ordenTrabajo.create({
      data: {
        numeroOrden,
        clienteId: cliente.id,
        placa: vehiculo.placa,
        descripcionInformal: data.descripcionInformal?.trim() || null,
        trabajoSolicitado: data.trabajoSolicitado?.trim() || null,
        estadoIngreso: data.estadoIngreso || 'ACEPTADO',
        observacionIngreso: data.observacionIngreso?.trim() || null,
        fotoRegistro: data.fotoRegistro?.trim() || null,
        estado: 'EN_ESPERA',
        creadorId: req.user.id,
        responsableId: data.responsableId || null,
        totalFinal: 0,
      },
      include: includeOrdenDetalle,
    });

    return orden;
  });

  await registrarLog(req, 'CREAR BORRADOR ORDEN', {
    numeroOrden: resultado.numeroOrden,
    placa: resultado.placa,
    cliente: resultado.cliente.nombreRazonSocial,
    estadoIngreso: resultado.estadoIngreso,
  }, null, resultado.id);

  return resultado;
};

export const listarOrdenes = async () => {
  return prisma.ordenTrabajo.findMany({
    include: includeOrdenLista,
    orderBy: { fechaCreacion: 'desc' },
  });
};

export const obtenerOrdenPorId = async (id) => {
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: includeOrdenDetalle,
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  return orden;
};

/** Validar borrador → ACEPTADO (supervisor/admin) */
export const aceptarOrden = async (id, { responsableId } = {}, req) => {
  const orden = await prisma.ordenTrabajo.findUnique({ where: { id: parseInt(id) } });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  if (orden.estaCerrada) throw new AppError('La orden está cerrada.');
  if (orden.estado !== 'EN_ESPERA') {
    throw new AppError('Solo se pueden aceptar órdenes en estado EN_ESPERA.');
  }

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: parseInt(id) },
    data: {
      estado: 'ACEPTADO',
      ...(responsableId ? { responsableId } : {}),
    },
    include: includeOrdenDetalle,
  });

  await registrarLog(
    req,
    'ACEPTAR ORDEN',
    { estado: 'ACEPTADO', responsableId: actualizada.responsableId },
    { estado: 'EN_ESPERA' },
    id
  );

  return actualizada;
};

export const actualizarOrden = async (id, data, req) => {
  const ordenPrevia = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: includeOrdenDetalle,
  });

  if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);
  if (ordenPrevia.estaCerrada) {
    throw new AppError('Esta orden está cerrada permanentemente y no puede modificarse.');
  }
  if (['TERMINADO', 'CANCELADO'].includes(ordenPrevia.estado)) {
    throw new AppError('No se puede modificar una orden cerrada o cancelada.');
  }

  if (ordenPrevia.estado === 'EN_ESPERA' && (data.materiales || data.servicios || data.terceros)) {
    throw new AppError('La orden debe estar aceptada antes de registrar materiales o servicios.');
  }

  const ESTADOS_TRABAJO = ['EN_REPARACION', 'CAMBIO_ACEITE', 'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO'];
  if (data.estado) {
    if (ordenPrevia.estado === 'EN_ESPERA' && data.estado !== 'EN_ESPERA') {
      throw new AppError('Acepte la orden antes de cambiar el estado de trabajo.');
    }
    if (ordenPrevia.estado !== 'EN_ESPERA' && data.estado === 'EN_ESPERA') {
      throw new AppError('No se puede volver a En espera.');
    }
    if (ESTADOS_TRABAJO.includes(ordenPrevia.estado) && !ESTADOS_TRABAJO.includes(data.estado)) {
      throw new AppError('El estado de trabajo solo puede ser reparación, cambio de aceite, esperando repuesto, terminado o cancelado.');
    }
  }

  const esTecnico = req.user?.rol === 'TECNICO';
  const precioMaterialPrevio = new Map(
    (ordenPrevia.materiales || []).map((m) => [m.materialId, m.precioAplicado])
  );
  const montoServicioPrevio = new Map(
    (ordenPrevia.servicios || []).map((s) => [s.servicioId, s.monto])
  );
  const montoTerceroPrevio = new Map(
    (ordenPrevia.terceros || []).map((t) => [t.terceroId, t.monto])
  );

  const resultado = await prisma.$transaction(async (tx) => {
    if (data.cliente) {
      await upsertCliente(tx, { ...ordenPrevia.cliente, ...data.cliente });
    }

    if (data.vehiculo) {
      await upsertVehiculo(tx, {
        placa: data.vehiculo.placa || ordenPrevia.placa,
        marcaId: data.vehiculo.marcaId ?? ordenPrevia.vehiculo.marcaId,
        modelo: data.vehiculo.modelo ?? ordenPrevia.vehiculo.modelo,
        horometro: data.vehiculo.horometro ?? ordenPrevia.vehiculo.horometro,
        kilometraje: data.vehiculo.kilometraje ?? ordenPrevia.vehiculo.kilometraje,
      });
    }

    const materiales = data.materiales;
    const servicios = data.servicios;
    const terceros = data.terceros;
    const tieneDetalles = materiales !== undefined || servicios !== undefined || terceros !== undefined;

    if (tieneDetalles) {
      await tx.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } });

      const mats = materiales || [];
      const servs = servicios || [];
      const tercs = terceros || [];

      if (mats.length > 0) {
        await tx.oTMaterial.createMany({
          data: mats.map((m) => ({
            ordenId: parseInt(id),
            materialId: m.materialId,
            cantidad: m.cantidad,
            precioAplicado: esTecnico
              ? (precioMaterialPrevio.get(m.materialId) ?? null)
              : (m.precioAlMomento ?? null),
          })),
        });
      }
      if (servs.length > 0) {
        await tx.oTServicio.createMany({
          data: servs.map((s) => ({
            ordenId: parseInt(id),
            servicioId: s.servicioId,
            descripcion: s.descripcion,
            monto: esTecnico
              ? (montoServicioPrevio.get(s.servicioId) ?? null)
              : (s.monto ?? null),
          })),
        });
      }
      if (tercs.length > 0) {
        await tx.oTTercero.createMany({
          data: tercs.map((t) => ({
            ordenId: parseInt(id),
            terceroId: t.terceroId,
            descripcion: t.descripcion,
            monto: esTecnico
              ? (montoTerceroPrevio.get(t.terceroId) ?? null)
              : (t.monto ?? null),
          })),
        });
      }
    }

    const matsParaTotal = esTecnico
      ? (materiales || []).map((m) => ({
        cantidad: m.cantidad,
        precioAlMomento: precioMaterialPrevio.get(m.materialId) ?? 0,
      }))
      : (materiales || []).map((m) => ({
        cantidad: m.cantidad,
        precioAlMomento: m.precioAlMomento ?? 0,
      }));
    const servsParaTotal = esTecnico
      ? (servicios || []).map((s) => ({ monto: montoServicioPrevio.get(s.servicioId) ?? 0 }))
      : (servicios || []).map((s) => ({ monto: s.monto ?? 0 }));
    const tercsParaTotal = esTecnico
      ? (terceros || []).map((t) => ({ monto: montoTerceroPrevio.get(t.terceroId) ?? 0 }))
      : (terceros || []).map((t) => ({ monto: t.monto ?? 0 }));

    const totalFinal = tieneDetalles
      ? calcularTotalOrden({
        materiales: matsParaTotal,
        servicios: servsParaTotal,
        terceros: tercsParaTotal,
      })
      : undefined;

    return tx.ordenTrabajo.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.descripcionInformal !== undefined && { descripcionInformal: data.descripcionInformal }),
        ...(data.trabajoSolicitado !== undefined && { trabajoSolicitado: data.trabajoSolicitado }),
        ...(data.estadoIngreso !== undefined && { estadoIngreso: data.estadoIngreso }),
        ...(data.observacionIngreso !== undefined && { observacionIngreso: data.observacionIngreso }),
        ...(data.fotoDesarrollo !== undefined && { fotoDesarrollo: data.fotoDesarrollo }),
        ...(data.responsableId !== undefined && { responsableId: data.responsableId }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.requiereFactura !== undefined && { requiereFactura: data.requiereFactura }),
        ...(data.numeroFactura !== undefined && { numeroFactura: data.numeroFactura }),
        ...(data.montoFactura !== undefined && { montoFactura: data.montoFactura }),
        ...(totalFinal !== undefined && { totalFinal }),
      },
      include: includeOrdenDetalle,
    });
  });

  await registrarLog(req, 'ACTUALIZAR ORDEN', {
    estado: resultado.estado,
    cliente: resultado.cliente.nombreRazonSocial,
    placa: resultado.placa,
    totalFinal: resultado.totalFinal,
  }, {
    estado: ordenPrevia.estado,
    cliente: ordenPrevia.cliente.nombreRazonSocial,
    placa: ordenPrevia.placa,
    totalFinal: ordenPrevia.totalFinal,
  }, id);

  return resultado;
};

export const actualizarEstadoOrden = async (id, payload, req) => {
  const { estado, requiereFactura, numeroFactura, montoFactura } = payload;

  const ordenPrevia = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: {
      estado: true,
      numeroOrden: true,
      estaCerrada: true,
      requiereFactura: true,
      numeroFactura: true,
    },
  });

  if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);
  if (ordenPrevia.estaCerrada) throw new AppError('La orden está cerrada.');
  if (ordenPrevia.estado === 'EN_ESPERA') {
    throw new AppError('Acepte la orden antes de cambiar el estado de trabajo.');
  }
  if (!['EN_REPARACION', 'CAMBIO_ACEITE', 'ESPERANDO_REPUESTO', 'TERMINADO', 'CANCELADO'].includes(estado)) {
    throw new AppError('Solo se pueden asignar los estados de trabajo: reparación, cambio de aceite, esperando repuesto, terminado o cancelado.');
  }

  const data = { estado };
  if (estado === 'CANCELADO') {
    if (requiereFactura !== undefined) data.requiereFactura = requiereFactura;
    if (numeroFactura !== undefined) data.numeroFactura = numeroFactura;
    if (montoFactura !== undefined) data.montoFactura = montoFactura;
  }

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: parseInt(id) },
    data,
    include: includeOrdenLista,
  });

  await registrarLog(
    req,
    'CAMBIO DE ESTADO',
    { estado, requiereFactura, numeroFactura, montoFactura },
    { estado: ordenPrevia.estado },
    id
  );

  return actualizada;
};

export const cerrarOrden = async (id, req) => {
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: { estado: true, estaCerrada: true, numeroOrden: true },
  });

  if (!orden) throw new AppError('Orden no encontrada', 404);
  if (orden.estaCerrada) throw new AppError('La orden ya está cerrada.');
  if (!['TERMINADO', 'CANCELADO'].includes(orden.estado)) {
    throw new AppError('Solo se pueden cerrar órdenes con estado TERMINADO o CANCELADO.');
  }

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: parseInt(id) },
    data: { estaCerrada: true },
  });

  await registrarLog(req, 'CIERRE DEFINITIVO DE ORDEN', { estaCerrada: true }, { estaCerrada: false }, id);
  return actualizada;
};

export const eliminarOrden = async (id, req) => {
  const ordenPrevia = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: includeOrdenDetalle,
  });

  if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);
  if (ordenPrevia.estaCerrada) {
    throw new AppError('No se puede eliminar una orden cerrada permanentemente.');
  }
  if (ordenPrevia.estado === 'TERMINADO') {
    throw new AppError('No se puede eliminar una orden terminada.');
  }

  await prisma.$transaction([
    prisma.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } }),
    prisma.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } }),
    prisma.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } }),
    prisma.ordenTrabajo.delete({ where: { id: parseInt(id) } }),
  ]);

  await registrarLog(req, 'ELIMINAR ORDEN', null, {
    numeroOrden: ordenPrevia.numeroOrden,
    cliente: ordenPrevia.cliente?.nombreRazonSocial,
    placa: ordenPrevia.placa,
  }, null);

  return { message: 'Orden eliminada exitosamente' };
};
