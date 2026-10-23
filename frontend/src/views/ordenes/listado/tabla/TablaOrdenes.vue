<script setup>
import FilaOrden from './FilaOrden.vue';
import { useTablaOrdenes } from './useTablaOrdenes.js';

defineProps({
  ordenes: { type: Array, required: true },
  cargando: { type: Boolean, default: false },
  filasVacias: { type: Number, default: 0 },
  imprimiendoId: { type: [Number, String, null], default: null },
});

defineEmits(['verDetalle', 'imprimir', 'editar', 'eliminar', 'aceptar', 'factura', 'cancelar']);

const { verPrecios } = useTablaOrdenes();
</script>

<template>
  <div v-if="cargando" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>
  <div v-else-if="ordenes.length === 0" class="py-16 text-center text-sm text-slate-400">
    No hay órdenes.
  </div>

  <div v-else class="overflow-x-auto">
    <table class="w-full min-w-[980px] border-collapse text-left text-sm text-slate-200">
      <thead class="border-b border-[#4a2870]/40 bg-[#160a24] text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <tr>
          <th class="whitespace-nowrap px-4 py-3.5 text-left">Fecha</th>
          <th class="whitespace-nowrap px-4 py-3.5 text-left">Orden #</th>
          <th class="px-4 py-3.5 text-left">Vehículo / placa</th>
          <th class="px-4 py-3.5 text-left">Cliente</th>
          <th class="px-4 py-3.5 text-left">Estado</th>
          <th v-if="verPrecios" class="whitespace-nowrap px-4 py-3.5 text-right">Inversión</th>
          <th class="min-w-[210px] whitespace-nowrap px-4 py-3.5 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#4a2870]/35">
        <FilaOrden
          v-for="o in ordenes"
          :key="o.id"
          :orden="o"
          :ver-precios="verPrecios"
          :imprimiendo-id="imprimiendoId"
          @ver-detalle="$emit('verDetalle', $event)"
          @imprimir="$emit('imprimir', $event)"
          @editar="$emit('editar', $event)"
          @eliminar="$emit('eliminar', $event)"
          @aceptar="$emit('aceptar', $event)"
          @factura="$emit('factura', $event)"
          @cancelar="$emit('cancelar', $event)"
        />
        <tr v-for="n in filasVacias" :key="'ghost-' + n" class="pointer-events-none h-[68px] opacity-0">
          <td :colspan="verPrecios ? 7 : 6" />
        </tr>
      </tbody>
    </table>
  </div>
</template>
