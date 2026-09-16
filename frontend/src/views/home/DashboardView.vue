<script setup>
import { ref, onMounted } from 'vue';
import { ordenService } from '../../services/ordenService.js';
import { RefreshCcw } from 'lucide-vue-next';
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
  <div class="space-y-6 animate-fade-in">

    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-black text-slate-800 uppercase tracking-tight">Panel General</h2>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mecánica LYER Motors</p>
      </div>
      <button
        @click="cargar"
        class="btn btn-sm bg-white border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl gap-2"
      >
        <RefreshCcw :class="['w-4 h-4', cargando ? 'animate-spin' : '']" />
        <span class="hidden sm:inline text-xs font-bold">Actualizar</span>
      </button>
    </div>

    <CtaNuevaOrden />

    <StatsGrid :stats="stats" :cargando="cargando" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TablaOrdenesRecientes :ordenes-recientes="ordenesRecientes" :cargando="cargando" />
      <PanelAccesosRapidos />
    </div>
  </div>
</template>
