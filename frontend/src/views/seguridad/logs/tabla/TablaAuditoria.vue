<script setup>
import FilaLog from './FilaLog.vue';
import TarjetaLog from './TarjetaLog.vue';

defineProps({
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['verDetalle']);
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>

  <div v-else-if="!logs.length" class="py-16 text-center text-sm text-lyer-muted">
    Sin registros
  </div>

  <template v-else>
    <div class="divide-y divide-lyer-linea/35 md:hidden">
      <TarjetaLog
        v-for="l in logs"
        :key="'m-' + l.id"
        :log="l"
        @ver-detalle="$emit('verDetalle', $event)"
      />
    </div>

    <div class="hidden overflow-x-auto md:block">
      <table class="w-full min-w-[860px] border-collapse text-left text-sm text-lyer-fg">
        <thead class="border-b border-lyer-linea/40 bg-lyer-panel text-[11px] font-bold uppercase tracking-wider text-lyer-muted">
          <tr>
            <th class="px-6 py-3.5">Fecha</th>
            <th class="px-4 py-3.5">Operador</th>
            <th class="px-4 py-3.5">Acción</th>
            <th class="px-4 py-3.5">Relacionado</th>
            <th class="px-6 py-3.5 text-center">Detalle</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-lyer-linea/35">
          <FilaLog
            v-for="l in logs"
            :key="l.id"
            :log="l"
            @ver-detalle="$emit('verDetalle', $event)"
          />
        </tbody>
      </table>
    </div>
  </template>
</template>
