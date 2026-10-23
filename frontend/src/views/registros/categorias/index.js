import { categoriaClientes } from './clientes.js';
import { categoriaVehiculos } from './vehiculos.js';
import { categoriaMarcas } from './marcas.js';

export const CATEGORIAS_REGISTRO = [categoriaClientes, categoriaVehiculos, categoriaMarcas];

export const tabsRegistro = CATEGORIAS_REGISTRO.map(({ id, label }) => ({ id, label }));

export function categoriaPorId(id) {
  return CATEGORIAS_REGISTRO.find((c) => c.id === id) || categoriaClientes;
}
