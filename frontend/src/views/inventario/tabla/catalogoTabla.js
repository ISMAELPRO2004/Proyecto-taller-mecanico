import { categoriaPorId } from '../categorias/index.js';

export const accionBtn = 'inline-flex items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] transition-colors';

export const iconoCategoria = (tabActiva) => categoriaPorId(tabActiva).icon;

export const precioTexto = (item) =>
  item.precioBase != null ? parseFloat(item.precioBase).toFixed(2) : null;
