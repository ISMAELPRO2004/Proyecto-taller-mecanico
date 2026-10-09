/** API pública de la orden. El controlador importa este índice. */
export {
  crearBorradorOrden,
  guardarPasoVehiculo,
  guardarPasoCliente,
  completarRecepcion,
} from './recepcion.js';

export { listarOrdenes, obtenerOrdenPorId } from './consulta.js';

export {
  aceptarOrden,
  actualizarOrden,
  actualizarEstadoOrden,
  cerrarOrden,
  eliminarOrden,
  actualizarFacturaOrden,
} from './trabajo.js';

export { subirFotoOrden, quitarFotoOrden, obtenerArchivoFoto } from './fotos.js';
