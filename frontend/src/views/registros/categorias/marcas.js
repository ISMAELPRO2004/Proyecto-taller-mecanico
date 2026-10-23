import { vehiculoService } from '../../../services/vehiculoService.js';

export const categoriaMarcas = {
  id: 'marcas',
  label: 'Marcas',
  filtrar(lista, q) {
    return lista.filter((m) => !q || m.nombre.toLowerCase().includes(q));
  },
  formDesde(item) {
    return { id: item.id, nombre: item.nombre };
  },
  validar(form) {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'El nombre de la marca es obligatorio';
    return e;
  },
  guardar(form) {
    return vehiculoService.actualizarMarca(form.id, form.nombre);
  },
  eliminar(item) {
    return vehiculoService.eliminarMarca(item.id);
  },
  crear(nombre) {
    return vehiculoService.crearMarca(nombre.trim());
  },
};
