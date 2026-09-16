<script setup>
import { Package, Trash2 } from 'lucide-vue-next';

defineProps({
  materiales: { type: Array, required: true },
});

defineEmits(['add', 'remove', 'update:materiales']);
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center border-b border-slate-50 pb-2">
      <div class="flex items-center gap-2 text-slate-400"><Package class="w-4 h-4" /><span class="text-[10px] font-black uppercase tracking-widest">Insumos</span></div>
      <button type="button" @click="$emit('add')" class="btn btn-xs bg-lyer-green text-white border-none px-4 rounded-lg">+ Añadir</button>
    </div>
    <div class="space-y-3">
      <div v-for="(m, i) in materiales" :key="i" class="flex flex-col md:flex-row md:items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 relative group">
        <div class="flex-1 min-w-0 pr-8 md:pr-0">
          <span class="text-[11px] font-black text-slate-700 uppercase leading-tight">{{ m.descripcion }}</span>
          <button @click="$emit('remove', i)" class="absolute top-4 right-4 md:hidden text-red-300"><Trash2 class="w-4 h-4" /></button>
        </div>
        <div class="flex flex-wrap items-center gap-3 md:justify-end">
          <div class="w-16"><label class="text-[8px] font-black text-slate-400 block mb-1 uppercase">Cant.</label><input v-model="m.cantidad" type="number" class="input input-xs w-full text-center font-black bg-white rounded-lg border-slate-200" /></div>
          <div class="w-32"><label class="text-[8px] font-black text-slate-400 block mb-1 uppercase">P.U. S/</label><div class="flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm"><input v-model="m.precioAlMomento" type="number" step="0.01" class="w-full bg-transparent font-black text-xs text-lyer-green outline-none" /></div></div>
          <div class="w-24 text-right hidden md:block"><label class="text-[8px] font-black text-slate-400 block mb-1 uppercase">Subtotal</label><span class="text-xs font-black text-slate-800">S/{{ (m.cantidad * m.precioAlMomento).toFixed(2) }}</span></div>
          <button @click="$emit('remove', i)" class="hidden md:block text-red-200 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
