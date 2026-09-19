<script setup>
defineProps({
  paso: { type: Number, required: true },
});

const pasos = [
  { n: 1, label: 'Vehículo' },
  { n: 2, label: 'Cliente' },
  { n: 3, label: 'Trabajo' },
];
</script>

<template>
  <div class="flex items-center gap-2 sm:gap-4 px-1">
    <template v-for="(p, i) in pasos" :key="p.n">
      <div class="flex items-center gap-2 min-w-0">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0',
            paso === p.n ? 'bg-lyer-green text-white' :
            paso > p.n ? 'bg-emerald-100 text-lyer-green' : 'bg-slate-100 text-slate-400',
          ]"
        >
          {{ p.n }}
        </div>
        <span
          :class="[
            'text-[10px] sm:text-xs font-black uppercase tracking-wide truncate',
            paso >= p.n ? 'text-slate-700' : 'text-slate-300',
          ]"
        >
          {{ p.label }}
        </span>
      </div>
      <div v-if="i < pasos.length - 1" class="flex-1 h-px bg-slate-200 min-w-4" />
    </template>
  </div>
</template>
