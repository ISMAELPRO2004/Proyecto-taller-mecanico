import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { registrarLog } from '../../auditoria/index.js';
import {
  TIPOS_FOTO,
  guardarFotoArchivo,
  leerFotoArchivo,
  borrarFotoArchivo,
  copiarFotoAuditoria,
  copiarBufferAuditoria,
} from '../fotoOrdenService.js';
import { includeOrdenDetalle } from './comun.js';

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
