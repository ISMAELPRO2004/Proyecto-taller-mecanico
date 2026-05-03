import prisma from '../config/prisma.js';
import { registrarLog } from '../utils/logger.js';

export const listarMateriales = async (req, res) => {
  const materiales = await prisma.catalogoMaterial.findMany({ orderBy: { descripcion: 'asc' } });
  res.json(materiales);
};

export const crearMaterial = async (req, res) => {
  try {
    const { descripcion, precioBase } = req.body;
    const nuevo = await prisma.catalogoMaterial.create({
      data: { descripcion, precioBase: parseFloat(precioBase) }
    });

    // LOG: Caso Creación (Nuevos datos, sin anteriores)
    await registrarLog(req, 'NUEVO MATERIAL EN CATÁLOGO', nuevo);

    res.status(201).json(nuevo);
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const actualizarMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener datos antes del cambio para comparar
    const anterior = await prisma.catalogoMaterial.findUnique({ where: { id: parseInt(id) } });

    const actualizado = await prisma.catalogoMaterial.update({
      where: { id: parseInt(id) },
      data: { 
        descripcion: req.body.descripcion, 
        precioBase: parseFloat(req.body.precioBase) 
      }
    });

    // LOG: Caso Edición (Nuevos vs Anteriores)
    await registrarLog(req, 'ACTUALIZAR MATERIAL', {
      ...req.body,
      _nombreItem: anterior.descripcion  // ← campo especial con prefijo _
    }, anterior);

    res.json(actualizado);
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminarMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Respaldo antes de borrar
    const anterior = await prisma.catalogoMaterial.findUnique({ where: { id: parseInt(id) } });

    await prisma.catalogoMaterial.delete({ where: { id: parseInt(id) } });

    // LOG: Caso Eliminación (Anteriores, sin nuevos)
    await registrarLog(req, 'ELIMINAR MATERIAL', null, anterior);

    res.json({ message: 'Material eliminado' });
  } catch (error) {
    res.status(400).json({ error: "No se puede eliminar porque ya está en una orden." });
  }
};