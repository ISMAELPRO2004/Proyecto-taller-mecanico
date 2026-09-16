<script setup>
import { CheckCircle, ClipboardList } from 'lucide-vue-next';

defineProps({
  responsableId: { type: [String, Number], default: '' },
  responsables: { type: Array, default: () => [] },
  totalFinal: { type: Number, default: 0 },
  esEdicion: { type: Boolean, default: false },
});

defineEmits(['update:responsableId', 'guardar']);
</script>

<template>
  <footer class="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] flex flex-col gap-6 shadow-2xl relative overflow-hidden mt-6">
    <div class="z-10 w-full md:w-1/3">
      <label class="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.3em] block mb-2">Responsable Taller</label>
      <select :value="responsableId" @change="$emit('update:responsableId', $event.target.value)"
        class="select select-bordered bg-slate-800 text-white border-slate-700 rounded-2xl font-bold text-xs h-12 w-full focus:border-lyer-green">
        <option value="">Seleccione técnico...</option>
        <option v-for="u in responsables" :key="u.id" :value="u.id">{{ u.nombreCompleto }}</option>
      </select>
    </div>

    <div class="z-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800 pt-6">
      <div>
        <p class="text-[8px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1 opacity-60">Liquidación OT</p>
        <h2 class="text-4xl font-black text-white tracking-tighter tabular-nums">S/ {{ totalFinal.toFixed(2) }}</h2>
      </div>
      <button @click="$emit('guardar')" class="btn btn-lg w-full md:w-auto bg-lyer-green hover:bg-emerald-500 text-white border-none px-12 rounded-2xl shadow-xl transition-all hover:scale-105">
        <CheckCircle class="w-5 h-5 mr-2" />
        <span class="font-black uppercase tracking-widest text-sm">{{ esEdicion ? 'Actualizar' : 'Finalizar' }}</span>
      </button>
    </div>
    <div class="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 pointer-events-none"><ClipboardList class="w-48 h-48 text-white" /></div>
  </footer>
</template>
