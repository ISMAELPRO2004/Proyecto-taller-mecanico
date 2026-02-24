import prisma from '../config/prisma.js';

export const listarServicios = async (req, res) => {
  const servicios = await prisma.catalogoServicio.findMany({ orderBy: { descripcion: 'asc' } });
  res.json(servicios);
};

export const crearServicio = async (req, res) => {
  const { descripcion, precioBase } = req.body;
  const nuevo = await prisma.catalogoServicio.create({
    data: { descripcion, precioBase: parseFloat(precioBase) }
  });
  res.status(201).json(nuevo);
};

export const actualizarServicio = async (req, res) => {
  const { id } = req.params;
  const { precioBase, descripcion } = req.body;
  const actualizado = await prisma.catalogoServicio.update({
    where: { id: parseInt(id) },
    data: { descripcion, precioBase: parseFloat(precioBase) }
  });
  res.json(actualizado);
};

export const eliminarServicio = async (req, res) => {
  const { id } = req.params;
  await prisma.catalogoServicio.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Servicio eliminado' });
};