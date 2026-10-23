<script setup>
import { Lock } from 'lucide-vue-next';
import AccionesOrden from './AccionesOrden.vue';
import { useTablaOrdenes } from './useTablaOrdenes.js';
import {
  fechaOrden,
  vehiculoOrden,
  nombreClienteOrden,
  pillEstado,
  etiquetaEstado,
  montoOrden,
} from './ordenTabla.js';

defineProps({
  orden: { type: Object, required: true },
  verPrecios: { type: Boolean, default: false },
  imprimiendoId: { type: [Number, String, null], default: null },
});

defineEmits(['verDetalle', 'imprimir', 'editar', 'eliminar', 'aceptar', 'factura', 'cancelar']);

const { ordenBloqueada, recepcionPendiente, verFacturaPendiente } = useTablaOrdenes();
</script>

<template>
  <tr class="transition-colors hover:bg-white/5">
    <td class="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-400">{{ fechaOrden(orden) }}</td>
    <td class="whitespace-nowrap px-4 py-3.5">
      <div class="flex items-center gap-1.5">
        <Lock v-if="ordenBloqueada(orden)" class="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span class="font-mono text-xs font-bold tracking-wide text-white">{{ orden.numeroOrden }}</span>
      </div>
    </td>
    <td class="px-4 py-3.5">
      <div class="flex items-center gap-2">
        <span class="rounded-md border border-[#4a2870]/60 bg-[#140a22] px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-100">
          {{ orden.placa }}
        </span>
        <span class="max-w-[180px] truncate text-xs font-medium uppercase text-slate-300" :title="vehiculoOrden(orden)">
          {{ vehiculoOrden(orden) || '—' }}
        </span>
      </div>
    </td>
    <td class="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-100">{{ nombreClienteOrden(orden) }}</td>
    <td class="px-4 py-3.5">
      <div class="flex flex-wrap items-center gap-1.5">
        <span :class="['rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', pillEstado(orden.estado)]">
          {{ etiquetaEstado(orden.estado) }}
        </span>
        <span
          v-if="recepcionPendiente(orden)"
          class="rounded-md border border-amber-500/35 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-200"
        >Pendiente a terminar</span>
        <span
          v-if="verFacturaPendiente(orden)"
          class="rounded-md border border-amber-500/35 bg-amber-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-200"
        >Factura pendiente</span>
      </div>
    </td>
    <td v-if="verPrecios" class="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs font-semibold">
      <span :class="Number(orden.totalFinal) > 0 ? 'font-bold text-white' : 'text-slate-400'">
        S/ {{ montoOrden(orden) }}
      </span>
    </td>
    <td class="px-4 py-3.5">
      <AccionesOrden
        :orden="orden"
        :imprimiendo-id="imprimiendoId"
        @ver-detalle="$emit('verDetalle', $event)"
        @imprimir="$emit('imprimir', $event)"
        @editar="$emit('editar', $event)"
        @eliminar="$emit('eliminar', $event)"
        @aceptar="$emit('aceptar', $event)"
        @factura="$emit('factura', $event)"
        @cancelar="$emit('cancelar', $event)"
      />
    </td>
  </tr>
</template>
