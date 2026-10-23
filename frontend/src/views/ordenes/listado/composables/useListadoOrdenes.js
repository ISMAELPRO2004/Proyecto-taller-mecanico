import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../../stores/auth.js';
import { ordenService } from '../../../../services/ordenService.js';
import { usePaginacion } from '../../../../composables/usePaginacion.js';
import { notify } from '../../../../utils/alerts.js';
import { generarOrdenPDF } from '../../../../utils/ordenPdf.js';
import { nombreClienteOrden } from '../../../../utils/ordenDisplay.js';

export function useListadoOrdenes() {
  const router = useRouter();
  const auth = useAuthStore();
  const ordenes = ref([]);
  const busqueda = ref('');
  const filtroEstado = ref('');
  const cargando = ref(true);
  const idSeleccionado = ref(null);
  const modalAbierto = ref(false);
  const facturaAbierta = ref(false);
  const ordenFactura = ref(null);
  const guardandoFactura = ref(false);
  const imprimiendoId = ref(null);

  const obtenerOrdenes = async () => {
    cargando.value = true;
    try {
      ordenes.value = await ordenService.listar();
    } catch {
      notify.error('Error de Conexión', 'No se pudieron sincronizar las órdenes.');
    } finally {
      cargando.value = false;
    }
  };

  const ordenesFiltradas = computed(() => {
    return ordenes.value.filter((o) => {
      const search = busqueda.value.toLowerCase();
      const cliente = nombreClienteOrden(o).toLowerCase();
      const coincideBusqueda =
        (o.numeroOrden?.toLowerCase() || '').includes(search) ||
        (o.placa?.toLowerCase() || '').includes(search) ||
        cliente.includes(search);
      const coincideEstado = filtroEstado.value === '' || o.estado === filtroEstado.value;
      return coincideBusqueda && coincideEstado;
    });
  });

  const { paginaActual, itemsPorPagina, opcionesItems, totalPaginas, itemsPaginados: ordenesPaginadas, filasVacias } =
    usePaginacion(ordenesFiltradas);

  const verDetalle = (id) => {
    idSeleccionado.value = id;
    modalAbierto.value = true;
  };

  const abrirFactura = (o) => {
    ordenFactura.value = o;
    facturaAbierta.value = true;
  };

  const aceptarOrden = async (o) => {
    const ok = await notify.confirm(
      '¿Aceptar borrador?',
      `La orden ${o.numeroOrden} pasará a estado ACEPTADO y podrá completarse en taller.`
    );
    if (!ok) return;
    try {
      await ordenService.aceptar(o.id);
      notify.success('Orden aceptada', 'Ya puede continuar el trabajo.');
      obtenerOrdenes();
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo aceptar la orden.');
    }
  };

  const cancelarTerminado = (o) => {
    ordenFactura.value = o;
    facturaAbierta.value = true;
  };

  const guardarFactura = async (payload) => {
    if (!ordenFactura.value) return;
    guardandoFactura.value = true;
    const esCancelacion = ordenFactura.value.estado === 'TERMINADO';
    try {
      if (esCancelacion) {
        await ordenService.cambiarEstado(ordenFactura.value.id, { estado: 'CANCELADO', ...payload });
        notify.success('Orden cancelada', 'La facturación quedó registrada.');
      } else {
        await ordenService.actualizarFactura(ordenFactura.value.id, payload);
        notify.success('Factura actualizada');
      }
      facturaAbierta.value = false;
      obtenerOrdenes();
    } catch (e) {
      notify.error(esCancelacion ? 'No se pudo cancelar' : 'No se pudo guardar la factura', e.response?.data?.message);
    } finally {
      guardandoFactura.value = false;
    }
  };

  const eliminarOrden = async (o) => {
    const esBorrador = o.estado === 'EN_ESPERA';
    const ok = await notify.confirm(
      esBorrador ? '¿Eliminar borrador?' : '¿Eliminar orden?',
      esBorrador
        ? `Se borrará ${o.numeroOrden} con su trabajo, sus fotos y, si se crearon solo para este borrador, el vehículo y el cliente.`
        : `Se borrará ${o.numeroOrden} y sus fotos. El cliente, el vehículo y los materiales del catálogo se conservan.`
    );
    if (!ok) return;
    try {
      await ordenService.eliminar(o.id);
      notify.success('Eliminado', esBorrador ? 'Borrador y datos creados con él eliminados.' : 'Orden y fotos eliminadas.');
      obtenerOrdenes();
    } catch (e) {
      notify.error('Error', e.response?.data?.message || e.response?.data?.error || 'No se pudo eliminar la orden.');
    }
  };

  const imprimirOrden = async (o) => {
    if (imprimiendoId.value) return;
    imprimiendoId.value = o.id;
    try {
      const detalle = await ordenService.obtener(o.id);
      await generarOrdenPDF(detalle, {
        verPrecios: ['ADMIN', 'SUPERVISOR'].includes(auth.usuario?.rol),
        accion: 'imprimir',
      });
    } catch {
      notify.error('Error', 'No se pudo preparar la impresión de la orden.');
    } finally {
      imprimiendoId.value = null;
    }
  };

  const irAEditar = (o) => {
    if (o.estado === 'EN_ESPERA') {
      router.push(`/ordenes/editar/${o.id}`);
      return;
    }
    router.push(`/ordenes/taller/${o.id}`);
  };

  onMounted(obtenerOrdenes);

  return {
    busqueda,
    filtroEstado,
    cargando,
    idSeleccionado,
    modalAbierto,
    facturaAbierta,
    ordenFactura,
    guardandoFactura,
    imprimiendoId,
    ordenesFiltradas,
    ordenesPaginadas,
    filasVacias,
    paginaActual,
    itemsPorPagina,
    opcionesItems,
    totalPaginas,
    obtenerOrdenes,
    verDetalle,
    abrirFactura,
    aceptarOrden,
    cancelarTerminado,
    guardarFactura,
    eliminarOrden,
    imprimirOrden,
    irAEditar,
  };
}
