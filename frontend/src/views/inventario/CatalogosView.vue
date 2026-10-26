<script setup>
import EncabezadoCatalogos from './encabezado/EncabezadoCatalogos.vue';
import BarraCategorias from './categorias/BarraCategorias.vue';
import TablaCatalogo from './tabla/TablaCatalogo.vue';
import ModalCatalogoForm from './modal/ModalCatalogoForm.vue';
import Paginador from '../../components/ui/Paginador.vue';
import { useCatalogos } from './composables/useCatalogos.js';

const {
  tabsCatalogo,
  tabActiva,
  listaFiltrada,
  listaPaginada,
  filasVacias,
  loading,
  busqueda,
  modalOpen,
  editando,
  form,
  nombreTabActiva,
  mostrarResponsable,
  paginaActual,
  itemsPorPagina,
  opcionesItems,
  totalPaginas,
  cargarDatos,
  guardar,
  eliminar,
  abrirModal,
  cerrarModal,
} = useCatalogos();
</script>

<template>
  <div class="space-y-5 animate-fade-in">
    <EncabezadoCatalogos :nombre-tab-activa="nombreTabActiva" @nuevo="abrirModal()" />

    <div class="overflow-hidden rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <BarraCategorias
        v-model:tab-activa="tabActiva"
        v-model:busqueda="busqueda"
        :tabs="tabsCatalogo"
        @change="cargarDatos"
      />

      <TablaCatalogo
        :items="listaPaginada"
        :loading="loading"
        :tab-activa="tabActiva"
        :filas-vacias="filasVacias"
        @editar="abrirModal"
        @eliminar="eliminar"
      />

      <div class="border-t border-lyer-linea/40 bg-lyer-panel px-4 py-4 md:px-6">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :total="listaFiltrada.length"
          :opciones-items="opcionesItems"
          mostrar-label-ver
          oscuro
          total-sufijo="registros"
        />
      </div>
    </div>

    <ModalCatalogoForm
      :is-open="modalOpen"
      :editando="editando"
      :form="form"
      :nombre-tab-activa="nombreTabActiva"
      :mostrar-responsable="mostrarResponsable"
      @close="cerrarModal"
      @guardar="guardar"
      @update:form="form = $event"
    />
  </div>
</template>
