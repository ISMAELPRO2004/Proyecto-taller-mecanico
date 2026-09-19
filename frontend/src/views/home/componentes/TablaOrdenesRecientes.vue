<script setup>
import { computed } from 'vue';
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import { Car, ArrowUpRight } from 'lucide-vue-next';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../utils/ordenDisplay.js';
import { useAuthStore } from '../../../stores/auth.js';
import { puedeVerPrecios, recepcionPendiente } from '../../../utils/roles.js';

defineProps({
  ordenesRecientes: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
});

const auth = useAuthStore();
const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
</script>

<template>
  <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
      <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
        <Car class="w-4 h-4 text-lyer-green" />
        Últimas Unidades en Taller
      </h3>
      <button
        @click="$router.push('/ordenes')"
        class="text-xs font-bold text-lyer-accent hover:underline flex items-center gap-1"
      >
        Ver todas <ArrowUpRight class="w-3 h-3" />
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead class="bg-slate-50">
          <tr class="text-slate-500 uppercase text-[9px] tracking-widest">
            <th class="py-3 pl-4">OT #</th>
            <th>Placa</th>
            <th class="hidden sm:table-cell">Cliente</th>
            <th>Estado</th>
            <th v-if="verPrecios" class="text-right pr-4">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cargando">
            <td :colspan="verPrecios ? 5 : 4" class="text-center py-10">
              <span class="loading loading-ring loading-md text-lyer-green" />
            </td>
          </tr>
          <tr
            v-for="o in ordenesRecientes"
            :key="o.id"
            class="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
            @click="$router.push('/ordenes')"
          >
            <td class="pl-4 py-3 font-black text-lyer-green italic text-xs">{{ o.numeroOrden }}</td>
            <td class="py-3">
              <div class="flex flex-col">
                <span class="font-black text-slate-700 uppercase text-sm">{{ o.placa }}</span>
                <span class="text-[10px] text-slate-400">{{ marcaVehiculoOrden(o) }} {{ modeloVehiculoOrden(o) }}</span>
              </div>
            </td>
            <td class="hidden sm:table-cell py-3 text-sm font-medium">{{ nombreClienteOrden(o) }}</td>
            <td class="py-3">
              <div class="flex flex-col items-start gap-1">
                <StatusBadge :estado="o.estado" />
                <span
                  v-if="recepcionPendiente(o)"
                  class="badge badge-warning badge-sm font-black uppercase text-[8px] animate-pulse"
                >Pendiente a terminar</span>
              </div>
            </td>
            <td v-if="verPrecios" class="text-right pr-4 py-3 font-black text-slate-700 text-sm tabular-nums">
              S/ {{ parseFloat(o.totalFinal).toFixed(2) }}
            </td>
          </tr>
          <tr v-if="!cargando && ordenesRecientes.length === 0">
            <td :colspan="verPrecios ? 5 : 4" class="text-center py-12 text-slate-400 text-sm">
              No hay órdenes registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
