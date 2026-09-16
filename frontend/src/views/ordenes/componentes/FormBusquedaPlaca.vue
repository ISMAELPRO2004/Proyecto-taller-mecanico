<script setup>
import { Search, History } from 'lucide-vue-next';
import { nombreClienteOrden } from '../../../utils/ordenDisplay.js';

defineProps({
  placa: { type: String, default: '' },
  historial: { type: Array, default: () => [] },
  error: { type: String, default: '' },
});

const emit = defineEmits(['update:placa', 'buscar']);

const onInput = (e) => {
  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
  emit('update:placa', val);
};
</script>

<template>
  <section class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
    <div class="flex items-center gap-2 text-lyer-green">
      <Search class="w-4 h-4" />
      <span class="text-[10px] font-black uppercase tracking-widest">Identificar placa</span>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <input
        :value="placa"
        @input="onInput"
        @keyup.enter="emit('buscar', placa)"
        maxlength="8"
        placeholder="Ej: ABC-123"
        :class="[
          'input input-bordered w-full sm:max-w-xs rounded-xl font-black text-center uppercase tracking-widest text-lg',
          error ? 'border-red-300 bg-red-50' : 'bg-slate-50 border-none',
        ]"
      />
      <button
        type="button"
        @click="emit('buscar', placa)"
        class="btn bg-lyer-green text-white border-none rounded-xl px-8"
      >
        Buscar placa
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-500 font-bold">{{ error }}</p>
    <p class="text-[11px] text-slate-400">
      Por ahora la placa se ingresa manualmente. Más adelante se conectará el escaneo por cámara/IA.
    </p>

    <div v-if="historial.length" class="mt-4 rounded-2xl border border-slate-100 overflow-hidden">
      <div class="px-4 py-3 bg-slate-50 flex items-center gap-2 text-slate-500">
        <History class="w-4 h-4" />
        <span class="text-[10px] font-black uppercase tracking-widest">Historial reciente ({{ historial.length }})</span>
      </div>
      <ul class="divide-y divide-slate-50">
        <li v-for="o in historial" :key="o.id" class="px-4 py-3 flex justify-between gap-3 text-sm">
          <div>
            <span class="font-black text-lyer-green italic">{{ o.numeroOrden }}</span>
            <span class="text-slate-400 text-xs ml-2">{{ nombreClienteOrden(o) }}</span>
          </div>
          <span class="text-[10px] font-bold text-slate-400 uppercase">{{ o.estado }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
