import { asyncHandler } from '../utils/asyncHandler.js';

/** Misma forma HTTP para materiales, servicios y terceros. */
export const crearControladorCatalogo = (service) => ({
  listar: asyncHandler(async (req, res) => {
    res.json(await service.listar(req));
  }, { defaultStatus: 500, useMessageKey: false }),

  crear: asyncHandler(async (req, res) => {
    res.status(201).json(await service.crear(req.body, req));
  }, { useMessageKey: false }),

  actualizar: asyncHandler(async (req, res) => {
    res.json(await service.actualizar(req.params.id, req.body, req));
  }, { useMessageKey: false }),

  eliminar: asyncHandler(async (req, res) => {
    res.json(await service.eliminar(req.params.id, req));
  }, { useMessageKey: false }),
});
