import { materialService } from '../services/catalogoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarMateriales = asyncHandler(async (req, res) => {
  const materiales = await materialService.listar();
  res.json(materiales);
}, { defaultStatus: 500, useMessageKey: false });

export const crearMaterial = asyncHandler(async (req, res) => {
  const nuevo = await materialService.crear(req.body, req);
  res.status(201).json(nuevo);
}, { useMessageKey: false });

export const actualizarMaterial = asyncHandler(async (req, res) => {
  const actualizado = await materialService.actualizar(req.params.id, req.body, req);
  res.json(actualizado);
}, { useMessageKey: false });

export const eliminarMaterial = asyncHandler(async (req, res) => {
  const resultado = await materialService.eliminar(req.params.id, req);
  res.json(resultado);
}, { useMessageKey: false });
