import { ESTADO } from '../constants/estadosOrden.js';

export const ROLES_CON_PRECIOS = ['ADMIN', 'SUPERVISOR'];
export const ROLES_IMPRIMIR = ['ADMIN', 'SUPERVISOR'];

export const puedeVerPrecios = (rol) => ROLES_CON_PRECIOS.includes(rol);

export const puedeImprimir = (rol) => ROLES_IMPRIMIR.includes(rol);

export const recepcionPendiente = (orden) =>
  orden?.estado === ESTADO.EN_ESPERA && orden?.pasoRecepcion != null;

/** Solo el admin ve/gestiona la alerta de factura pendiente */
export const mostrarAlertaFactura = (orden, rol) =>
  rol === 'ADMIN'
  && orden?.estado === ESTADO.CANCELADO
  && !!orden?.requiereFactura
  && !String(orden?.numeroFactura || '').trim();
