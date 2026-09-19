import { recepcionPendiente } from '../../../utils/roles.js';

export const puedeEditar = (o) => !['TERMINADO', 'CANCELADO'].includes(o.estado);

/** Admin: cualquier orden. Resto: solo borradores incompletos de recepción. */
export const puedeEliminar = (o, rol) => {
  if (rol === 'ADMIN') return true;
  return recepcionPendiente(o);
};

export const facturaPendiente = (o) =>
  o?.estado === 'CANCELADO' && !!o.requiereFactura && !String(o.numeroFactura || '').trim();
export const puedeCancelarTerminado = (o) => o?.estado === 'TERMINADO';
export const puedeAceptar = (o) =>
  o?.estado === 'EN_ESPERA' && o?.pasoRecepcion == null && !!o?.clienteId;
