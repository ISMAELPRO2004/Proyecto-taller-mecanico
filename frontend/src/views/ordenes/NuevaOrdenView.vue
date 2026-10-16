<script setup>
import { useRecepcionOrden } from './composables/useRecepcionOrden.js';
import EncabezadoOrdenForm from './componentes/EncabezadoOrdenForm.vue';
import PasosRecepcion from './componentes/PasosRecepcion.vue';
import FormBusquedaPlaca from './componentes/FormBusquedaPlaca.vue';
import FormVehiculo from './componentes/FormVehiculo.vue';
import FormCliente from './componentes/FormCliente.vue';
import FormIngresoOrden from './componentes/FormIngresoOrden.vue';
import CampoFoto from './componentes/CampoFoto.vue';
import { Check, ArrowRight, ArrowLeft, Car, User } from 'lucide-vue-next';

const {
  router, ordenId, pasoRecepcion, paso, pasoAlcanzado, cargando, vehiculoBloqueado, placaConsultada,
  form, historialOrdenes, errores, onCambioPlaca, buscarPlaca, marcas,
  puedeEditarVehiculoUI, onNuevaMarca, empezarEditarVehiculoEnPaso, editandoVehiculo,
  cancelarEdicionVehiculo, guardandoPaso, guardarPasoVehiculo, pasoOrigenEdicion,
  resumenVehiculo, irAEditarVehiculo, cambiarVehiculo, clienteBloqueado,
  clienteConsultado, clienteEraNuevo, nombreClienteBloqueado, onCambioNombre, marcarClienteNuevo,
  puedeEditarClienteUI, aplicarCliente, empezarEditarClienteEnPaso, cambiarCliente,
  editandoCliente, clienteConfirmado, cancelarEdicionCliente, irAPaso, guardarPasoCliente,
  resumenCliente, recepcionCompleta, irAEditarCliente, fotoSrc, puedeCambiarRegistro,
  puedeQuitarRegistro, subiendoFoto, archivoRegistro, quitarRegistro, guardando,
  completarBorrador,
} = useRecepcionOrden();
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 animate-fade-in pb-16">
    <EncabezadoOrdenForm
      :es-edicion="!!ordenId"
      :paso="paso"
      modo="recepcion"
      @back="router.back()"
    />

    <PasosRecepcion :paso="paso" :max-paso="pasoAlcanzado" @ir="irAPaso" />

    <div
      v-if="ordenId && pasoRecepcion != null"
      class="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-200"
    >
      Borrador pendiente a terminar de rellenar
      <span class="font-black">· Paso {{ pasoRecepcion }} de 3 guardado</span>
    </div>

    <div v-if="cargando" class="py-20 text-center">
      <span class="loading loading-ring loading-lg text-lyer-accent" />
    </div>

    <template v-else>
      <!-- PASO 1: VEHÍCULO -->
      <div v-if="paso === 1" class="space-y-8 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8 md:p-10">
        <FormBusquedaPlaca
          :placa="form.vehiculo.placa"
          :historial="historialOrdenes"
          :error="errores.placa"
          @update:placa="onCambioPlaca"
          @buscar="buscarPlaca"
        />

        <template v-if="placaConsultada">
          <div class="border-t border-[#4a2870]/40" />
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

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              v-if="editandoVehiculo && ordenId"
              type="button"
              class="h-12 rounded-xl border border-[#4a2870]/50 px-5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
              @click="cancelarEdicionVehiculo"
            >
              Cancelar
            </button>
            <span v-else />
            <button
              type="button"
              :disabled="guardandoPaso"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lyer-accent px-8 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)] disabled:opacity-60 sm:ml-auto"
              @click="guardarPasoVehiculo"
            >
              <span v-if="guardandoPaso" class="loading loading-spinner loading-sm" />
              <template v-else>
                {{ editandoVehiculo && ordenId
                  ? (pasoOrigenEdicion >= 3 ? 'Guardar y volver' : 'Guardar vehículo')
                  : 'Continuar al cliente' }}
                <ArrowRight class="h-5 w-5" />
              </template>
            </button>
          </div>
        </template>
      </div>

      <!-- PASO 2: CLIENTE -->
      <template v-else-if="paso === 2">
        <div class="flex flex-col gap-4 rounded-2xl border border-lyer-cyan/30 bg-[#221433]/90 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div class="flex min-w-0 items-center gap-3.5">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lyer-cyan/40 bg-lyer-cyan/10 text-lyer-cyan">
              <Car class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <span class="block text-[11px] font-semibold uppercase tracking-wider text-lyer-cyan">Vehículo asociado</span>
              <p class="mt-0.5 truncate text-sm text-slate-300 md:text-base">
                <span class="mr-2 inline-block rounded border border-[#4a2870] bg-[#140a22] px-2 py-0.5 font-mono text-base font-bold tracking-wider text-white">
                  {{ resumenVehiculo.placa }}
                </span>
                {{ resumenVehiculo.marca }} {{ resumenVehiculo.modelo }}
                <span
                  v-if="resumenVehiculo.kilometraje || resumenVehiculo.horometro"
                  class="ml-2 hidden font-mono text-xs text-slate-500 md:inline"
                >
                  <template v-if="resumenVehiculo.kilometraje">{{ resumenVehiculo.kilometraje }} KM</template>
                  <template v-if="resumenVehiculo.kilometraje && resumenVehiculo.horometro"> · </template>
                  <template v-if="resumenVehiculo.horometro">{{ resumenVehiculo.horometro }} HRS</template>
                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button
              v-if="puedeEditarVehiculoUI"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lyer-cyan/40 hover:text-white"
              @click="irAEditarVehiculo"
            >
              Editar
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lyer-cyan/40 hover:text-white"
              @click="cambiarVehiculo"
            >
              Cambiar
            </button>
          </div>
        </div>

        <FormCliente
          :cliente="form.cliente"
          :errores="errores"
          :bloqueado="clienteBloqueado"
          :nombre-bloqueado="nombreClienteBloqueado"
          :consultado="clienteConsultado"
          :es-nuevo="clienteEraNuevo"
          :puede-editar="puedeEditarClienteUI"
          @update:cliente="form.cliente = $event"
          @actualizar-nombre="onCambioNombre"
          @sin-coincidencias="marcarClienteNuevo"
          @seleccionar-cliente="aplicarCliente"
          @editar="empezarEditarClienteEnPaso"
        />

        <div v-if="clienteBloqueado && !puedeEditarClienteUI" class="flex justify-end">
          <button
            type="button"
            class="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
            @click="cambiarCliente"
          >
            Cambiar selección de cliente
          </button>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#4a2870]/50 px-5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white sm:flex-none"
              @click="irAPaso(1)"
            >
              <ArrowLeft class="h-4 w-4" />
              Atrás
            </button>
            <button
              v-if="editandoCliente && clienteConfirmado"
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-xl border border-[#4a2870]/50 px-5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white"
              @click="cancelarEdicionCliente"
            >
              Cancelar
            </button>
          </div>
          <button
            type="button"
            :disabled="guardandoPaso"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lyer-accent px-8 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)] disabled:opacity-60"
            @click="guardarPasoCliente"
          >
            <span v-if="guardandoPaso" class="loading loading-spinner loading-sm" />
            <template v-else>
              Continuar al trabajo
              <ArrowRight class="h-5 w-5" />
            </template>
          </button>
        </div>
      </template>

      <!-- PASO 3: RECEPCIÓN -->
      <template v-else>
        <div class="grid gap-3.5 sm:grid-cols-2">
          <div class="flex items-center justify-between gap-3 rounded-xl border border-[#4a2870]/45 bg-[#221433]/90 p-4">
            <div class="flex min-w-0 items-center gap-3.5">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
                <Car class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <span class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Vehículo asociado</span>
                <div class="mt-0.5 flex flex-wrap items-center gap-2">
                  <span class="rounded border border-[#4a2870] bg-[#140a22] px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-white">
                    {{ resumenVehiculo.placa }}
                  </span>
                  <span class="truncate text-sm font-semibold text-slate-100">
                    {{ resumenVehiculo.marca }} {{ resumenVehiculo.modelo }}
                  </span>
                </div>
                <p v-if="resumenVehiculo.kilometraje || resumenVehiculo.horometro" class="mt-0.5 font-mono text-[11px] text-slate-400">
                  <template v-if="resumenVehiculo.kilometraje">{{ resumenVehiculo.kilometraje }} KM</template>
                  <template v-if="resumenVehiculo.kilometraje && resumenVehiculo.horometro"> · </template>
                  <template v-if="resumenVehiculo.horometro">{{ resumenVehiculo.horometro }} HRS</template>
                </p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <button
                v-if="puedeEditarVehiculoUI"
                type="button"
                class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-200 hover:text-white"
                @click="irAEditarVehiculo"
              >
                Editar
              </button>
              <button
                type="button"
                class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-400 hover:text-white"
                @click="cambiarVehiculo"
              >
                Cambiar
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 rounded-xl border border-[#4a2870]/45 bg-[#221433]/90 p-4">
            <div class="flex min-w-0 items-center gap-3.5">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
                <User class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <span class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cliente asignado</span>
                <h4 class="mt-0.5 truncate text-sm font-bold text-white">{{ resumenCliente.nombre }}</h4>
                <p class="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span v-if="resumenCliente.documento" class="rounded border border-[#4a2870]/70 bg-[#140a22] px-1.5 py-0.5 font-mono">
                    {{ resumenCliente.documento }}
                  </span>
                  <span v-if="resumenCliente.representante">{{ resumenCliente.representante }}</span>
                </p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <button
                v-if="puedeEditarClienteUI"
                type="button"
                class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-200 hover:text-white"
                @click="irAEditarCliente"
              >
                Editar
              </button>
              <button
                type="button"
                class="rounded-lg border border-[#4a2870]/50 bg-[#2a1840] px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-400 hover:text-white"
                @click="cambiarCliente"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>

        <FormIngresoOrden
          v-model:descripcion-informal="form.descripcionInformal"
          v-model:estado-ingreso="form.estadoIngreso"
          v-model:observacion-ingreso="form.observacionIngreso"
          :errores="errores"
        />

        <CampoFoto
          oscuro
          obligatoria
          titulo="Foto de registro inicial"
          ayuda="Tomar o subir la foto de la unidad al ingresar."
          :error="errores.fotoRegistro"
          :src="fotoSrc"
          :puede-cambiar="puedeCambiarRegistro"
          :puede-quitar="puedeQuitarRegistro"
          :subiendo="subiendoFoto"
          @seleccionar="archivoRegistro = $event"
          @quitar="quitarRegistro"
        />

        <footer class="flex flex-col gap-4 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Al finalizar</p>
            <p class="mt-1 text-sm text-slate-300">
              La orden queda
              <span class="font-semibold text-lyer-soft">en espera</span>
              hasta que un supervisor la valide.
            </p>
          </div>
          <div class="flex w-full shrink-0 gap-3 sm:w-auto">
            <button
              type="button"
              class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#4a2870]/50 px-5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white sm:flex-none"
              @click="irAPaso(2)"
            >
              <ArrowLeft class="h-4 w-4" />
              Atrás
            </button>
            <button
              type="button"
              :disabled="guardando"
              class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-lyer-accent px-7 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] shadow-[0_0_20px_-3px_rgba(255,96,128,0.45)] disabled:opacity-60 sm:flex-none"
              @click="completarBorrador"
            >
              <span v-if="guardando" class="loading loading-spinner loading-sm" />
              <template v-else>
                {{ recepcionCompleta ? 'Guardar cambios' : 'Finalizar orden' }}
                <Check class="h-5 w-5" />
              </template>
            </button>
          </div>
        </footer>
      </template>
    </template>
  </div>
</template>
