<script setup>
import { Database } from 'lucide-vue-next';
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
      <Database class="h-6 w-6" />
    </div>
    <div>
      <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">Registros</h2>
      <p class="font-mono text-[11px] uppercase tracking-widest text-slate-400">Clientes, vehículos y marcas</p>
    </div>
  </div>
</template>
