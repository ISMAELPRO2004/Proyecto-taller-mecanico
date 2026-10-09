<script setup>
import { useRecepcionOrden } from './composables/useRecepcionOrden.js';
import EncabezadoOrdenForm from './componentes/EncabezadoOrdenForm.vue';
import PasosRecepcion from './componentes/PasosRecepcion.vue';
import FormBusquedaPlaca from './componentes/FormBusquedaPlaca.vue';
import FormVehiculo from './componentes/FormVehiculo.vue';
import FormCliente from './componentes/FormCliente.vue';
import FormIngresoOrden from './componentes/FormIngresoOrden.vue';
import CampoFoto from './componentes/CampoFoto.vue';
import { CheckCircle, ClipboardList, ArrowRight, ArrowLeft, Car, User } from 'lucide-vue-next';

const {
  router, ordenId, pasoRecepcion, paso, cargando, vehiculoBloqueado, placaConsultada,
  form, historialOrdenes, errores, onCambioPlaca, buscarPlaca, marcas,
  puedeEditarVehiculoUI, onNuevaMarca, empezarEditarVehiculoEnPaso, editandoVehiculo,
  cancelarEdicionVehiculo, guardandoPaso, guardarPasoVehiculo, pasoOrigenEdicion,
  resumenVehiculo, irAEditarVehiculo, cambiarVehiculo, clienteBloqueado,
  puedeEditarClienteUI, aplicarCliente, empezarEditarClienteEnPaso, cambiarCliente,
  editandoCliente, clienteConfirmado, cancelarEdicionCliente, irAPaso, guardarPasoCliente,
  resumenCliente, recepcionCompleta, irAEditarCliente, fotoSrc, puedeCambiarRegistro,
  puedeQuitarRegistro, subiendoFoto, archivoRegistro, quitarRegistro, guardando,
  completarBorrador,
} = useRecepcionOrden();
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
