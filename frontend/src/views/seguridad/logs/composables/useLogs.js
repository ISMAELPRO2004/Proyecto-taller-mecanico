import { computed, ref, watch } from 'vue';
import { agruparLogs } from '../../../../utils/agruparLogs.js';
import { usuarioService } from '../../../../services/usuarioService.js';
import { notify } from '../../../../utils/alerts.js';

export function useLogs({ loading, tabActiva }) {
  const logs = ref([]);
  const logsVisibles = computed(() => agruparLogs(logs.value));
  const logSeleccionado = ref(null);
  const modalLogOpen = ref(false);

  const busqueda = ref('');
  const filtroUsuarioId = ref('');

  const paginaActual = ref(1);
  const itemsPorPagina = ref(10);
  const totalLogs = ref(0);
  const totalPaginas = ref(1);
  const opcionesItems = [10, 20, 50];

  const cargarLogs = async () => {
    loading.value = true;
    try {
      const params = {
        page: paginaActual.value,
        limit: itemsPorPagina.value,
      };
      if (busqueda.value.trim()) params.accion = busqueda.value.trim();
      if (filtroUsuarioId.value) params.usuarioId = filtroUsuarioId.value;

      const data = await usuarioService.listarLogs(params);
      logs.value = data.data;
      totalLogs.value = data.total;
      totalPaginas.value = data.totalPages;
    } catch {
      notify.error('Error', 'No se pudo cargar el historial de auditoría.');
    } finally {
      loading.value = false;
    }
  };

  const verDetalleLog = (log) => {
    logSeleccionado.value = log;
    modalLogOpen.value = true;
  };

  const paginasVisibles = computed(() => {
    const total = totalPaginas.value;
    const actual = paginaActual.value;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 3) return [1, 2, 3, 4, 5];
    if (actual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [actual - 2, actual - 1, actual, actual + 1, actual + 2];
  });

  watch([busqueda, filtroUsuarioId, itemsPorPagina], () => {
    paginaActual.value = 1;
    if (tabActiva.value === 'logs') cargarLogs();
  });

  watch(paginaActual, () => {
    if (tabActiva.value === 'logs') cargarLogs();
  });

  return {
    logsVisibles,
    logSeleccionado,
    modalLogOpen,
    busqueda,
    filtroUsuarioId,
    paginaActual,
    itemsPorPagina,
    totalLogs,
    totalPaginas,
    opcionesItems,
    paginasVisibles,
    cargarLogs,
    verDetalleLog,
  };
}
