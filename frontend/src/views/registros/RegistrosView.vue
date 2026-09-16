<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Database, Plus, Search } from 'lucide-vue-next';
import { clienteService } from '../../services/clienteService.js';
import { vehiculoService } from '../../services/vehiculoService.js';
import { notify } from '../../utils/alerts.js';
import { usePaginacion } from '../../composables/usePaginacion.js';
import Paginador from '../../components/ui/Paginador.vue';
import TabsRegistros from './componentes/TabsRegistros.vue';
import TablaRegistros from './componentes/TablaRegistros.vue';
import ModalRegistroForm from './componentes/ModalRegistroForm.vue';

const tab = ref('clientes');
const busqueda = ref('');
const loading = ref(false);
const clientes = ref([]);
const vehiculos = ref([]);
const marcas = ref([]);
const modalOpen = ref(false);
const form = ref({});
const nuevaMarca = ref('');

const listaActiva = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (tab.value === 'clientes') {
    return clientes.value.filter((c) =>
      !q || c.nombreRazonSocial.toLowerCase().includes(q) || c.numeroDocumento.includes(q)
    );
  }
  if (tab.value === 'vehiculos') {
    return vehiculos.value.filter((v) =>
      !q || v.placa.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q) || v.marca?.nombre?.toLowerCase().includes(q)
    );
  }
  return marcas.value.filter((m) => !q || m.nombre.toLowerCase().includes(q));
});

const { paginaActual, itemsPorPagina, opcionesItems, totalPaginas, itemsPaginados } =
  usePaginacion(listaActiva, { opcionesItems: [10, 20, 50] });

watch(tab, () => { busqueda.value = ''; paginaActual.value = 1; });

const cargar = async () => {
  loading.value = true;
  try {
    const [c, v, m] = await Promise.all([
      clienteService.listar(null, true),
      vehiculoService.listar(),
      vehiculoService.listarMarcas(),
    ]);
    clientes.value = c;
    vehiculos.value = v;
    marcas.value = m;
  } catch {
    notify.error('Error', 'No se pudieron cargar los registros.');
  } finally {
    loading.value = false;
  }
};

const abrirEditar = (item) => {
  if (tab.value === 'clientes') {
    form.value = { ...item, representante: item.representante || '', celular: item.celular || '', correo: item.correo || '' };
  } else if (tab.value === 'vehiculos') {
    form.value = {
      placa: item.placa,
      marcaId: item.marcaId,
      modelo: item.modelo,
      kilometraje: item.kilometraje,
      horometro: item.horometro,
    };
  } else {
    form.value = { id: item.id, nombre: item.nombre };
  }
  modalOpen.value = true;
};

const guardar = async () => {
  try {
    if (tab.value === 'clientes') {
      await clienteService.actualizar(form.value.id, form.value);
    } else if (tab.value === 'vehiculos') {
      await vehiculoService.actualizar(form.value.placa, {
        marcaId: Number(form.value.marcaId),
        modelo: form.value.modelo,
        kilometraje: form.value.kilometraje === '' ? null : form.value.kilometraje,
        horometro: form.value.horometro === '' ? null : form.value.horometro,
      });
    } else {
      await vehiculoService.actualizarMarca(form.value.id, form.value.nombre);
    }
    notify.success('Guardado', 'Registro actualizado.');
    modalOpen.value = false;
    cargar();
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo guardar.');
  }
};

const eliminar = async (item) => {
  const ok = await notify.confirm('¿Eliminar registro?', 'Solo se puede si no tiene órdenes o vehículos vinculados.');
  if (!ok) return;
  try {
    if (tab.value === 'clientes') await clienteService.eliminar(item.id);
    else if (tab.value === 'vehiculos') await vehiculoService.eliminar(item.placa);
    else await vehiculoService.eliminarMarca(item.id);
    notify.success('Eliminado', 'Registro removido.');
    cargar();
  } catch (e) {
    notify.error('No se pudo eliminar', e.response?.data?.message || 'Tiene registros asociados.');
  }
};

const crearMarca = async () => {
  if (!nuevaMarca.value.trim()) return;
  try {
    await vehiculoService.crearMarca(nuevaMarca.value.trim());
    nuevaMarca.value = '';
    notify.success('Marca creada', '');
    cargar();
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo crear la marca.');
  }
};

onMounted(cargar);
</script>

<template>
  <div class="space-y-6 animate-fade-in pb-10">
    <div class="flex items-center gap-3">
      <div class="bg-lyer-green p-3 rounded-2xl text-white shadow-lg">
        <Database class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl md:text-2xl font-black text-slate-800 uppercase">Registros</h2>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clientes, vehículos y marcas</p>
      </div>
    </div>

    <TabsRegistros v-model="tab" />

    <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar..."
            class="input input-bordered w-full pl-10 rounded-xl bg-slate-50 border-none" />
        </div>
        <div v-if="tab === 'marcas'" class="flex gap-2">
          <input v-model="nuevaMarca" placeholder="Nueva marca" class="input input-bordered rounded-xl" @keyup.enter="crearMarca" />
          <button @click="crearMarca" class="btn bg-lyer-green text-white border-none rounded-xl">
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>

      <TablaRegistros
        :tipo="tab"
        :items="itemsPaginados"
        :loading="loading"
        @editar="abrirEditar"
        @eliminar="eliminar"
      />

      <div class="p-4 border-t bg-slate-50/50">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :total="listaActiva.length"
          :opciones-items="opcionesItems"
        />
      </div>
    </div>

    <ModalRegistroForm
      :is-open="modalOpen"
      :tipo="tab"
      :form="form"
      :marcas="marcas"
      @close="modalOpen = false"
      @guardar="guardar"
      @update:form="form = $event"
    />
  </div>
</template>
