<script setup>
import { computed } from 'vue';
import { ClipboardList, Wrench, ShieldCheck, ArrowUpRight } from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.js';

const auth = useAuthStore();

const accesos = computed(() => {
  const rol = auth.usuario?.rol;
  const items = [
    { label: 'Ver todas las órdenes', to: '/ordenes', icon: ClipboardList },
  ];
  if (rol === 'ADMIN' || rol === 'SUPERVISOR') {
    items.push({ label: 'Actualizar catálogos', to: '/catalogos', icon: Wrench });
  }
  if (rol === 'ADMIN') {
    items.push({ label: 'Usuarios y auditoría', to: '/usuarios', icon: ShieldCheck });
  }
  return items;
});
</script>

<template>
  <div class="flex h-full flex-col rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <h3 class="font-display text-sm font-bold tracking-wide text-white">Accesos rápidos</h3>
    <div class="mt-3.5 flex flex-1 flex-col gap-2">
      <router-link
        v-for="item in accesos"
        :key="item.to"
        :to="item.to"
        class="group flex items-center justify-between rounded-xl border border-[#4a2870]/40 bg-[#2a1840]/80 p-3 text-slate-200 transition-all hover:border-lyer-accent/40 hover:bg-[#321c4c] hover:text-white"
      >
        <span class="flex items-center gap-3">
          <component :is="item.icon" class="h-5 w-5 text-lyer-cyan" />
          <span class="text-xs font-medium sm:text-sm">{{ item.label }}</span>
        </span>
        <ArrowUpRight class="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lyer-accent" />
      </router-link>
    </div>
  </div>
</template>
