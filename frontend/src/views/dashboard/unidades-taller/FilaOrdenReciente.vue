<script setup>
import { computed } from 'vue';
import { Eye } from 'lucide-vue-next';
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../utils/ordenDisplay.js';
import { recepcionPendiente } from '../../../utils/roles.js';

const props = defineProps({
  orden: { type: Object, required: true },
  verPrecios: { type: Boolean, default: false },
});

const vehiculo = computed(() =>
  [marcaVehiculoOrden(props.orden), modeloVehiculoOrden(props.orden)].filter(Boolean).join(' ')
);
</script>

<template>
  <tr
    class="cursor-pointer transition-colors hover:bg-white/5"
    @click="$router.push('/ordenes')"
  >
    <td class="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold italic text-sky-400">
      {{ orden.numeroOrden }}
    </td>
    <td class="px-3 py-3">
      <div class="flex flex-col">
        <span class="font-mono text-sm font-bold tracking-wider text-lyer-fg">{{ orden.placa }}</span>
        <span class="text-[11px] text-lyer-muted">{{ vehiculo || '—' }}</span>
      </div>
    </td>
    <td class="hidden px-3 py-3 text-lyer-muted sm:table-cell">{{ nombreClienteOrden(orden) }}</td>
    <td class="px-3 py-3">
      <div class="flex flex-col items-start gap-1">
        <StatusBadge :estado="orden.estado" oscuro />
        <span
          v-if="recepcionPendiente(orden)"
          class="badge badge-warning badge-sm text-[8px] font-black uppercase"
        >Pendiente a terminar</span>
      </div>
    </td>
    <td v-if="verPrecios" class="whitespace-nowrap px-4 py-3 text-right font-mono font-bold text-lyer-fg">
      S/ {{ parseFloat(orden.totalFinal || 0).toFixed(2) }}
    </td>
    <td class="px-3 py-3 text-center">
      <button
        type="button"
        class="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#321c4c] text-lyer-muted transition-colors hover:bg-[#3d2460] hover:text-lyer-fg"
        title="Ver en el listado"
        @click.stop="$router.push('/ordenes')"
      >
        <Eye class="h-4 w-4" />
      </button>
    </td>
  </tr>
</template>
