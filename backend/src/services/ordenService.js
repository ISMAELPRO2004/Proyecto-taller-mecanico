import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { calcularTotalOrden } from '../utils/money.js';
import { registrarLog } from '../utils/logger.js';
import {
  TIPOS_FOTO,
  guardarFotoArchivo,
  leerFotoArchivo,
  borrarFotoArchivo,
  borrarCarpetaOrden,
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

  await registrarLog(
    req,
    'CAMBIO DE ESTADO',
    { estado, requiereFactura, numeroFactura, montoFactura },
    { estado: ordenPrevia.estado },
    id
  );

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
  if (req.user?.rol !== 'ADMIN') {
    throw new AppError('Solo el administrador puede eliminar órdenes.', 403);
  }

  const ordenId = parseInt(id);
  await prisma.$transaction([
    prisma.logActividad.updateMany({ where: { ordenId }, data: { ordenId: null } }),
    prisma.oTMaterial.deleteMany({ where: { ordenId } }),
    prisma.oTServicio.deleteMany({ where: { ordenId } }),
    prisma.oTTercero.deleteMany({ where: { ordenId } }),
    prisma.ordenTrabajo.delete({ where: { id: ordenId } }),
  ]);

  await borrarCarpetaOrden(id);

  await registrarLog(req, 'ELIMINAR ORDEN', null, {
    numeroOrden: ordenPrevia.numeroOrden,
    cliente: ordenPrevia.cliente?.nombreRazonSocial,
    placa: ordenPrevia.placa,
  }, null);

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

  const ruta = await guardarFotoArchivo(orden.id, tipo, file);
  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: orden.id },
    data: { [campo]: ruta },
    include: includeOrdenDetalle,
  });

  await registrarLog(
    req,
    previa ? `REEMPLAZAR FOTO ${tipo.toUpperCase()}` : `SUBIR FOTO ${tipo.toUpperCase()}`,
    { [campo]: ruta },
    { [campo]: previa },
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
  if (previa) await borrarFotoArchivo(previa);

  const actualizada = await prisma.ordenTrabajo.update({
    where: { id: orden.id },
    data: { [campo]: null },
    include: includeOrdenDetalle,
  });

  await registrarLog(req, `QUITAR FOTO ${tipo.toUpperCase()}`, { [campo]: null }, { [campo]: previa }, orden.id);
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
