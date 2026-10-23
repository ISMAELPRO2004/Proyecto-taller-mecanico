<script setup>
import { ArrowUpRight } from 'lucide-vue-next';

defineProps({
  to: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
});
</script>

<template>
  <router-link
    :to="to"
    class="group flex items-center justify-between rounded-xl border border-[#4a2870]/40 bg-[#2a1840]/80 p-3 text-slate-200 transition-all hover:border-lyer-accent/40 hover:bg-[#321c4c] hover:text-white"
  >
    <span class="flex items-center gap-3">
      <component :is="icon" class="h-5 w-5 text-lyer-cyan" />
      <span class="text-xs font-medium sm:text-sm">{{ label }}</span>
    </span>
    <ArrowUpRight class="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lyer-accent" />
  </router-link>
</template>
