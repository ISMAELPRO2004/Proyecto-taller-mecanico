import * as vehiculoService from '../services/vehiculoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarMarcas = asyncHandler(async (req, res) => {
  const marcas = await vehiculoService.listarMarcas();
  res.json(marcas);
}, { defaultStatus: 500, useMessageKey: false });

export const crearMarca = asyncHandler(async (req, res) => {
  const marca = await vehiculoService.crearMarca(req.body, req);
  res.status(201).json(marca);
});

export const buscarPorPlaca = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.buscarPorPlaca(req.params.placa);
  res.json(vehiculo);
}, { defaultStatus: 500 });

export const upsertVehiculo = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.upsertVehiculo(req.body, req);
  res.status(201).json(vehiculo);
});
