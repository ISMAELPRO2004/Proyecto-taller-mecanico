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
  crearMarcaSchema,
  upsertVehiculoSchema,
} from './cliente.schema.js';
export { idParamSchema, fotoParamSchema } from './common.schema.js';
