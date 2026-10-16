<script setup>
import { CheckCircle, ChevronDown } from 'lucide-vue-next';

defineProps({
  responsableId: { type: [String, Number], default: '' },
  responsables: { type: Array, default: () => [] },
  subtotales: {
    type: Object,
    default: () => ({ insumos: 0, manoObra: 0, terceros: 0 }),
  },
  totalFinal: { type: Number, default: 0 },
  esEdicion: { type: Boolean, default: false },
  verPrecios: { type: Boolean, default: true },
});

defineEmits(['update:responsableId', 'guardar']);

const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
</script>

<template>
  <footer class="rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <label class="min-w-0 lg:max-w-sm lg:flex-1">
        <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Responsable del taller
        </span>
        <div class="relative">
          <select
            :value="responsableId"
            class="h-11 w-full appearance-none rounded-xl border border-[#4a2870]/50 bg-[#140a22] px-3 pr-9 text-sm text-white focus:border-lyer-cyan focus:outline-none"
            @change="$emit('update:responsableId', $event.target.value)"
          >
            <option value="">Seleccione técnico...</option>
            <option v-for="u in responsables" :key="u.id" :value="u.id">{{ u.nombreCompleto }}</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
        </div>
      </label>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div v-if="verPrecios" class="flex flex-wrap items-end gap-4 font-mono text-xs">
          <div class="text-right">
            <span class="block text-[10px] uppercase tracking-wider text-slate-400">Insumos</span>
            <span class="font-semibold text-lyer-soft">{{ soles(subtotales.insumos) }}</span>
          </div>
          <div class="text-right">
            <span class="block text-[10px] uppercase tracking-wider text-slate-400">M. obra</span>
            <span class="font-semibold text-lyer-cyan">{{ soles(subtotales.manoObra) }}</span>
          </div>
          <div class="text-right">
            <span class="block text-[10px] uppercase tracking-wider text-slate-400">Terceros</span>
            <span class="font-semibold text-amber-300">{{ soles(subtotales.terceros) }}</span>
          </div>
          <div class="rounded-xl border border-lyer-cyan/30 bg-[#140a22] px-3.5 py-2 text-right">
            <span class="block text-[10px] uppercase tracking-wider text-slate-400">Total</span>
            <span class="text-lg font-bold text-lyer-cyan">{{ soles(totalFinal) }}</span>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#3a1260]"
          @click="$emit('guardar')"
        >
          <CheckCircle class="h-4 w-4" />
          {{ esEdicion ? 'Guardar orden' : 'Finalizar' }}
        </button>
      </div>
    </div>
  </footer>
</template>
