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

  const sinPrecio = (item) => {
    const { precioBase, ...resto } = item;
    return resto;
  };

  const listar = async (req) => {
    const items = await repo().findMany({ orderBy: { descripcion: 'asc' } });
    if (req?.user?.rol === 'TECNICO') return items.map(sinPrecio);
    return items;
  };

  const crear = async ({ descripcion, precioBase, responsable }, req) => {
    const nombreItem = descripcion?.trim();
    if (!nombreItem) throw new AppError('La descripción es obligatoria.');

    const esTecnico = req.user?.rol === 'TECNICO';
    let precio = null;
    if (!esTecnico) {
      const n = parseFloat(precioBase);
      if (!Number.isFinite(n) || n <= 0) throw new AppError('Ingresa un precio válido.');
      precio = n;
    }

    const data = {
      descripcion: nombreItem,
      precioBase: precio,
    };
    if (model === 'catalogoTercero') {
      const nombre = responsable?.trim();
      if (!nombre) throw new AppError('El responsable del tercero es obligatorio.');
      data.responsable = nombre;
    }

    const nuevo = await repo().create({ data });

    await registrarLog(req, labels.crear, nuevo);
    return esTecnico ? sinPrecio(nuevo) : nuevo;
  };

  const actualizar = async (id, { descripcion, precioBase, responsable }, req) => {
    const anterior = await repo().findUnique({ where: { id: parseInt(id) } });
    if (!anterior) throw new AppError(`${labels.entidad} no encontrado`, 404);

    const precio = parseFloat(precioBase);
    if (!Number.isFinite(precio) || precio <= 0) throw new AppError('Ingresa un precio válido.');

    const data = {
      descripcion,
      precioBase: precio,
    };
    if (model === 'catalogoTercero') {
      const nombre = responsable?.trim();
      if (!nombre) throw new AppError('El responsable del tercero es obligatorio.');
      data.responsable = nombre;
    }

    const actualizado = await repo().update({
      where: { id: parseInt(id) },
      data,
    });

    await registrarLog(
      req,
      labels.actualizar,
      { descripcion, precioBase, responsable, _nombreItem: anterior.descripcion },
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
