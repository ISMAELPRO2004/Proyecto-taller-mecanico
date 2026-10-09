import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { calcularTotalOrden } from '../utils/money.js';
import { registrarLog, registrarGrupo } from '../utils/logger.js';
import {
  eventosPasoVehiculo,
  eventosPasoCliente,
  eventosTrabajoBorrador,
  eventosEliminarBorrador,
  eventosActualizarTaller,
  eventoEstado,
  grupoDeEventos,
} from '../utils/eventosAuditoria.js';

const guardarGrupo = (req, eventos, { contexto, resumen, ordenId }) => registrarGrupo(
  req,
  grupoDeEventos(eventos, { contexto, resumen }),
  ordenId
);
import {
  TIPOS_FOTO,
  guardarFotoArchivo,
  leerFotoArchivo,
  borrarFotoArchivo,
  borrarCarpetaOrden,
  copiarFotoAuditoria,
  copiarBufferAuditoria,
} from './fotoOrdenService.js';

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

const upsertCliente = async (tx, clienteInput, { actualizarDatos = false } = {}) => {
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

const upsertVehiculo = async (tx, vehiculoInput, { actualizarDatos = false } = {}) => {
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
  const { orden, eventos } = await prisma.$transaction(async (tx) => {
    const vehiculoGuardado = await upsertVehiculo(tx, data.vehiculo, { actualizarDatos: true });
    const clienteGuardado = await upsertCliente(tx, data.cliente, { actualizarDatos: true });
    const numeroOrden = await siguienteNumeroOrden(tx);

    const orden = await tx.ordenTrabajo.create({
      data: {
        numeroOrden,
        clienteId: clienteGuardado.cliente.id,
        placa: vehiculoGuardado.vehiculo.placa,
        descripcionInformal: data.descripcionInformal?.trim() || null,
        trabajoSolicitado: data.trabajoSolicitado?.trim() || null,
        estadoIngreso: data.estadoIngreso || 'ACEPTADO',
        observacionIngreso: data.observacionIngreso?.trim() || null,
        estado: 'EN_ESPERA',
        pasoRecepcion: null,
        creadorId: req.user.id,
        responsableId: data.responsableId || null,
        totalFinal: 0,
      },
      include: includeOrdenDetalle,
    });

    const ordenVacia = { clienteId: null, cliente: null, pasoRecepcion: 1 };
    const eventos = [
      ...eventosPasoVehiculo({
        ordenPrevia: null,
        orden,
        vehiculo: vehiculoGuardado.vehiculo,
        eraNuevo: vehiculoGuardado.eraNuevo,
        seActualizo: vehiculoGuardado.seActualizo,
        anterior: vehiculoGuardado.anterior,
      }),
      ...eventosPasoCliente({
        ordenPrevia: ordenVacia,
        orden,
        cliente: clienteGuardado.cliente,
        eraNuevo: clienteGuardado.eraNuevo,
        seActualizo: clienteGuardado.seActualizo,
        anterior: clienteGuardado.anterior,
      }),
      ...eventosTrabajoBorrador({ ordenPrevia: ordenVacia, orden, data }),
    ];

    return { orden, eventos };
  });

  await guardarGrupo(req, eventos, { contexto: 'BORRADOR', resumen: orden.numeroOrden, ordenId: orden.id });
  return orden;
};

/** Paso 1: guardar vehículo y crear/actualizar borrador incompleto */
export const guardarPasoVehiculo = async (id, { vehiculo, actualizarDatos = false }, req) => {
  const ordenId = id ? parseInt(id) : null;

  const { orden, eventos } = await prisma.$transaction(async (tx) => {
    let ordenPrevia = null;
    if (ordenId) {
      ordenPrevia = await tx.ordenTrabajo.findUnique({
        where: { id: ordenId },
        include: { vehiculo: { include: { marca: true } } },
      });
      if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);
      if (ordenPrevia.estado !== 'EN_ESPERA') {
        throw new AppError('Solo se puede editar el vehículo en un borrador de recepción.');
      }
      if (ordenPrevia.pasoRecepcion == null) {
        throw new AppError('La recepción ya está completa. El vehículo ya no se edita aquí.');
      }
    }

    const puedeActualizar = actualizarDatos && (
      !ordenPrevia || ordenPrevia.vehiculoEditableEnBorrador
    );
    const guardado = await upsertVehiculo(tx, vehiculo, {
      actualizarDatos: !!puedeActualizar,
    });
    const veh = guardado.vehiculo;

    const editable = guardado.eraNuevo
      || !!puedeActualizar
      || (!!ordenPrevia && ordenPrevia.placa === veh.placa && ordenPrevia.vehiculoEditableEnBorrador);

    const orden = !ordenPrevia
      ? await tx.ordenTrabajo.create({
        data: {
          numeroOrden: await siguienteNumeroOrden(tx),
          placa: veh.placa,
          estado: 'EN_ESPERA',
          pasoRecepcion: 1,
          vehiculoEditableEnBorrador: editable,
          clienteEditableEnBorrador: false,
          creadorId: req.user.id,
          totalFinal: 0,
        },
        include: includeOrdenDetalle,
      })
      : await tx.ordenTrabajo.update({
        where: { id: ordenId },
        data: {
          placa: veh.placa,
          pasoRecepcion: Math.max(ordenPrevia.pasoRecepcion || 1, 1),
          vehiculoEditableEnBorrador: editable,
        },
        include: includeOrdenDetalle,
      });

    return {
      orden,
      eventos: eventosPasoVehiculo({
        ordenPrevia,
        orden,
        vehiculo: veh,
        eraNuevo: guardado.eraNuevo,
        seActualizo: guardado.seActualizo,
        anterior: guardado.anterior,
      }),
    };
  });

  await guardarGrupo(req, eventos, { contexto: 'BORRADOR', resumen: orden.numeroOrden, ordenId: orden.id });
  return orden;
};

/** Paso 2: asociar cliente al borrador */
export const guardarPasoCliente = async (id, { cliente, actualizarDatos = false }, req) => {
  const ordenId = parseInt(id);

  const { orden, eventos } = await prisma.$transaction(async (tx) => {
    const ordenPrevia = await tx.ordenTrabajo.findUnique({
      where: { id: ordenId },
      include: { cliente: true },
    });
    if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);
    if (ordenPrevia.estado !== 'EN_ESPERA') {
      throw new AppError('Solo se puede editar el cliente en un borrador de recepción.');
    }
    if (ordenPrevia.pasoRecepcion == null) {
      throw new AppError('La recepción ya está completa. El cliente ya no se edita aquí.');
    }
    if (!ordenPrevia.placa) throw new AppError('Primero registra el vehículo.');

    const puedeActualizar = actualizarDatos && ordenPrevia.clienteEditableEnBorrador;
    const guardado = await upsertCliente(tx, cliente, {
      actualizarDatos: !!puedeActualizar,
    });
    const cli = guardado.cliente;

    const editable = guardado.eraNuevo
      || !!puedeActualizar
      || (ordenPrevia.clienteId === cli.id && ordenPrevia.clienteEditableEnBorrador);

    const orden = await tx.ordenTrabajo.update({
      where: { id: ordenId },
      data: {
        clienteId: cli.id,
        pasoRecepcion: Math.max(ordenPrevia.pasoRecepcion || 1, 2),
        clienteEditableEnBorrador: editable,
      },
      include: includeOrdenDetalle,
    });

    return {
      orden,
      eventos: eventosPasoCliente({
        ordenPrevia,
        orden,
        cliente: cli,
        eraNuevo: guardado.eraNuevo,
        seActualizo: guardado.seActualizo,
        anterior: guardado.anterior,
      }),
    };
  });

  await guardarGrupo(req, eventos, { contexto: 'BORRADOR', resumen: orden.numeroOrden, ordenId: orden.id });
  return orden;
};

/** Paso 3: completar recepción (queda EN_ESPERA listo para aceptar) */
export const completarRecepcion = async (id, data, req) => {
  const ordenId = parseInt(id);

  const { orden, eventos } = await prisma.$transaction(async (tx) => {
    const ordenPrevia = await tx.ordenTrabajo.findUnique({ where: { id: ordenId } });
    if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);
    if (ordenPrevia.estado !== 'EN_ESPERA') {
      throw new AppError('Solo se completa la recepción en borradores EN_ESPERA.');
    }
    if (!ordenPrevia.placa) throw new AppError('Falta el vehículo.');
    if (!ordenPrevia.clienteId) throw new AppError('Falta el cliente.');

    const orden = await tx.ordenTrabajo.update({
      where: { id: ordenId },
      data: {
        descripcionInformal: data.descripcionInformal?.trim() || null,
        trabajoSolicitado: data.trabajoSolicitado?.trim() || null,
        estadoIngreso: data.estadoIngreso || 'ACEPTADO',
        observacionIngreso: data.observacionIngreso?.trim() || null,
        pasoRecepcion: null,
        vehiculoEditableEnBorrador: false,
        clienteEditableEnBorrador: false,
      },
      include: includeOrdenDetalle,
    });

    return {
      orden,
      eventos: eventosTrabajoBorrador({ ordenPrevia, orden, data }),
    };
  });

  await guardarGrupo(req, eventos, { contexto: 'BORRADOR', resumen: orden.numeroOrden, ordenId: orden.id });
  return orden;
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

  await guardarGrupo(req, eventosActualizarTaller({ antes: ordenPrevia, despues: resultado }), {
    contexto: 'ORDEN',
    resumen: resultado.numeroOrden,
    ordenId: id,
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

  await guardarGrupo(req, [
    eventoEstado(ordenPrevia.estado, actualizada.estado),
  ], { contexto: 'ORDEN', resumen: actualizada.numeroOrden, ordenId: id });

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
    await guardarGrupo(req, eventosEliminarBorrador({
      orden: ordenPrevia,
      eliminoVehiculo: !!placaABorrar,
      eliminoCliente: !!clienteABorrar,
    }), { contexto: 'BORRADOR', resumen: ordenPrevia.numeroOrden, ordenId: null });
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

const campoFoto = {
  registro: 'fotoRegistro',
  desarrollo: 'fotoDesarrollo',
};

const etiquetaFoto = {
  registro: 'Foto de registro (ingreso)',
  desarrollo: 'Foto de desarrollo (rotativa)',
};

const puedeEditarDesarrollo = (orden) =>
  !orden.estaCerrada && !['TERMINADO', 'CANCELADO', 'EN_ESPERA'].includes(orden.estado);

export const subirFotoOrden = async (id, tipo, file, req) => {
  if (!TIPOS_FOTO.includes(tipo)) throw new AppError('Tipo de foto inválido', 400);
  if (!file) throw new AppError('Selecciona una imagen', 400);

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, estado: true, estaCerrada: true, fotoRegistro: true, fotoDesarrollo: true, numeroOrden: true },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);

  const campo = campoFoto[tipo];
  const previa = orden[campo];
  const esAdmin = req.user?.rol === 'ADMIN';
  const ordenTerminada = ['TERMINADO', 'CANCELADO'].includes(orden.estado) || orden.estaCerrada;

  if (ordenTerminada) {
    throw new AppError('La orden ya terminó. Solo se puede ajustar la facturación.');
  }

  if (tipo === 'registro') {
    if (previa && !esAdmin) {
      throw new AppError('La foto de registro ya fue tomada. Solo un administrador puede cambiarla.', 403);
    }
  } else if (!puedeEditarDesarrollo(orden)) {
    throw new AppError(
      orden.estado === 'EN_ESPERA'
        ? 'La foto de desarrollo se toma después de aceptar la orden.'
        : 'La foto de desarrollo solo se reemplaza mientras la orden está en trabajo.'
    );
  }

  const snapshotAnterior = previa
    ? await copiarFotoAuditoria(orden.id, tipo, previa)
    : null;

  const ruta = await guardarFotoArchivo(orden.id, tipo, file);
  const snapshotNuevo = await copiarBufferAuditoria(orden.id, tipo, file);

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: orden.id },
    data: { [campo]: ruta },
    include: includeOrdenDetalle,
  });

  const operacion = previa ? 'REEMPLAZAR' : 'SUBIR';
  await registrarLog(
    req,
    `${operacion} FOTO ${tipo.toUpperCase()}`,
    {
      operacion,
      tipoFoto: tipo,
      imagen: etiquetaFoto[tipo],
      archivoNuevo: ruta,
      archivoAnterior: previa || null,
      snapshotNuevo,
      snapshotAnterior,
      numeroOrden: orden.numeroOrden,
    },
    previa ? { archivo: previa, tipoFoto: tipo } : null,
    orden.id
  );

  return actualizada;
};

export const quitarFotoOrden = async (id, tipo, req) => {
  if (!TIPOS_FOTO.includes(tipo)) throw new AppError('Tipo de foto inválido', 400);

  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, estado: true, estaCerrada: true, fotoRegistro: true, fotoDesarrollo: true },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  if (['TERMINADO', 'CANCELADO'].includes(orden.estado) || orden.estaCerrada) {
    throw new AppError('La orden ya terminó. Solo se puede ajustar la facturación.');
  }
  const esAdmin = req.user?.rol === 'ADMIN';
  if (tipo === 'registro' && !esAdmin) {
    throw new AppError('Solo un administrador puede quitar la foto de registro.', 403);
  }
  if (tipo === 'desarrollo' && !puedeEditarDesarrollo(orden)) {
    throw new AppError('Ya no se puede quitar la foto de desarrollo.');
  }

  const campo = campoFoto[tipo];
  const previa = orden[campo];
  const snapshotAnterior = previa
    ? await copiarFotoAuditoria(orden.id, tipo, previa)
    : null;
  if (previa) await borrarFotoArchivo(previa);

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: orden.id },
    data: { [campo]: null },
    include: includeOrdenDetalle,
  });

  await registrarLog(
    req,
    `QUITAR FOTO ${tipo.toUpperCase()}`,
    {
      operacion: 'QUITAR',
      tipoFoto: tipo,
      imagen: etiquetaFoto[tipo],
      archivoNuevo: null,
      archivoAnterior: previa || null,
      snapshotAnterior,
      snapshotNuevo: null,
    },
    previa ? { archivo: previa, tipoFoto: tipo } : { archivo: null, tipoFoto: tipo },
    orden.id
  );
  return actualizada;
};

export const obtenerArchivoFoto = async (id, tipo) => {
  if (!TIPOS_FOTO.includes(tipo)) throw new AppError('Tipo de foto inválido', 400);
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: { fotoRegistro: true, fotoDesarrollo: true },
  });
  if (!orden) throw new AppError('Orden no encontrada', 404);
  const ruta = orden[campoFoto[tipo]];
  if (!ruta) throw new AppError('Imagen no encontrada', 404);
  return leerFotoArchivo(ruta);
};
