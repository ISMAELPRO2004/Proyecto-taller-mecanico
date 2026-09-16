<script setup>
import { ref, computed, onMounted } from 'vue';
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
import { CheckCircle, ClipboardList, ArrowRight, ArrowLeft, Car } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const esEdicion = computed(() => !!route.params.id);
const cargando = ref(false);
const guardando = ref(false);
const guardandoVehiculo = ref(false);
const marcas = ref([]);
const historialOrdenes = ref([]);
const vehiculoRegistrado = ref(false);
/** Solo tras Buscar placa: muestra datos del vehículo */
const placaConsultada = ref(false);

/** 1 = vehículo, 2 = cliente + orden */
const paso = ref(1);

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

const resumenVehiculo = computed(() => {
  const v = form.value.vehiculo;
  const marca = marcas.value.find((m) => String(m.id) === String(v.marcaId));
  return {
    placa: v.placa,
    marca: marca?.nombre || '—',
    modelo: v.modelo || '—',
  };
});

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
  vehiculoRegistrado.value = true;
  placaConsultada.value = true;
  paso.value = 2;
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
    vehiculoRegistrado.value = true;
    placaConsultada.value = true;

    const ultima = data.ordenes?.[0]?.cliente;
    if (ultima?.numeroDocumento) {
      try {
        const cliente = await clienteService.buscarDocumento(ultima.numeroDocumento);
        form.value.cliente = mapCliente(cliente);
      } catch { /* ok */ }
    }

    notify.success('Vehículo encontrado', `${data.marca?.nombre || ''} ${data.modelo}`);
  } catch {
    historialOrdenes.value = [];
    vehiculoRegistrado.value = false;
    placaConsultada.value = true;
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

const validarOrden = () => {
  const e = {};
  const { cliente, estadoIngreso, observacionIngreso } = form.value;
  if (!cliente.nombreRazonSocial?.trim()) e.nombreRazonSocial = 'Nombre / razón social obligatorio';
  if (!cliente.numeroDocumento?.trim()) e.numeroDocumento = 'Documento obligatorio';
  if (cliente.tipoDocumento === 'DNI' && cliente.numeroDocumento.length !== 8) e.numeroDocumento = 'DNI: 8 dígitos';
  if (cliente.tipoDocumento === 'RUC' && cliente.numeroDocumento.length !== 11) e.numeroDocumento = 'RUC: 11 dígitos';
  if (estadoIngreso === 'OBSERVADO' && !observacionIngreso?.trim()) {
    e.observacionIngreso = 'Describe la observación de ingreso';
  }
  errores.value = e;
  return Object.keys(e).length === 0;
};

const continuarAOrden = async () => {
  if (!validarVehiculo()) {
    return notify.error('Completa el vehículo', 'Placa, marca y modelo son obligatorios.');
  }

  guardandoVehiculo.value = true;
  try {
    await vehiculoService.upsert({
      placa: form.value.vehiculo.placa,
      marcaId: Number(form.value.vehiculo.marcaId),
      modelo: form.value.vehiculo.modelo,
      horometro: form.value.vehiculo.horometro === '' ? null : form.value.vehiculo.horometro,
      kilometraje: form.value.vehiculo.kilometraje === '' ? null : form.value.vehiculo.kilometraje,
    });
    vehiculoRegistrado.value = true;
    paso.value = 2;
    notify.success('Vehículo listo', 'Ahora registra el cliente y la orden.');
  } catch (e) {
    notify.error('Error', e.response?.data?.message || 'No se pudo guardar el vehículo.');
  } finally {
    guardandoVehiculo.value = false;
  }
};

const volverAVehiculo = () => {
  paso.value = 1;
  errores.value = {};
};

const payload = () => ({
  cliente: {
    ...form.value.cliente,
    representante: form.value.cliente.representante || null,
    celular: form.value.cliente.celular || null,
    correo: form.value.cliente.correo || null,
  },
  vehiculo: {
    ...form.value.vehiculo,
    marcaId: Number(form.value.vehiculo.marcaId),
    horometro: form.value.vehiculo.horometro === '' ? null : form.value.vehiculo.horometro,
    kilometraje: form.value.vehiculo.kilometraje === '' ? null : form.value.vehiculo.kilometraje,
  },
  descripcionInformal: form.value.descripcionInformal || null,
  trabajoSolicitado: form.value.trabajoSolicitado || null,
  estadoIngreso: form.value.estadoIngreso,
  observacionIngreso: form.value.observacionIngreso || null,
  fotoRegistro: form.value.fotoRegistro || null,
});

const guardar = async () => {
  if (!validarOrden()) return notify.error('Revisa los campos', 'Faltan datos del cliente o ingreso.');
  guardando.value = true;
  try {
    if (esEdicion.value) {
      await ordenService.actualizar(route.params.id, payload());
      notify.success('Actualizado', 'Borrador de orden actualizado.');
    } else {
      const orden = await ordenService.crear(payload());
      notify.success('Borrador creado', `${orden.numeroOrden} quedó en espera de validación.`);
    }
    router.push('/ordenes');
  } catch (e) {
    const msg = e.response?.data?.errors?.[0]?.mensaje
      || e.response?.data?.message
      || 'No se pudo guardar.';
    notify.error('Error', msg);
  } finally {
    guardando.value = false;
  }
};

onMounted(inicializar);
</script>

<template>
  <div class="max-w-[1100px] mx-auto space-y-6 animate-fade-in pb-24 px-4">
    <EncabezadoOrdenForm
      :es-edicion="esEdicion"
      modo="recepcion"
      @back="router.back()"
    />

    <PasosRecepcion :paso="paso" />

    <div v-if="cargando" class="py-20 text-center">
      <span class="loading loading-ring loading-lg text-lyer-green" />
    </div>

    <template v-else>
      <!-- PASO 1: VEHÍCULO -->
      <template v-if="paso === 1">
        <FormBusquedaPlaca
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
            @update:vehiculo="form.vehiculo = $event"
            @crear-marca="onNuevaMarca"
          />

          <div class="flex justify-end">
            <button
              :disabled="guardandoVehiculo"
              @click="continuarAOrden"
              class="btn btn-lg bg-lyer-green hover:bg-emerald-600 text-white border-none px-10 rounded-2xl shadow-lg"
            >
              <span v-if="guardandoVehiculo" class="loading loading-spinner" />
              <template v-else>
                Continuar a la orden
                <ArrowRight class="w-5 h-5 ml-2" />
              </template>
            </button>
          </div>
        </template>
      </template>

      <!-- PASO 2: CLIENTE + ORDEN -->
      <template v-else>
        <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-lyer-green text-white flex items-center justify-center shrink-0">
              <Car class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Vehículo seleccionado</p>
              <p class="font-black text-slate-800 uppercase truncate">
                {{ resumenVehiculo.placa }}
                <span class="text-slate-400 font-bold normal-case text-sm">
                  · {{ resumenVehiculo.marca }} {{ resumenVehiculo.modelo }}
                </span>
              </p>
            </div>
          </div>
          <button type="button" @click="volverAVehiculo"
            class="btn btn-sm btn-ghost text-lyer-green font-bold gap-1">
            <ArrowLeft class="w-4 h-4" /> Cambiar vehículo
          </button>
        </div>

        <FormCliente
          :cliente="form.cliente"
          :errores="errores"
          @update:cliente="form.cliente = $event"
          @seleccionar-cliente="aplicarCliente"
        />

        <FormIngresoOrden
          v-model:descripcion-informal="form.descripcionInformal"
          v-model:trabajo-solicitado="form.trabajoSolicitado"
          v-model:estado-ingreso="form.estadoIngreso"
          v-model:observacion-ingreso="form.observacionIngreso"
          :errores="errores"
        />

        <footer class="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div class="z-10">
            <p class="text-[8px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1 opacity-60">
              Estado inicial
            </p>
            <h2 class="text-2xl font-black text-white tracking-tight">EN ESPERA</h2>
            <p class="text-xs text-slate-400 mt-1">Un supervisor o admin validará la orden para continuar.</p>
          </div>
          <button
            :disabled="guardando"
            @click="guardar"
            class="z-10 btn btn-lg w-full md:w-auto bg-lyer-green hover:bg-emerald-500 text-white border-none px-12 rounded-2xl shadow-xl"
          >
            <span v-if="guardando" class="loading loading-spinner" />
            <CheckCircle v-else class="w-5 h-5 mr-2" />
            <span class="font-black uppercase tracking-widest text-sm">
              {{ esEdicion ? 'Guardar cambios' : 'Crear borrador' }}
            </span>
          </button>
          <div class="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 pointer-events-none">
            <ClipboardList class="w-48 h-48 text-white" />
          </div>
        </footer>
      </template>
    </template>
  </div>
</template>
