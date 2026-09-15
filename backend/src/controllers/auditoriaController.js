import * as auditoriaService from '../services/auditoriaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarLogs = asyncHandler(async (req, res) => {
  const resultado = await auditoriaService.listarLogs(req.query);
  res.json(resultado);
}, { defaultStatus: 500, useMessageKey: false });
