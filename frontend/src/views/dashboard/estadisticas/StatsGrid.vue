<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  stats: { type: Object, required: true },
  cargando: { type: Boolean, default: false },
  mesSeleccionado: { type: String, required: true },
});

const emit = defineEmits(['update:mesSeleccionado']);

const chartData = computed(() => ({
  labels: [
    'Total registradas',
    'En reparación',
    'Cambio de aceite',
    'En espera de repuesto',
    'Terminadas',
    'Canceladas',
  ],
  datasets: [
    {
      label: 'Órdenes de trabajo',
      data: [
        props.stats.total,
        props.stats.enReparacion,
        props.stats.cambioAceite,
        props.stats.esperandoRepuesto,
        props.stats.terminadas,
        props.stats.canceladas,
      ],
      backgroundColor: [
        'rgba(148, 163, 184, 0.8)',  // slate-400  -> Total registradas
        'rgba(245, 158, 11, 0.85)',  // amber-500  -> En reparación
        'rgba(168, 85, 247, 0.85)',  // purple-500 -> Cambio de aceite
        'rgba(14, 165, 233, 0.85)',  // sky-500    -> En espera de repuesto
        'rgba(34, 197, 94, 0.85)',   // green-500  -> Terminadas
        'rgba(239, 68, 68, 0.85)',   // red-500    -> Canceladas
      ],
      borderColor: [
        'rgb(148, 163, 184)',
        'rgb(245, 158, 11)',
        'rgb(168, 85, 247)',
        'rgb(14, 165, 233)',
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 24,
    },
  ],
}));

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#94a3b8',
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.12)',
      },
    },
    y: {
      ticks: {
        color: '#e2e8f0',
        font: {
          weight: '600',
          size: 12,
        },
      },
      grid: {
        display: false,
      },
    },
  },
};
</script>

<template>
  <div
    v-if="cargando"
    class="h-80 w-full animate-pulse rounded-2xl border border-lyer-linea/45 bg-lyer-card/90"
  />

  <section
    v-else
    class="rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-5 shadow-md"
  >
    <!-- Encabezado con filtro por mes -->
    <div class="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 class="font-display text-lg font-bold text-lyer-fg">
          Resumen de órdenes por mes
        </h2>
        <p class="text-xs text-lyer-muted">
          Distribución según estado de atención en el periodo seleccionado
        </p>
      </div>

      <div class="flex items-center gap-2">
        <label for="filtro-mes" class="text-xs font-medium text-lyer-muted">
          Mes:
        </label>
        <input
          id="filtro-mes"
          type="month"
          :value="mesSeleccionado"
          @input="emit('update:mesSeleccionado', $event.target.value)"
          class="rounded-xl border border-lyer-linea/60 bg-lyer-bg px-3 py-1.5 text-sm text-lyer-fg focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Contenedor del gráfico (h-72 para alojar las 6 barras cómodamente) -->
    <div class="relative h-72 w-full">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>