<script setup>
import { PlusCircle, Trash2, RefreshCcw, ArrowRight } from 'lucide-vue-next';

defineProps({
  modo: String,
  filas: { type: Array, default: () => [] },
});
</script>

<template>
  <div class="space-y-6">
  <div class="flex items-center gap-2" :class="modo === 'borrado' ? 'text-red-500' : modo === 'cambio' ? 'text-amber-600' : 'text-emerald-600'">
    <PlusCircle v-if="modo === 'nuevo'" class="w-4 h-4" />
    <Trash2 v-else-if="modo === 'borrado'" class="w-4 h-4" />
    <RefreshCcw v-else class="w-4 h-4" />
    <span class="text-[10px] font-black uppercase tracking-widest">
      {{ modo === 'nuevo' ? 'Registro nuevo' : modo === 'borrado' ? 'Se eliminó' : 'Antes y después' }}
    </span>
  </div>

  <div v-if="modo === 'cambio'" class="space-y-3">
    <div v-for="fila in filas" :key="fila.etiqueta" class="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <span class="text-[9px] font-black text-slate-400 uppercase w-36 shrink-0">{{ fila.etiqueta }}</span>
      <div class="flex items-center gap-3 text-xs font-bold min-w-0">
        <span class="opacity-40 line-through truncate">{{ fila.de }}</span>
        <ArrowRight class="w-3 h-3 text-lyer-green shrink-0" />
        <span class="text-lyer-green truncate">{{ fila.a }}</span>
      </div>
    </div>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div v-for="fila in filas" :key="fila.etiqueta" :class="['p-4 rounded-2xl border', modo === 'borrado' ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100']">
      <span class="block text-[8px] font-black uppercase opacity-60 mb-1" :class="modo === 'borrado' ? 'text-red-500' : 'text-emerald-700'">
        {{ fila.etiqueta }}
      </span>
      <span class="text-xs font-bold" :class="modo === 'borrado' ? 'text-red-800' : 'text-slate-700'">
        {{ fila.valor }}
      </span>
    </div>
  </div>
  </div>
</template>
