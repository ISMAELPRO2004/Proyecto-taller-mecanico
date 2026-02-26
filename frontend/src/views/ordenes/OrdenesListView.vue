<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../../api/axios.js';
import { notify } from '../../utils/alerts.js';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Plus, 
  FileText,
  RefreshCcw
} from 'lucide-vue-next';

const ordenes = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const cargando = ref(true);

const obtenerOrdenes = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get('/ordenes');
    ordenes.value = data;
  } catch (error) {
    notify.error('Error', 'No se pudieron cargar las órdenes');
  } finally {
    cargando.value = false;
  }
};

const cambiarEstado = async (id, nuevoEstado) => {
  try {
    await api.put(`/ordenes/${id}/estado`, { estado: nuevoEstado });
    notify.success('Actualizado', 'Estado de la orden actualizado con éxito');
    obtenerOrdenes();
  } catch (error) {
    notify.error('Error', 'No se pudo cambiar el estado');
  }
};

const eliminarOrden = async (id) => {
  const confirmar = await notify.confirm('¿Eliminar orden?', 'Esta acción no se puede deshacer');
  if (confirmar) {
    try {
      await api.delete(`/ordenes/${id}`);
      notify.success('Eliminado', 'La orden ha sido borrada');
      obtenerOrdenes();
    } catch (error) {
      notify.error('Error', 'No tienes permisos o la orden no existe');
    }
  }
};

// Lógica de filtrado reactivo
const ordenesFiltradas = computed(() => {
  return ordenes.value.filter(o => {
    const coincideBusqueda = o.numeroOrden.toLowerCase().includes(busqueda.value.toLowerCase()) ||
                            o.placa.toLowerCase().includes(busqueda.value.toLowerCase()) ||
                            o.clienteNombre.toLowerCase().includes(busqueda.value.toLowerCase());
    const coincideEstado = filtroEstado.value === '' || o.estado === filtroEstado.value;
    return coincideBusqueda && coincideEstado;
  });
});

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'EN_REPARACION': return 'badge-warning';
    case 'TERMINADO': return 'badge-success';
    case 'CANCELADO': return 'badge-error';
    default: return 'badge-ghost';
  }
};

onMounted(obtenerOrdenes);
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
        <FileText class="text-lyer-green" /> Gestión de Órdenes OT
      </h2>
      <router-link to="/ordenes/nueva" class="btn bg-lyer-green text-white hover:bg-emerald-900 border-none shadow-md">
        <Plus class="w-5 h-5" /> Nueva Orden
      </router-link>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input 
          v-model="busqueda"
          type="text" 
          placeholder="Buscar por placa, cliente o N° orden..." 
          class="input input-bordered w-full pl-10 focus:border-lyer-accent"
        />
      </div>
      <select v-model="filtroEstado" class="select select-bordered w-full md:w-48">
        <option value="">Todos los estados</option>
        <option value="EN_REPARACION">En Reparación</option>
        <option value="TERMINADO">Terminado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <button @click="obtenerOrdenes" class="btn btn-ghost border-slate-200">
        <RefreshCcw :class="{'animate-spin': cargando}" class="w-5 h-5" />
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr class="text-slate-500 uppercase text-[10px] tracking-widest">
              <th>Fecha</th>
              <th>Orden #</th>
              <th>Vehículo / Placa</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th class="text-right">Total</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-slate-700">
            <tr v-for="o in ordenesFiltradas" :key="o.id" class="hover:bg-slate-50 transition-colors">
              <td class="text-xs">{{ new Date(o.fechaCreacion).toLocaleDateString() }}</td>
              <td class="font-bold text-lyer-green">{{ o.numeroOrden }}</td>
              <td>
                <div class="flex flex-col">
                  <span class="font-bold uppercase">{{ o.placa }}</span>
                  <span class="text-[10px] opacity-60">{{ o.marca }} {{ o.modelo }}</span>
                </div>
              </td>
              <td class="text-sm font-medium">{{ o.clienteNombre }}</td>
              <td>
                <div class="dropdown dropdown-hover">
                  <label tabindex="0" :class="['badge badge-sm cursor-pointer font-bold p-3', getEstadoClass(o.estado)]">
                    {{ o.estado.replace('_', ' ') }}
                  </label>
                  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44 z-[100] border">
                    <li><a @click="cambiarEstado(o.id, 'EN_REPARACION')" class="text-warning">En Reparación</a></li>
                    <li><a @click="cambiarEstado(o.id, 'TERMINADO')" class="text-success">Terminado</a></li>
                    <li><a @click="cambiarEstado(o.id, 'CANCELADO')" class="text-error">Cancelado</a></li>
                  </ul>
                </div>
              </td>
              <td class="text-right font-black">S/ {{ parseFloat(o.totalFinal).toFixed(2) }}</td>
              <td>
                <div class="flex justify-center gap-1">
                  <button @click="$emit('ver-detalle', o.id)" class="btn btn-square btn-ghost btn-sm text-lyer-green">
                    <Eye class="w-5 h-5" />
                  </button>
                  <button @click="eliminarOrden(o.id)" class="btn btn-square btn-ghost btn-sm text-red-500">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="ordenesFiltradas.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400 font-medium">
                No se encontraron órdenes con esos criterios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>