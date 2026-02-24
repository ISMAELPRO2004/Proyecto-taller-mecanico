import prisma from '../config/prisma.js';

export const listarServiciosTerceros = async (req, res) => {
  const servicios = await prisma.catalogoTercero.findMany({ orderBy: { descripcion: 'asc' } });
  res.json(servicios);
};

export const crearServicioTercero = async (req, res) => {
  const { descripcion, precioBase } = req.body;
  const nuevo = await prisma.catalogoTercero.create({
    data: { descripcion, precioBase: parseFloat(precioBase) }
  });
  res.status(201).json(nuevo);
};

export const actualizarServicioTercero = async (req, res) => {
  const { id } = req.params;
  const { precioBase, descripcion } = req.body;
  const actualizado = await prisma.catalogoTercero.update({
    where: { id: parseInt(id) },
    data: { descripcion, precioBase: parseFloat(precioBase) }
  });
  res.json(actualizado);
};

export const eliminarServicioTercero = async (req, res) => {
  const { id } = req.params;
  await prisma.catalogoTercero.delete({ where: { id: parseInt(id) } });
  res.json({ message: 'Servicio de tercero eliminado' });
};