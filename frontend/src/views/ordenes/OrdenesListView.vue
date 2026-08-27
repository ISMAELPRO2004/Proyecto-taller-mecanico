<script setup>
import OrdenDetalleModal from '../../components/ui/OrdenDetalleModal.vue';
import StatusBadge from '../../components/ui/StatusBadge.vue';
import { ref, onMounted, computed } from 'vue';
import { ordenService } from '../../services/ordenService.js';
import { usePaginacion } from '../../composables/usePaginacion.js';
import { notify } from '../../utils/alerts.js';
import { generarOrdenPDF } from '../../utils/ordenPdf.js';
import {
  Eye, Trash2, Plus, FileText, RefreshCcw,
  ChevronLeft, ChevronRight, ListOrdered, Edit3, Lock, Printer
} from 'lucide-vue-next';

const ordenes = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const cargando = ref(true);
const idSeleccionado = ref(null);
const modalAbierto = ref(false);

const obtenerOrdenes = async () => {
  cargando.value = true;
  try {
    ordenes.value = await ordenService.listar();
  } catch {
    notify.error('Error de Conexión', 'No se pudieron sincronizar las órdenes.');
  } finally {
    cargando.value = false;
  }
};

const ordenesFiltradas = computed(() => {
  return ordenes.value.filter(o => {
    const search = busqueda.value.toLowerCase();
    const coincideBusqueda =
      (o.numeroOrden?.toLowerCase() || '').includes(search) ||
      (o.placa?.toLowerCase() || '').includes(search) ||
      (o.clienteNombre?.toLowerCase() || '').includes(search);
    const coincideEstado = filtroEstado.value === '' || o.estado === filtroEstado.value;
    return coincideBusqueda && coincideEstado;
  });
});

const { paginaActual, itemsPorPagina, opcionesItems, totalPaginas, itemsPaginados: ordenesPaginadas, filasVacias } =
  usePaginacion(ordenesFiltradas);

const verDetalle = (id) => { idSeleccionado.value = id; modalAbierto.value = true; };

const puedeEditar = (o) => !o.estaCerrada && !['TERMINADO', 'CANCELADO'].includes(o.estado);
const puedeEliminar = (o) => !o.estaCerrada && o.estado !== 'TERMINADO';
const puedeCerrar = (o) => !o.estaCerrada && ['TERMINADO', 'CANCELADO'].includes(o.estado);

const cerrarOrden = async (o) => {
  const ok = await notify.confirm(
    '¿Cerrar orden permanentemente?',
    `La orden ${o.numeroOrden} quedará bloqueada. Esta acción no se puede deshacer.`
  );
  if (!ok) return;
  try {
    await ordenService.cerrar(o.id);
    notify.success('Orden Cerrada', 'El registro ha sido sellado correctamente.');
    obtenerOrdenes();
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo cerrar la orden.');
  }
};

const eliminarOrden = async (o) => {
  if (o.estaCerrada) {
    notify.error('Acción bloqueada', 'No se puede eliminar una orden cerrada.');
    return;
  }
  const ok = await notify.confirm('¿Eliminar orden?', 'Esta acción no se puede deshacer.');
  if (!ok) return;
  try {
    await ordenService.eliminar(o.id);
    notify.success('Orden Eliminada', 'El registro ha sido borrado.');
    obtenerOrdenes();
  } catch {
    notify.error('Error', 'No se pudo eliminar la orden.');
  }
};

const imprimiendoId = ref(null);
const imprimirOrden = async (o) => {
  if (imprimiendoId.value) return;
  imprimiendoId.value = o.id;
  try {
    const detalle = await ordenService.obtener(o.id);
    generarOrdenPDF(detalle);
  } catch {
    notify.error('Error', 'No se pudo generar el PDF de la orden.');
  } finally {
    imprimiendoId.value = null;
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
      <router-link to="/ordenes/nueva"
        class="btn bg-lyer-green text-white hover:bg-emerald-900 border-none px-8 rounded-xl shadow-md transition-transform hover:scale-105">
        <Plus class="w-5 h-5 mr-1" /> Nueva Orden
      </router-link>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
      <input v-model="busqueda" type="text" placeholder="Buscar placa, cliente o N° orden..."
        class="input input-bordered w-full bg-slate-50 border-slate-100 focus:border-lyer-accent rounded-xl text-sm" />
      <div class="flex gap-2">
        <select v-model="filtroEstado"
          class="select select-bordered flex-1 bg-slate-50 border-slate-100 rounded-xl text-sm">
          <option value="">Todos los estados</option>
          <option value="EN_REPARACION">En Reparación</option>
          <option value="CAMBIO_ACEITE">Cambio de Aceite</option>
          <option value="ESPERANDO_REPUESTO">Esp. Repuesto</option>
          <option value="TERMINADO">Terminado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <button @click="obtenerOrdenes"
          class="btn btn-square bg-white border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl shrink-0">
          <RefreshCcw :class="{ 'animate-spin': cargando }" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- ── VISTA MÓVIL: tarjetas ── (visible solo en < md) -->
      <div class="md:hidden divide-y divide-slate-50">
        <div v-if="cargando" class="py-16 text-center">
          <span class="loading loading-ring loading-md text-lyer-green" />
        </div>
        <div v-for="o in ordenesPaginadas" :key="'m-' + o.id"
          :class="['p-4 space-y-3 hover:bg-emerald-50/20 transition-colors', o.estaCerrada ? 'bg-slate-50/50' : '']">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 mb-1">
              <Lock v-if="o.estaCerrada" class="w-3 h-3 text-slate-400 shrink-0" />
              <span class="font-black text-lyer-green italic text-sm">{{ o.numeroOrden }}</span>
              <span class="text-[9px] text-slate-400">· {{ new Date(o.fechaCreacion).toLocaleDateString('es-PE') }}</span>
            </div>
            <p class="font-black text-slate-800 uppercase text-sm">{{ o.placa }}
              <span class="text-[10px] font-medium text-slate-400 normal-case"> · {{ o.marca }} {{ o.modelo }}</span>
            </p>
            <p class="text-xs text-slate-500 font-medium mt-0.5">{{ o.clienteNombre }}</p>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge :estado="o.estado" :cerrada="o.estaCerrada" />
              <span class="font-black text-slate-700 text-sm">S/ {{ parseFloat(o.totalFinal || 0).toFixed(2) }}</span>
            </div>
          </div>
          <!-- Acciones — grid 2 cols para que no se aprieten en móvil -->
          <div class="grid grid-cols-2 gap-2">
            <button @click="verDetalle(o.id)"
              class="btn btn-sm h-11 min-h-11 bg-emerald-50 text-lyer-green border border-emerald-100 hover:bg-lyer-green hover:text-white rounded-xl font-bold gap-1.5 px-2">
              <Eye class="w-4 h-4 shrink-0" />
              <span class="text-xs">Ver</span>
            </button>
            <button @click="imprimirOrden(o)" :disabled="imprimiendoId === o.id"
              class="btn btn-sm h-11 min-h-11 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-700 hover:text-white rounded-xl font-bold gap-1.5 px-2 disabled:opacity-50">
              <span v-if="imprimiendoId === o.id" class="loading loading-spinner loading-xs" />
              <Printer v-else class="w-4 h-4 shrink-0" />
              <span class="text-xs">Imprimir</span>
            </button>
            <button v-if="puedeEditar(o)" @click="$router.push(`/ordenes/editar/${o.id}`)"
              class="btn btn-sm h-11 min-h-11 bg-emerald-50 text-lyer-green border border-emerald-100 hover:bg-lyer-green hover:text-white rounded-xl font-bold gap-1.5 px-2">
              <Edit3 class="w-4 h-4 shrink-0" />
              <span class="text-xs">Editar</span>
            </button>
            <button v-if="puedeCerrar(o)" @click="cerrarOrden(o)"
              class="btn btn-sm h-11 min-h-11 bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-500 hover:text-white rounded-xl font-bold gap-1.5 px-2">
              <Lock class="w-4 h-4 shrink-0" />
              <span class="text-xs">Cerrar</span>
            </button>
            <button v-if="puedeEliminar(o)" @click="eliminarOrden(o)"
              class="btn btn-sm h-11 min-h-11 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold gap-1.5 px-2">
              <Trash2 class="w-4 h-4 shrink-0" />
              <span class="text-xs">Borrar</span>
            </button>
          </div>
        </div>
        <div v-if="!cargando && ordenesPaginadas.length === 0"
          class="py-16 text-center text-slate-300 text-sm font-bold">
          No hay órdenes.
        </div>
      </div>

      <!-- ── VISTA DESKTOP: tabla ── (visible solo en >= md) -->
      <div class="hidden md:block overflow-x-auto min-h-[400px]">
        <table class="table w-full border-separate border-spacing-0">
          <!-- thead y tbody igual que antes, sin cambios -->
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
            <tr v-for="o in ordenesPaginadas" :key="o.id"
              :class="['hover:bg-emerald-50/30 transition-colors h-[75px]', o.estaCerrada ? 'bg-slate-50/50' : '']">
              <td class="pl-8 text-xs">{{ new Date(o.fechaCreacion).toLocaleDateString('es-PE') }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <Lock v-if="o.estaCerrada" class="w-3 h-3 text-slate-400 shrink-0" />
                  <span class="font-black text-lyer-green italic">{{ o.numeroOrden }}</span>
                </div>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="font-black text-slate-800 uppercase text-sm">{{ o.placa }}</span>
                  <span class="text-[10px] font-bold opacity-40 uppercase">{{ o.marca }} {{ o.modelo }}</span>
                </div>
              </td>
              <td class="text-sm font-bold">{{ o.clienteNombre }}</td>
              <td>
                <StatusBadge :estado="o.estado" :cerrada="o.estaCerrada" size="md" />
              </td>
              <td class="text-right font-black text-slate-800">
                S/ {{ parseFloat(o.totalFinal || 0).toFixed(2) }}
              </td>
              <td class="text-center pr-8">
                <div class="flex justify-center gap-1">
                  <button @click="verDetalle(o.id)" title="Ver detalle"
                    class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg transition-all">
                    <Eye class="w-5 h-5" />
                  </button>
                  <button @click="imprimirOrden(o)" :disabled="imprimiendoId === o.id" title="Imprimir PDF"
                    class="btn btn-square btn-ghost btn-sm text-slate-500 hover:bg-slate-700 hover:text-white rounded-lg transition-all disabled:opacity-40">
                    <span v-if="imprimiendoId === o.id" class="loading loading-spinner loading-xs" />
                    <Printer v-else class="w-5 h-5" />
                  </button>
                  <button @click="$router.push(`/ordenes/editar/${o.id}`)" :disabled="!puedeEditar(o)" title="Editar"
                    class="btn btn-square btn-ghost btn-sm text-lyer-green hover:bg-lyer-green hover:text-white rounded-lg disabled:opacity-20">
                    <Edit3 class="w-5 h-5" />
                  </button>
                  <button v-if="puedeCerrar(o)" @click="cerrarOrden(o)" title="Cerrar orden"
                    class="btn btn-square btn-ghost btn-sm text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg">
                    <Lock class="w-4 h-4" />
                  </button>
                  <button @click="eliminarOrden(o)" :disabled="!puedeEliminar(o)" title="Eliminar"
                    :class="['btn btn-square btn-ghost btn-sm rounded-lg transition-all',
                      puedeEliminar(o) ? 'text-red-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-200 opacity-20 cursor-not-allowed']">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-for="n in filasVacias" :key="'ghost-' + n" class="h-[75px] opacity-0 pointer-events-none">
              <td colspan="7"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación — igual que antes -->
      <div
        class="p-4 md:p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <select v-model="itemsPorPagina"
            class="select select-ghost select-xs font-black text-lyer-green focus:bg-transparent">
            <option v-for="opt in opcionesItems" :key="opt" :value="opt">{{ opt }} filas</option>
          </select>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total: {{ ordenesFiltradas.length }}
          </span>
        </div>
        <div class="join shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden">
          <button @click="paginaActual--" :disabled="paginaActual === 1"
            class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button v-for="p in totalPaginas" :key="p" @click="paginaActual = p"
            :class="['join-item btn btn-sm border-none font-black px-3', paginaActual === p ? 'bg-lyer-green text-white' : 'bg-white text-slate-400']">
            {{ p }}
          </button>
          <button @click="paginaActual++" :disabled="paginaActual === totalPaginas"
            class="join-item btn btn-sm bg-white border-none disabled:text-slate-200">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <OrdenDetalleModal :orden-id="idSeleccionado" :is-open="modalAbierto" @close="modalAbierto = false" />
  </div>
</template>