<script setup>
import EncabezadoDashboard from './encabezado/EncabezadoDashboard.vue';
import CtaNuevaOrden from './nueva-entrada/CtaNuevaOrden.vue';
import StatsGrid from './estadisticas/StatsGrid.vue';
import TablaOrdenesRecientes from './unidades-taller/TablaOrdenesRecientes.vue';
import PanelAccesosRapidos from './accesos-rapidos/PanelAccesosRapidos.vue';
import { useDashboard } from './composables/useDashboard.js';

const { cargando, ordenes, stats, ordenesRecientes } = useDashboard();
</script>

<template>
  <div class="w-full space-y-5 animate-fade-in">
    <EncabezadoDashboard />
    <CtaNuevaOrden />
    <StatsGrid :stats="stats" :cargando="cargando" />

    <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:items-stretch">
      <TablaOrdenesRecientes
        class="lg:col-span-8 lg:h-full"
        :ordenes-recientes="ordenesRecientes"
        :total="ordenes.length"
        :cargando="cargando"
      />
      <PanelAccesosRapidos class="lg:col-span-4 lg:h-full" />
    </div>
  </div>
</template>
