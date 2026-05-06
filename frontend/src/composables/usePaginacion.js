import { ref, computed, watch } from 'vue';

export function usePaginacion(listaRef, opciones = {}) {
  const itemsPorPagina = ref(opciones.itemsPorPagina || 10);
  const paginaActual = ref(1);
  const opcionesItems = opciones.opcionesItems || [5, 10, 20, 50];

  watch([() => listaRef.value, itemsPorPagina], () => { paginaActual.value = 1; });

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil((listaRef.value?.length || 0) / itemsPorPagina.value))
  );

  const itemsPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
    return (listaRef.value || []).slice(inicio, inicio + itemsPorPagina.value);
  });

  const filasVacias = computed(() =>
    Math.max(0, itemsPorPagina.value - itemsPaginados.value.length)
  );

  return {
    paginaActual,
    itemsPorPagina,
    opcionesItems,
    totalPaginas,
    itemsPaginados,
    filasVacias,
  };
}
