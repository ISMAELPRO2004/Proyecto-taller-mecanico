<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { ordenService } from '../../services/ordenService.js';
import { vehiculoService } from '../../services/vehiculoService.js';
import { clienteService } from '../../services/clienteService.js';
import { notify } from '../../utils/alerts.js';
import EncabezadoOrdenForm from './componentes/EncabezadoOrdenForm.vue';
import PasosRecepcion from './componentes/PasosRecepcion.vue';
import FormBusquedaPlaca from './componentes/FormBusquedaPlaca.vue';
import FormVehiculo from './componentes/FormVehiculo.vue';
import FormCliente from './componentes/FormCliente.vue';
import FormIngresoOrden from './componentes/FormIngresoOrden.vue';
import CampoFoto from './componentes/CampoFoto.vue';
import { CheckCircle, ClipboardList, ArrowRight, ArrowLeft, Car, User } from 'lucide-vue-next';

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

const form = ref({
  cliente: {
    tipoCliente: 'PERSONA',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombreRazonSocial: '',
    representante: '',
    celular: '',
    correo: '',
  },
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

const recepcionCompleta = computed(() => pasoRecepcion.value == null && !!ordenId.value);
const vehiculoBloqueado = computed(() => {
  if (editandoVehiculo.value) return false;
  if (recepcionCompleta.value && !esAdmin.value) return true;
  // Vehículo ya existente: solo selección, sin editar datos maestros
  if (!vehiculoEraNuevo.value && placaConsultada.value) return true;
  // Ya guardado en este borrador: bloqueado hasta pulsar Editar
  if (ordenId.value && placaConsultada.value) return true;
  if (paso.value > 1) return true;
  return false;
});
const clienteBloqueado = computed(() => {
  if (editandoCliente.value) return false;
  if (recepcionCompleta.value && !esAdmin.value) return true;
  // Cliente ya existente: solo selección
  if (!clienteEraNuevo.value && form.value.cliente.numeroDocumento) return true;
  // Ya guardado en este borrador: bloqueado hasta pulsar Editar
  if (clienteConfirmado.value) return true;
  if (paso.value > 2) return true;
  return false;
});
const puedeEditarVehiculoUI = computed(() =>
  !recepcionCompleta.value && vehiculoEditable.value
);
const puedeEditarClienteUI = computed(() =>
  !recepcionCompleta.value && clienteEditable.value
);
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
  };
});

const resumenCliente = computed(() => form.value.cliente.nombreRazonSocial || '—');

const mapCliente = (cliente) => ({
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

const mapOrdenAForm = (orden) => {
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
  placaConsultada.value = true;
  editandoVehiculo.value = false;
  editandoCliente.value = false;

  if (orden.pasoRecepcion === 1) paso.value = 2;
  else if (orden.pasoRecepcion === 2) paso.value = 3;
  else paso.value = 3;

  cargarFotoRegistro(orden.id, orden.fotoRegistro);
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

const quitarRegistro = async () => {
  archivoRegistro.value = null;
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

const inicializar = async () => {
  cargando.value = true;
  try {
    await cargarMarcas();
    if (esEdicion.value) {
      const orden = await ordenService.obtener(route.params.id);
      if (orden.estado !== 'EN_ESPERA') {
        const puedeTaller = ['ADMIN', 'SUPERVISOR', 'TECNICO'].includes(auth.usuario?.rol);
        if (puedeTaller) router.replace(`/ordenes/taller/${orden.id}`);
        else {
          notify.info('Orden aceptada', 'La recepción ya no edita esta orden.');
          router.replace('/ordenes');
        }
        return;
      }
      mapOrdenAForm(orden);
      historialOrdenes.value = [];
    }
  } catch {
    notify.error('Error', 'No se pudo cargar la orden.');
  } finally {
    cargando.value = false;
  }
};

const normalizarPlaca = (placa) =>
  (placa || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

const buscarPlaca = async (placa) => {
  const limpia = normalizarPlaca(placa);
  if (limpia.length < 7 || limpia.length > 8) {
    errores.value = { ...errores.value, placa: 'Placa inválida (7 u 8 caracteres, puede incluir -)' };
    placaConsultada.value = false;
    return;
  }

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
    if (ultima?.numeroDocumento) {
      try {
        const cliente = await clienteService.buscarDocumento(ultima.numeroDocumento);
        form.value.cliente = mapCliente(cliente);
        clienteEraNuevo.value = false;
      } catch { /* ok */ }
    }

    notify.success('Vehículo encontrado', `${data.marca?.nombre || ''} ${data.modelo}`);
  } catch {
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
  if (placaConsultada.value) {
    placaConsultada.value = false;
    historialOrdenes.value = [];
    errores.value = { ...errores.value, placa: '', marcaId: '', modelo: '' };
  }
};

const aplicarCliente = (cliente) => {
  form.value.cliente = mapCliente(cliente);
  clienteEraNuevo.value = false;
  notify.success('Cliente cargado', cliente.nombreRazonSocial);
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
  if (!vehiculo.placa?.trim() || vehiculo.placa.length < 7 || vehiculo.placa.length > 8) {
    e.placa = 'Placa obligatoria (7 u 8 caracteres)';
  }
  if (!vehiculo.marcaId) e.marcaId = 'Marca obligatoria';
  if (!vehiculo.modelo?.trim()) e.modelo = 'Modelo obligatorio';
  errores.value = e;
  return Object.keys(e).length === 0;
};

const validarCliente = () => {
  const e = {};
  const { cliente } = form.value;
  if (!cliente.nombreRazonSocial?.trim()) e.nombreRazonSocial = 'Nombre / razón social obligatorio';
  if (!cliente.numeroDocumento?.trim()) e.numeroDocumento = 'Documento obligatorio';
  if (cliente.tipoDocumento === 'DNI' && cliente.numeroDocumento.length !== 8) e.numeroDocumento = 'DNI: 8 dígitos';
  if (cliente.tipoDocumento === 'RUC' && cliente.numeroDocumento.length !== 11) e.numeroDocumento = 'RUC: 11 dígitos';
  errores.value = e;
  return Object.keys(e).length === 0;
};

const validarTrabajo = () => {
  const e = {};
  const { estadoIngreso, observacionIngreso } = form.value;
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
    paso.value = 3;
    notify.success(
      eraEdicion ? 'Cliente actualizado' : 'Cliente guardado',
      eraEdicion ? 'Volviste al detalle del trabajo.' : 'Ahora completa el trabajo a realizar.'
    );
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo guardar el cliente.');
  } finally {
    guardandoPaso.value = false;
  }
};

const completarBorrador = async () => {
  if (!ordenId.value) return;
  if (!validarTrabajo()) return notify.error('Revisa el ingreso', 'Falta la observación.');

  guardando.value = true;
  try {
    await ordenService.completarRecepcion(ordenId.value, {
      descripcionInformal: form.value.descripcionInformal || null,
      trabajoSolicitado: form.value.trabajoSolicitado || null,
      estadoIngreso: form.value.estadoIngreso,
      observacionIngreso: form.value.observacionIngreso || null,
    });

    if (archivoRegistro.value) {
      subiendoFoto.value = true;
      try {
        await ordenService.subirFoto(ordenId.value, 'registro', archivoRegistro.value);
      } catch (e) {
        notify.error('El borrador se guardó, pero la foto no', e.response?.data?.message || 'Vuelve a subirla.');
        router.replace(`/ordenes/editar/${ordenId.value}`);
        return;
      }
    }

    notify.success('Borrador listo', 'La orden quedó en espera de validación.');
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
  if (n < 1 || n > 3) return;
  if (n > 1 && !ordenId.value) return;
  if (n > 2 && !clienteConfirmado.value) return;
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
  form.value.cliente = {
    tipoCliente: 'PERSONA',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombreRazonSocial: '',
    representante: '',
    celular: '',
    correo: '',
  };
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

onMounted(inicializar);
onUnmounted(() => {
  if (fotoSrc.value) URL.revokeObjectURL(fotoSrc.value);
});
</script>

<template>
  <div class="max-w-[1100px] mx-auto space-y-6 animate-fade-in pb-24 px-4">
    <EncabezadoOrdenForm
      :es-edicion="!!ordenId"
      modo="recepcion"
      @back="router.back()"
    />

    <PasosRecepcion :paso="paso" />

    <div
      v-if="ordenId && pasoRecepcion != null"
      class="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-amber-800 text-xs font-bold"
    >
      Borrador pendiente a terminar de rellenar
      <span class="font-black">· Paso {{ pasoRecepcion }} de 3 guardado</span>
    </div>

    <div v-if="cargando" class="py-20 text-center">
      <span class="loading loading-ring loading-lg text-lyer-green" />
    </div>

    <template v-else>
      <!-- PASO 1: VEHÍCULO -->
      <template v-if="paso === 1">
        <FormBusquedaPlaca
          v-if="!vehiculoBloqueado || !placaConsultada"
          :placa="form.vehiculo.placa"
          :historial="historialOrdenes"
          :error="errores.placa"
          @update:placa="onCambioPlaca"
          @buscar="buscarPlaca"
        />

        <template v-if="placaConsultada">
          <FormVehiculo
            :vehiculo="form.vehiculo"
            :marcas="marcas"
            :errores="errores"
            :bloqueado="vehiculoBloqueado"
            :puede-editar="puedeEditarVehiculoUI"
            @update:vehiculo="form.vehiculo = $event"
            @crear-marca="onNuevaMarca"
            @editar="empezarEditarVehiculoEnPaso"
          />

          <div class="flex justify-end gap-2">
            <button
              v-if="editandoVehiculo && ordenId"
              type="button"
              @click="cancelarEdicionVehiculo"
              class="btn btn-ghost rounded-2xl"
            >
              Cancelar
            </button>
            <button
              :disabled="guardandoPaso"
              @click="guardarPasoVehiculo"
              class="btn btn-lg bg-lyer-green hover:bg-emerald-600 text-white border-none px-10 rounded-2xl shadow-lg"
            >
              <span v-if="guardandoPaso" class="loading loading-spinner" />
              <template v-else>
              {{ editandoVehiculo && ordenId
                ? (pasoOrigenEdicion >= 3 ? 'Guardar y volver' : 'Guardar vehículo')
                : 'Continuar al cliente' }}
                <ArrowRight class="w-5 h-5 ml-2" />
              </template>
            </button>
          </div>
        </template>
      </template>

      <!-- PASO 2: CLIENTE -->
      <template v-else-if="paso === 2">
        <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-lyer-green text-white flex items-center justify-center shrink-0">
              <Car class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Vehículo</p>
              <p class="font-black text-slate-800 uppercase truncate">
                {{ resumenVehiculo.placa }}
                <span class="text-slate-400 font-bold normal-case text-sm">
                  · {{ resumenVehiculo.marca }} {{ resumenVehiculo.modelo }}
                </span>
              </p>
            </div>
          </div>
          <div class="flex gap-1">
            <button
              v-if="puedeEditarVehiculoUI"
              type="button"
              @click="irAEditarVehiculo"
              class="btn btn-sm btn-ghost text-lyer-green font-bold gap-1"
            >
              Editar
            </button>
            <button type="button" @click="cambiarVehiculo"
              class="btn btn-sm btn-ghost text-slate-500 font-bold gap-1">
              <ArrowLeft class="w-4 h-4" /> Cambiar
            </button>
          </div>
        </div>

        <FormCliente
          :cliente="form.cliente"
          :errores="errores"
          :bloqueado="clienteBloqueado"
          :puede-editar="puedeEditarClienteUI"
          @update:cliente="form.cliente = $event"
          @seleccionar-cliente="aplicarCliente"
          @editar="empezarEditarClienteEnPaso"
        />

        <div v-if="clienteBloqueado && !puedeEditarClienteUI" class="flex justify-end -mt-2">
          <button type="button" @click="cambiarCliente" class="btn btn-sm btn-ghost text-slate-500 font-bold">
            Cambiar selección de cliente
          </button>
        </div>

        <div v-if="editandoCliente && clienteConfirmado" class="flex justify-end -mt-2 gap-2">
          <button type="button" @click="cancelarEdicionCliente" class="btn btn-sm btn-ghost text-slate-500 font-bold">
            Cancelar edición
          </button>
        </div>

        <div class="flex justify-between gap-2">
          <button type="button" @click="irAPaso(1)" class="btn btn-ghost rounded-2xl gap-1">
            <ArrowLeft class="w-4 h-4" /> Atrás
          </button>
          <button
            :disabled="guardandoPaso"
            @click="guardarPasoCliente"
            class="btn btn-lg bg-lyer-green hover:bg-emerald-600 text-white border-none px-10 rounded-2xl shadow-lg"
          >
            <span v-if="guardandoPaso" class="loading loading-spinner" />
            <template v-else>
              Continuar al trabajo
              <ArrowRight class="w-5 h-5 ml-2" />
            </template>
          </button>
        </div>
      </template>

      <!-- PASO 3: TRABAJO -->
      <template v-else>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-lyer-green text-white flex items-center justify-center shrink-0">
                <Car class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <p class="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Vehículo</p>
                <p class="font-black text-slate-800 uppercase truncate text-sm">{{ resumenVehiculo.placa }}</p>
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button
                v-if="puedeEditarVehiculoUI"
                type="button"
                @click="irAEditarVehiculo"
                class="btn btn-xs btn-ghost text-lyer-green font-bold"
              >
                Editar
              </button>
              <button
                v-if="!recepcionCompleta"
                type="button"
                @click="cambiarVehiculo"
                class="btn btn-xs btn-ghost text-slate-500 font-bold"
              >
                Cambiar
              </button>
            </div>
          </div>
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                <User class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cliente</p>
                <p class="font-black text-slate-800 truncate text-sm">{{ resumenCliente }}</p>
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button
                v-if="puedeEditarClienteUI"
                type="button"
                @click="irAEditarCliente"
                class="btn btn-xs btn-ghost text-lyer-green font-bold"
              >
                Editar
              </button>
              <button
                v-if="!recepcionCompleta"
                type="button"
                @click="cambiarCliente"
                class="btn btn-xs btn-ghost text-slate-500 font-bold"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>

        <FormIngresoOrden
          v-model:descripcion-informal="form.descripcionInformal"
          v-model:trabajo-solicitado="form.trabajoSolicitado"
          v-model:estado-ingreso="form.estadoIngreso"
          v-model:observacion-ingreso="form.observacionIngreso"
          :errores="errores"
        />

        <CampoFoto
          titulo="Foto de registro"
          ayuda="Se toma una sola vez al ingresar el vehículo. Después solo el administrador puede cambiarla."
          :src="fotoSrc"
          :puede-cambiar="puedeCambiarRegistro"
          :puede-quitar="puedeQuitarRegistro"
          :subiendo="subiendoFoto"
          @seleccionar="archivoRegistro = $event"
          @quitar="quitarRegistro"
        />

        <footer class="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div class="z-10">
            <p class="text-[8px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1 opacity-60">
              Estado inicial
            </p>
            <h2 class="text-2xl font-black text-white tracking-tight">EN ESPERA</h2>
            <p class="text-xs text-slate-400 mt-1">Un supervisor o admin validará la orden para continuar.</p>
          </div>
          <div class="z-10 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button type="button" @click="irAPaso(2)" class="btn btn-ghost text-slate-300 rounded-2xl">
              <ArrowLeft class="w-4 h-4" /> Atrás
            </button>
            <button
              :disabled="guardando"
              @click="completarBorrador"
              class="btn btn-lg w-full md:w-auto bg-lyer-green hover:bg-emerald-500 text-white border-none px-12 rounded-2xl shadow-xl"
            >
              <span v-if="guardando" class="loading loading-spinner" />
              <CheckCircle v-else class="w-5 h-5 mr-2" />
              <span class="font-black uppercase tracking-widest text-sm">
                {{ recepcionCompleta ? 'Guardar cambios' : 'Finalizar borrador' }}
              </span>
            </button>
          </div>
          <div class="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 pointer-events-none">
            <ClipboardList class="w-48 h-48 text-white" />
          </div>
        </footer>
      </template>
    </template>
  </div>
</template>
