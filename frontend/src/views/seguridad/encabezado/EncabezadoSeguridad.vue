<script setup>
import { ShieldCheck, UserPlus } from 'lucide-vue-next';

defineProps({
  tabActiva: { type: String, required: true },
});

defineEmits(['nuevo']);
</script>

<template>
  <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div class="flex items-center gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
        <ShieldCheck class="h-6 w-6" />
      </div>
      <div>
        <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">Seguridad</h2>
        <p class="font-mono text-[11px] uppercase tracking-widest text-slate-400">Usuarios y auditoría</p>
      </div>
    </div>
    <button
      v-if="tabActiva === 'usuarios'"
      type="button"
      class="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-lyer-accent px-5 text-sm font-bold tracking-wide text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)]"
      @click="$emit('nuevo')"
    >
      <UserPlus class="h-5 w-5" />
      Nuevo acceso
    </button>
  </div>
</template>
