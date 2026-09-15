import * as vehiculoService from '../services/vehiculoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const buscarPorPlaca = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.buscarPorPlaca(req.params.placa);
  res.json(vehiculo);
}, { defaultStatus: 500, useMessageKey: false });
