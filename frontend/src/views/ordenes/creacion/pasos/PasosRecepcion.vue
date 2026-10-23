<script setup>
import { Car, User, Wrench } from 'lucide-vue-next';

defineProps({
  paso: { type: Number, required: true },
  maxPaso: { type: Number, default: 1 },
});

defineEmits(['ir']);

const pasos = [
  { n: 1, fase: 'Fase inicial', label: '1. Vehículo', icon: Car },
  { n: 2, fase: 'Siguiente', label: '2. Cliente', icon: User },
  { n: 3, fase: 'Fase final', label: '3. Recepción', icon: Wrench },
];
</script>

<template>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
    <button
      v-for="p in pasos"
      :key="p.n"
      type="button"
      :disabled="p.n === paso || p.n > maxPaso"
      :class="[
        'flex items-center gap-3.5 rounded-xl p-4 text-left transition-all',
        paso === p.n
          ? 'border-2 border-lyer-cyan bg-[#221433] shadow-[0_0_22px_-6px_rgba(128,255,255,0.45)] disabled:opacity-100'
          : p.n <= maxPaso
            ? 'border border-lyer-accent/35 bg-[#221433]/80 hover:border-lyer-cyan/50'
            : 'cursor-not-allowed border border-[#4a2870]/30 bg-[#160a24]/70 text-slate-500 opacity-70 disabled:opacity-70',
      ]"
      @click="$emit('ir', p.n)"
    >
      <div
        :class="[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold',
          paso === p.n ? 'bg-lyer-accent text-[#1a0633]' : p.n <= maxPaso ? 'bg-lyer-green text-white' : 'bg-[#2a1840] text-slate-400',
        ]"
      >
        {{ p.n }}
      </div>
      <div class="min-w-0">
        <span :class="['block text-[11px] font-semibold uppercase tracking-wider', paso === p.n ? 'text-lyer-cyan' : 'text-slate-500']">
          {{ paso === p.n && p.n === 2 ? 'Fase actual' : p.n < paso || (p.n <= maxPaso && p.n !== paso && p.n < 3) ? 'Listo' : p.fase }}
        </span>
        <span :class="['block truncate font-display text-base font-bold uppercase tracking-wide', p.n <= maxPaso || paso === p.n ? 'text-white' : 'text-slate-400']">
          {{ p.label }}
        </span>
      </div>
      <component :is="p.icon" :class="['ml-auto h-6 w-6 shrink-0', paso === p.n ? 'text-lyer-cyan' : 'text-slate-500']" />
    </button>
  </div>
</template>
