import { categoriaRepuestos } from './repuestos.js';
import { categoriaServicios } from './servicios.js';
import { categoriaTerceros } from './terceros.js';

export const CATEGORIAS_CATALOGO = [categoriaRepuestos, categoriaServicios, categoriaTerceros];

export const tabsCatalogo = CATEGORIAS_CATALOGO.map(({ id, label }) => ({ id, label }));

export function categoriaPorId(id) {
  return CATEGORIAS_CATALOGO.find((c) => c.id === id) || categoriaRepuestos;
}
