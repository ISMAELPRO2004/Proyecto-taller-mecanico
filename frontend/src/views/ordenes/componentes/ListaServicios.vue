<script setup>
import { Wrench, Trash2 } from 'lucide-vue-next';

defineProps({
  servicios: { type: Array, required: true },
});

defineEmits(['add', 'remove']);
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center border-b border-slate-50 pb-2">
      <div class="flex items-center gap-2 text-slate-400"><Wrench class="w-4 h-4" /><span class="text-[10px] font-black uppercase tracking-widest">Mano de Obra</span></div>
      <button type="button" @click="$emit('add')" class="btn btn-xs btn-outline border-slate-200 text-slate-400 px-4 rounded-lg">+ Catálogo</button>
    </div>
    <div class="grid grid-cols-1 gap-3">
      <div v-for="(s, i) in servicios" :key="i" class="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/30 p-4 rounded-2xl border border-slate-50">
        <span class="flex-1 text-[11px] font-black text-slate-600 uppercase">{{ s.descripcion }}</span>
        <div class="flex items-center justify-end gap-3">
          <div class="w-32 flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm"><span class="text-[9px] font-bold text-slate-300">S/</span><input v-model="s.monto" type="number" step="0.01" class="w-full bg-transparent font-black text-xs text-slate-800 outline-none text-right" /></div>
          <button @click="$emit('remove', i)" class="text-red-200 hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
