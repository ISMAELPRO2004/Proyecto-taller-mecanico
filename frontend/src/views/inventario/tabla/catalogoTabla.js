import { categoriaPorId } from '../categorias/index.js';

export const accionBtn = 'inline-flex items-center justify-center rounded-lg border border-lyer-linea/50 bg-lyer-hover transition-colors';

export const iconoCategoria = (tabActiva) => categoriaPorId(tabActiva).icon;

export const precioTexto = (item) =>
  item.precioBase != null ? parseFloat(item.precioBase).toFixed(2) : null;
