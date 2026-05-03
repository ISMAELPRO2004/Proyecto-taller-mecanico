import prisma from '../config/prisma.js';
import { registrarLog } from '../utils/logger.js';

export const listarServiciosTerceros = async (req, res) => {
  const servicios = await prisma.catalogoTercero.findMany({ orderBy: { descripcion: 'asc' } });
  res.json(servicios);
};

export const crearServicioTercero = async (req, res) => {
  try {
    const { descripcion, precioBase } = req.body;
    const nuevo = await prisma.catalogoTercero.create({
      data: { descripcion, precioBase: parseFloat(precioBase) }
    });

    // LOG: Caso Creación (Nuevos datos, sin anteriores)
    await registrarLog(req, 'NUEVO SERVICIO DE TERCERO EN CATÁLOGO', nuevo);

    res.status(201).json(nuevo);
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const actualizarServicioTercero = async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Obtener datos antes del cambio para comparar
    const anterior = await prisma.catalogoTercero.findUnique({ where: { id: parseInt(id) } });

    const actualizado = await prisma.catalogoTercero.update({
      where: { id: parseInt(id) },
      data: { 
        descripcion: req.body.descripcion, 
        precioBase: parseFloat(req.body.precioBase) 
      }
    });

    // LOG: Caso Edición (Nuevos vs Anteriores)
    await registrarLog(req, 'ACTUALIZAR SERVICIO DE TERCERO',
      {
        ...req.body,
        _nombreItem: anterior.descripcion  // ← campo especial con prefijo _
      }, anterior);

    res.json(actualizado);
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminarServicioTercero = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Respaldo antes de borrar
    const anterior = await prisma.catalogoTercero.findUnique({ where: { id: parseInt(id) } });

    await prisma.catalogoTercero.delete({ where: { id: parseInt(id) } });

    // LOG: Caso Eliminación (Anteriores, sin nuevos)
    await registrarLog(req, 'ELIMINAR SERVICIO DE TERCERO', null, anterior);

    res.json({ message: 'Servicio de tercero eliminado' });
  } catch (error) {
    res.status(400).json({ error: "No se puede eliminar porque ya está en una orden." });
  }
};
