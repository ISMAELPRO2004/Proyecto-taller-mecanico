import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { calcularTotalOrden } from '../../utils/money.js';
import {
  registrarLog,
  auditarBorrador,
  auditarOrden,
  eventosEliminarBorrador,
  eventosActualizarTaller,
  eventoEstado,
} from '../../auditoria/index.js';
import { borrarCarpetaOrden } from '../fotoOrdenService.js';
import {
  includeOrdenLista,
  includeOrdenDetalle,
  upsertCliente,
  upsertVehiculo,
} from './comun.js';

/** Validar borrador → ACEPTADO (supervisor/admin) */
export const aceptarOrden = async (id, { responsableId } = {}, req) => {
  const orden = await prisma.ordenTrabajo.findUnique({ where: { id: parseInt(id) } });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  if (orden.estaCerrada) throw new AppError('La orden está cerrada.');
  if (orden.estado !== 'EN_ESPERA') {
    throw new AppError('Solo se pueden aceptar órdenes en estado EN_ESPERA.');
  }
  if (orden.pasoRecepcion != null) {
    throw new AppError('La recepción aún no está completa. Termina de rellenar el borrador.');
  }
  if (!orden.clienteId) {
    throw new AppError('La orden no tiene cliente asignado.');
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
      await upsertCliente(tx, { ...ordenPrevia.cliente, ...data.cliente }, { actualizarDatos: true });
    }

    if (data.vehiculo) {
      await upsertVehiculo(tx, {
        placa: data.vehiculo.placa || ordenPrevia.placa,
        marcaId: data.vehiculo.marcaId ?? ordenPrevia.vehiculo.marcaId,
        modelo: data.vehiculo.modelo ?? ordenPrevia.vehiculo.modelo,
        horometro: data.vehiculo.horometro ?? ordenPrevia.vehiculo.horometro,
        kilometraje: data.vehiculo.kilometraje ?? ordenPrevia.vehiculo.kilometraje,
      }, { actualizarDatos: true });
    }

    const materiales = data.materiales;
    const servicios = data.servicios;
    const terceros = data.terceros;
    const tieneDetalles = materiales !== undefined || servicios !== undefined || terceros !== undefined;

    let lineasTotal = null;

    if (tieneDetalles) {
      await tx.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } });
      await tx.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } });

      const mats = materiales || [];
      const servs = servicios || [];
      const tercs = terceros || [];

      const matsSinPrecio = mats
        .filter((m) => precioMaterialPrevio.get(m.materialId) == null)
        .map((m) => m.materialId);
      const servsSinPrecio = servs
        .filter((s) => montoServicioPrevio.get(s.servicioId) == null)
        .map((s) => s.servicioId);
      const tercsSinPrecio = tercs
        .filter((t) => montoTerceroPrevio.get(t.terceroId) == null)
        .map((t) => t.terceroId);

      const [basesMaterial, basesServicio, basesTercero] = await Promise.all([
        matsSinPrecio.length
          ? tx.catalogoMaterial.findMany({ where: { id: { in: matsSinPrecio } }, select: { id: true, precioBase: true } })
          : [],
        servsSinPrecio.length
          ? tx.catalogoServicio.findMany({ where: { id: { in: servsSinPrecio } }, select: { id: true, precioBase: true } })
          : [],
        tercsSinPrecio.length
          ? tx.catalogoTercero.findMany({ where: { id: { in: tercsSinPrecio } }, select: { id: true, precioBase: true } })
          : [],
      ]);
      const baseMaterial = new Map(basesMaterial.map((item) => [item.id, item.precioBase]));
      const baseServicio = new Map(basesServicio.map((item) => [item.id, item.precioBase]));
      const baseTercero = new Map(basesTercero.map((item) => [item.id, item.precioBase]));

      const precioMaterial = (m) => (
        esTecnico
          ? (precioMaterialPrevio.get(m.materialId) ?? baseMaterial.get(m.materialId) ?? null)
          : (m.precioAlMomento ?? baseMaterial.get(m.materialId) ?? null)
      );
      const montoServicio = (s) => (
        esTecnico
          ? (montoServicioPrevio.get(s.servicioId) ?? baseServicio.get(s.servicioId) ?? null)
          : (s.monto ?? baseServicio.get(s.servicioId) ?? null)
      );
      const montoTercero = (t) => (
        esTecnico
          ? (montoTerceroPrevio.get(t.terceroId) ?? baseTercero.get(t.terceroId) ?? null)
          : (t.monto ?? baseTercero.get(t.terceroId) ?? null)
      );

      if (mats.length > 0) {
        await tx.oTMaterial.createMany({
          data: mats.map((m) => ({
            ordenId: parseInt(id),
            materialId: m.materialId,
            cantidad: m.cantidad,
            precioAplicado: precioMaterial(m),
          })),
        });
      }
      if (servs.length > 0) {
        await tx.oTServicio.createMany({
          data: servs.map((s) => ({
            ordenId: parseInt(id),
            servicioId: s.servicioId,
            descripcion: s.descripcion,
            monto: montoServicio(s),
          })),
        });
      }
      if (tercs.length > 0) {
        await tx.oTTercero.createMany({
          data: tercs.map((t) => ({
            ordenId: parseInt(id),
            terceroId: t.terceroId,
            descripcion: t.descripcion,
            monto: montoTercero(t),
          })),
        });
      }

      lineasTotal = {
        materiales: mats.map((m) => ({
          cantidad: m.cantidad,
          precioAlMomento: precioMaterial(m) ?? 0,
        })),
        servicios: servs.map((s) => ({ monto: montoServicio(s) ?? 0 })),
        terceros: tercs.map((t) => ({ monto: montoTercero(t) ?? 0 })),
      };
    }

    const totalFinal = lineasTotal ? calcularTotalOrden(lineasTotal) : undefined;

    return tx.ordenTrabajo.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.descripcionInformal !== undefined && { descripcionInformal: data.descripcionInformal }),
        ...(data.trabajoSolicitado !== undefined && { trabajoSolicitado: data.trabajoSolicitado }),
        ...(data.estadoIngreso !== undefined && { estadoIngreso: data.estadoIngreso }),
        ...(data.observacionIngreso !== undefined && { observacionIngreso: data.observacionIngreso }),
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

  await auditarOrden(req, {
    orden: resultado,
    eventos: eventosActualizarTaller({ antes: ordenPrevia, despues: resultado }),
  });

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
  const cancelarTerminado = ordenPrevia.estado === 'TERMINADO'
    && estado === 'CANCELADO'
    && req.user?.rol === 'ADMIN';
  if (ordenPrevia.estaCerrada && !cancelarTerminado) {
    throw new AppError('La orden ya no admite cambios de estado.');
  }
  if (ordenPrevia.estado === 'EN_ESPERA') {
    throw new AppError('Acepte la orden antes de cambiar el estado de trabajo.');
  }
  if (['TERMINADO', 'CANCELADO'].includes(ordenPrevia.estado) && !cancelarTerminado) {
    throw new AppError('La orden ya terminó. Solo el administrador puede pasarla a cancelado.');
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

  await auditarOrden(req, {
    orden: actualizada,
    eventos: [eventoEstado(ordenPrevia.estado, actualizada.estado)],
  });

  return actualizada;
};

export const cerrarOrden = async () => {
  throw new AppError('El cierre ya no se usa. Al marcar Terminado la orden queda bloqueada.');
};

export const eliminarOrden = async (id, req) => {
  const ordenPrevia = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: includeOrdenDetalle,
  });

  if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);

  const esAdmin = req.user?.rol === 'ADMIN';
  const borradorIncompleto = ordenPrevia.estado === 'EN_ESPERA' && ordenPrevia.pasoRecepcion != null;
  if (!esAdmin && !borradorIncompleto) {
    throw new AppError('Solo puedes eliminar borradores pendientes de terminar. Las demás órdenes solo las borra el administrador.', 403);
  }

  const ordenId = parseInt(id);
  // Solo en borrador incompleto: limpiar vehículo/cliente nacidos en ese borrador
  const placaABorrar = borradorIncompleto && ordenPrevia.vehiculoEditableEnBorrador
    ? ordenPrevia.placa
    : null;
  const clienteABorrar = borradorIncompleto && ordenPrevia.clienteEditableEnBorrador
    ? ordenPrevia.clienteId
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.logActividad.updateMany({ where: { ordenId }, data: { ordenId: null } });
    await tx.oTMaterial.deleteMany({ where: { ordenId } });
    await tx.oTServicio.deleteMany({ where: { ordenId } });
    await tx.oTTercero.deleteMany({ where: { ordenId } });
    await tx.ordenTrabajo.delete({ where: { id: ordenId } });

    if (placaABorrar) {
      const otras = await tx.ordenTrabajo.count({ where: { placa: placaABorrar } });
      if (otras === 0) {
        await tx.vehiculo.delete({ where: { placa: placaABorrar } }).catch(() => null);
      }
    }

    if (clienteABorrar) {
      const otras = await tx.ordenTrabajo.count({ where: { clienteId: clienteABorrar } });
      if (otras === 0) {
        await tx.cliente.delete({ where: { id: clienteABorrar } }).catch(() => null);
      }
    }
  });

  // Siempre borrar fotos de la orden (registro + desarrollo) para no dejar basura en disco
  await borrarCarpetaOrden(id);

  if (ordenPrevia.estado === 'EN_ESPERA') {
    await auditarBorrador(req, {
      orden: ordenPrevia,
      eventos: eventosEliminarBorrador({
        orden: ordenPrevia,
        eliminoVehiculo: !!placaABorrar,
        eliminoCliente: !!clienteABorrar,
      }),
      ordenId: null,
    });
  } else {
    await registrarLog(req, 'ELIMINAR ORDEN', null, {
      numeroOrden: ordenPrevia.numeroOrden,
      cliente: ordenPrevia.cliente?.nombreRazonSocial,
      placa: ordenPrevia.placa,
      limpioVehiculoNuevo: !!placaABorrar,
      limpioClienteNuevo: !!clienteABorrar,
    }, null);
  }

  return { message: 'Orden eliminada exitosamente' };
};

export const actualizarFacturaOrden = async (id, data, req) => {
  if (req.user?.rol !== 'ADMIN') {
    throw new AppError('Solo el administrador puede completar o cambiar la factura.', 403);
  }

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      estado: true,
      numeroOrden: true,
      requiereFactura: true,
      numeroFactura: true,
      montoFactura: true,
    },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  if (orden.estado !== 'CANCELADO') {
    throw new AppError('La factura solo se gestiona cuando la orden está cancelada.');
  }

  const requiereFactura = !!data.requiereFactura;
  const numeroFactura = requiereFactura ? (data.numeroFactura?.trim() || null) : null;
  const montoFactura = requiereFactura && data.montoFactura != null && data.montoFactura !== ''
    ? data.montoFactura
    : null;

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: orden.id },
    data: { requiereFactura, numeroFactura, montoFactura },
    include: includeOrdenDetalle,
  });

  await registrarLog(
    req,
    'ACTUALIZAR FACTURA',
    { requiereFactura, numeroFactura, montoFactura },
    {
      requiereFactura: orden.requiereFactura,
      numeroFactura: orden.numeroFactura,
      montoFactura: orden.montoFactura,
    },
    orden.id
  );

  return actualizada;
};
