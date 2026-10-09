import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import {
  auditarBorrador,
  eventosPasoVehiculo,
  eventosPasoCliente,
  eventosTrabajoBorrador,
} from '../../auditoria/index.js';
import {
  includeOrdenDetalle,
  upsertCliente,
  upsertVehiculo,
  siguienteNumeroOrden,
} from './comun.js';

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

  await auditarBorrador(req, { orden, eventos });
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

  await auditarBorrador(req, { orden, eventos });
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

  await auditarBorrador(req, { orden, eventos });
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

  await auditarBorrador(req, { orden, eventos });
  return orden;
};
