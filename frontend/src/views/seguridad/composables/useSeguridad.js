import { onMounted, ref, watch } from 'vue';
import { tabsSeguridad } from '../categorias/index.js';
import { useUsuarios } from '../usuarios/composables/useUsuarios.js';
import { useLogs } from '../logs/composables/useLogs.js';

export function useSeguridad() {
  const tabActiva = ref('usuarios');
  const loading = ref(false);

  const usuariosApi = useUsuarios(loading);
  const logsApi = useLogs({ loading, tabActiva });

  const cargarDatos = () => {
    if (tabActiva.value === 'usuarios') usuariosApi.cargarUsuarios();
    else logsApi.cargarLogs();
  };

  watch(tabActiva, () => {
    logsApi.paginaActual.value = 1;
    logsApi.busqueda.value = '';
    cargarDatos();
  });

  onMounted(cargarDatos);

  return {
    tabsSeguridad,
    tabActiva,
    loading,
    ...usuariosApi,
    ...logsApi,
  };
}
