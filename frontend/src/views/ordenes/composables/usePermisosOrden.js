export const puedeEditar = (o) => !o.estaCerrada && !['TERMINADO', 'CANCELADO'].includes(o.estado);
export const puedeEliminar = (o) => !o.estaCerrada && o.estado !== 'TERMINADO';
export const puedeCerrar = (o) => !o.estaCerrada && ['TERMINADO', 'CANCELADO'].includes(o.estado);
export const puedeAceptar = (o) => !o.estaCerrada && o.estado === 'EN_ESPERA';
