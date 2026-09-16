<script setup>
import { ExternalLink, Trash2 } from 'lucide-vue-next';

defineProps({
  terceros: { type: Array, required: true },
  verPrecios: { type: Boolean, default: true },
});

defineEmits(['add', 'remove']);
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center border-b border-slate-50 pb-2">
      <div class="flex items-center gap-2 text-blue-400"><ExternalLink class="w-4 h-4" /><span class="text-[10px] font-black uppercase tracking-widest">Trabajos Externos</span></div>
      <button type="button" @click="$emit('add')" class="btn btn-xs btn-outline border-blue-100 text-blue-400 px-4 rounded-lg">+ Terceros</button>
    </div>
    <div class="grid grid-cols-1 gap-3">
      <div v-for="(t, i) in terceros" :key="i" class="flex flex-col md:flex-row md:items-center gap-4 bg-blue-50/20 p-4 rounded-2xl border border-blue-50">
        <div class="min-w-0 flex-1">
          <span class="text-[11px] font-bold text-blue-900 italic uppercase">{{ t.descripcion }}</span>
          <p v-if="t.responsable" class="text-[10px] text-blue-400 font-bold">Responsable: {{ t.responsable }}</p>
        </div>
        <div class="flex items-center justify-end gap-3">
          <div v-if="verPrecios" class="w-32 flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm"><span class="text-[9px] font-bold text-blue-200">S/</span><input v-model="t.monto" type="number" step="0.01" class="w-full bg-transparent font-black text-xs text-blue-700 outline-none text-right" /></div>
          <button @click="$emit('remove', i)" class="text-red-200 hover:text-red-500"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
