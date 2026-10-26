<script setup>
import EncabezadoListado from './encabezado/EncabezadoListado.vue';
import FiltrosOrdenes from './filtros/FiltrosOrdenes.vue';
import TablaOrdenes from './tabla/TablaOrdenes.vue';
import OrdenDetalleModal from './detalle/OrdenDetalleModal.vue';
import OrdenDetalleBorradorModal from './detalle/OrdenDetalleBorradorModal.vue';
import ModalFacturaOrden from './factura/ModalFacturaOrden.vue';
import Paginador from '../../../components/ui/Paginador.vue';
import { useListadoOrdenes } from './composables/useListadoOrdenes.js';

const {
  busqueda,
  filtroEstado,
  cargando,
  idSeleccionado,
  modalAbierto,
  modalBorradorAbierto,
  facturaAbierta,
  ordenFactura,
  guardandoFactura,
  imprimiendoId,
  ordenesFiltradas,
  ordenesPaginadas,
  filasVacias,
  paginaActual,
  itemsPorPagina,
  opcionesItems,
  totalPaginas,
  obtenerOrdenes,
  verDetalle,
  continuarBorrador,
  abrirFactura,
  aceptarOrden,
  cancelarTerminado,
  guardarFactura,
  eliminarOrden,
  imprimirOrden,
  irAEditar,
} = useListadoOrdenes();
</script>

<template>
  <div class="w-full space-y-5 animate-fade-in">
    <EncabezadoListado />

    <FiltrosOrdenes
      v-model:busqueda="busqueda"
      v-model:filtro-estado="filtroEstado"
      :cargando="cargando"
      @refrescar="obtenerOrdenes"
    />

    <div class="overflow-hidden rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
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

      <div class="border-t border-lyer-linea/40 bg-lyer-panel px-4 py-4 md:px-6">
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

    <OrdenDetalleBorradorModal
      :orden-id="idSeleccionado"
      :is-open="modalBorradorAbierto"
      @close="modalBorradorAbierto = false"
      @continuar="continuarBorrador"
    />
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
