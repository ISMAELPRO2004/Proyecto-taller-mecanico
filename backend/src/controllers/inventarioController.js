import prisma from '../config/prisma.js';

// Obtener todos los materiales del catálogo
export const listarMateriales = async (req, res) => {
  try {
    const materiales = await prisma.catalogoMaterial.findMany({
      orderBy: { descripcion: 'asc' }
    });
    res.json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo material (Solo ADMIN)
export const crearMaterial = async (req, res) => {
  const { descripcion, precioBase } = req.body;
  try {
    const nuevo = await prisma.catalogoMaterial.create({
      data: { descripcion, precioBase: parseFloat(precioBase) }
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar precio (Solo ADMIN - Genera Log de Auditoría)
export const actualizarPrecio = async (req, res) => {
  const { id } = req.params;
  const { precioBase } = req.body;
  try {
    const actualizado = await prisma.catalogoMaterial.update({
      where: { id: parseInt(id) },
      data: { precioBase: parseFloat(precioBase) }
    });
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};