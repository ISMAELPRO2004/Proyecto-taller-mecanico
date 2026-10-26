<script setup>
import { Plus } from 'lucide-vue-next';
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-lyer-cyan">Mecánica LYER Motors</p>
      <h2 class="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-lyer-fg md:text-3xl">
        Listado de órdenes de trabajo
      </h2>
    </div>
    <router-link
      to="/ordenes/nueva"
      class="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-lyer-accent px-5 text-sm font-bold tracking-wide text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)]"
    >
      <Plus class="h-5 w-5" />
      Crear orden
    </router-link>
  </div>
</template>
