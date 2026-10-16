<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Database, Plus, Search } from 'lucide-vue-next';
import { clienteService } from '../../services/clienteService.js';
import { vehiculoService } from '../../services/vehiculoService.js';
import { notify } from '../../utils/alerts.js';
import { usePaginacion } from '../../composables/usePaginacion.js';
import Paginador from '../../components/ui/Paginador.vue';
import Tabs from '../../components/ui/Tabs.vue';
import TablaRegistros from './componentes/TablaRegistros.vue';
import ModalRegistroForm from './componentes/ModalRegistroForm.vue';

const tabsRegistro = [
  { id: 'clientes', label: 'Clientes' },
  { id: 'vehiculos', label: 'Vehículos' },
  { id: 'marcas', label: 'Marcas' },
];
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
      !q || c.nombreRazonSocial.toLowerCase().includes(q) || (c.numeroDocumento || '').toLowerCase().includes(q)
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
  <div class="space-y-5 animate-fade-in">
    <div class="flex items-center gap-3">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
        <Database class="h-6 w-6" />
      </div>
      <div>
        <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">Registros</h2>
        <p class="font-mono text-[11px] uppercase tracking-widest text-slate-400">Clientes, vehículos y marcas</p>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div class="space-y-4 border-b border-[#4a2870]/40 px-4 py-4 md:px-6">
        <Tabs v-model="tab" :items="tabsRegistro" oscuro />
        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="relative flex-1">
            <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar..."
              class="h-11 w-full rounded-xl border border-[#4a2870]/60 bg-[#140a22] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none"
            />
          </div>
          <div v-if="tab === 'marcas'" class="flex gap-2">
            <input
              v-model="nuevaMarca"
              type="text"
              placeholder="Nombre de la marca"
              aria-label="Nombre de la marca"
              class="h-11 w-full rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none sm:w-56"
              @keyup.enter="crearMarca"
            />
            <button
              type="button"
              title="Crear marca"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lyer-accent text-[#1a0633]"
              @click="crearMarca"
            >
              <Plus class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <TablaRegistros
        :tipo="tab"
        :items="itemsPaginados"
        :loading="loading"
        @editar="abrirEditar"
        @eliminar="eliminar"
      />

      <div class="border-t border-[#4a2870]/40 bg-[#160a24] px-4 py-4 md:px-6">
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
      :marcas="marcas"
      @close="modalOpen = false"
      @guardar="guardar"
      @update:form="form = $event"
    />
  </div>
</template>
