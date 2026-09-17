import { createReadStream } from 'fs';
import * as ordenService from '../services/ordenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const crearOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.crearBorradorOrden(req.body, req);
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

export const aceptarOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.aceptarOrden(req.params.id, req.body, req);
  res.json(orden);
});

export const actualizarEstadoOrden = asyncHandler(async (req, res) => {
  const orden = await ordenService.actualizarEstadoOrden(req.params.id, req.body, req);
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

export const subirFoto = asyncHandler(async (req, res) => {
  const orden = await ordenService.subirFotoOrden(req.params.id, req.params.tipo, req.file, req);
  res.json(orden);
});

export const quitarFoto = asyncHandler(async (req, res) => {
  const orden = await ordenService.quitarFotoOrden(req.params.id, req.params.tipo, req);
  res.json(orden);
});

export const obtenerFoto = asyncHandler(async (req, res) => {
  const { abs, mime } = await ordenService.obtenerArchivoFoto(req.params.id, req.params.tipo);
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'private, no-store');
  createReadStream(abs).pipe(res);
});
