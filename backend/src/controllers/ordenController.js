import * as ordenService from '../services/ordenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const crearOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.crearOrden(req.body, req);
  res.status(201).json(orden);
});

export const listarOrdenes = asyncHandler(async (req, res) => {
  const ordenes = await ordenService.listarOrdenes();
  res.json(ordenes);
}, { defaultStatus: 500, useMessageKey: false });

export const obtenerOrdenPorId = asyncHandler(async (req, res) => {
  const orden = await ordenService.obtenerOrdenPorId(req.params.id);
  res.json(orden);
}, { defaultStatus: 500, useMessageKey: false });

export const actualizarOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.actualizarOrden(req.params.id, req.body, req);
  res.json(orden);
});

export const actualizarEstadoOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.actualizarEstadoOrden(req.params.id, req.body.estado, req);
  res.json(orden);
}, { useMessageKey: false });

export const cerrarOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.cerrarOrden(req.params.id, req);
  res.json(orden);
}, { useMessageKey: false });

export const eliminarOrden = asyncHandler(async (req, res) => {
  const resultado = await ordenService.eliminarOrden(req.params.id, req);
  res.json(resultado);
}, { useMessageKey: false });
