<script setup>
import { ref, watch } from 'vue';
import { ChevronDown, ArrowRight } from 'lucide-vue-next';

const props = defineProps({
  contexto: String,
  secciones: { type: Array, default: () => [] },
  clave: [String, Number],
});

const abiertas = ref([]);
watch(() => props.clave, () => { abiertas.value = []; });

const alternar = (indice) => {
  const set = new Set(abiertas.value);
  if (set.has(indice)) set.delete(indice);
  else set.add(indice);
  abiertas.value = [...set];
};
const abierta = (indice) => abiertas.value.includes(indice);
</script>

<template>
  <div class="space-y-6">
  <p class="text-[10px] font-black uppercase tracking-widest" :class="contexto === 'ORDEN' ? 'text-lyer-green' : 'text-slate-400'">
    {{ contexto === 'ORDEN' ? 'Orden en trabajo' : 'Recepción / borrador' }}
  </p>
  <div v-for="(seccion, indice) in secciones" :key="seccion.titulo" class="rounded-2xl border border-slate-100 overflow-hidden">
    <button type="button" class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 text-left" @click="alternar(indice)">
      <span class="text-[11px] font-black uppercase tracking-wide text-slate-700">{{ seccion.titulo }}</span>
      <span class="flex items-center gap-2 text-[10px] font-bold text-slate-400 shrink-0">
        {{ seccion.items.length }}
        <ChevronDown :class="['w-4 h-4 transition-transform', abierta(indice) ? 'rotate-180' : '']" />
      </span>
    </button>
    <div v-if="abierta(indice)" class="p-4 space-y-4 border-t border-slate-100 bg-white">
      <div v-for="(item, itemIndice) in seccion.items" :key="itemIndice" class="space-y-2">
        <p class="text-xs font-black uppercase" :class="item.modo === 'borrado' ? 'text-red-500' : item.modo === 'cambio' ? 'text-amber-600' : 'text-emerald-600'">
          {{ item.resumen }}
        </p>
        <div v-if="item.modo === 'cambio'" class="space-y-2">
          <div v-for="fila in item.filas" :key="fila.etiqueta" class="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-[9px] font-black text-slate-400 uppercase w-32 shrink-0">{{ fila.etiqueta }}</span>
            <div class="flex items-center gap-2 text-xs font-bold min-w-0">
              <span class="opacity-40 line-through truncate">{{ fila.de }}</span>
              <ArrowRight class="w-3 h-3 text-lyer-green shrink-0" />
              <span class="text-lyer-green truncate">{{ fila.a }}</span>
            </div>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div v-for="fila in item.filas" :key="fila.etiqueta" :class="['p-3 rounded-xl border', item.modo === 'borrado' ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100']">
            <span class="block text-[8px] font-black uppercase opacity-60 mb-1" :class="item.modo === 'borrado' ? 'text-red-500' : 'text-emerald-700'">{{ fila.etiqueta }}</span>
            <span class="text-xs font-bold" :class="item.modo === 'borrado' ? 'text-red-800' : 'text-slate-700'">{{ fila.valor }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
