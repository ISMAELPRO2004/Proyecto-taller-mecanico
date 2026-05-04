<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios.js';
import { 
  ClipboardList, Wrench, Clock, CheckCircle2,
  XCircle, ArrowUpRight, Car, RefreshCcw
} from 'lucide-vue-next';

const cargando = ref(true);
const ordenes  = ref([]);

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
    const { data } = await api.get('/ordenes');
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

const ESTADO_CONFIG = {
  EN_REPARACION:      { label: 'En Reparación',      badge: 'badge-warning text-warning-content' },
  CAMBIO_ACEITE:      { label: 'Cambio de Aceite',    badge: 'badge-info text-info-content'    },
  ESPERANDO_REPUESTO: { label: 'Esperando Repuesto',  badge: 'badge-info text-info-content'    },
  TERMINADO:          { label: 'Terminado',           badge: 'badge-success text-success-content' },
  CANCELADO:          { label: 'Cancelado',           badge: 'badge-error text-error-content'  },
};
const estadoBadge = (estado) => ESTADO_CONFIG[estado]?.badge || 'badge-ghost';
const estadoLabel = (estado) => ESTADO_CONFIG[estado]?.label || estado;

onMounted(cargar);
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Encabezado con refresh -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-black text-slate-800 uppercase tracking-tight">Panel General</h2>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mecánica LYER Motors</p>
      </div>
      <button @click="cargar"
        class="btn btn-sm bg-white border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl gap-2">
        <RefreshCcw :class="['w-4 h-4', cargando ? 'animate-spin' : '']" />
        <span class="hidden sm:inline text-xs font-bold">Actualizar</span>
      </button>
    </div>

    <!-- Stats grid — 2 cols en móvil, 3 en tablet, 5 en desktop -->
    <div v-if="cargando" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div v-for="n in 5" :key="n"
        class="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-24" />
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

      <div class="bg-white p-4 rounded-2xl border-b-4 border-lyer-green shadow-sm flex flex-col gap-1">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
        <h3 class="text-3xl font-black text-slate-800">{{ stats.total }}</h3>
        <p class="text-[10px] text-slate-400 font-medium">Órdenes registradas</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border-b-4 border-amber-400 shadow-sm flex flex-col gap-1">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reparación</p>
        <h3 class="text-3xl font-black text-amber-500">{{ stats.enReparacion }}</h3>
        <p class="text-[10px] text-slate-400 font-medium">En proceso activo</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border-b-4 border-sky-400 shadow-sm flex flex-col gap-1">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Espera</p>
        <h3 class="text-3xl font-black text-sky-500">
          {{ stats.esperandoRepuesto + stats.cambioAceite }}
        </h3>
        <p class="text-[10px] text-slate-400 font-medium">Repuesto o aceite</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border-b-4 border-emerald-500 shadow-sm flex flex-col gap-1">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terminadas</p>
        <h3 class="text-3xl font-black text-emerald-600">{{ stats.terminadas }}</h3>
        <p class="text-[10px] text-slate-400 font-medium">Listas para entrega</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border-b-4 border-red-400 shadow-sm flex flex-col gap-1 col-span-2 sm:col-span-1">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Canceladas</p>
        <h3 class="text-3xl font-black text-red-500">{{ stats.canceladas }}</h3>
        <p class="text-[10px] text-slate-400 font-medium">Sin completar</p>
      </div>

    </div>

    <!-- Contenido principal — tabla + acciones -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Tabla recientes — ocupa 2/3 en desktop, full en móvil -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <Car class="w-4 h-4 text-lyer-green" />
            Últimas Unidades en Taller
          </h3>
          <button @click="$router.push('/ordenes')"
            class="text-xs font-bold text-lyer-accent hover:underline flex items-center gap-1">
            Ver todas <ArrowUpRight class="w-3 h-3" />
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead class="bg-slate-50">
              <tr class="text-slate-500 uppercase text-[9px] tracking-widest">
                <th class="py-3 pl-4">OT #</th>
                <th>Placa</th>
                <!-- Ocultar cliente en pantallas muy pequeñas -->
                <th class="hidden sm:table-cell">Cliente</th>
                <th>Estado</th>
                <th class="text-right pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cargando">
                <td colspan="5" class="text-center py-10">
                  <span class="loading loading-ring loading-md text-lyer-green" />
                </td>
              </tr>
              <tr v-for="o in ordenesRecientes" :key="o.id"
                class="hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                @click="$router.push('/ordenes')">
                <td class="pl-4 py-3 font-black text-lyer-green italic text-xs">{{ o.numeroOrden }}</td>
                <td class="py-3">
                  <div class="flex flex-col">
                    <span class="font-black text-slate-700 uppercase text-sm">{{ o.placa }}</span>
                    <span class="text-[10px] text-slate-400">{{ o.marca }} {{ o.modelo }}</span>
                  </div>
                </td>
                <td class="hidden sm:table-cell py-3 text-sm font-medium">{{ o.clienteNombre }}</td>
                <td class="py-3">
                  <span :class="['badge badge-sm font-bold p-2 border-none text-[9px]', estadoBadge(o.estado)]">
                    {{ estadoLabel(o.estado) }}
                  </span>
                </td>
                <td class="text-right pr-4 py-3 font-black text-slate-700 text-sm tabular-nums">
                  S/ {{ parseFloat(o.totalFinal).toFixed(2) }}
                </td>
              </tr>
              <tr v-if="!cargando && ordenesRecientes.length === 0">
                <td colspan="5" class="text-center py-12 text-slate-400 text-sm">
                  No hay órdenes registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel lateral de acciones rápidas -->
      <div class="space-y-4">

        <!-- CTA nueva orden -->
        <div class="bg-lyer-green text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div class="relative z-10">
            <h4 class="text-lg font-black mb-1">¿Nueva Entrada?</h4>
            <p class="text-emerald-100 text-xs mb-5 leading-relaxed">
              Registra un nuevo vehículo y genera su orden de trabajo.
            </p>
            <button @click="$router.push('/ordenes/nueva')"
              class="btn bg-white text-lyer-green border-none hover:bg-emerald-50 w-full font-bold text-sm">
              + Crear Orden de Trabajo
            </button>
          </div>
          <Car class="absolute -bottom-4 -right-4 w-28 h-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <!-- Accesos rápidos -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <h4 class="font-bold text-slate-800 mb-4 text-sm">Accesos Rápidos</h4>
          <div class="space-y-2">
            <button @click="$router.push('/ordenes')"
              class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div class="flex items-center gap-3">
                <ClipboardList class="w-4 h-4 text-lyer-green" />
                <span class="text-sm font-medium text-slate-700">Ver todas las órdenes</span>
              </div>
              <ArrowUpRight class="w-4 h-4 text-slate-400" />
            </button>
            <button @click="$router.push('/catalogos')"
              class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div class="flex items-center gap-3">
                <Wrench class="w-4 h-4 text-lyer-green" />
                <span class="text-sm font-medium text-slate-700">Actualizar catálogos</span>
              </div>
              <ArrowUpRight class="w-4 h-4 text-slate-400" />
            </button>
            <button @click="$router.push('/usuarios')"
              class="flex items-center justify-between w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div class="flex items-center gap-3">
                <CheckCircle2 class="w-4 h-4 text-lyer-green" />
                <span class="text-sm font-medium text-slate-700">Usuarios & Auditoría</span>
              </div>
              <ArrowUpRight class="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
</style>