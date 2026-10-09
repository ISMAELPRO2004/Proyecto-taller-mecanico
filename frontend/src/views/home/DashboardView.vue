<script setup>
import { ref, onMounted } from 'vue';
import { ordenService } from '../../services/ordenService.js';
import CtaNuevaOrden from './componentes/CtaNuevaOrden.vue';
import StatsGrid from './componentes/StatsGrid.vue';
import TablaOrdenesRecientes from './componentes/TablaOrdenesRecientes.vue';
import PanelAccesosRapidos from './componentes/PanelAccesosRapidos.vue';

const cargando = ref(true);
const ordenes = ref([]);

const stats = ref({
  total:             0,
  enReparacion:      0,
  esperandoRepuesto: 0,
  cambioAceite:      0,
  terminadas:        0,
  canceladas:        0,
});

const ordenesRecientes = ref([]);

const cargar = async () => {
  cargando.value = true;
  try {
    const data = await ordenService.listar();
    ordenes.value = data;

    stats.value = {
      total:             data.length,
      enReparacion:      data.filter(o => o.estado === 'EN_REPARACION').length,
      esperandoRepuesto: data.filter(o => o.estado === 'ESPERANDO_REPUESTO').length,
      cambioAceite:      data.filter(o => o.estado === 'CAMBIO_ACEITE').length,
      terminadas:        data.filter(o => o.estado === 'TERMINADO').length,
      canceladas:        data.filter(o => o.estado === 'CANCELADO').length,
    };

    ordenesRecientes.value = data.slice(0, 5);
  } catch (e) {
    console.error('Error dashboard:', e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<template>
  <div class="w-full space-y-5 animate-fade-in">
    <div>
      <h2 class="font-display text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
        Panel general
      </h2>
      <p class="mt-0.5 text-xs uppercase tracking-wider text-slate-400">
        Mecánica LYER Motors · Gestión de taller
      </p>
    </div>

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
