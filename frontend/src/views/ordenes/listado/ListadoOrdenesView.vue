<script setup>
import EncabezadoListado from './encabezado/EncabezadoListado.vue';
import FiltrosOrdenes from './filtros/FiltrosOrdenes.vue';
import TablaOrdenes from './tabla/TablaOrdenes.vue';
import OrdenDetalleModal from './detalle/OrdenDetalleModal.vue';
import ModalFacturaOrden from './factura/ModalFacturaOrden.vue';
import Paginador from '../../../components/ui/Paginador.vue';
import { useListadoOrdenes } from './composables/useListadoOrdenes.js';

const {
  busqueda,
  filtroEstado,
  cargando,
  idSeleccionado,
  modalAbierto,
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
