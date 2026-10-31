<script setup>
import FiltrosAuditoria from './filtros/FiltrosAuditoria.vue';
import TablaAuditoria from './tabla/TablaAuditoria.vue';
import Paginador from '../../../components/ui/Paginador.vue';

defineProps({
  busqueda: { type: String, default: '' },
  filtroUsuarioId: { type: String, default: '' },
  usuarios: { type: Array, default: () => [] },
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  paginaActual: { type: Number, required: true },
  itemsPorPagina: { type: Number, required: true },
  totalPaginas: { type: Number, required: true },
  opcionesItems: { type: Array, required: true },
  totalLogs: { type: Number, required: true },
  paginasVisibles: { type: Array, required: true },
});

defineEmits([
  'update:busqueda',
  'update:filtroUsuarioId',
  'update:paginaActual',
  'update:itemsPorPagina',
  'verDetalle',
]);
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <FiltrosAuditoria
      :busqueda="busqueda"
      :filtro-usuario-id="filtroUsuarioId"
      :usuarios="usuarios"
      @update:busqueda="$emit('update:busqueda', $event)"
      @update:filtro-usuario-id="$emit('update:filtroUsuarioId', $event)"
    />

    <TablaAuditoria
      :logs="logs"
      :loading="loading"
      @ver-detalle="$emit('verDetalle', $event)"
    />

    <div class="border-t border-lyer-linea/40 bg-lyer-panel px-4 py-4 md:px-6">
      <Paginador
        :model-value="paginaActual"
        :items-por-pagina="itemsPorPagina"
        :total-paginas="totalPaginas"
        :opciones-items="opcionesItems"
        :total="totalLogs"
        :paginas-visibles="paginasVisibles"
        mostrar-label-ver
        oscuro
        total-sufijo="registros"
        @update:model-value="$emit('update:paginaActual', $event)"
        @update:items-por-pagina="$emit('update:itemsPorPagina', $event)"
      />
    </div>
  </div>
</template>
