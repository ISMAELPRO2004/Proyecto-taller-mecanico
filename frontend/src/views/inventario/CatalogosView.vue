<script setup>
import { ref, onMounted, computed } from 'vue';
import { catalogoService, endpoints } from '../../services/catalogoService.js';
import { usePaginacion } from '../../composables/usePaginacion.js';
import { notify } from '../../utils/alerts.js';
import Paginador from '../../components/ui/Paginador.vue';
import TabsCatalogos from './componentes/TabsCatalogos.vue';
import TablaCatalogo from './componentes/TablaCatalogo.vue';
import ModalCatalogoForm from './componentes/ModalCatalogoForm.vue';
import { Layers, Plus } from 'lucide-vue-next';

const tabActiva = ref('materiales');
const lista = ref([]);
const loading = ref(false);
const busqueda = ref('');

const modalOpen = ref(false);
const editando = ref(false);
const form = ref({ id: null, descripcion: '', precioBase: 0, responsable: '' });

const cargarDatos = async () => {
  loading.value = true;
  try {
    const data = await catalogoService[
      tabActiva.value === 'materiales' ? 'listarMateriales' :
      tabActiva.value === 'servicios' ? 'listarServicios' : 'listarTerceros'
    ]();
    lista.value = Array.isArray(data) ? data : [];
  } catch (e) {
    notify.error("Error", "No se pudieron sincronizar los datos");
  } finally {
    loading.value = false;
  }
};

const listaFiltrada = computed(() => {
  const q = busqueda.value.toLowerCase();
  return lista.value.filter(item =>
    item.descripcion.toLowerCase().includes(q)
    || (item.responsable || '').toLowerCase().includes(q)
  );
});

const { paginaActual, itemsPorPagina, opcionesItems, totalPaginas, itemsPaginados: listaPaginada, filasVacias } =
  usePaginacion(listaFiltrada, { opcionesItems: [5, 10, 20] });

const nombreTabActiva = computed(() => {
  const nombres = {
    materiales: 'Material',
    servicios: 'Servicio',
    terceros: 'Tercero'
  };
  return nombres[tabActiva.value] || '';
});

const guardar = async () => {
  if (!form.value.descripcion || form.value.precioBase <= 0) {
    return notify.error("Campos incompletos", "Por favor revisa la descripción y el precio.");
  }
  if (tabActiva.value === 'terceros' && !form.value.responsable?.trim()) {
    return notify.error("Campos incompletos", "Indica el responsable del tercero.");
  }
  try {
    if (editando.value) {
      await catalogoService.actualizar(endpoints[tabActiva.value], form.value.id, form.value);
      notify.success("Actualizado", "El ítem se actualizó correctamente.");
    } else {
      await catalogoService.crear(endpoints[tabActiva.value], form.value);
      notify.success("Registrado", "Nuevo ítem añadido al catálogo.");
    }
    cerrarModal();
    cargarDatos();
  } catch (e) { notify.error("Error al guardar"); }
};

const eliminar = async (id) => {
  const confirmado = await notify.confirm("¿Eliminar ítem?", "Si este ítem está en uso en órdenes antiguas, no podrá eliminarse.");
  if (!confirmado) return;
  try {
    await catalogoService.eliminar(endpoints[tabActiva.value], id);
    notify.success("Eliminado", "Ítem removido del catálogo.");
    cargarDatos();
  } catch (e) { notify.error("Error", "No se puede eliminar: el ítem está vinculado a órdenes existentes."); }
};

const abrirModal = (item = null) => {
  if (item) {
    editando.value = true;
    form.value = { ...item };
  } else {
    editando.value = false;
    form.value = { id: null, descripcion: '', precioBase: 0, responsable: '' };
  }
  modalOpen.value = true;
};

const cerrarModal = () => { modalOpen.value = false; };

onMounted(cargarDatos);
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
      <div class="flex items-center gap-3">
        <div class="bg-lyer-green p-3 rounded-2xl text-white shadow-lg">
          <Layers class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-800 uppercase">Catálogos</h2>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Precios Maestros</p>
        </div>
      </div>
      <button @click="abrirModal()"
        class="btn btn-sm md:btn-md bg-lyer-green text-white border-none rounded-xl w-full md:w-auto">
        <Plus class="w-4 h-4 mr-1" /> Nuevo {{ nombreTabActiva }}
      </button>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
      <TabsCatalogos v-model="tabActiva" v-model:busqueda="busqueda" @change="cargarDatos" />

      <TablaCatalogo
        :items="listaPaginada"
        :loading="loading"
        :tab-activa="tabActiva"
        :filas-vacias="filasVacias"
        @editar="abrirModal"
        @eliminar="eliminar"
      />

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-50">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :total="listaFiltrada.length"
          :opciones-items="opcionesItems"
          mostrar-label-ver
          total-sufijo="Registros"
        />
      </div>
    </div>

    <ModalCatalogoForm
      :is-open="modalOpen"
      :editando="editando"
      :form="form"
      :nombre-tab-activa="nombreTabActiva"
      :mostrar-responsable="tabActiva === 'terceros'"
      @close="cerrarModal"
      @guardar="guardar"
      @update:form="form = $event"
    />
  </div>
</template>
