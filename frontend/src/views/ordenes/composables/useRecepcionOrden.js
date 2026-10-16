import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.js';
import { ordenService } from '../../../services/ordenService.js';
import { vehiculoService } from '../../../services/vehiculoService.js';
import { notify } from '../../../utils/alerts.js';
import { FORMATO_PLACA, MENSAJE_FORMATO_PLACA, errorPlacaEnCurso } from '../../../utils/placa.js';
import {
  leerBorradorLocal,
  guardarBorradorLocal,
  limpiarBorradorLocal,
  marcarRecargaRecepcion,
  consumirRecargaRecepcion,
  guardarFotoLocal,
  leerFotoLocal,
  borrarFotoLocal,
} from '../../../utils/borradorRecepcion.js';

/** Estado y pasos del borrador de recepción. La vista solo compone la pantalla. */
export function useRecepcionOrden() {
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
  /** Solo tras Buscar placa: muestra datos del vehículo */
  const placaConsultada = ref(false);
  const esAdmin = computed(() => auth.usuario?.rol === 'ADMIN');
  const fotoSrc = ref('');
  const archivoRegistro = ref(null);
  const subiendoFoto = ref(false);

  /** 1 = vehículo, 2 = cliente, 3 = trabajo */
  const paso = ref(1);
  /** null = recepción completa (EN_ESPERA listo) */
  const pasoRecepcion = ref(null);
  const vehiculoEditable = ref(false);
  const clienteEditable = ref(false);
  const editandoVehiculo = ref(false);
  const editandoCliente = ref(false);
  /** Paso desde el que se abrió Editar (para volver sin reiniciar el wizard) */
  const pasoOrigenEdicion = ref(null);
  /** true si la placa no existía al buscar (alta nueva en este flujo) */
  const vehiculoEraNuevo = ref(false);
  /** true si el cliente se está registrando nuevo (no vino de sugerencia) */
  const clienteEraNuevo = ref(true);
  const clienteConfirmado = ref(false);
  /** true tras elegir un cliente o confirmar que el nombre no existe */
  const clienteConsultado = ref(false);

  const clienteVacio = (extra = {}) => ({
    id: null,
    tipoCliente: 'PERSONA',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombreRazonSocial: '',
    representante: '',
    celular: '',
    correo: '',
    ...extra,
  });

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
  /** Evita que el estado vacío inicial pise el borrador guardado en el navegador. */
  const restaurando = ref(true);

  const recepcionCompleta = computed(() => pasoRecepcion.value == null && !!ordenId.value);
  const vehiculoBloqueado = computed(() => {
    if (editandoVehiculo.value) return false;
    // Vehículo ya existente: solo selección, sin editar datos maestros
    if (!vehiculoEraNuevo.value && placaConsultada.value) return true;
    // Ya guardado en este borrador: bloqueado hasta pulsar Editar
    if (ordenId.value && placaConsultada.value) return true;
    if (paso.value > 1) return true;
    return false;
  });
  const clienteBloqueado = computed(() => {
    if (editandoCliente.value) return false;
    // Cliente ya existente: solo selección. El nombre grande sigue editable.
    if (!clienteEraNuevo.value && clienteConsultado.value) return true;
    // Ya guardado en este borrador: bloqueado hasta pulsar Editar
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

  const mapCliente = (cliente) => ({
    id: cliente.id || null,
    tipoCliente: cliente.tipoCliente || 'PERSONA',
    tipoDocumento: cliente.tipoDocumento || 'DNI',
    numeroDocumento: cliente.numeroDocumento || '',
    nombreRazonSocial: cliente.nombreRazonSocial || '',
    representante: cliente.representante || '',
    celular: cliente.celular || '',
    correo: cliente.correo || '',
  });

  const cargarMarcas = async () => {
    try {
      marcas.value = await vehiculoService.listarMarcas();
    } catch {
      notify.error('Error', 'No se pudieron cargar las marcas.');
    }
  };

  const claveFoto = () => String(ordenId.value || 'nueva');

  const snapshotLocal = () => ({
    ordenId: ordenId.value,
    paso: paso.value,
    pasoRecepcion: pasoRecepcion.value,
    form: form.value,
    placaConsultada: placaConsultada.value,
    vehiculoEraNuevo: vehiculoEraNuevo.value,
    clienteConsultado: clienteConsultado.value,
    clienteEraNuevo: clienteEraNuevo.value,
    clienteConfirmado: clienteConfirmado.value,
    vehiculoEditable: vehiculoEditable.value,
    clienteEditable: clienteEditable.value,
    editandoVehiculo: editandoVehiculo.value,
    editandoCliente: editandoCliente.value,
    ruta: window.location.pathname,
  });

  const snapshotUtil = (local) => {
    if (!local?.form) return false;
    return !!(
      local.ordenId
      || local.form.vehiculo?.placa
      || local.form.cliente?.nombreRazonSocial
      || local.form.descripcionInformal
      || local.form.observacionIngreso
    );
  };

  const persistirLocal = () => {
    if (restaurando.value) return;
    const previo = leerBorradorLocal();
    const placa = form.value.vehiculo.placa;
    const nombre = form.value.cliente.nombreRazonSocial?.trim();
    const solicitud = form.value.descripcionInformal?.trim();
    if (!ordenId.value && !placa && !nombre && !solicitud && snapshotUtil(previo)) return;
    if (!ordenId.value && previo?.ordenId && !placa) return;
    guardarBorradorLocal(snapshotLocal());
  };

  const esRecargaDeEstaPantalla = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const misma = !!nav?.name?.includes(window.location.pathname);
    if (misma && nav.type === 'reload') return true;
    if (misma && consumirRecargaRecepcion()) return true;
    return false;
  };

  const aplicarSnapshot = (local, conservarServidor = false) => {
    const fotoServidor = conservarServidor ? form.value.fotoRegistro : '';
    form.value = {
      ...local.form,
      cliente: { ...clienteVacio(), ...local.form.cliente },
      vehiculo: {
        placa: '',
        marcaId: '',
        modelo: '',
        horometro: null,
        kilometraje: null,
        ...local.form.vehiculo,
      },
      fotoRegistro: fotoServidor || local.form.fotoRegistro || '',
    };
    if (local.paso) paso.value = local.paso;
    placaConsultada.value = !!local.placaConsultada;
    vehiculoEraNuevo.value = !!local.vehiculoEraNuevo;
    clienteConsultado.value = !!local.clienteConsultado;
    clienteEraNuevo.value = local.clienteEraNuevo !== false;
    clienteConfirmado.value = !!local.clienteConfirmado;
    vehiculoEditable.value = !!local.vehiculoEditable;
    clienteEditable.value = !!local.clienteEditable;
    editandoVehiculo.value = !!local.editandoVehiculo;
    editandoCliente.value = !!local.editandoCliente;
    if (!conservarServidor) {
      ordenId.value = local.ordenId || null;
      pasoRecepcion.value = local.pasoRecepcion ?? null;
    }
  };

  const restaurarFotoPendiente = async () => {
    if (form.value.fotoRegistro) {
      await borrarFotoLocal(claveFoto()).catch(() => {});
      return;
    }
    const file = await leerFotoLocal(claveFoto()).catch(() => null);
    if (!file) return;
    archivoRegistro.value = file;
    if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
    fotoSrc.value = URL.createObjectURL(file);
  };

  const mapOrdenAForm = async (orden) => {
    form.value = {
      cliente: mapCliente(orden.cliente || {}),
      vehiculo: {
        placa: orden.placa || '',
        marcaId: orden.vehiculo?.marcaId || '',
        modelo: orden.vehiculo?.modelo || '',
        horometro: orden.vehiculo?.horometro ?? null,
        kilometraje: orden.vehiculo?.kilometraje ?? null,
      },
      descripcionInformal: orden.descripcionInformal || '',
      trabajoSolicitado: orden.trabajoSolicitado || '',
      estadoIngreso: orden.estadoIngreso || 'ACEPTADO',
      observacionIngreso: orden.observacionIngreso || '',
      fotoRegistro: orden.fotoRegistro || '',
    };
    ordenId.value = orden.id;
    pasoRecepcion.value = orden.pasoRecepcion;
    vehiculoEditable.value = !!orden.vehiculoEditableEnBorrador;
    clienteEditable.value = !!orden.clienteEditableEnBorrador;
    vehiculoEraNuevo.value = !!orden.vehiculoEditableEnBorrador;
    clienteEraNuevo.value = !!orden.clienteEditableEnBorrador;
    clienteConfirmado.value = !!orden.clienteId;
    clienteConsultado.value = !!orden.clienteId;
    placaConsultada.value = true;
    editandoVehiculo.value = false;
    editandoCliente.value = false;

    if (orden.pasoRecepcion === 1) paso.value = 2;
    else if (orden.pasoRecepcion === 2) paso.value = 3;
    else paso.value = 3;

    await cargarFotoRegistro(orden.id, orden.fotoRegistro);
    recordarGuardado();
  };

  const vehiculoGuardado = ref(null);
  const clienteGuardado = ref(null);

  const recordarGuardado = () => {
    vehiculoGuardado.value = { ...form.value.vehiculo };
    clienteGuardado.value = { ...form.value.cliente };
  };

  const pasoAlcanzado = computed(() => {
    if (!ordenId.value) return 1;
    if (pasoRecepcion.value == null || pasoRecepcion.value >= 2) return 3;
    return 2;
  });

  const cambioPendiente = () => {
    if (editandoVehiculo.value || editandoCliente.value) return true;
    if (
      paso.value === 1
      && placaConsultada.value
      && vehiculoGuardado.value
      && form.value.vehiculo.placa !== vehiculoGuardado.value.placa
    ) return true;
    if (paso.value === 2 && clienteConsultado.value && clienteEraNuevo.value && !clienteConfirmado.value) {
      return true;
    }
    return false;
  };

  const restaurarSeleccionGuardada = () => {
    if (vehiculoGuardado.value?.placa) {
      form.value.vehiculo = { ...vehiculoGuardado.value };
      placaConsultada.value = true;
      vehiculoEraNuevo.value = vehiculoEditable.value;
    }
    if (clienteGuardado.value?.id || clienteGuardado.value?.nombreRazonSocial) {
      form.value.cliente = { ...clienteGuardado.value };
      clienteConsultado.value = true;
      clienteEraNuevo.value = clienteEditable.value;
      clienteConfirmado.value = !!clienteGuardado.value.id;
    }
  };

  const cargarFotoRegistro = async (id, ruta) => {
    if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
    fotoSrc.value = '';
    if (!ruta || !id) return;
    try {
      const blob = await ordenService.descargarFoto(id, 'registro');
      fotoSrc.value = URL.createObjectURL(blob);
    } catch {
      fotoSrc.value = '';
    }
  };

  const alElegirFoto = async (file) => {
    if (!file) return;
    errores.value = { ...errores.value, fotoRegistro: '' };
    archivoRegistro.value = file;
    if (fotoSrc.value?.startsWith('blob:')) URL.revokeObjectURL(fotoSrc.value);
    fotoSrc.value = URL.createObjectURL(file);
    const clave = claveFoto();
    try {
      await guardarFotoLocal(clave, file);
    } catch {
      /* si el navegador no guarda la foto, el envío al finalizar sigue usando el archivo */
    }
    persistirLocal();
    if (!ordenId.value) return;

    subiendoFoto.value = true;
    try {
      const ordenFoto = await ordenService.subirFoto(ordenId.value, 'registro', file);
      form.value.fotoRegistro = ordenFoto.fotoRegistro || form.value.fotoRegistro;
      archivoRegistro.value = null;
      await borrarFotoLocal(clave).catch(() => {});
      await cargarFotoRegistro(ordenId.value, form.value.fotoRegistro);
    } catch (e) {
      notify.error(
        'No se pudo subir la foto',
        e.response?.data?.message || 'Quedó en este borrador y se reintentará al finalizar.',
      );
    } finally {
      subiendoFoto.value = false;
    }
  };

  const quitarRegistro = async () => {
    archivoRegistro.value = null;
    await borrarFotoLocal(claveFoto()).catch(() => {});
    if (!form.value.fotoRegistro && fotoSrc.value?.startsWith('blob:')) {
      URL.revokeObjectURL(fotoSrc.value);
      fotoSrc.value = '';
      return;
    }
    if (!ordenId.value || !form.value.fotoRegistro) return;
    subiendoFoto.value = true;
    try {
      await ordenService.quitarFoto(ordenId.value, 'registro');
      form.value.fotoRegistro = '';
      if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
      fotoSrc.value = '';
      notify.success('Foto quitada');
    } catch (e) {
      notify.error('No se pudo quitar', e.response?.data?.message);
    } finally {
      subiendoFoto.value = false;
    }
  };

  const redirigirSiYaNoEsBorrador = (orden) => {
    if (orden.estado === 'EN_ESPERA') return false;
    const puedeTaller = ['ADMIN', 'SUPERVISOR', 'TECNICO'].includes(auth.usuario?.rol);
    if (puedeTaller) router.replace(`/ordenes/taller/${orden.id}`);
    else {
      notify.info('Orden aceptada', 'La recepción ya no edita esta orden.');
      router.replace('/ordenes');
    }
    return true;
  };

  const recuperarEncima = async (orden, local, recarga) => {
    await mapOrdenAForm(orden);
    historialOrdenes.value = [];
    const hayLocal = local && Number(local.ordenId) === Number(orden.id) && snapshotUtil(local);
    if (hayLocal) aplicarSnapshot(local, true);
    await restaurarFotoPendiente();
    if (recarga && (hayLocal || archivoRegistro.value)) {
      notify.info('Borrador recuperado', 'Sigues en el mismo paso.');
    }
  };

  const inicializar = async () => {
    restaurando.value = true;
    cargando.value = true;
    const recarga = esRecargaDeEstaPantalla();
    const local = leerBorradorLocal();
    try {
      await cargarMarcas();
      if (esEdicion.value) {
        const orden = await ordenService.obtener(route.params.id);
        if (redirigirSiYaNoEsBorrador(orden)) return;
        await recuperarEncima(orden, local, recarga);
        return;
      }

      if (recarga && local?.ordenId && local.ruta === '/ordenes/nueva') {
        await router.replace(`/ordenes/editar/${local.ordenId}`);
        const orden = await ordenService.obtener(local.ordenId);
        if (redirigirSiYaNoEsBorrador(orden)) return;
        await recuperarEncima(orden, local, true);
        return;
      }

      if (recarga && snapshotUtil(local)) {
        aplicarSnapshot(local);
        await restaurarFotoPendiente();
        notify.info('Borrador recuperado', 'Sigues en el mismo paso.');
      }
    } catch {
      notify.error('Error', 'No se pudo cargar la orden.');
    } finally {
      restaurando.value = false;
      cargando.value = false;
    }
  };

  const normalizarPlaca = (placa) =>
    (placa || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

  const buscarPlaca = async (placa) => {
    const limpia = normalizarPlaca(placa);
    if (!limpia) {
      errores.value = { ...errores.value, placa: MENSAJE_FORMATO_PLACA };
      placaConsultada.value = false;
      return;
    }

    const formatoOk = FORMATO_PLACA.test(limpia);
    form.value.vehiculo.placa = limpia;
    errores.value = { ...errores.value, placa: '' };
    try {
      const data = await vehiculoService.buscarPorPlaca(limpia);
      form.value.vehiculo = {
        placa: data.placa,
        marcaId: data.marcaId,
        modelo: data.modelo,
        horometro: data.horometro,
        kilometraje: data.kilometraje,
      };
      historialOrdenes.value = data.ordenes || [];
      placaConsultada.value = true;
      vehiculoEraNuevo.value = false;
      editandoVehiculo.value = false;

      const ultima = data.ordenes?.[0]?.cliente;
      if (ultima?.id) {
        form.value.cliente = mapCliente(ultima);
        clienteEraNuevo.value = false;
        clienteConsultado.value = true;
      }

      notify.success('Vehículo encontrado', `${data.marca?.nombre || ''} ${data.modelo}`);
    } catch {
      if (!formatoOk) {
        historialOrdenes.value = [];
        placaConsultada.value = false;
        errores.value = { ...errores.value, placa: MENSAJE_FORMATO_PLACA };
        return;
      }
      historialOrdenes.value = [];
      placaConsultada.value = true;
      vehiculoEraNuevo.value = true;
      editandoVehiculo.value = true;
      form.value.vehiculo = {
        placa: limpia,
        marcaId: '',
        modelo: '',
        horometro: null,
        kilometraje: null,
      };
      notify.info('Placa nueva', 'Completa marca y modelo para registrarla.');
    }
  };

  const onCambioPlaca = (valor) => {
    form.value.vehiculo.placa = valor;
    const aviso = errorPlacaEnCurso(valor);
    if (placaConsultada.value) {
      placaConsultada.value = false;
      historialOrdenes.value = [];
      errores.value = { ...errores.value, placa: aviso, marcaId: '', modelo: '' };
      return;
    }
    errores.value = { ...errores.value, placa: aviso };
  };

  const onCambioNombre = (valor) => {
    const cargado = !clienteEraNuevo.value && (clienteConsultado.value || form.value.cliente.id);
    if (cargado) {
      const { tipoCliente, tipoDocumento } = form.value.cliente;
      form.value.cliente = clienteVacio({ nombreRazonSocial: valor, tipoCliente, tipoDocumento });
      clienteEraNuevo.value = true;
      clienteConsultado.value = false;
      editandoCliente.value = false;
      errores.value = { ...errores.value, nombreRazonSocial: '', numeroDocumento: '' };
      return;
    }
    form.value.cliente.nombreRazonSocial = valor;
    if (clienteEraNuevo.value && clienteConsultado.value && !form.value.cliente.id) {
      clienteConsultado.value = false;
    }
    if (valor.trim().length < 2) clienteConsultado.value = false;
  };

  const marcarClienteNuevo = () => {
    const nombre = form.value.cliente.nombreRazonSocial?.trim() || '';
    if (nombre.length < 2) {
      errores.value = { ...errores.value, nombreRazonSocial: 'Escribe el nombre y pulsa Buscar cliente' };
      return;
    }
    errores.value = { ...errores.value, nombreRazonSocial: '' };
    if (clienteEraNuevo.value && clienteConsultado.value && !form.value.cliente.id) return;
    if (form.value.cliente.id || !clienteEraNuevo.value) {
      const { tipoCliente, tipoDocumento } = form.value.cliente;
      form.value.cliente = clienteVacio({ nombreRazonSocial: nombre, tipoCliente, tipoDocumento });
    }
    clienteEraNuevo.value = true;
    clienteConsultado.value = true;
    editandoCliente.value = false;
  };

  const aplicarCliente = (cliente) => {
    form.value.cliente = mapCliente(cliente);
    clienteEraNuevo.value = false;
    clienteConsultado.value = true;
    editandoCliente.value = false;
    const titulo = cliente.tipoCliente === 'EMPRESA' ? 'Empresa registrada' : 'Persona registrada';
    notify.success(titulo, cliente.nombreRazonSocial);
  };

  const onNuevaMarca = async (nombre) => {
    try {
      const marca = await vehiculoService.crearMarca(nombre);
      marcas.value = [...marcas.value, marca].sort((a, b) => a.nombre.localeCompare(b.nombre));
      form.value.vehiculo.marcaId = marca.id;
      notify.success('Marca creada', marca.nombre);
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo crear la marca.');
    }
  };

  const validarVehiculo = () => {
    const e = {};
    const { vehiculo } = form.value;
    if (!FORMATO_PLACA.test(normalizarPlaca(vehiculo.placa))) {
      e.placa = MENSAJE_FORMATO_PLACA;
    }
    if (!vehiculo.marcaId) e.marcaId = 'Marca obligatoria';
    if (!vehiculo.modelo?.trim()) e.modelo = 'Modelo obligatorio';
    errores.value = e;
    return Object.keys(e).length === 0;
  };

  const validarCliente = () => {
    const e = {};
    const { cliente } = form.value;
    if (!clienteConsultado.value) e.nombreRazonSocial = 'Elige una recomendación o pulsa Buscar cliente';
    else if (!cliente.nombreRazonSocial?.trim() || cliente.nombreRazonSocial.trim().length < 2) {
      e.nombreRazonSocial = 'Nombre / razón social obligatorio';
    }
    const doc = (cliente.numeroDocumento || '').trim();
    if (cliente.tipoCliente === 'EMPRESA' && cliente.tipoDocumento !== 'RUC') {
      e.tipoDocumento = 'Una empresa solo puede usar RUC';
    }
    if (doc && cliente.tipoDocumento === 'DNI' && doc.length !== 8) e.numeroDocumento = 'DNI: 8 dígitos';
    if (doc && cliente.tipoDocumento === 'RUC' && doc.length !== 11) e.numeroDocumento = 'RUC: 11 dígitos';
    if (cliente.celular && cliente.celular.length !== 9) e.celular = 'Celular: 9 dígitos';
    errores.value = e;
    return Object.keys(e).length === 0;
  };

  const validarTrabajo = () => {
    const e = {};
    const { estadoIngreso, observacionIngreso, descripcionInformal } = form.value;
    if (!descripcionInformal?.trim()) {
      e.descripcionInformal = 'Escribe la solicitud del cliente';
    }
    if (!archivoRegistro.value && !form.value.fotoRegistro) {
      e.fotoRegistro = 'La foto de registro inicial es obligatoria';
    }
    if (estadoIngreso === 'OBSERVADO' && !observacionIngreso?.trim()) {
      e.observacionIngreso = 'Describe la observación de ingreso';
    }
    errores.value = e;
    return Object.keys(e).length === 0;
  };

  const payloadVehiculo = () => ({
    placa: form.value.vehiculo.placa,
    marcaId: Number(form.value.vehiculo.marcaId),
    modelo: form.value.vehiculo.modelo,
    horometro: form.value.vehiculo.horometro === '' ? null : form.value.vehiculo.horometro,
    kilometraje: form.value.vehiculo.kilometraje === '' ? null : form.value.vehiculo.kilometraje,
  });

  const payloadCliente = () => ({
    ...form.value.cliente,
    id: !clienteEraNuevo.value && form.value.cliente.id ? form.value.cliente.id : null,
    numeroDocumento: form.value.cliente.numeroDocumento || null,
    representante: form.value.cliente.representante || null,
    celular: form.value.cliente.celular || null,
    correo: form.value.cliente.correo || null,
  });

  const guardarPasoVehiculo = async () => {
    if (!validarVehiculo()) {
      return notify.error('Completa el vehículo', 'Placa, marca y modelo son obligatorios.');
    }

    const origen = pasoOrigenEdicion.value;
    const eraEdicion = editandoVehiculo.value && !!ordenId.value;

    guardandoPaso.value = true;
    try {
      const actualizarDatos = editandoVehiculo.value && vehiculoEditable.value;
      const orden = await ordenService.guardarPasoVehiculo({
        vehiculo: payloadVehiculo(),
        actualizarDatos,
      }, ordenId.value);

      ordenId.value = orden.id;
      pasoRecepcion.value = orden.pasoRecepcion;
      vehiculoEditable.value = !!orden.vehiculoEditableEnBorrador;
      editandoVehiculo.value = false;
      placaConsultada.value = true;
      pasoOrigenEdicion.value = null;
      recordarGuardado();

      if (!esEdicion.value) {
        await router.replace(`/ordenes/editar/${orden.id}`);
      }

      // Si editó desde un paso posterior, vuelve ahí (sin rehacer cliente)
      if (eraEdicion && origen != null) {
        if (origen >= 3 && clienteConfirmado.value) {
          paso.value = 3;
          notify.success('Vehículo actualizado', 'Volviste al detalle del trabajo.');
        } else if (origen >= 2) {
          paso.value = 2;
          notify.success('Vehículo actualizado', 'Puedes seguir con el cliente.');
        } else {
          paso.value = clienteConfirmado.value ? 3 : 2;
          notify.success('Vehículo actualizado');
        }
      } else {
        paso.value = 2;
        notify.success('Vehículo guardado', 'Puedes continuar con el cliente. Si sales, el borrador queda pendiente.');
      }
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo guardar el vehículo.');
    } finally {
      guardandoPaso.value = false;
    }
  };

  const guardarPasoCliente = async () => {
    if (!ordenId.value) return notify.error('Falta el vehículo', 'Vuelve al paso 1.');
    if (!validarCliente()) return notify.error('Revisa el cliente', 'Completa los datos obligatorios.');

    const origen = pasoOrigenEdicion.value;
    const eraEdicion = editandoCliente.value && clienteConfirmado.value;

    guardandoPaso.value = true;
    try {
      const actualizarDatos = editandoCliente.value && clienteEditable.value;
      const orden = await ordenService.guardarPasoCliente(ordenId.value, {
        cliente: payloadCliente(),
        actualizarDatos,
      });

      pasoRecepcion.value = orden.pasoRecepcion;
      clienteEditable.value = !!orden.clienteEditableEnBorrador;
      clienteConfirmado.value = true;
      editandoCliente.value = false;
      pasoOrigenEdicion.value = null;
      recordarGuardado();
      paso.value = 3;
      notify.success(
        eraEdicion ? 'Cliente actualizado' : 'Cliente guardado',
        eraEdicion ? 'Volviste al detalle de la recepción.' : 'Ahora registra la solicitud del cliente.'
      );
    } catch (e) {
      notify.error('Error', e.response?.data?.message || 'No se pudo guardar el cliente.');
    } finally {
      guardandoPaso.value = false;
    }
  };

  const completarBorrador = async () => {
    if (!ordenId.value) return;
    if (!validarTrabajo()) {
      return notify.error('Revisa la recepción', 'La solicitud del cliente y la foto inicial son obligatorias.');
    }

    guardando.value = true;
    try {
      if (archivoRegistro.value) {
        subiendoFoto.value = true;
        try {
          const ordenFoto = await ordenService.subirFoto(ordenId.value, 'registro', archivoRegistro.value);
          form.value.fotoRegistro = ordenFoto.fotoRegistro || form.value.fotoRegistro;
          archivoRegistro.value = null;
        } catch (e) {
          notify.error('No se pudo subir la foto', e.response?.data?.message || 'Vuelve a elegirla.');
          return;
        }
      }

      await ordenService.completarRecepcion(ordenId.value, {
        descripcionInformal: form.value.descripcionInformal.trim(),
        estadoIngreso: form.value.estadoIngreso,
        observacionIngreso: form.value.observacionIngreso || null,
      });

      notify.success('Borrador listo', 'La orden quedó en espera de validación.');
      await limpiarBorradorLocal();
      router.push('/ordenes');
    } catch (e) {
      const msg = e.response?.data?.errors?.[0]?.mensaje
        || e.response?.data?.message
        || 'No se pudo guardar.';
      notify.error('Error', msg);
    } finally {
      guardando.value = false;
      subiendoFoto.value = false;
    }
  };

  const irAPaso = (n) => {
    if (n < 1 || n > 3 || n === paso.value) return;
    if (n > pasoAlcanzado.value) return;
    if (cambioPendiente()) {
      notify.info('Hay cambios sin guardar', 'Termina este paso antes de saltar a otro.');
      return;
    }
    restaurarSeleccionGuardada();
    paso.value = n;
    errores.value = {};
    editandoVehiculo.value = false;
    editandoCliente.value = false;
    pasoOrigenEdicion.value = null;
  };

  const cambiarVehiculo = () => {
    pasoOrigenEdicion.value = null;
    paso.value = 1;
    editandoVehiculo.value = false;
    placaConsultada.value = false;
    historialOrdenes.value = [];
    errores.value = {};
  };

  const cambiarCliente = () => {
    pasoOrigenEdicion.value = null;
    paso.value = 2;
    editandoCliente.value = false;
    clienteConfirmado.value = false;
    clienteEditable.value = false;
    clienteEraNuevo.value = true;
    clienteConsultado.value = false;
    form.value.cliente = clienteVacio();
    errores.value = {};
  };

  const irAEditarCliente = () => {
    pasoOrigenEdicion.value = paso.value;
    paso.value = 2;
    editandoCliente.value = true;
  };

  const irAEditarVehiculo = () => {
    pasoOrigenEdicion.value = paso.value;
    paso.value = 1;
    editandoVehiculo.value = true;
    placaConsultada.value = true;
  };

  /** Editar sin cambiar de paso (ya estás en el formulario bloqueado) */
  const empezarEditarVehiculoEnPaso = () => {
    if (pasoOrigenEdicion.value == null) {
      pasoOrigenEdicion.value = clienteConfirmado.value ? 3 : (ordenId.value ? 2 : 1);
    }
    editandoVehiculo.value = true;
  };

  const empezarEditarClienteEnPaso = () => {
    if (pasoOrigenEdicion.value == null) {
      pasoOrigenEdicion.value = clienteConfirmado.value ? 3 : 2;
    }
    editandoCliente.value = true;
  };

  const cancelarEdicionVehiculo = () => {
    const origen = pasoOrigenEdicion.value;
    editandoVehiculo.value = false;
    pasoOrigenEdicion.value = null;
    if (origen != null && origen > 1) {
      if (origen >= 3 && clienteConfirmado.value) paso.value = 3;
      else if (origen >= 2) paso.value = 2;
    }
  };

  const cancelarEdicionCliente = () => {
    const origen = pasoOrigenEdicion.value;
    editandoCliente.value = false;
    pasoOrigenEdicion.value = null;
    if (origen != null && origen >= 3 && clienteConfirmado.value) paso.value = 3;
  };

  watch(
    () => ({
      ordenId: ordenId.value,
      paso: paso.value,
      pasoRecepcion: pasoRecepcion.value,
      form: form.value,
      placaConsultada: placaConsultada.value,
      vehiculoEraNuevo: vehiculoEraNuevo.value,
      clienteConsultado: clienteConsultado.value,
      clienteEraNuevo: clienteEraNuevo.value,
      clienteConfirmado: clienteConfirmado.value,
      vehiculoEditable: vehiculoEditable.value,
      clienteEditable: clienteEditable.value,
      editandoVehiculo: editandoVehiculo.value,
      editandoCliente: editandoCliente.value,
    }),
    () => persistirLocal(),
    { deep: true },
  );

  const alOcultarPagina = () => {
    persistirLocal();
    marcarRecargaRecepcion();
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
    if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
  });

  return {
    router, ordenId, pasoRecepcion, paso, pasoAlcanzado, cargando, vehiculoBloqueado, placaConsultada,
    form, historialOrdenes, errores, onCambioPlaca, buscarPlaca, marcas,
    puedeEditarVehiculoUI, onNuevaMarca, empezarEditarVehiculoEnPaso, editandoVehiculo,
    cancelarEdicionVehiculo, guardandoPaso, guardarPasoVehiculo, pasoOrigenEdicion,
    resumenVehiculo, irAEditarVehiculo, cambiarVehiculo, clienteBloqueado,
    clienteConsultado, clienteEraNuevo, nombreClienteBloqueado, onCambioNombre, marcarClienteNuevo,
    puedeEditarClienteUI, aplicarCliente, empezarEditarClienteEnPaso, cambiarCliente,
    editandoCliente, clienteConfirmado, cancelarEdicionCliente, irAPaso, guardarPasoCliente,
    resumenCliente, recepcionCompleta, irAEditarCliente, fotoSrc, puedeCambiarRegistro,
    puedeQuitarRegistro, subiendoFoto, archivoRegistro, alElegirFoto, quitarRegistro, guardando,
    completarBorrador,
  };
}
