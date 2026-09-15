import * as usuarioService from '../services/usuarioService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const crearUsuario = asyncHandler(async (req, res) => {
  const resultado = await usuarioService.crearUsuario(req.body, req);
  res.status(201).json(resultado);
}, { useMessageKey: false });

export const editarUsuario = asyncHandler(async (req, res) => {
  const resultado = await usuarioService.editarUsuario(req.params.id, req.body, req);
  res.json(resultado);
}, { useMessageKey: false });

export const eliminarUsuario = asyncHandler(async (req, res) => {
  const resultado = await usuarioService.eliminarUsuario(req.params.id, req);
  res.json(resultado);
}, { useMessageKey: false });

export const toggleActivarUsuario = asyncHandler(async (req, res) => {
  const resultado = await usuarioService.toggleActivarUsuario(req.params.id, req);
  res.json(resultado);
}, { useMessageKey: false });

export const listarUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.listarUsuarios();
  res.json(usuarios);
}, { defaultStatus: 500, useMessageKey: false });
