import { computed, onMounted, ref, watch } from 'vue';
import { clienteService } from '../../../services/clienteService.js';
import { vehiculoService } from '../../../services/vehiculoService.js';
import { notify } from '../../../utils/alerts.js';
import { usePaginacion } from '../../../composables/usePaginacion.js';
import { tabsRegistro, categoriaPorId } from '../categorias/index.js';
import { categoriaMarcas } from '../categorias/marcas.js';

export function useRegistros() {
  const tab = ref('clientes');
  const busqueda = ref('');
  const loading = ref(false);
  const clientes = ref([]);
  const vehiculos = ref([]);
  const marcas = ref([]);
  const modalOpen = ref(false);
  const form = ref({});
  const errores = ref({});
  const nuevaMarca = ref('');

  const categoria = computed(() => categoriaPorId(tab.value));

  const listaActiva = computed(() => {
    const q = busqueda.value.trim().toLowerCase();
    const lista = tab.value === 'clientes'
      ? clientes.value
      : tab.value === 'vehiculos'
        ? vehiculos.value
        : marcas.value;
    return categoria.value.filtrar(lista, q);
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
    form.value = categoria.value.formDesde(item);
    errores.value = {};
    modalOpen.value = true;
  };

  const actualizarForm = (next) => {
    form.value = next;
    errores.value = {};
  };

  const guardar = async () => {
    const e = categoria.value.validar?.(form.value) || {};
    errores.value = e;
    if (Object.keys(e).length) {
      return notify.error('Revisa los datos', Object.values(e)[0]);
    }
    try {
      await categoria.value.guardar(form.value);
      notify.success('Guardado', 'Registro actualizado.');
      modalOpen.value = false;
      errores.value = {};
      cargar();
    } catch (err) {
      notify.error('Error', err.response?.data?.message || 'No se pudo guardar.');
    }
  };

  const eliminar = async (item) => {
    const ok = await notify.confirm('¿Eliminar registro?', 'Solo se puede si no tiene órdenes o vehículos vinculados.');
    if (!ok) return;
    try {
      await categoria.value.eliminar(item);
      notify.success('Eliminado', 'Registro removido.');
      cargar();
    } catch (e) {
      notify.error('No se pudo eliminar', e.response?.data?.message || 'Tiene registros asociados.');
    }
  };

  const crearMarca = async () => {
    if (!nuevaMarca.value.trim()) {
      return notify.error('Campos incompletos', 'Escribe el nombre de la marca.');
    }
    try {
      await categoriaMarcas.crear(nuevaMarca.value);
      nuevaMarca.value = '';
      notify.success('Marca creada', '');
      cargar();
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo crear la marca.');
    }
  };

  const cerrarModal = () => {
    modalOpen.value = false;
    errores.value = {};
  };

  onMounted(cargar);

  return {
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
  };
}
