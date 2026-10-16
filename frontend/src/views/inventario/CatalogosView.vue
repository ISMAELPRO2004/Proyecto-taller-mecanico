<script setup>
import { ref, onMounted, computed } from 'vue';
import { catalogoService, endpoints } from '../../services/catalogoService.js';
import { usePaginacion } from '../../composables/usePaginacion.js';
import { notify } from '../../utils/alerts.js';
import Paginador from '../../components/ui/Paginador.vue';
import Tabs from '../../components/ui/Tabs.vue';
import TablaCatalogo from './componentes/TablaCatalogo.vue';
import ModalCatalogoForm from './componentes/ModalCatalogoForm.vue';
import { Layers, Plus } from 'lucide-vue-next';

const tabsCatalogo = [
  { id: 'materiales', label: 'Repuestos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'terceros', label: 'Terceros' },
];
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
  <div class="space-y-5 animate-fade-in">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <Layers class="h-6 w-6" />
        </div>
        <div>
          <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">Catálogos</h2>
          <p class="font-mono text-[11px] uppercase tracking-widest text-slate-400">Precios maestros</p>
        </div>
      </div>
      <button
        type="button"
        class="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-lyer-accent px-5 text-sm font-bold tracking-wide text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)]"
        @click="abrirModal()"
      >
        <Plus class="h-5 w-5" />
        Nuevo {{ nombreTabActiva }}
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div class="border-b border-[#4a2870]/40 px-4 py-4 md:px-6">
        <Tabs v-model="tabActiva" :items="tabsCatalogo" oscuro @change="cargarDatos">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar..."
            class="h-11 w-full rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none lg:w-80"
          />
        </Tabs>
      </div>

      <TablaCatalogo
        :items="listaPaginada"
        :loading="loading"
        :tab-activa="tabActiva"
        :filas-vacias="filasVacias"
        @editar="abrirModal"
        @eliminar="eliminar"
      />

      <div class="border-t border-[#4a2870]/40 bg-[#160a24] px-4 py-4 md:px-6">
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
      :mostrar-responsable="tabActiva === 'terceros'"
      @close="cerrarModal"
      @guardar="guardar"
      @update:form="form = $event"
    />
  </div>
</template>
