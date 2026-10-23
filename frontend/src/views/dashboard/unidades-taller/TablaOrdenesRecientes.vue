<script setup>
import { computed } from 'vue';
import { Car, ArrowUpRight } from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.js';
import { puedeVerPrecios } from '../../../utils/roles.js';
import FilaOrdenReciente from './FilaOrdenReciente.vue';

const props = defineProps({
  ordenesRecientes: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  cargando: { type: Boolean, default: false },
});

const auth = useAuthStore();
const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
const columnas = computed(() => (verPrecios.value ? 6 : 5));
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
          <FilaOrdenReciente
            v-for="o in ordenesRecientes"
            :key="o.id"
            :orden="o"
            :ver-precios="verPrecios"
          />
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
