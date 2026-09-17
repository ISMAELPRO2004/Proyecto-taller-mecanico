export const puedeEditar = (o) => !['TERMINADO', 'CANCELADO'].includes(o.estado);
export const puedeEliminar = () => true;
export const facturaPendiente = (o) =>
  o?.estado === 'CANCELADO' && !!o.requiereFactura && !String(o.numeroFactura || '').trim();
export const puedeCancelarTerminado = (o) => o?.estado === 'TERMINADO';
export const puedeAceptar = (o) => o?.estado === 'EN_ESPERA';
