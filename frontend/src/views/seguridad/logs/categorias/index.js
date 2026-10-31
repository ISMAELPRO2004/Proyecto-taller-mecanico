import LogCreacion from './creacion/LogCreacion.vue';
import LogEliminacion from './eliminacion/LogEliminacion.vue';
import LogEdicion from './edicion/LogEdicion.vue';
import LogDetalle from './detalle/LogDetalle.vue';
import LogGrupo from './grupo/LogGrupo.vue';
import LogFoto from './foto/LogFoto.vue';

export const CATEGORIAS_LOG = {
  CREACION: LogCreacion,
  ELIMINACION: LogEliminacion,
  EDICION: LogEdicion,
  DETALLE: LogDetalle,
  GRUPO: LogGrupo,
  FOTO: LogFoto,
};

export function componentePorTipo(tipo) {
  return CATEGORIAS_LOG[tipo] || null;
}
