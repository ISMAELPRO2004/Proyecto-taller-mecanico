<script setup>
import EncabezadoRegistros from './encabezado/EncabezadoRegistros.vue';
import BarraCategorias from './categorias/BarraCategorias.vue';
import TablaRegistros from './tabla/TablaRegistros.vue';
import ModalRegistroForm from './modal/ModalRegistroForm.vue';
import Paginador from '../../components/ui/Paginador.vue';
import { useRegistros } from './composables/useRegistros.js';

const {
  tabsRegistro,
  tab,
  busqueda,
  loading,
  marcas,
  modalOpen,
  form,
  errores,
  actualizarForm,
  nuevaMarca,
  listaActiva,
  paginaActual,
  itemsPorPagina,
  opcionesItems,
  totalPaginas,
  itemsPaginados,
  abrirEditar,
  guardar,
  eliminar,
  crearMarca,
  cerrarModal,
} = useRegistros();
</script>

<template>
  <div class="space-y-5 animate-fade-in">
    <EncabezadoRegistros />

    <div class="overflow-hidden rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <BarraCategorias
        v-model:tab="tab"
        v-model:busqueda="busqueda"
        v-model:nueva-marca="nuevaMarca"
        :tabs="tabsRegistro"
        @crear-marca="crearMarca"
      />

      <TablaRegistros
        :tipo="tab"
        :items="itemsPaginados"
        :loading="loading"
        @editar="abrirEditar"
        @eliminar="eliminar"
      />

      <div class="border-t border-lyer-linea/40 bg-lyer-panel px-4 py-4 md:px-6">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :total="listaActiva.length"
          :opciones-items="opcionesItems"
          oscuro
          total-sufijo="registros"
        />
      </div>
    </div>

    <ModalRegistroForm
      :is-open="modalOpen"
      :tipo="tab"
      :form="form"
      :errores="errores"
      :marcas="marcas"
      @close="cerrarModal"
      @guardar="guardar"
      @update:form="actualizarForm"
    />
  </div>
</template>
