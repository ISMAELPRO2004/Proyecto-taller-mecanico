export const nombreClienteOrden = (orden) =>
  orden?.cliente?.nombreRazonSocial
  || orden?.clienteNombre
  || '—';

export const marcaVehiculoOrden = (orden) =>
  orden?.vehiculo?.marca?.nombre
  || orden?.marca
  || '';

export const modeloVehiculoOrden = (orden) =>
  orden?.vehiculo?.modelo
  || orden?.modelo
  || '';
