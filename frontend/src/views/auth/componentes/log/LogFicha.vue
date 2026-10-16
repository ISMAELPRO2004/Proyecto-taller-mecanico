<script setup>
import { computed } from 'vue';
import { PlusCircle, Trash2, RefreshCcw, ArrowRight, Package, Wrench, ExternalLink } from 'lucide-vue-next';
import { MOVIMIENTO } from '../../../../utils/movimientoLog.js';

const props = defineProps({
  tipo: String,
  creacion: Object,
  eliminacion: Object,
  cabecera: { type: Array, default: () => [] },
  listas: { type: Array, default: () => [] },
  campoLabel: Function,
  formatVal: Function,
});

const claveItem = (accion) => {
  if (accion === 'AÑADIDO') return 'creado';
  if (accion === 'ELIMINADO') return 'eliminado';
  return 'modificado';
};

const bloques = computed(() => {
  const mapa = { creado: [], modificado: [], eliminado: [] };
  for (const lista of props.listas) {
    for (const item of lista.items || []) {
      mapa[claveItem(item.accion)].push({ ...item, lista: lista.nombre, icono: lista.icono });
    }
  }
  return ['creado', 'modificado', 'eliminado']
    .filter((clave) => mapa[clave].length)
    .map((clave) => ({ clave, ...MOVIMIENTO[clave], items: mapa[clave] }));
});

const iconoDe = (icono) => (icono === 'wrench' ? Wrench : icono === 'external' ? ExternalLink : Package);
</script>

<template>
  <div class="space-y-6">
    <template v-if="tipo === 'CREACION'">
      <div class="flex items-center gap-2 text-green-300">
        <PlusCircle class="h-4 w-4" />
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest">Creado</span>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div v-for="[label, val] in creacion.campos" :key="label" class="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <span class="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-green-300/80">{{ label }}</span>
          <span class="text-sm font-semibold text-white">{{ val }}</span>
        </div>
      </div>
      <template v-if="creacion.materiales.length">
        <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">Repuestos</p>
        <div class="overflow-hidden rounded-xl border border-[#4a2870]/45">
          <table class="w-full text-sm text-slate-200">
            <thead class="bg-[#160a24] text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-4 py-2.5 text-left">Descripción</th>
                <th class="px-4 py-2.5 text-center">Cantidad</th>
                <th class="px-4 py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#4a2870]/35">
              <tr v-for="(m, i) in creacion.materiales" :key="i">
                <td class="px-4 py-2.5">{{ m.descripcion }}</td>
                <td class="px-4 py-2.5 text-center font-mono">{{ m.cantidad }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-lyer-cyan">S/ {{ m.subtotal.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-if="creacion.servicios.length">
        <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">Servicios</p>
        <div class="overflow-hidden rounded-xl border border-[#4a2870]/45">
          <table class="w-full text-sm text-slate-200">
            <tbody class="divide-y divide-[#4a2870]/35">
              <tr v-for="(s, i) in creacion.servicios" :key="i">
                <td class="px-4 py-2.5">{{ s.descripcion }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-lyer-cyan">S/ {{ s.monto.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-if="creacion.terceros.length">
        <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">Trabajos externos</p>
        <div class="overflow-hidden rounded-xl border border-[#4a2870]/45">
          <table class="w-full text-sm text-slate-200">
            <tbody class="divide-y divide-[#4a2870]/35">
              <tr v-for="(t, i) in creacion.terceros" :key="i">
                <td class="px-4 py-2.5">{{ t.descripcion }}</td>
                <td class="px-4 py-2.5 text-right font-mono text-amber-200">S/ {{ t.monto.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-if="creacion.total !== null" class="flex items-center justify-between rounded-xl border border-[#4a2870]/50 bg-[#10041f] px-5 py-4">
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">Total de la orden</span>
        <span class="font-mono text-lg font-bold text-lyer-cyan">S/ {{ creacion.total.toFixed(2) }}</span>
      </div>
    </template>

    <template v-else-if="tipo === 'ELIMINACION'">
      <div class="flex items-center gap-2 text-rose-300">
        <Trash2 class="h-4 w-4" />
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest">Eliminado</span>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div v-for="[label, val] in eliminacion.campos" :key="label" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <span class="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-rose-300/80">{{ label }}</span>
          <span class="text-sm font-semibold text-white">{{ val }}</span>
        </div>
      </div>
      <template v-if="eliminacion.materiales.length">
        <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-300">Repuestos incluidos</p>
        <div class="overflow-hidden rounded-xl border border-rose-500/30">
          <table class="w-full text-sm text-slate-200">
            <tbody class="divide-y divide-rose-500/20">
              <tr v-for="(m, i) in eliminacion.materiales" :key="i">
                <td class="px-4 py-2.5">{{ m.descripcion }}</td>
                <td class="px-4 py-2.5 text-center font-mono text-rose-200">x{{ m.cantidad }}</td>
                <td class="px-4 py-2.5 text-right font-mono">S/ {{ m.subtotal.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-if="eliminacion.servicios.length || eliminacion.terceros.length">
        <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-300">Servicios incluidos</p>
        <div class="overflow-hidden rounded-xl border border-rose-500/30">
          <table class="w-full text-sm text-slate-200">
            <tbody class="divide-y divide-rose-500/20">
              <tr v-for="(s, i) in eliminacion.servicios" :key="'s' + i">
                <td class="px-4 py-2.5">{{ s.descripcion }}</td>
                <td class="px-4 py-2.5 text-right font-mono">S/ {{ s.monto.toFixed(2) }}</td>
              </tr>
              <tr v-for="(t, i) in eliminacion.terceros" :key="'t' + i">
                <td class="px-4 py-2.5">{{ t.descripcion }}</td>
                <td class="px-4 py-2.5 text-right font-mono">S/ {{ t.monto.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-if="eliminacion.total" class="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4">
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-200">Total eliminado</span>
        <span class="font-mono text-lg font-bold text-rose-200">S/ {{ eliminacion.total.toFixed(2) }}</span>
      </div>
    </template>

    <template v-else-if="tipo === 'EDICION'">
      <div v-if="cabecera.length" class="space-y-3">
        <div class="flex items-center gap-2 text-amber-200">
          <RefreshCcw class="h-4 w-4" />
          <span class="font-mono text-[11px] font-bold uppercase tracking-widest">Modificado</span>
        </div>
        <div v-for="[key, val] in cabecera" :key="key" class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">{{ campoLabel(key) }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span class="text-slate-400 line-through">{{ formatVal(key, val.de) }}</span>
            <ArrowRight class="h-3.5 w-3.5 shrink-0 text-amber-200" />
            <span class="text-white">{{ formatVal(key, val.a) }}</span>
          </div>
        </div>
      </div>

      <div v-for="bloque in bloques" :key="bloque.clave" class="space-y-3">
        <div v-if="bloque.clave !== 'modificado' || !cabecera.length" class="flex items-center gap-2" :class="bloque.tono">
          <PlusCircle v-if="bloque.clave === 'creado'" class="h-4 w-4" />
          <Trash2 v-else-if="bloque.clave === 'eliminado'" class="h-4 w-4" />
          <RefreshCcw v-else class="h-4 w-4" />
          <span class="font-mono text-[11px] font-bold uppercase tracking-widest">{{ bloque.label }}</span>
        </div>
        <article
          v-for="(item, i) in bloque.items"
          :key="bloque.clave + i"
          :class="['rounded-xl border p-4', bloque.tono]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-mono text-[10px] uppercase tracking-wider text-slate-400">{{ item.lista }}</p>
              <p class="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                <component :is="iconoDe(item.icono)" class="h-4 w-4 shrink-0 text-slate-400" />
                {{ item.descripcion }}
              </p>
            </div>
            <span :class="['shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider', bloque.tono]">
              {{ bloque.label }}
            </span>
          </div>
          <div v-if="item.accion === 'MODIFICADO'" class="mt-3 space-y-1.5">
            <div v-for="campo in ['cantidad', 'precio', 'monto']" :key="campo">
              <div v-if="item[campo]" class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                <span class="w-16 capitalize text-slate-400">{{ campo }}</span>
                <span class="line-through">{{ item[campo].de }}</span>
                <ArrowRight class="h-3 w-3 text-amber-200" />
                <span class="text-white">{{ item[campo].a }}</span>
              </div>
            </div>
          </div>
          <div v-if="item.accion === 'AÑADIDO' && item.datos" class="mt-2 flex flex-wrap gap-3 font-mono text-xs text-slate-300">
            <span v-if="item.datos.cantidad">Cantidad: {{ item.datos.cantidad }}</span>
            <span v-if="item.datos.precio">Precio: S/ {{ item.datos.precio }}</span>
            <span v-if="item.datos.monto">Monto: S/ {{ item.datos.monto }}</span>
          </div>
        </article>
      </div>

      <p v-if="!cabecera.length && !bloques.length" class="py-8 text-center text-sm text-slate-400">
        Sin cambios registrados
      </p>
    </template>
  </div>
</template>
