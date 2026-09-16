<script setup>
import { Clock, Eye } from 'lucide-vue-next';

defineProps({
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['verDetalle']);
</script>

<template>
  <div class="min-h-[400px]">
    <div v-if="loading" class="py-20 text-center">
      <span class="loading loading-ring loading-lg text-lyer-green"></span>
    </div>

    <template v-else>
      <!-- Vista móvil -->
      <div class="md:hidden divide-y divide-slate-100">
        <div
          v-for="l in logs"
          :key="'m-' + l.id"
          class="p-4 hover:bg-emerald-50/20 transition-colors flex items-start justify-between gap-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1.5">
              <Clock class="w-3.5 h-3.5 text-slate-300" />
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {{ new Date(l.fecha).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) }}
              </span>
            </div>

            <p class="font-black text-slate-800 text-xs uppercase leading-tight">
              {{ l.usuario?.nombreCompleto || 'Sistema' }}
              <span class="text-[9px] font-medium text-slate-400 normal-case block italic">
                {{ l.usuario?.rol || 'Automático' }}
              </span>
            </p>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="px-2 py-1 bg-white rounded-lg text-[9px] font-black text-lyer-green border border-slate-200 uppercase tracking-tighter shadow-sm">
                {{ l.accion }}
              </span>
              <span v-if="l.orden" class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                OT: {{ l.orden.numeroOrden }}
              </span>
            </div>
          </div>

          <div class="shrink-0">
            <button
              @click="$emit('verDetalle', l)"
              class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-xl shadow-sm border border-slate-100 bg-white"
            >
              <Eye class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="!logs.length" class="py-16 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
          Sin registros
        </div>
      </div>

      <!-- Vista desktop -->
      <div class="hidden md:block overflow-x-auto">
        <table class="table w-full border-separate border-spacing-0">
          <thead class="bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
            <tr>
              <th class="py-5 pl-8 text-left">Timestamp</th>
              <th class="text-left">Operador</th>
              <th class="text-left">Acción</th>
              <th class="text-left">Relacionado</th>
              <th class="text-center pr-8 w-24">Detalle</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr
              v-for="l in logs"
              :key="l.id"
              class="hover:bg-emerald-50/30 transition-colors border-b border-slate-50 group"
            >
              <td class="pl-8 text-[11px] font-bold py-4">
                <div class="flex items-center gap-2">
                  <Clock class="w-3.5 h-3.5 text-slate-300" />
                  {{ new Date(l.fecha).toLocaleString('es-PE') }}
                </div>
              </td>
              <td class="py-4">
                <p class="font-black text-slate-800 text-xs">{{ l.usuario?.nombreCompleto || 'Sistema' }}</p>
                <p class="text-[9px] text-slate-400 font-bold">{{ l.usuario?.rol }}</p>
              </td>
              <td class="py-4">
                <span class="px-3 py-1.5 bg-white rounded-lg text-[10px] font-black text-lyer-green border border-slate-200 uppercase tracking-tighter shadow-sm">
                  {{ l.accion }}
                </span>
              </td>
              <td class="py-4 text-[10px] font-bold text-slate-400">
                <span v-if="l.orden" class="bg-slate-100 px-2 py-1 rounded-md">{{ l.orden.numeroOrden }}</span>
                <span v-else>—</span>
              </td>
              <td class="text-center pr-8 py-4">
                <button
                  @click="$emit('verDetalle', l)"
                  class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-xl transition-all"
                >
                  <Eye class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
