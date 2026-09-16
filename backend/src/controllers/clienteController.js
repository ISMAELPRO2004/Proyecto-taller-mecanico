import * as clienteService from '../services/clienteService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listarClientes = asyncHandler(async (req, res) => {
  const todos = req.query.todos === '1';
  const clientes = await clienteService.listarClientes(req.query.q, { todos });
  res.json(clientes);
}, { defaultStatus: 500, useMessageKey: false });

export const actualizarCliente = asyncHandler(async (req, res) => {
  const cliente = await clienteService.actualizarCliente(req.params.id, req.body, req);
  res.json(cliente);
});

export const eliminarCliente = asyncHandler(async (req, res) => {
  const resultado = await clienteService.eliminarCliente(req.params.id, req);
  res.json(resultado);
});

export const buscarPorDocumento = asyncHandler(async (req, res) => {
  const cliente = await clienteService.buscarPorDocumento(req.params.documento);
  res.json(cliente);
}, { defaultStatus: 500 });

export const upsertCliente = asyncHandler(async (req, res) => {
  const cliente = await clienteService.crearOActualizarCliente(req.body, req);
  res.status(201).json(cliente);
});
