import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { calcularTotalOrden } from '../utils/money.js';
import { registrarLog } from '../utils/logger.js';

const incluirDetallesOrden = {
  responsable: { select: { nombreCompleto: true } },
  materiales: { include: { material: true } },
  servicios: { include: { servicio: true } },
  terceros: { include: { tercero: true } },
};

export const crearOrden = async (data, req) => {
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId,
  } = data;

  const resultado = await prisma.$transaction(async (tx) => {
    const year = new Date().getFullYear();

    const contador = await tx.contadorOrden.upsert({
      where: { anio: year },
      create: { anio: year, contador: 1 },
      update: { contador: { increment: 1 } },
    });
    const numeroOrden = `OT-${year}-${contador.contador.toString().padStart(4, '0')}`;
    const totalCalculado = calcularTotalOrden({ materiales, servicios, terceros });

    const vehiculo = await tx.vehiculo.upsert({
      where: { placa: placa.trim().toUpperCase() },
      update: {
        horometro: parseFloat(horometro || 0),
        kilometraje: parseFloat(kilometraje || 0),
      },
      create: {
        placa: placa.trim().toUpperCase(),
        marca: marca || 'Genérica',
        modelo: modelo || 'Genérico',
        horometro: parseFloat(horometro || 0),
        kilometraje: parseFloat(kilometraje || 0),
      },
    });

    const nuevaOrden = await tx.ordenTrabajo.create({
      data: {
        numeroOrden,
        clienteNombre,
        clienteCelular: clienteCelular || '',
        trabajoSolicitado: trabajoSolicitado || 'Mantenimiento General',
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        horometro: vehiculo.horometro,
        kilometraje: vehiculo.kilometraje,
        creadorId: req.user.id,
        responsableId: parseInt(responsableId),
        totalFinal: totalCalculado,
        estado: 'EN_REPARACION',
      },
    });

    if (materiales?.length > 0) {
      await tx.oTMaterial.createMany({
        data: materiales.map((m) => ({
          ordenId: nuevaOrden.id,
          materialId: m.materialId,
          cantidad: m.cantidad,
          precioAplicado: m.precioAlMomento,
        })),
      });
    }

    if (servicios?.length > 0) {
      await tx.oTServicio.createMany({
        data: servicios.map((s) => ({
          ordenId: nuevaOrden.id,
          servicioId: s.servicioId,
          descripcion: s.descripcion,
          monto: s.monto,
        })),
      });
    }

    if (terceros?.length > 0) {
      await tx.oTTercero.createMany({
        data: terceros.map((t) => ({
          ordenId: nuevaOrden.id,
          terceroId: t.terceroId,
          descripcion: t.descripcion,
          monto: t.monto,
        })),
      });
    }

    const responsableCreacion = await tx.usuario.findUnique({
      where: { id: parseInt(responsableId) },
      select: { nombreCompleto: true },
    });

    return { nuevaOrden, responsableCreacion };
  });

  await registrarLog(req, 'CREAR ORDEN', {
    ...data,
    responsable: resultado.responsableCreacion?.nombreCompleto ?? responsableId,
  }, null, resultado.nuevaOrden.id);

  return resultado.nuevaOrden;
};

export const listarOrdenes = async () => {
  return prisma.ordenTrabajo.findMany({
    include: { responsable: { select: { nombreCompleto: true } } },
    orderBy: { fechaCreacion: 'desc' },
  });
};

export const obtenerOrdenPorId = async (id) => {
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: {
      responsable: true,
      creador: true,
      materiales: { include: { material: true } },
      servicios: { include: { servicio: true } },
      terceros: { include: { tercero: true } },
    },
  });

  if (!orden) throw new AppError('Orden no encontrada', 404);
  return orden;
};

export const actualizarOrden = async (id, data, req) => {
  const {
    clienteNombre, clienteCelular, trabajoSolicitado,
    placa, marca, modelo, horometro, kilometraje,
    materiales, servicios, terceros, responsableId, estado,
  } = data;

  const ordenPrevia = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    include: incluirDetallesOrden,
  });

  if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);

  if (ordenPrevia.estaCerrada) {
    throw new AppError('Esta orden está cerrada permanentemente y no puede modificarse.');
  }

  if (['TERMINADO', 'CANCELADO'].includes(ordenPrevia.estado)) {
    throw new AppError('No se puede modificar una orden cerrada o cancelada.');
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const totalCalculado = calcularTotalOrden({ materiales, servicios, terceros });

    await tx.vehiculo.update({
      where: { placa: placa.trim().toUpperCase() },
      data: {
        horometro: parseFloat(horometro || 0),
        kilometraje: parseFloat(kilometraje || 0),
      },
    });

    await tx.oTMaterial.deleteMany({ where: { ordenId: parseInt(id) } });
    await tx.oTServicio.deleteMany({ where: { ordenId: parseInt(id) } });
    await tx.oTTercero.deleteMany({ where: { ordenId: parseInt(id) } });

    const ordenActualizada = await tx.ordenTrabajo.update({
      where: { id: parseInt(id) },
      data: {
        clienteNombre,
        clienteCelular,
        trabajoSolicitado,
        marca,
        modelo,
        horometro: parseFloat(horometro || 0),
        kilometraje: parseFloat(kilometraje || 0),
        responsableId: parseInt(responsableId),
        totalFinal: totalCalculado,
        estado: estado || ordenPrevia.estado,
      },
    });

    if (materiales?.length > 0) {
      await tx.oTMaterial.createMany({
        data: materiales.map((m) => ({
          ordenId: ordenActualizada.id,
          materialId: m.materialId,
          cantidad: parseFloat(m.cantidad),
          precioAplicado: parseFloat(m.precioAlMomento),
        })),
      });
    }

    if (servicios?.length > 0) {
      await tx.oTServicio.createMany({
        data: servicios.map((s) => ({
          ordenId: ordenActualizada.id,
          servicioId: s.servicioId,
          descripcion: s.descripcion,
          monto: parseFloat(s.monto || 0),
        })),
      });
    }

    if (terceros?.length > 0) {
      await tx.oTTercero.createMany({
        data: terceros.map((t) => ({
          ordenId: ordenActualizada.id,
          terceroId: t.terceroId,
          descripcion: t.descripcion,
          monto: parseFloat(t.monto || 0),
        })),
      });
    }

    return ordenActualizada;
  });

  const nuevoResponsable = await prisma.usuario.findUnique({
    where: { id: parseInt(responsableId) },
    select: { nombreCompleto: true },
  });

  const anteriorNormalizado = {
    clienteNombre: ordenPrevia.clienteNombre,
    clienteCelular: ordenPrevia.clienteCelular,
    trabajoSolicitado: ordenPrevia.trabajoSolicitado,
    placa: ordenPrevia.placa,
    marca: ordenPrevia.marca,
    modelo: ordenPrevia.modelo,
    horometro: ordenPrevia.horometro,
    kilometraje: ordenPrevia.kilometraje,
    estado: ordenPrevia.estado,
    totalFinal: ordenPrevia.totalFinal,
    responsable: ordenPrevia.responsable?.nombreCompleto ?? '—',
    materiales: ordenPrevia.materiales,
    servicios: ordenPrevia.servicios,
    terceros: ordenPrevia.terceros,
  };

  const nuevoNormalizado = {
    clienteNombre,
    clienteCelular,
    trabajoSolicitado,
    placa,
    marca,
    modelo,
    horometro,
    kilometraje,
    estado: estado || ordenPrevia.estado,
    totalFinal: resultado.totalFinal,
    responsable: nuevoResponsable?.nombreCompleto ?? responsableId,
    materiales,
    servicios,
    terceros,
  };

  await registrarLog(req, 'ACTUALIZAR ORDEN', nuevoNormalizado, anteriorNormalizado, id);

  return resultado;
};

export const actualizarEstadoOrden = async (id, estado, req) => {
  const ordenPrevia = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: { estado: true, clienteNombre: true, numeroOrden: true },
  });

  if (!ordenPrevia) throw new AppError('Orden no encontrada', 404);

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: parseInt(id) },
    data: { estado },
  });

  await registrarLog(
    req,
    'CAMBIO DE ESTADO',
    { estado },
    { estado: ordenPrevia.estado },
    id
  );

  return actualizada;
};

export const cerrarOrden = async (id, req) => {
  const orden = await prisma.ordenTrabajo.findUnique({
    where: { id: parseInt(id) },
    select: { estado: true, estaCerrada: true, fechaCreacion: true, numeroOrden: true },
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
    include: incluirDetallesOrden,
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
    ...ordenPrevia,
    responsable: ordenPrevia.responsable?.nombreCompleto ?? '—',
  }, null);

  return { message: 'Orden eliminada exitosamente' };
};
