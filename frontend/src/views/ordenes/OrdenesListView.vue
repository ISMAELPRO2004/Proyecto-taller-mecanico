<script setup>
import OrdenDetalleModal from './componentes/OrdenDetalleModal.vue';
import FiltrosOrdenes from './componentes/FiltrosOrdenes.vue';
import TablaOrdenes from './componentes/TablaOrdenes.vue';
import ModalFacturaOrden from './componentes/ModalFacturaOrden.vue';
import Paginador from '../../components/ui/Paginador.vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { ordenService } from '../../services/ordenService.js';
import { usePaginacion } from '../../composables/usePaginacion.js';
import { notify } from '../../utils/alerts.js';
import { generarOrdenPDF } from '../../utils/ordenPdf.js';
import { nombreClienteOrden } from '../../utils/ordenDisplay.js';
import { Plus, FileText } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();
const ordenes = ref([]);
const busqueda = ref('');
const filtroEstado = ref('');
const cargando = ref(true);
const idSeleccionado = ref(null);
const modalAbierto = ref(false);
const facturaAbierta = ref(false);
const ordenFactura = ref(null);
const guardandoFactura = ref(false);

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
    const cliente = nombreClienteOrden(o).toLowerCase();
    const coincideBusqueda =
      (o.numeroOrden?.toLowerCase() || '').includes(search) ||
      (o.placa?.toLowerCase() || '').includes(search) ||
      cliente.includes(search);
    const coincideEstado = filtroEstado.value === '' || o.estado === filtroEstado.value;
    return coincideBusqueda && coincideEstado;
  });
});

const { paginaActual, itemsPorPagina, opcionesItems, totalPaginas, itemsPaginados: ordenesPaginadas, filasVacias } =
  usePaginacion(ordenesFiltradas);

const verDetalle = (id) => { idSeleccionado.value = id; modalAbierto.value = true; };

const abrirFactura = (o) => {
  ordenFactura.value = o;
  facturaAbierta.value = true;
};

const aceptarOrden = async (o) => {
  const ok = await notify.confirm(
    '¿Aceptar borrador?',
    `La orden ${o.numeroOrden} pasará a estado ACEPTADO y podrá completarse en taller.`
  );
  if (!ok) return;
  try {
    await ordenService.aceptar(o.id);
    notify.success('Orden aceptada', 'Ya puede continuar el trabajo.');
    obtenerOrdenes();
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo aceptar la orden.');
  }
};

const cancelarTerminado = (o) => {
  ordenFactura.value = o;
  facturaAbierta.value = true;
};

const guardarFactura = async (payload) => {
  if (!ordenFactura.value) return;
  guardandoFactura.value = true;
  const esCancelacion = ordenFactura.value.estado === 'TERMINADO';
  try {
    if (esCancelacion) {
      await ordenService.cambiarEstado(ordenFactura.value.id, { estado: 'CANCELADO', ...payload });
      notify.success('Orden cancelada', 'La facturación quedó registrada.');
    } else {
      await ordenService.actualizarFactura(ordenFactura.value.id, payload);
      notify.success('Factura actualizada');
    }
    facturaAbierta.value = false;
    obtenerOrdenes();
  } catch (e) {
    notify.error(esCancelacion ? 'No se pudo cancelar' : 'No se pudo guardar la factura', e.response?.data?.message);
  } finally {
    guardandoFactura.value = false;
  }
};

const eliminarOrden = async (o) => {
  const incompleto = o.estado === 'EN_ESPERA' && o.pasoRecepcion != null;
  const ok = await notify.confirm(
    incompleto ? '¿Eliminar borrador pendiente?' : '¿Eliminar orden?',
    incompleto
      ? `Se borrará ${o.numeroOrden}, sus fotos y el vehículo/cliente nuevos creados solo en este borrador.`
      : `Se borrará ${o.numeroOrden} y sus fotos. El cliente y el vehículo se conservan.`
  );
  if (!ok) return;
  try {
    await ordenService.eliminar(o.id);
    notify.success('Eliminado', incompleto ? 'Borrador y datos temporales eliminados.' : 'Orden y fotos eliminadas.');
    obtenerOrdenes();
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo eliminar la orden.');
  }
};

const imprimiendoId = ref(null);
const imprimirOrden = async (o) => {
  if (imprimiendoId.value) return;
  imprimiendoId.value = o.id;
  try {
    const detalle = await ordenService.obtener(o.id);
    generarOrdenPDF(detalle, { verPrecios: ['ADMIN', 'SUPERVISOR'].includes(auth.usuario?.rol) });
  } catch {
    notify.error('Error', 'No se pudo generar el PDF de la orden.');
  } finally {
    imprimiendoId.value = null;
  }
};

const irAEditar = (o) => {
  if (o.estado === 'EN_ESPERA') {
    router.push(`/ordenes/editar/${o.id}`);
    return;
  }
  router.push(`/ordenes/taller/${o.id}`);
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

    <FiltrosOrdenes
      v-model:busqueda="busqueda"
      v-model:filtro-estado="filtroEstado"
      :cargando="cargando"
      @refrescar="obtenerOrdenes"
    />

    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <TablaOrdenes
        :ordenes="ordenesPaginadas"
        :cargando="cargando"
        :filas-vacias="filasVacias"
        :imprimiendo-id="imprimiendoId"
        @ver-detalle="verDetalle"
        @imprimir="imprimirOrden"
        @editar="irAEditar"
        @aceptar="aceptarOrden"
        @cancelar="cancelarTerminado"
        @eliminar="eliminarOrden"
        @factura="abrirFactura"
      />

      <div class="p-4 md:p-6 bg-slate-50/50 border-t border-slate-100">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :total="ordenesFiltradas.length"
          :opciones-items="opcionesItems"
        />
      </div>
    </div>

    <OrdenDetalleModal :orden-id="idSeleccionado" :is-open="modalAbierto" @close="modalAbierto = false" @actualizada="obtenerOrdenes" />
    <ModalFacturaOrden
      :is-open="facturaAbierta"
      :orden="ordenFactura"
      :guardando="guardandoFactura"
      @close="facturaAbierta = false"
      @guardar="guardarFactura"
    />
  </div>
</template>
