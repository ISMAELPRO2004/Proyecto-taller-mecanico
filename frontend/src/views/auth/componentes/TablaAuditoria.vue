<script setup>
import { Eye } from 'lucide-vue-next';
import { fechaHora } from '../../../utils/fecha.js';
import { MOVIMIENTO, movimientosDeLog } from '../../../utils/movimientoLog.js';

defineProps({
  logs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['verDetalle']);

const resumenLog = (log) => {
  const detalles = typeof log?.detalles === 'string'
    ? (() => { try { return JSON.parse(log.detalles); } catch { return null; } })()
    : log?.detalles;
  return detalles?.resumen || '';
};

const marcas = (log) => movimientosDeLog(log).map((clave) => ({ clave, ...MOVIMIENTO[clave] }));
const accionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#4a2870]/50 bg-[#2a1840] text-lyer-cyan transition-colors hover:border-lyer-cyan/50 hover:bg-lyer-cyan/10';
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>

  <div v-else-if="!logs.length" class="py-16 text-center text-sm text-slate-400">
    Sin registros
  </div>

  <template v-else>
    <div class="divide-y divide-[#4a2870]/35 md:hidden">
      <article v-for="l in logs" :key="'m-' + l.id" class="flex items-start justify-between gap-3 p-4">
        <div class="min-w-0 flex-1">
          <p class="font-mono text-[11px] text-slate-400">{{ fechaHora(l.fecha) }}</p>
          <p class="mt-1 text-sm font-semibold text-white">{{ l.usuario?.nombreCompleto || 'Sistema' }}</p>
          <p class="text-xs uppercase tracking-wider text-slate-400">{{ l.usuario?.rol || 'Automático' }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              v-for="marca in marcas(l)"
              :key="marca.clave"
              :class="['rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', marca.tono]"
            >{{ marca.label }}</span>
            <span class="text-xs font-semibold uppercase text-slate-200">{{ l.accion }}</span>
          </div>
          <p v-if="resumenLog(l)" class="mt-1 text-xs text-slate-400">{{ resumenLog(l) }}</p>
          <p v-if="l.orden" class="mt-1 font-mono text-xs text-lyer-cyan">{{ l.orden.numeroOrden }}</p>
        </div>
        <button type="button" :class="accionBtn" title="Ver detalle" @click="$emit('verDetalle', l)">
          <Eye class="h-4 w-4" />
        </button>
      </article>
    </div>

    <div class="hidden overflow-x-auto md:block">
      <table class="w-full min-w-[860px] border-collapse text-left text-sm text-slate-200">
        <thead class="border-b border-[#4a2870]/40 bg-[#160a24] text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            <th class="px-6 py-3.5">Fecha</th>
            <th class="px-4 py-3.5">Operador</th>
            <th class="px-4 py-3.5">Acción</th>
            <th class="px-4 py-3.5">Relacionado</th>
            <th class="px-6 py-3.5 text-center">Detalle</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#4a2870]/35">
          <tr v-for="l in logs" :key="l.id" class="transition-colors hover:bg-white/5">
            <td class="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-slate-400">{{ fechaHora(l.fecha) }}</td>
            <td class="px-4 py-3.5">
              <p class="font-semibold text-white">{{ l.usuario?.nombreCompleto || 'Sistema' }}</p>
              <p class="text-[11px] uppercase tracking-wider text-slate-400">{{ l.usuario?.rol }}</p>
            </td>
            <td class="px-4 py-3.5">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  v-for="marca in marcas(l)"
                  :key="marca.clave"
                  :class="['rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', marca.tono]"
                >{{ marca.label }}</span>
                <span class="text-xs font-semibold uppercase text-slate-100">{{ l.accion }}</span>
              </div>
              <p v-if="resumenLog(l)" class="mt-1 text-xs text-slate-400">{{ resumenLog(l) }}</p>
            </td>
            <td class="px-4 py-3.5 font-mono text-xs">
              <span v-if="l.orden" class="rounded-md border border-[#4a2870]/60 bg-[#140a22] px-2 py-0.5 text-lyer-cyan">{{ l.orden.numeroOrden }}</span>
              <span v-else class="text-slate-500">—</span>
            </td>
            <td class="px-6 py-3.5">
              <div class="flex justify-center">
                <button type="button" :class="accionBtn" title="Ver detalle" @click="$emit('verDetalle', l)">
                  <Eye class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>
