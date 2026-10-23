<script setup>
import EncabezadoSeguridad from './encabezado/EncabezadoSeguridad.vue';
import BarraCategorias from './categorias/BarraCategorias.vue';
import GridUsuarios from './usuarios/tarjetas/GridUsuarios.vue';
import ModalUsuarioForm from './usuarios/modal/ModalUsuarioForm.vue';
import PanelAuditoria from './logs/PanelAuditoria.vue';
import LogDetalleModal from './logs/modal/LogDetalleModal.vue';
import { useSeguridad } from './composables/useSeguridad.js';

const {
  tabsSeguridad,
  tabActiva,
  loading,
  usuarios,
  modalOpen,
  editando,
  form,
  abrirCrear,
  abrirEditar,
  guardarUsuario,
  toggleUsuario,
  eliminarUsuario,
  logsVisibles,
  logSeleccionado,
  modalLogOpen,
  busqueda,
  filtroUsuarioId,
  paginaActual,
  itemsPorPagina,
  totalLogs,
  totalPaginas,
  opcionesItems,
  paginasVisibles,
  verDetalleLog,
} = useSeguridad();
</script>

<template>
  <div class="space-y-5 animate-fade-in">
    <EncabezadoSeguridad :tab-activa="tabActiva" @nuevo="abrirCrear" />

    <BarraCategorias v-model:tab-activa="tabActiva" :tabs="tabsSeguridad" />

    <GridUsuarios
      v-if="tabActiva === 'usuarios'"
      :usuarios="usuarios"
      :loading="loading"
      @editar="abrirEditar"
      @toggle="toggleUsuario"
      @eliminar="eliminarUsuario"
    />

    <PanelAuditoria
      v-else
      v-model:busqueda="busqueda"
      v-model:filtro-usuario-id="filtroUsuarioId"
      v-model:pagina-actual="paginaActual"
      v-model:items-por-pagina="itemsPorPagina"
      :usuarios="usuarios"
      :logs="logsVisibles"
      :loading="loading"
      :total-paginas="totalPaginas"
      :opciones-items="opcionesItems"
      :total-logs="totalLogs"
      :paginas-visibles="paginasVisibles"
      @ver-detalle="verDetalleLog"
    />

    <ModalUsuarioForm
      :is-open="modalOpen"
      :editando="editando"
      v-model:form="form"
      @close="modalOpen = false"
      @guardar="guardarUsuario"
    />

    <LogDetalleModal :isOpen="modalLogOpen" :log="logSeleccionado" @close="modalLogOpen = false" />
  </div>
</template>
