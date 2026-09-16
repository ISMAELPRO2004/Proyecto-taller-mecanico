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

export const listarVehiculos = asyncHandler(async (req, res) => {
  const vehiculos = await vehiculoService.listarVehiculos();
  res.json(vehiculos);
}, { defaultStatus: 500, useMessageKey: false });

export const actualizarVehiculo = asyncHandler(async (req, res) => {
  const vehiculo = await vehiculoService.actualizarVehiculo(req.params.placa, req.body, req);
  res.json(vehiculo);
});

export const eliminarVehiculo = asyncHandler(async (req, res) => {
  const resultado = await vehiculoService.eliminarVehiculo(req.params.placa, req);
  res.json(resultado);
});

export const actualizarMarca = asyncHandler(async (req, res) => {
  const marca = await vehiculoService.actualizarMarca(req.params.id, req.body, req);
  res.json(marca);
});

export const eliminarMarca = asyncHandler(async (req, res) => {
  const resultado = await vehiculoService.eliminarMarca(req.params.id, req);
  res.json(resultado);
});
