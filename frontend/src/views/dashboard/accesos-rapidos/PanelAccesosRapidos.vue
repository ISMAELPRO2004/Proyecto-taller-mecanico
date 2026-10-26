<script setup>
import { computed } from 'vue';
import { ClipboardList, Wrench, ShieldCheck } from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.js';
import EnlaceAccesoRapido from './EnlaceAccesoRapido.vue';

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
  <div class="flex h-full flex-col rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
    <h3 class="font-display text-sm font-bold tracking-wide text-lyer-fg">Accesos rápidos</h3>
    <div class="mt-3.5 flex flex-1 flex-col gap-2">
      <EnlaceAccesoRapido
        v-for="item in accesos"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
      />
    </div>
  </div>
</template>
