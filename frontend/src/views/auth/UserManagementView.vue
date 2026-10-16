<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { agruparLogs } from '../../utils/agruparLogs.js';
import { usuarioService } from '../../services/usuarioService.js';
import { notify } from '../../utils/alerts.js';
import LogDetalleModal from './componentes/LogDetalleModal.vue';
import Tabs from '../../components/ui/Tabs.vue';
import GridUsuarios from './componentes/GridUsuarios.vue';
import FiltrosAuditoria from './componentes/FiltrosAuditoria.vue';
import TablaAuditoria from './componentes/TablaAuditoria.vue';
import ModalUsuarioForm from './componentes/ModalUsuarioForm.vue';
import Paginador from '../../components/ui/Paginador.vue';
import { ShieldCheck, UserPlus, Users, History } from 'lucide-vue-next';

const tabsSeguridad = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'logs', label: 'Auditoría', icon: History },
];

// ── ESTADO GENERAL ────────────────────────────────────────────────────────────
const tabActiva = ref('usuarios');
const loading = ref(false);

// ── USUARIOS ──────────────────────────────────────────────────────────────────
const usuarios = ref([]);
const modalOpen = ref(false);
const editando = ref(false);
const form = ref({
  id: null, nombreCompleto: '', username: '', password: '', rol: 'RECEPCIONISTA'
});

// ── LOGS ──────────────────────────────────────────────────────────────────────
const logs = ref([]);
const logsVisibles = computed(() => agruparLogs(logs.value));
const logSeleccionado = ref(null);
const modalLogOpen = ref(false);

// Filtros del lado del servidor
const busqueda = ref('');
const filtroUsuarioId = ref('');

// Paginación sincronizada con el backend
const paginaActual = ref(1);
const itemsPorPagina = ref(10);
const totalLogs = ref(0);
const totalPaginas = ref(1);
const opcionesItems = [10, 20, 50];

// ── CARGA DE DATOS ────────────────────────────────────────────────────────────
const cargarUsuarios = async () => {
  loading.value = true;
  try {
    usuarios.value = await usuarioService.listar();
  } catch {
    notify.error('Error', 'No se pudo cargar la lista de usuarios.');
  } finally {
    loading.value = false;
  }
};

const cargarLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: paginaActual.value,
      limit: itemsPorPagina.value,
    };
    if (busqueda.value.trim()) params.accion = busqueda.value.trim();
    if (filtroUsuarioId.value) params.usuarioId = filtroUsuarioId.value;

    const data = await usuarioService.listarLogs(params);
    logs.value = data.data;
    totalLogs.value = data.total;
    totalPaginas.value = data.totalPages;
  } catch {
    notify.error('Error', 'No se pudo cargar el historial de auditoría.');
  } finally {
    loading.value = false;
  }
};

const cargarDatos = () => {
  if (tabActiva.value === 'usuarios') cargarUsuarios();
  else cargarLogs();
};

watch([busqueda, filtroUsuarioId, itemsPorPagina], () => {
  paginaActual.value = 1;
  if (tabActiva.value === 'logs') cargarLogs();
});

watch(tabActiva, () => {
  paginaActual.value = 1;
  busqueda.value = '';
  cargarDatos();
});

watch(paginaActual, () => {
  if (tabActiva.value === 'logs') cargarLogs();
});

onMounted(cargarDatos);

// ── USUARIOS: ACCIONES ────────────────────────────────────────────────────────
const abrirCrear = () => {
  editando.value = false;
  form.value = { id: null, nombreCompleto: '', username: '', password: '', rol: 'RECEPCIONISTA' };
  modalOpen.value = true;
};

const abrirEditar = (u) => {
  editando.value = true;
  form.value = { id: u.id, nombreCompleto: u.nombreCompleto, username: u.username, password: '', rol: u.rol };
  modalOpen.value = true;
};

const guardarUsuario = async () => {
  try {
    if (editando.value) {
      await usuarioService.editar(form.value.id, form.value);
      notify.success('¡Actualizado!', 'Perfil modificado correctamente.');
    } else {
      await usuarioService.crear(form.value);
      notify.success('¡Creado!', 'Nuevo usuario registrado.');
    }
    modalOpen.value = false;
    cargarUsuarios();
  } catch (e) {
    notify.error('Error', e.response?.data?.error || 'No se pudo procesar la solicitud.');
  }
};

const toggleUsuario = async (u) => {
  const accion = u.activo ? 'desactivar' : 'activar';
  const ok = await notify.confirm(
    `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
    `El usuario ${u.nombreCompleto} ${u.activo ? 'ya no podrá' : 'podrá nuevamente'} ingresar al sistema.`
  );
  if (!ok) return;
  try {
    await usuarioService.toggleActivo(u.id);
    notify.success('¡Listo!', `Usuario ${accion === 'desactivar' ? 'desactivado' : 'activado'}.`);
    cargarUsuarios();
  } catch {
    notify.error('Error', 'Operación no permitida.');
  }
};

const eliminarUsuario = async (u) => {
  const ok = await notify.confirm(
    '¿Eliminar usuario permanentemente?',
    `${u.nombreCompleto} será borrado del sistema. Esta acción no se puede deshacer.`
  );
  if (!ok) return;
  try {
    await usuarioService.eliminar(u.id);
    notify.success('Eliminado', 'Usuario borrado del sistema.');
    cargarUsuarios();
  } catch (e) {
    notify.error('Error', e.response?.data?.error || 'No se pudo eliminar. Puede tener registros asociados.');
  }
};

// ── LOGS: ACCIONES ────────────────────────────────────────────────────────────
const verDetalleLog = (log) => {
  logSeleccionado.value = log;
  modalLogOpen.value = true;
};

const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 3) return [1, 2, 3, 4, 5];
  if (actual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [actual - 2, actual - 1, actual, actual + 1, actual + 2];
});
</script>

<template>
  <div class="space-y-5 animate-fade-in">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <ShieldCheck class="h-6 w-6" />
        </div>
        <div>
          <h2 class="font-display text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">Seguridad</h2>
          <p class="font-mono text-[11px] uppercase tracking-widest text-slate-400">Usuarios y auditoría</p>
        </div>
      </div>
      <button
        v-if="tabActiva === 'usuarios'"
        type="button"
        class="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-lyer-accent px-5 text-sm font-bold tracking-wide text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)]"
        @click="abrirCrear"
      >
        <UserPlus class="h-5 w-5" />
        Nuevo acceso
      </button>
    </div>

    <Tabs v-model="tabActiva" :items="tabsSeguridad" oscuro />

    <GridUsuarios
      v-if="tabActiva === 'usuarios'"
      :usuarios="usuarios"
      :loading="loading"
      @editar="abrirEditar"
      @toggle="toggleUsuario"
      @eliminar="eliminarUsuario"
    />

    <div v-else class="overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <FiltrosAuditoria
        v-model:busqueda="busqueda"
        v-model:filtroUsuarioId="filtroUsuarioId"
        :usuarios="usuarios"
      />

      <TablaAuditoria
        :logs="logsVisibles"
        :loading="loading"
        @ver-detalle="verDetalleLog"
      />

      <div class="border-t border-[#4a2870]/40 bg-[#160a24] px-4 py-4 md:px-6">
        <Paginador
          v-model="paginaActual"
          v-model:items-por-pagina="itemsPorPagina"
          :total-paginas="totalPaginas"
          :opciones-items="opcionesItems"
          :total="totalLogs"
          :paginas-visibles="paginasVisibles"
          mostrar-label-ver
          oscuro
          total-sufijo="registros"
        />
      </div>
    </div>

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
