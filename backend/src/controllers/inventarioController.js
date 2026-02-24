import prisma from '../config/prisma.js';

export const listarMateriales = async (req, res) => {
  const materiales = await prisma.catalogoMaterial.findMany({ orderBy: { descripcion: 'asc' } });
  res.json(materiales);
};

export const crearMaterial = async (req, res) => {
  const { descripcion, precioBase } = req.body;
  const nuevo = await prisma.catalogoMaterial.create({
    data: { descripcion, precioBase: parseFloat(precioBase) }
  });
  res.status(201).json(nuevo);
};

export const actualizarMaterial = async (req, res) => {
  const { id } = req.params;
  const { precioBase, descripcion } = req.body;
  const actualizado = await prisma.catalogoMaterial.update({
    where: { id: parseInt(id) },
    data: { 
      descripcion, 
      precioBase: parseFloat(precioBase) 
    }
  });
  res.json(actualizado);
};

export const eliminarMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.catalogoMaterial.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Material eliminado' });
  } catch (error) {
    res.status(400).json({ error: "No se puede eliminar porque ya está en una orden." });
  }
};