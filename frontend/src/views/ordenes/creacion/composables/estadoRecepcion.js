import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../../../stores/auth.js';

export function clienteVacio(extra = {}) {
  return {
    id: null,
    tipoCliente: 'PERSONA',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombreRazonSocial: '',
    representante: '',
    celular: '',
    correo: '',
    ...extra,
  };
}

export function mapCliente(cliente) {
  return {
    id: cliente.id || null,
    tipoCliente: cliente.tipoCliente || 'PERSONA',
    tipoDocumento: cliente.tipoDocumento || 'DNI',
    numeroDocumento: cliente.numeroDocumento || '',
    nombreRazonSocial: cliente.nombreRazonSocial || '',
    representante: cliente.representante || '',
    celular: cliente.celular || '',
    correo: cliente.correo || '',
  };
}

/** Refs y computados compartidos por vehículo, cliente y recepción. */
export function crearEstadoRecepcion() {
  const route = useRoute();
  const router = useRouter();
  const auth = useAuthStore();
  const esEdicion = computed(() => !!route.params.id);
  const ordenId = ref(route.params.id ? Number(route.params.id) : null);
  const cargando = ref(false);
  const guardando = ref(false);
  const guardandoPaso = ref(false);
  const marcas = ref([]);
  const historialOrdenes = ref([]);
  const placaConsultada = ref(false);
  const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
  const fotoSrc = ref('');
  const archivoRegistro = ref(null);
  const subiendoFoto = ref(false);

  const paso = ref(1);
  const pasoRecepcion = ref(null);
  const vehiculoEditable = ref(false);
  const clienteEditable = ref(false);
  const editandoVehiculo = ref(false);
  const editandoCliente = ref(false);
  const pasoOrigenEdicion = ref(null);
  const vehiculoEraNuevo = ref(false);
  const clienteEraNuevo = ref(true);
  const clienteConfirmado = ref(false);
  const clienteConsultado = ref(false);

  const form = ref({
    cliente: clienteVacio(),
    vehiculo: {
      placa: '',
      marcaId: '',
      modelo: '',
      horometro: null,
      kilometraje: null,
    },
    descripcionInformal: '',
    trabajoSolicitado: '',
    estadoIngreso: 'ACEPTADO',
    observacionIngreso: '',
    fotoRegistro: '',
  });

  const errores = ref({});
  const restaurando = ref(true);
  const vehiculoGuardado = ref(null);
  const clienteGuardado = ref(null);

  const recepcionCompleta = computed(() => pasoRecepcion.value == null && !!ordenId.value);
  const vehiculoBloqueado = computed(() => {
    if (editandoVehiculo.value) return false;
    if (!vehiculoEraNuevo.value && placaConsultada.value) return true;
    if (ordenId.value && placaConsultada.value) return true;
    if (paso.value > 1) return true;
    return false;
  });
  const clienteBloqueado = computed(() => {
    if (editandoCliente.value) return false;
    if (!clienteEraNuevo.value && clienteConsultado.value) return true;
    if (clienteConfirmado.value) return true;
    if (paso.value > 2) return true;
    return false;
  });
  const puedeEditarVehiculoUI = computed(() => vehiculoEditable.value);
  const puedeEditarClienteUI = computed(() => clienteEditable.value);
  const nombreClienteBloqueado = computed(() => {
    if (editandoCliente.value) return false;
    if (clienteConfirmado.value) return true;
    return false;
  });
  const puedeCambiarRegistro = computed(() =>
    !recepcionCompleta.value || !form.value.fotoRegistro || esAdmin.value
  );
  const puedeQuitarRegistro = computed(() =>
    !!archivoRegistro.value || (esAdmin.value && !!form.value.fotoRegistro)
  );

  const resumenVehiculo = computed(() => {
    const v = form.value.vehiculo;
    const marca = marcas.value.find((m) => String(m.id) === String(v.marcaId));
    return {
      placa: v.placa,
      marca: marca?.nombre || '—',
      modelo: v.modelo || '—',
      kilometraje: v.kilometraje,
      horometro: v.horometro,
    };
  });

  const resumenCliente = computed(() => {
    const c = form.value.cliente;
    const documento = c.numeroDocumento
      ? `${c.tipoDocumento || 'DOC'}: ${c.numeroDocumento}`
      : '';
    return {
      nombre: c.nombreRazonSocial || '—',
      documento,
      representante: c.representante || '',
    };
  });

  const pasoAlcanzado = computed(() => {
    if (!ordenId.value) return 1;
    if (pasoRecepcion.value == null || pasoRecepcion.value >= 2) return 3;
    return 2;
  });

  const recordarGuardado = () => {
    vehiculoGuardado.value = { ...form.value.vehiculo };
    clienteGuardado.value = { ...form.value.cliente };
  };

  const claveFoto = () => String(ordenId.value || 'nueva');

  return {
    route,
    router,
    auth,
    esEdicion,
    ordenId,
    cargando,
    guardando,
    guardandoPaso,
    marcas,
    historialOrdenes,
    placaConsultada,
    esAdmin,
    fotoSrc,
    archivoRegistro,
    subiendoFoto,
    paso,
    pasoRecepcion,
    vehiculoEditable,
    clienteEditable,
    editandoVehiculo,
    editandoCliente,
    pasoOrigenEdicion,
    vehiculoEraNuevo,
    clienteEraNuevo,
    clienteConfirmado,
    clienteConsultado,
    form,
    errores,
    restaurando,
    vehiculoGuardado,
    clienteGuardado,
    recepcionCompleta,
    vehiculoBloqueado,
    clienteBloqueado,
    puedeEditarVehiculoUI,
    puedeEditarClienteUI,
    nombreClienteBloqueado,
    puedeCambiarRegistro,
    puedeQuitarRegistro,
    resumenVehiculo,
    resumenCliente,
    pasoAlcanzado,
    recordarGuardado,
    claveFoto,
  };
}
