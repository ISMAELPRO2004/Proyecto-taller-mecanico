<script setup>
import { computed } from 'vue';
import { ArrowRight, PlusCircle, RefreshCcw, Trash2 } from 'lucide-vue-next';
import { MOVIMIENTO } from '../../../../utils/movimientoLog.js';

const props = defineProps({
  contexto: String,
  secciones: { type: Array, default: () => [] },
  clave: [String, Number],
});

const claveDe = (modo) => (modo === 'borrado' ? 'eliminado' : modo === 'nuevo' ? 'creado' : 'modificado');

const bloques = computed(() => {
  const mapa = { creado: [], modificado: [], eliminado: [] };
  for (const seccion of props.secciones) {
    for (const item of seccion.items || []) {
      mapa[claveDe(item.modo)].push({ ...item, seccion: seccion.titulo });
    }
  }
  return ['creado', 'modificado', 'eliminado']
    .filter((clave) => mapa[clave].length)
    .map((clave) => ({ clave, ...MOVIMIENTO[clave], items: mapa[clave] }));
});
</script>

<template>
  <div class="space-y-6">
    <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-lyer-cyan">
      {{ contexto === 'ORDEN' ? 'Orden en trabajo' : 'Recepción / borrador' }}
    </p>

    <section v-for="bloque in bloques" :key="bloque.clave" class="space-y-3">
      <div class="flex items-center gap-2" :class="bloque.tono">
        <PlusCircle v-if="bloque.clave === 'creado'" class="h-4 w-4" />
        <Trash2 v-else-if="bloque.clave === 'eliminado'" class="h-4 w-4" />
        <RefreshCcw v-else class="h-4 w-4" />
        <span class="font-mono text-[11px] font-bold uppercase tracking-widest">{{ bloque.label }}</span>
        <span class="font-mono text-[10px] text-slate-500">{{ bloque.items.length }}</span>
      </div>

      <article
        v-for="(item, indice) in bloque.items"
        :key="bloque.clave + indice"
        :class="['rounded-xl border p-4', bloque.tono]"
      >
        <p class="font-mono text-[10px] uppercase tracking-wider text-slate-400">{{ item.seccion }}</p>
        <p class="mt-1 text-sm font-semibold text-white">{{ item.resumen }}</p>

        <div v-if="bloque.clave === 'modificado'" class="mt-3 space-y-2">
          <div v-for="fila in item.filas" :key="fila.etiqueta" class="rounded-lg border border-[#4a2870]/40 bg-[#10041f] px-3 py-2.5">
            <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ fila.etiqueta }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span class="text-slate-400 line-through">{{ fila.de }}</span>
              <ArrowRight class="h-3.5 w-3.5 shrink-0 text-amber-200" />
              <span class="text-white">{{ fila.a }}</span>
            </div>
          </div>
        </div>

        <div v-else class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div v-for="fila in item.filas" :key="fila.etiqueta" class="rounded-lg border border-[#4a2870]/40 bg-[#10041f] px-3 py-2.5">
            <span class="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ fila.etiqueta }}</span>
            <span class="mt-1 block text-sm font-semibold text-white">{{ fila.valor }}</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
