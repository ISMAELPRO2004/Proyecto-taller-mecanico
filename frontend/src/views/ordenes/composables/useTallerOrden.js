import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.js';
import { ordenService } from '../../../services/ordenService.js';
import { catalogoService } from '../../../services/catalogoService.js';
import { usuarioService } from '../../../services/usuarioService.js';
import { notify } from '../../../utils/alerts.js';
import { puedeVerPrecios } from '../../../utils/roles.js';
import { ESTADO, ESTADOS_CERRADOS } from '../../../constants/estadosOrden.js';
import { nombreClienteOrden, marcaVehiculoOrden, modeloVehiculoOrden } from '../../../utils/ordenDisplay.js';
import {
  leerBorradorTaller,
  guardarBorradorTaller,
  marcarRecargaTaller,
  consumirRecargaTaller,
  limpiarBorradorTaller,
  guardarFotoTaller,
  leerFotoTaller,
  borrarFotoTaller,
} from '../../../utils/borradorTaller.js';

/** Estado del taller: ítems, fotos, estado y factura. La vista solo compone la pantalla. */
export function useTallerOrden() {
  const route = useRoute();
  const router = useRouter();
  const auth = useAuthStore();
  const verPrecios = computed(() => puedeVerPrecios(auth.usuario?.rol));
  const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
  const fotos = ref({ registro: '', desarrollo: '' });
  const subiendoFoto = ref('');
  const cargando = ref(true);
  const guardando = ref(false);
  const restaurando = ref(true);
  const responsables = ref([]);
  const catalogos = ref({ materiales: [], servicios: [], terceros: [] });

  const form = ref({
    numeroOrden: '',
    placa: '',
    cliente: '',
    marca: '',
    modelo: '',
    descripcionInformal: '',
    trabajoSolicitado: '',
    estado: ESTADO.ACEPTADO,
    responsableId: '',
    materiales: [],
    servicios: [],
    terceros: [],
    requiereFactura: false,
    numeroFactura: '',
    montoFactura: '',
  });

const selector = ref({ abierto: false, tipo: 'materiales', titulo: '' });
const modalFactura = ref(false);
const estadoAntes = ref(ESTADO.ACEPTADO);

  const titulosCatalogo = {
    materiales: 'Repuestos e insumos',
    servicios: 'Mano de obra',
    terceros: 'Trabajos externos',
  };

  const idsSeleccionados = computed(() => {
    if (selector.value.tipo === 'materiales') return form.value.materiales.map((m) => m.materialId);
    if (selector.value.tipo === 'servicios') return form.value.servicios.map((s) => s.servicioId);
    return form.value.terceros.map((t) => t.terceroId);
  });

  const itemsSelector = computed(() => catalogos.value[selector.value.tipo] || []);

  const subtotales = computed(() => {
    const insumos = form.value.materiales.reduce(
      (acc, m) => acc + Number(m.cantidad || 0) * Number(m.precioAlMomento || 0),
      0
    );
    const manoObra = form.value.servicios.reduce((acc, s) => acc + Number(s.monto || 0), 0);
    const terceros = form.value.terceros.reduce((acc, t) => acc + Number(t.monto || 0), 0);
    return { insumos, manoObra, terceros };
  });

  const totalFinal = computed(() => (
    subtotales.value.insumos + subtotales.value.manoObra + subtotales.value.terceros
  ));

  const facturaPendiente = computed(
    () => esAdmin.value
      && form.value.estado === ESTADO.CANCELADO
      && form.value.requiereFactura
      && !String(form.value.numeroFactura || '').trim()
  );

  const cargarFoto = async (tipo, ruta) => {
    if (fotos.value[tipo]) URL.revokeObjectURL(fotos.value[tipo]);
    fotos.value[tipo] = '';
    if (!ruta) return;
    try {
      const blob = await ordenService.descargarFoto(route.params.id, tipo);
      fotos.value[tipo] = URL.createObjectURL(blob);
    } catch {
      fotos.value[tipo] = '';
    }
  };

  const claveFoto = (tipo) => `${tipo}-${route.params.id}`;

  const mostrarArchivo = (tipo, file) => {
    if (fotos.value[tipo]?.startsWith('blob:')) URL.revokeObjectURL(fotos.value[tipo]);
    fotos.value[tipo] = URL.createObjectURL(file);
  };

  const subirFoto = async (tipo, file, { recuperada = false } = {}) => {
    subiendoFoto.value = tipo;
    mostrarArchivo(tipo, file);
    await guardarFotoTaller(claveFoto(tipo), file).catch(() => {});
    try {
      const orden = await ordenService.subirFoto(route.params.id, tipo, file);
      await borrarFotoTaller(claveFoto(tipo)).catch(() => {});
      await cargarFoto(tipo, tipo === 'registro' ? orden.fotoRegistro : orden.fotoDesarrollo);
      const nombre = tipo === 'registro' ? 'registro' : 'desarrollo';
      notify[recuperada ? 'info' : 'success'](
        recuperada ? `Foto de ${nombre} recuperada` : `Foto de ${nombre} actualizada`,
      );
    } catch (e) {
      const status = e.response?.status;
      if (status && status < 500) await borrarFotoTaller(claveFoto(tipo)).catch(() => {});
      notify.error('No se pudo subir la foto', e.response?.data?.message);
    } finally {
      subiendoFoto.value = '';
    }
  };

  const subirDesarrollo = (file) => subirFoto('desarrollo', file);
  const subirRegistroAdmin = (file) => subirFoto('registro', file);

  const quitarDesarrollo = async () => {
    subiendoFoto.value = 'desarrollo';
    await borrarFotoTaller(claveFoto('desarrollo')).catch(() => {});
    try {
      await ordenService.quitarFoto(route.params.id, 'desarrollo');
      if (fotos.value.desarrollo) URL.revokeObjectURL(fotos.value.desarrollo);
      fotos.value.desarrollo = '';
    } catch (e) {
      notify.error('No se pudo quitar', e.response?.data?.message);
    } finally {
      subiendoFoto.value = '';
    }
  };

  const quitarRegistroAdmin = async () => {
    subiendoFoto.value = 'registro';
    await borrarFotoTaller(claveFoto('registro')).catch(() => {});
    try {
      await ordenService.quitarFoto(route.params.id, 'registro');
      if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
      fotos.value.registro = '';
    } catch (e) {
      notify.error('No se pudo quitar', e.response?.data?.message);
    } finally {
      subiendoFoto.value = '';
    }
  };

  const abrirSelector = (tipo) => {
    selector.value = { abierto: true, tipo, titulo: titulosCatalogo[tipo] };
  };

  const confirmarCatalogo = (seleccionados) => {
    const tipo = selector.value.tipo;
    if (tipo === 'materiales') {
      const actuales = new Map(form.value.materiales.map((m) => [m.materialId, m]));
      form.value.materiales = seleccionados.map((item) => actuales.get(item.id) || {
        materialId: item.id,
        descripcion: item.descripcion,
        cantidad: 1,
        precioAlMomento: item.precioBase ?? null,
      });
    } else if (tipo === 'servicios') {
      const actuales = new Map(form.value.servicios.map((s) => [s.servicioId, s]));
      form.value.servicios = seleccionados.map((item) => actuales.get(item.id) || {
        servicioId: item.id,
        descripcion: item.descripcion,
        monto: item.precioBase ?? null,
      });
    } else {
      const actuales = new Map(form.value.terceros.map((t) => [t.terceroId, t]));
      form.value.terceros = seleccionados.map((item) => actuales.get(item.id) || {
        terceroId: item.id,
        descripcion: item.descripcion,
        monto: item.precioBase ?? null,
        responsable: item.responsable || '',
      });
    }
    selector.value.abierto = false;
  };

  const cambiarEstado = (nuevo) => {
    if (!nuevo || nuevo === ESTADO.CANCELADO || nuevo === form.value.estado) return;
    form.value.estado = nuevo;
  };

const aplicarFactura = ({ requiereFactura, numeroFactura, montoFactura }) => {
  form.value.requiereFactura = requiereFactura;
  form.value.numeroFactura = numeroFactura || '';
  form.value.montoFactura = montoFactura ?? '';
  form.value.estado = ESTADO.CANCELADO;
  modalFactura.value = false;
};

  const cancelarFactura = () => {
    form.value.estado = estadoAntes.value;
    modalFactura.value = false;
  };

  const payload = () => {
    const body = {
      descripcionInformal: form.value.descripcionInformal || null,
      trabajoSolicitado: form.value.trabajoSolicitado || null,
      responsableId: form.value.responsableId || null,
      estado: form.value.estado,
      materiales: form.value.materiales.map((m) => ({
        materialId: Number(m.materialId),
        cantidad: Number(m.cantidad) || 1,
        precioAlMomento: verPrecios.value ? m.precioAlMomento : null,
      })),
      servicios: form.value.servicios.map((s) => ({
        servicioId: Number(s.servicioId),
        descripcion: s.descripcion,
        monto: verPrecios.value ? s.monto : null,
      })),
      terceros: form.value.terceros.map((t) => ({
        terceroId: Number(t.terceroId),
        descripcion: t.descripcion,
        monto: verPrecios.value ? t.monto : null,
      })),
    };

    if (form.value.estado === ESTADO.CANCELADO) {
      body.requiereFactura = form.value.requiereFactura;
      body.numeroFactura = form.value.numeroFactura || null;
      body.montoFactura = form.value.montoFactura === '' ? null : form.value.montoFactura;
    }

    return body;
  };

  const guardar = async () => {
    if (modalFactura.value) return;
    if (form.value.estado === ESTADO.CANCELADO && form.value.requiereFactura === undefined) {
      modalFactura.value = true;
      return;
    }
    guardando.value = true;
    try {
      await ordenService.actualizar(route.params.id, payload());
      await limpiarBorradorTaller();
      notify.success('Orden actualizada');
      router.push('/ordenes');
    } catch (error) {
      notify.error('No se pudo guardar', error.response?.data?.message);
    } finally {
      guardando.value = false;
    }
  };

  const mapOrden = (orden) => {
    const precioVisible = (aplicado, base) => {
      const valor = (aplicado !== null && aplicado !== undefined && aplicado !== '')
        ? aplicado
        : (verPrecios.value ? base : aplicado);
      if (valor === null || valor === undefined || valor === '') return null;
      const numero = Number(valor);
      return Number.isNaN(numero) ? null : numero;
    };

    form.value = {
      numeroOrden: orden.numeroOrden || '',
      placa: orden.placa || orden.vehiculo?.placa || '',
      cliente: nombreClienteOrden(orden),
      marca: marcaVehiculoOrden(orden),
      modelo: modeloVehiculoOrden(orden),
      documento: orden.cliente?.numeroDocumento
        ? `${orden.cliente.tipoDocumento || 'DOC'}: ${orden.cliente.numeroDocumento}`
        : '',
      kilometraje: orden.vehiculo?.kilometraje ?? null,
      fechaCreacion: orden.fechaCreacion || null,
      descripcionInformal: orden.descripcionInformal || '',
      trabajoSolicitado: orden.trabajoSolicitado || '',
      estado: orden.estado,
      responsableId: orden.responsableId || '',
      requiereFactura: orden.requiereFactura || false,
      numeroFactura: orden.numeroFactura || '',
      montoFactura: orden.montoFactura ?? '',
      materiales: (orden.materiales || []).map((m) => ({
        materialId: m.materialId,
        descripcion: m.material?.descripcion || '',
        cantidad: m.cantidad,
        precioAlMomento: precioVisible(m.precioAplicado, m.material?.precioBase),
      })),
      servicios: (orden.servicios || []).map((s) => ({
        servicioId: s.servicioId,
        descripcion: s.descripcion || s.servicio?.descripcion || '',
        monto: precioVisible(s.monto, s.servicio?.precioBase),
      })),
      terceros: (orden.terceros || []).map((t) => ({
        terceroId: t.terceroId,
        descripcion: t.descripcion || t.tercero?.descripcion || '',
        monto: precioVisible(t.monto, t.tercero?.precioBase),
        responsable: t.tercero?.responsable || '',
      })),
    };
  };

  const firmaEditable = (datos) => JSON.stringify({
    trabajoSolicitado: (datos.trabajoSolicitado || '').trim(),
    estado: datos.estado || '',
    responsableId: datos.responsableId ? String(datos.responsableId) : '',
    materiales: (datos.materiales || []).map((m) => ({
      id: Number(m.materialId),
      cantidad: Number(m.cantidad) || 0,
      precio: m.precioAlMomento === '' || m.precioAlMomento == null ? null : Number(m.precioAlMomento),
      descripcion: m.descripcion || '',
    })),
    servicios: (datos.servicios || []).map((s) => ({
      id: Number(s.servicioId),
      monto: s.monto === '' || s.monto == null ? null : Number(s.monto),
      descripcion: s.descripcion || '',
    })),
    terceros: (datos.terceros || []).map((t) => ({
      id: Number(t.terceroId),
      monto: t.monto === '' || t.monto == null ? null : Number(t.monto),
      descripcion: t.descripcion || '',
      responsable: t.responsable || '',
    })),
  });

  const snapshotLocal = () => ({
    ordenId: Number(route.params.id),
    ruta: window.location.pathname,
    trabajoSolicitado: form.value.trabajoSolicitado,
    estado: form.value.estado,
    responsableId: form.value.responsableId,
    materiales: form.value.materiales,
    servicios: form.value.servicios,
    terceros: form.value.terceros,
  });

  const persistirLocal = () => {
    if (restaurando.value || !route.params.id) return;
    guardarBorradorTaller(snapshotLocal());
  };

  const esRecargaDeEstaPantalla = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const misma = !!nav?.name?.includes(window.location.pathname);
    if (misma && nav.type === 'reload') return true;
    if (misma && consumirRecargaTaller()) return true;
    return false;
  };

  const aplicarBorrador = (local) => {
    form.value = {
      ...form.value,
      trabajoSolicitado: local.trabajoSolicitado ?? form.value.trabajoSolicitado,
      estado: local.estado && local.estado !== ESTADO.CANCELADO ? local.estado : form.value.estado,
      responsableId: local.responsableId ?? form.value.responsableId,
      materiales: Array.isArray(local.materiales) ? local.materiales : form.value.materiales,
      servicios: Array.isArray(local.servicios) ? local.servicios : form.value.servicios,
      terceros: Array.isArray(local.terceros) ? local.terceros : form.value.terceros,
    };
  };

  const recuperarFotoPendiente = async (tipo) => {
    if (tipo === 'registro' && !esAdmin.value) return false;
    const file = await leerFotoTaller(claveFoto(tipo)).catch(() => null);
    if (!file) return false;
    await subirFoto(tipo, file, { recuperada: true });
    return true;
  };

  const inicializar = async () => {
    restaurando.value = true;
    cargando.value = true;
    const recarga = esRecargaDeEstaPantalla();
    const local = leerBorradorTaller();
    try {
      const [orden, usuarios, materiales, servicios, terceros] = await Promise.all([
        ordenService.obtener(route.params.id),
        usuarioService.listar().catch(() => []),
        catalogoService.listarMateriales().catch(() => []),
        catalogoService.listarServicios().catch(() => []),
        catalogoService.listarTerceros().catch(() => []),
      ]);

      if (orden.estado === ESTADO.EN_ESPERA) {
        router.replace(`/ordenes/editar/${orden.id}`);
        return;
      }
      if (orden.estaCerrada || ESTADOS_CERRADOS.includes(orden.estado)) {
        notify.info('Orden no editable', 'Esta orden ya no se puede completar.');
        router.replace('/ordenes');
        return;
      }

      mapOrden(orden);
      const hayLocal = local && Number(local.ordenId) === Number(orden.id);
      const distinto = hayLocal && firmaEditable(local) !== firmaEditable(form.value);
      if (recarga && distinto) {
        aplicarBorrador(local);
        notify.info('Borrador recuperado', 'Lo que habías escrito sigue en la orden.');
      }
      await Promise.all([
        cargarFoto('registro', orden.fotoRegistro),
        cargarFoto('desarrollo', orden.fotoDesarrollo),
      ]);
      responsables.value = (usuarios || []).filter((u) => u.activo && ['TECNICO', 'SUPERVISOR'].includes(u.rol));
      catalogos.value = { materiales, servicios, terceros };
      restaurando.value = false;
      persistirLocal();
      await Promise.all([
        recuperarFotoPendiente('desarrollo'),
        recuperarFotoPendiente('registro'),
      ]);
    } catch {
      notify.error('Error', 'No se pudo cargar la orden.');
      router.replace('/ordenes');
    } finally {
      restaurando.value = false;
      cargando.value = false;
    }
  };

  watch(form, () => persistirLocal(), { deep: true });

  const alOcultarPagina = () => {
    persistirLocal();
    marcarRecargaTaller();
  };

  const alCambiarVisibilidad = () => {
    if (document.visibilityState === 'hidden') persistirLocal();
  };

  onMounted(() => {
    window.addEventListener('pagehide', alOcultarPagina);
    window.addEventListener('beforeunload', alOcultarPagina);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    inicializar();
  });
  onUnmounted(() => {
    window.removeEventListener('pagehide', alOcultarPagina);
    window.removeEventListener('beforeunload', alOcultarPagina);
    document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    if (fotos.value.registro) URL.revokeObjectURL(fotos.value.registro);
    if (fotos.value.desarrollo) URL.revokeObjectURL(fotos.value.desarrollo);
  });

  return {
    router, cargando, form, cambiarEstado, facturaPendiente, fotos, esAdmin, subiendoFoto,
    subirRegistroAdmin, quitarRegistroAdmin, subirDesarrollo, quitarDesarrollo, verPrecios,
    abrirSelector, responsables, subtotales, totalFinal, guardar, selector, itemsSelector, idsSeleccionados,
    confirmarCatalogo, modalFactura, cancelarFactura, aplicarFactura, guardando,
  };
}
