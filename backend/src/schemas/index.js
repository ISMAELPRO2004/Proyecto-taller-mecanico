export { loginSchema } from './auth.schema.js';
export {
  crearBorradorOrdenSchema,
  actualizarBorradorOrdenSchema,
  actualizarOrdenSchema,
  actualizarEstadoSchema,
  aceptarOrdenSchema,
  actualizarFacturaSchema,
} from './orden.schema.js';
export {
  crearClienteSchema,
  crearMarcaSchema,
  upsertVehiculoSchema,
} from './cliente.schema.js';
export { idParamSchema, fotoParamSchema } from './common.schema.js';
