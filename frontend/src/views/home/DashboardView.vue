<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios.js';
import { 
  ClipboardCheck, 
  Clock, 
  TrendingUp, 
  Car, 
  ArrowUpRight,
  AlertTriangle 
} from 'lucide-vue-next';

const stats = ref({
  total: 0,
  enProceso: 0,
  terminadas: 0,
  ingresosMes: 0
});

const ordenesRecientes = ref([]);
const cargando = ref(true);

const obtenerResumen = async () => {
  try {
    const { data } = await api.get('/ordenes');
    stats.value.total = data.length;
    stats.value.enProceso = data.filter(o => o.estado === 'EN_REPARACION').length;
    stats.value.terminadas = data.filter(o => o.estado === 'TERMINADO').length;
    stats.value.ingresosMes = data.reduce((acc, o) => acc + parseFloat(o.totalFinal), 0);
    
    // Tomamos las últimas 5 órdenes para la tabla
    ordenesRecientes.value = data.slice(0, 5);
  } catch (error) {
    console.error("Error cargando dashboard:", error);
  } finally {
    cargando.value = false;
  }
};

const getStatusClass = (estado) => {
  const classes = {
    'EN_REPARACION': 'badge-warning text-warning-content',
    'TERMINADO': 'badge-success text-success-content',
    'CANCELADO': 'badge-error text-error-content'
  };
  return classes[estado] || 'badge-ghost';
};

onMounted(obtenerResumen);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-lyer-green flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Órdenes</p>
          <h3 class="text-3xl font-black text-slate-800">{{ stats.total }}</h3>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl text-lyer-green">
          <ClipboardCheck class="w-8 h-8" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-lyer-accent flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">En Reparación</p>
          <h3 class="text-3xl font-black text-slate-800">{{ stats.enProceso }}</h3>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl text-lyer-accent">
          <Clock class="w-8 h-8" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-lyer-green flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos Totales</p>
          <h3 class="text-3xl font-black text-slate-800">S/ {{ stats.ingresosMes.toFixed(2) }}</h3>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl text-lyer-green">
          <TrendingUp class="w-8 h-8" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-amber-500 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertas</p>
          <h3 class="text-3xl font-black text-slate-800">0</h3>
        </div>
        <div class="p-3 bg-amber-50 rounded-xl text-amber-500">
          <AlertTriangle class="w-8 h-8" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <Car class="w-5 h-5 text-lyer-green" /> 
            Últimas Unidades en Taller
          </h3>
          <button @click="$router.push('/ordenes')" class="text-sm font-bold text-lyer-accent hover:underline flex items-center gap-1">
            Ver todas <ArrowUpRight class="w-4 h-4" />
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50">
              <tr class="text-slate-500 uppercase text-[10px] tracking-widest">
                <th>OT #</th>
                <th>Vehículo / Placa</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in ordenesRecientes" :key="o.id" class="hover:bg-slate-50 transition-colors cursor-pointer">
                <td class="font-mono font-bold text-lyer-green">{{ o.numeroOrden }}</td>
                <td>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-700 uppercase">{{ o.placa }}</span>
                    <span class="text-xs text-slate-400">{{ o.marca }} {{ o.modelo }}</span>
                  </div>
                </td>
                <td class="text-sm">{{ o.clienteNombre }}</td>
                <td>
                  <span :class="['badge badge-sm font-bold p-3', getStatusClass(o.estado)]">
                    {{ o.estado.replace('_', ' ') }}
                  </span>
                </td>
                <td class="text-right font-black text-slate-700">S/ {{ parseFloat(o.totalFinal).toFixed(2) }}</td>
              </tr>
              <tr v-if="ordenesRecientes.length === 0">
                <td colspan="5" class="text-center py-10 text-slate-400">No hay órdenes registradas recientemente.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-lyer-green text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
          <div class="relative z-10">
            <h4 class="text-xl font-bold mb-2">¿Nueva Entrada?</h4>
            <p class="text-emerald-100 text-sm mb-6">Registra un nuevo vehículo y genera su orden de trabajo en segundos.</p>
            <button @click="$router.push('/ordenes')" class="btn bg-white text-lyer-green border-none hover:bg-emerald-50 w-full font-bold">
              + Crear Orden de Trabajo
            </button>
          </div>
          <Car class="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 class="font-bold text-slate-800 mb-4">Mantenimiento de Catálogos</h4>
          <div class="space-y-3">
            <button @click="$router.push('/catalogos')" class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <span class="text-sm font-medium">Actualizar Precios</span>
              <Package class="w-4 h-4 text-lyer-accent" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>