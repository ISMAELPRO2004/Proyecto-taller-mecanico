import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { registrarLog } from '../utils/logger.js';

/**
 * Factory CRUD para catálogos (materiales, servicios, terceros).
 * Unifica la lógica duplicada de los tres controllers anteriores.
 */
export const createCatalogoService = ({
  model,
  labels,
}) => {
  const repo = () => prisma[model];

  const listar = async () => {
    return repo().findMany({ orderBy: { descripcion: 'asc' } });
  };

  const crear = async ({ descripcion, precioBase }, req) => {
    const nuevo = await repo().create({
      data: { descripcion, precioBase: parseFloat(precioBase) },
    });

    await registrarLog(req, labels.crear, nuevo);
    return nuevo;
  };

  const actualizar = async (id, { descripcion, precioBase }, req) => {
    const anterior = await repo().findUnique({ where: { id: parseInt(id) } });
    if (!anterior) throw new AppError(`${labels.entidad} no encontrado`, 404);

    const actualizado = await repo().update({
      where: { id: parseInt(id) },
      data: {
        descripcion,
        precioBase: parseFloat(precioBase),
      },
    });

    await registrarLog(
      req,
      labels.actualizar,
      { descripcion, precioBase, _nombreItem: anterior.descripcion },
      anterior
    );

    return actualizado;
  };

  const eliminar = async (id, req) => {
    const anterior = await repo().findUnique({ where: { id: parseInt(id) } });
    if (!anterior) throw new AppError(`${labels.entidad} no encontrado`, 404);

    try {
      await repo().delete({ where: { id: parseInt(id) } });
    } catch {
      throw new AppError('No se puede eliminar porque ya está en una orden.');
    }

    await registrarLog(req, labels.eliminar, null, anterior);
    return { message: `${labels.entidad} eliminado` };
  };

  return { listar, crear, actualizar, eliminar };
};

export const materialService = createCatalogoService({
  model: 'catalogoMaterial',
  labels: {
    entidad: 'Material',
    crear: 'NUEVO MATERIAL EN CATÁLOGO',
    actualizar: 'ACTUALIZAR MATERIAL',
    eliminar: 'ELIMINAR MATERIAL',
  },
});

export const servicioService = createCatalogoService({
  model: 'catalogoServicio',
  labels: {
    entidad: 'Servicio',
    crear: 'NUEVO SERVICIO EN CATÁLOGO',
    actualizar: 'ACTUALIZAR SERVICIO',
    eliminar: 'ELIMINAR SERVICIO',
  },
});

export const terceroService = createCatalogoService({
  model: 'catalogoTercero',
  labels: {
    entidad: 'Servicio de tercero',
    crear: 'NUEVO SERVICIO DE TERCERO EN CATÁLOGO',
    actualizar: 'ACTUALIZAR SERVICIO DE TERCERO',
    eliminar: 'ELIMINAR SERVICIO DE TERCERO',
  },
});
