import { terceroService } from '../services/catalogoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarServiciosTerceros = asyncHandler(async (req, res) => {
  const servicios = await terceroService.listar();
  res.json(servicios);
}, { defaultStatus: 500, useMessageKey: false });

export const crearServicioTercero = asyncHandler(async (req, res) => {
  const nuevo = await terceroService.crear(req.body, req);
  res.status(201).json(nuevo);
}, { useMessageKey: false });

export const actualizarServicioTercero = asyncHandler(async (req, res) => {
  const actualizado = await terceroService.actualizar(req.params.id, req.body, req);
  res.json(actualizado);
}, { useMessageKey: false });

export const eliminarServicioTercero = asyncHandler(async (req, res) => {
  const resultado = await terceroService.eliminar(req.params.id, req);
  res.json(resultado);
}, { useMessageKey: false });
