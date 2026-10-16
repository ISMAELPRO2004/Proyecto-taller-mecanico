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
import { Plus } from 'lucide-vue-next';

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
  const esBorrador = o.estado === 'EN_ESPERA';
  const ok = await notify.confirm(
    esBorrador ? '¿Eliminar borrador?' : '¿Eliminar orden?',
    esBorrador
      ? `Se borrará ${o.numeroOrden} con su trabajo, sus fotos y, si se crearon solo para este borrador, el vehículo y el cliente.`
      : `Se borrará ${o.numeroOrden} y sus fotos. El cliente, el vehículo y los materiales del catálogo se conservan.`
  );
  if (!ok) return;
  try {
    await ordenService.eliminar(o.id);
    notify.success('Eliminado', esBorrador ? 'Borrador y datos creados con él eliminados.' : 'Orden y fotos eliminadas.');
    obtenerOrdenes();
  } catch (e) {
    notify.error('Error', e.response?.data?.message || e.response?.data?.error || 'No se pudo eliminar la orden.');
  }
};

const imprimiendoId = ref(null);
const imprimirOrden = async (o) => {
  if (imprimiendoId.value) return;
  imprimiendoId.value = o.id;
  try {
    const detalle = await ordenService.obtener(o.id);
    await generarOrdenPDF(detalle, {
      verPrecios: ['ADMIN', 'SUPERVISOR'].includes(auth.usuario?.rol),
      accion: 'imprimir',
    });
  } catch {
    notify.error('Error', 'No se pudo preparar la impresión de la orden.');
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
  <div class="w-full space-y-5 animate-fade-in">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-lyer-cyan">Mecánica LYER Motors</p>
        <h2 class="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
          Listado de órdenes de trabajo
        </h2>
      </div>
      <router-link
        to="/ordenes/nueva"
        class="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-lyer-accent px-5 text-sm font-bold tracking-wide text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)]"
      >
        <Plus class="h-5 w-5" />
        Crear orden
      </router-link>
    </div>

    <FiltrosOrdenes
      v-model:busqueda="busqueda"
      v-model:filtro-estado="filtroEstado"
      :cargando="cargando"
      @refrescar="obtenerOrdenes"
    />

    <div class="overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
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

      <div class="border-t border-[#4a2870]/40 bg-[#160a24] px-4 py-4 md:px-6">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :total="ordenesFiltradas.length"
          :opciones-items="opcionesItems"
          oscuro
          total-sufijo="órdenes"
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
