export { loginSchema } from './auth.schema.js';
export {
  crearBorradorOrdenSchema,
  actualizarBorradorOrdenSchema,
  actualizarOrdenSchema,
  actualizarEstadoSchema,
  aceptarOrdenSchema,
  actualizarFacturaSchema,
  pasoVehiculoSchema,
  pasoClienteSchema,
  completarRecepcionSchema,
} from './orden.schema.js';
export {
  crearClienteSchema,
  consultarDocumentoSchema,
} from './cliente.schema.js';
export {
  crearMarcaSchema,
  upsertVehiculoSchema,
  placaParamSchema,
} from './vehiculo.schema.js';
export {
  crearUsuarioSchema,
  editarUsuarioSchema,
} from './user.schema.js';
export {
  crearItemCatalogoSchema,
  actualizarItemCatalogoSchema,
  crearTerceroSchema,
  actualizarTerceroSchema,
} from './inventario.schema.js';
export { idParamSchema, fotoParamSchema } from './common.schema.js';
