import { createReadStream } from 'fs';
import * as auditoriaService from '../services/auditoriaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarLogs = asyncHandler(async (req, res) => {
  const resultado = await auditoriaService.listarLogs(req.query);
  res.json(resultado);
}, { defaultStatus: 500, useMessageKey: false });

export const obtenerFotoLog = asyncHandler(async (req, res) => {
  const { abs, mime } = await auditoriaService.obtenerFotoAuditoria(req.query.ruta);
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'private, no-store');
  createReadStream(abs).pipe(res);
}, { defaultStatus: 404, useMessageKey: false });
