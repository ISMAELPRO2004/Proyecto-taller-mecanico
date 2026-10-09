<script setup>
import { computed } from 'vue';
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import { Car, ArrowUpRight, Eye } from 'lucide-vue-next';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../utils/ordenDisplay.js';
import { useAuthStore } from '../../../stores/auth.js';
import { puedeVerPrecios, recepcionPendiente } from '../../../utils/roles.js';

const props = defineProps({
  ordenesRecientes: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  cargando: { type: Boolean, default: false },
});

const auth = useAuthStore();
const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
const columnas = computed(() => (verPrecios.value ? 6 : 5));
const vehiculo = (orden) => [marcaVehiculoOrden(orden), modeloVehiculoOrden(orden)].filter(Boolean).join(' ');
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <div class="flex items-center justify-between border-b border-[#4a2870]/40 bg-black/15 px-5 py-4">
      <h3 class="flex items-center gap-2.5 font-display text-sm font-bold tracking-wide text-white sm:text-base">
        <Car class="h-5 w-5 text-lyer-cyan" />
        Últimas unidades en taller
      </h3>
      <router-link
        to="/ordenes"
        class="inline-flex items-center gap-1 text-xs font-semibold text-lyer-accent hover:text-lyer-soft"
      >
        Ver todas
        <ArrowUpRight class="h-3.5 w-3.5" />
      </router-link>
    </div>

    <div class="flex-1 overflow-x-auto">
      <table class="w-full border-collapse text-left text-xs">
        <thead>
          <tr class="border-b border-[#4a2870]/40 bg-black/20 text-[11px] uppercase tracking-wider text-slate-400">
            <th class="px-4 py-3 font-semibold">OT #</th>
            <th class="px-3 py-3 font-semibold">Placa y vehículo</th>
            <th class="hidden px-3 py-3 font-semibold sm:table-cell">Cliente</th>
            <th class="px-3 py-3 font-semibold">Estado</th>
            <th v-if="verPrecios" class="px-4 py-3 text-right font-semibold">Total</th>
            <th class="px-3 py-3 text-center font-semibold">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#4a2870]/35 text-slate-200">
          <tr v-if="cargando">
            <td :colspan="columnas" class="py-10 text-center">
              <span class="loading loading-ring loading-md text-lyer-accent" />
            </td>
          </tr>
          <tr
            v-for="o in ordenesRecientes"
            :key="o.id"
            class="cursor-pointer transition-colors hover:bg-white/5"
            @click="$router.push('/ordenes')"
          >
            <td class="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold italic text-sky-400">
              {{ o.numeroOrden }}
            </td>
            <td class="px-3 py-3">
              <div class="flex flex-col">
                <span class="font-mono text-sm font-bold tracking-wider text-white">{{ o.placa }}</span>
                <span class="text-[11px] text-slate-400">{{ vehiculo(o) || '—' }}</span>
              </div>
            </td>
            <td class="hidden px-3 py-3 text-slate-300 sm:table-cell">{{ nombreClienteOrden(o) }}</td>
            <td class="px-3 py-3">
              <div class="flex flex-col items-start gap-1">
                <StatusBadge :estado="o.estado" oscuro />
                <span
                  v-if="recepcionPendiente(o)"
                  class="badge badge-warning badge-sm text-[8px] font-black uppercase"
                >Pendiente a terminar</span>
              </div>
            </td>
            <td v-if="verPrecios" class="whitespace-nowrap px-4 py-3 text-right font-mono font-bold text-white">
              S/ {{ parseFloat(o.totalFinal || 0).toFixed(2) }}
            </td>
            <td class="px-3 py-3 text-center">
              <button
                type="button"
                class="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#321c4c] text-slate-300 transition-colors hover:bg-[#3d2460] hover:text-white"
                title="Ver en el listado"
                @click.stop="$router.push('/ordenes')"
              >
                <Eye class="h-4 w-4" />
              </button>
            </td>
          </tr>
          <tr v-if="!cargando && ordenesRecientes.length === 0">
            <td :colspan="columnas" class="py-12 text-center text-sm text-slate-400">
              No hay órdenes registradas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-auto border-t border-[#4a2870]/40 bg-black/15 px-5 py-3 text-[11px] text-slate-400">
      Mostrando {{ ordenesRecientes.length }} de {{ props.total }} órdenes
    </div>
  </div>
</template>
