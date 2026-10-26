import { recepcionPendiente } from '../../../../utils/roles.js';
import { ESTADO, ESTADOS_CERRADOS } from '../../../../constants/estadosOrden.js';

export const puedeEditar = (o) => !ESTADOS_CERRADOS.includes(o.estado);

/** Admin: cualquier orden. Resto: solo borradores incompletos de recepción. */
export const puedeEliminar = (o, rol) => {
  if (rol === 'ADMIN') return true;
  return recepcionPendiente(o);
};

export const facturaPendiente = (o) =>
  o?.estado === ESTADO.CANCELADO && !!o.requiereFactura && !String(o.numeroFactura || '').trim();
export const puedeCancelarTerminado = (o) => o?.estado === ESTADO.TERMINADO;
export const puedeAceptar = (o) =>
  o?.estado === ESTADO.EN_ESPERA && o?.pasoRecepcion == null && !!o?.clienteId;
