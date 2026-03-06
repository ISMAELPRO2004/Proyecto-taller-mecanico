<script setup>
import OrdenDetalleModal from '../../components/ui/OrdenDetalleModal.vue';
import { ref, onMounted, computed, watch } from 'vue';
import api from '../../api/axios.js';
import { notify } from '../../utils/alerts.js';
import { 
  Eye, Trash2, Plus, FileText, RefreshCcw,
  ChevronLeft, ChevronRight, ListOrdered, Edit3
} from 'lucide-vue-next';

// --- ESTADOS REACTIVOS ---
const ordenes = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const cargando = ref(true);
const idSeleccionado = ref(null);
const modalAbierto = ref(false);

// --- PAGINACIÓN ---
const paginaActual = ref(1);
const itemsPorPagina = ref(10);
const opcionesItems = [5, 10, 20, 50];

// --- FUNCIONES DE UTILIDAD (Definidas antes para el template) ---
const getStatusClass = (estado) => {
  const map = { 
    'ESPERANDO_REPUESTO': 'badge-info text-info-content',
    'CAMBIO_ACEITE': 'badge-info text-info-content',
    'EN_REPARACION': 'badge-warning text-warning-content', 
    'TERMINADO': 'badge-success text-success-content', 
    'CANCELADO': 'badge-error text-error-content' 
  };
  return map[estado] || 'badge-ghost';
};

const obtenerOrdenes = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get('/ordenes');
    ordenes.value = Array.isArray(data) ? data : [];
  } catch (error) {
    notify.error('Error de Conexión', 'No se pudieron sincronizar las órdenes con el servidor.');
    console.error(error);
  } finally {
    cargando.value = false;
  }
};

// --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
const ordenesFiltradas = computed(() => {
  return ordenes.value.filter(o => {
    const search = busqueda.value.toLowerCase();
    const coincideBusqueda = (o.numeroOrden?.toLowerCase() || '').includes(search) ||
                            (o.placa?.toLowerCase() || '').includes(search) ||
                            (o.clienteNombre?.toLowerCase() || '').includes(search);
    const coincideEstado = filtroEstado.value === '' || o.estado === filtroEstado.value;
    return coincideBusqueda && coincideEstado;
  });
});

// Resetear página al filtrar
watch([busqueda, filtroEstado, itemsPorPagina], () => {
  paginaActual.value = 1;
});

const totalPaginas = computed(() => {
  const paginas = Math.ceil(ordenesFiltradas.value.length / itemsPorPagina.value);
  return paginas > 0 ? paginas : 1;
});

const ordenesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
  return ordenesFiltradas.value.slice(inicio, inicio + itemsPorPagina.value);
});

const filasVacias = computed(() => {
  const faltantes = itemsPorPagina.value - ordenesPaginadas.value.length;
  return faltantes > 0 ? faltantes : 0;
});

// --- ACCIONES ---
const verDetalle = (id) => {
  idSeleccionado.value = id;
  modalAbierto.value = true;
};

const irAEditar = (id) => {
  router.push(`/ordenes/editar/${id}`);
};

const puedeEditar = (estado) => !['TERMINADO', 'CANCELADO'].includes(estado);

const eliminarOrden = async (id) => {
  const confirmar = await notify.confirm('¿Eliminar orden?', 'Esta acción no se puede deshacer y afectará los reportes.');
  if (confirmar) {
    try {
      await api.delete(`/ordenes/${id}`);
      notify.success('Orden Eliminada', 'El registro ha sido borrado correctamente.');
      obtenerOrdenes();
    } catch (error) {
      notify.error('Error', 'No se pudo eliminar la orden. Verifique sus permisos.');
    }
  }
};

onMounted(obtenerOrdenes);
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="bg-lyer-green p-3 rounded-2xl text-white shadow-lg">
          <FileText class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800 tracking-tight uppercase">Gestión de Órdenes</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mecánica LYER Motors</p>
        </div>
      </div>
      <router-link to="/ordenes/nueva" class="btn bg-lyer-green text-white hover:bg-emerald-900 border-none px-8 rounded-xl shadow-md transition-transform hover:scale-105">
        <Plus class="w-5 h-5 mr-1" /> Nueva Orden
      </router-link>
    </div>

    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
      <div class="relative flex-1">
        <input v-model="busqueda" type="text" placeholder="Buscar placa, cliente o N° orden..." 
          class="input input-bordered w-full bg-slate-50 border-slate-100 focus:border-lyer-accent rounded-xl" />
      </div>
      <div class="flex gap-3">
        <select v-model="filtroEstado" class="select select-bordered w-full lg:w-48 bg-slate-50 border-slate-100 rounded-xl">
          <option value="">Todos los estados</option>
          <option value="EN_REPARACION">En Reparación</option>
          <option value="TERMINADO">Terminado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <button @click="obtenerOrdenes" class="btn btn-square bg-white border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl">
          <RefreshCcw :class="{'animate-spin': cargando}" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto min-h-[500px]">
        <table class="table w-full border-separate border-spacing-0">
          <thead class="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b">
            <tr>
              <th class="py-5 pl-8">Fecha</th>
              <th>Orden #</th>
              <th>Vehículo / Placa</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th class="text-right">Inversión</th>
              <th class="text-center pr-8">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr v-for="o in ordenesPaginadas" :key="o.id" class="hover:bg-emerald-50/30 transition-colors h-[75px]">
              <td class="pl-8 text-xs">{{ new Date(o.fechaCreacion).toLocaleDateString() }}</td>
              <td class="font-black text-lyer-green italic">{{ o.numeroOrden }}</td>
              <td>
                <div class="flex flex-col">
                  <span class="font-black text-slate-800 uppercase text-sm">{{ o.placa }}</span>
                  <span class="text-[10px] font-bold opacity-40 uppercase">{{ o.marca }} {{ o.modelo }}</span>
                </div>
              </td>
              <td class="text-sm font-bold">{{ o.clienteNombre }}</td>
              <td>
                <span :class="['badge badge-sm font-black p-3 border-none', getStatusClass(o.estado)]">
                  {{ o.estado?.replace('_', ' ') }}
                </span>
              </td>
              <td class="text-right font-black text-slate-800">S/ {{ parseFloat(o.totalFinal || 0).toFixed(2) }}</td>
              <td class="text-center pr-8">
                <div class="flex justify-center gap-2">
                  <button @click="verDetalle(o.id)" class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg transition-all">
                    <Eye class="w-5 h-5" />
                  </button>
                  <button 
            @click="$router.push(`/ordenes/editar/${o.id}`)"
            :disabled="!puedeEditar(o.estado)"
            class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg transition-all disabled:opacity-30"
            title="Editar Orden"
          >
            <Edit3 class="w-5 h-5" />
          </button>
                  <button @click="eliminarOrden(o.id)" class="btn btn-square btn-ghost btn-sm text-slate-300 hover:text-red-500 rounded-lg">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-for="n in filasVacias" :key="'ghost-'+n" class="h-[75px] opacity-0 pointer-events-none">
              <td colspan="7"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <ListOrdered class="w-4 h-4" /> Mostrar:
            <select v-model="itemsPorPagina" class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
              <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} filas</option>
            </select>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total: {{ ordenesFiltradas.length }} Registros
          </span>
        </div>

        <div class="join shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden">
          <button @click="paginaActual--" :disabled="paginaActual === 1" class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button v-for="p in totalPaginas" :key="p" @click="paginaActual = p"
            :class="['join-item btn btn-sm border-none font-black px-4', paginaActual === p ? 'bg-lyer-green text-white' : 'bg-white text-slate-400']">
            {{ p }}
          </button>
          <button @click="paginaActual++" :disabled="paginaActual === totalPaginas" class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <OrdenDetalleModal 
      :orden-id="idSeleccionado" 
      :is-open="modalAbierto" 
      @close="modalAbierto = false" 
    />
  </div>
</template>