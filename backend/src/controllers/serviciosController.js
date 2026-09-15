import { servicioService } from '../services/catalogoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarServicios = asyncHandler(async (req, res) => {
  const servicios = await servicioService.listar();
  res.json(servicios);
}, { defaultStatus: 500, useMessageKey: false });

export const crearServicio = asyncHandler(async (req, res) => {
  const nuevo = await servicioService.crear(req.body, req);
  res.status(201).json(nuevo);
}, { useMessageKey: false });

export const actualizarServicio = asyncHandler(async (req, res) => {
  const actualizado = await servicioService.actualizar(req.params.id, req.body, req);
  res.json(actualizado);
}, { useMessageKey: false });

export const eliminarServicio = asyncHandler(async (req, res) => {
  const resultado = await servicioService.eliminar(req.params.id, req);
  res.json(resultado);
}, { useMessageKey: false });
