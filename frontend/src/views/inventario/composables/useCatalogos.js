import { ref, onMounted, computed } from 'vue';
import { catalogoService } from '../../../services/catalogoService.js';
import { usePaginacion } from '../../../composables/usePaginacion.js';
import { notify } from '../../../utils/alerts.js';
import { tabsCatalogo, categoriaPorId } from '../categorias/index.js';

export function useCatalogos() {
  const tabActiva = ref('materiales');
  const lista = ref([]);
  const loading = ref(false);
  const busqueda = ref('');
  const modalOpen = ref(false);
  const editando = ref(false);
  const form = ref({ id: null, descripcion: '', precioBase: 0, responsable: '' });

  const categoria = computed(() => categoriaPorId(tabActiva.value));
  const nombreTabActiva = computed(() => categoria.value.singular);
  const mostrarResponsable = computed(() => categoria.value.mostrarResponsable);

  const cargarDatos = async () => {
    loading.value = true;
    try {
      const data = await categoriaPorId(tabActiva.value).listar();
      lista.value = Array.isArray(data) ? data : [];
    } catch {
      notify.error('Error', 'No se pudieron sincronizar los datos');
    } finally {
      loading.value = false;
    }
  };

  const listaFiltrada = computed(() => {
    const q = busqueda.value.toLowerCase();
    return lista.value.filter((item) =>
      item.descripcion.toLowerCase().includes(q)
      || (item.responsable || '').toLowerCase().includes(q)
    );
  });

  const { paginaActual, itemsPorPagina, opcionesItems, totalPaginas, itemsPaginados: listaPaginada, filasVacias } =
    usePaginacion(listaFiltrada, { opcionesItems: [5, 10, 20] });

  const guardar = async () => {
    if (!form.value.descripcion || form.value.precioBase <= 0) {
      return notify.error('Campos incompletos', 'Por favor revisa la descripción y el precio.');
    }
    if (tabActiva.value === 'terceros' && !form.value.responsable?.trim()) {
      return notify.error('Campos incompletos', 'Indica el responsable del tercero.');
    }
    try {
      if (editando.value) {
        await catalogoService.actualizar(categoria.value.endpoint, form.value.id, form.value);
        notify.success('Actualizado', 'El ítem se actualizó correctamente.');
      } else {
        await catalogoService.crear(categoria.value.endpoint, form.value);
        notify.success('Registrado', 'Nuevo ítem añadido al catálogo.');
      }
      cerrarModal();
      cargarDatos();
    } catch {
      notify.error('Error al guardar');
    }
  };

  const eliminar = async (id) => {
    const confirmado = await notify.confirm('¿Eliminar ítem?', 'Si este ítem está en uso en órdenes antiguas, no podrá eliminarse.');
    if (!confirmado) return;
    try {
      await catalogoService.eliminar(categoria.value.endpoint, id);
      notify.success('Eliminado', 'Ítem removido del catálogo.');
      cargarDatos();
    } catch {
      notify.error('Error', 'No se puede eliminar: el ítem está vinculado a órdenes existentes.');
    }
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

  return {
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
  };
}
