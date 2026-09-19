export const ROLES_CON_PRECIOS = ['ADMIN', 'SUPERVISOR'];

export const puedeVerPrecios = (rol) => ROLES_CON_PRECIOS.includes(rol);

export const recepcionPendiente = (orden) =>
  orden?.estado === 'EN_ESPERA' && orden?.pasoRecepcion != null;
