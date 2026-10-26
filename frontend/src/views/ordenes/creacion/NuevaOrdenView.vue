<script setup>
import { useRecepcionOrden } from './composables/useRecepcionOrden.js';
import EncabezadoOrdenForm from '../compartido/EncabezadoOrdenForm.vue';
import PasosRecepcion from './pasos/PasosRecepcion.vue';
import PasoVehiculo from './vehiculo/PasoVehiculo.vue';
import PasoCliente from './cliente/PasoCliente.vue';
import PasoRecepcion from './recepcion/PasoRecepcion.vue';

const {
  router, ordenId, pasoRecepcion, paso, pasoAlcanzado, cargando, vehiculoBloqueado, placaConsultada,
  form, historialOrdenes, errores, onCambioPlaca, buscarPlaca, modoEntrada, elegirModoEntrada, marcas,
  puedeEditarVehiculoUI, onNuevaMarca, empezarEditarVehiculoEnPaso, editandoVehiculo,
  cancelarEdicionVehiculo, guardandoPaso, guardarPasoVehiculo, pasoOrigenEdicion,
  resumenVehiculo, irAEditarVehiculo, cambiarVehiculo, clienteBloqueado,
  clienteConsultado, clienteEraNuevo, nombreClienteBloqueado, onCambioNombre, marcarClienteNuevo,
  puedeEditarClienteUI, aplicarCliente, empezarEditarClienteEnPaso, cambiarCliente,
  editandoCliente, clienteConfirmado, cancelarEdicionCliente, irAPaso, guardarPasoCliente,
  resumenCliente, recepcionCompleta, irAEditarCliente, fotoSrc, puedeCambiarRegistro,
  puedeQuitarRegistro, subiendoFoto, alElegirFoto, quitarRegistro, guardando,
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
      <PasoVehiculo
        v-if="paso === 1"
        :placa="form.vehiculo.placa"
        :historial="historialOrdenes"
        :errores="errores"
        :placa-consultada="placaConsultada"
        :vehiculo="form.vehiculo"
        :marcas="marcas"
        :bloqueado="vehiculoBloqueado"
        :puede-editar="puedeEditarVehiculoUI"
        :editando="editandoVehiculo"
        :orden-id="ordenId"
        :guardando-paso="guardandoPaso"
        :paso-origen-edicion="pasoOrigenEdicion"
        :modo-entrada="modoEntrada"
        @update:placa="onCambioPlaca"
        @buscar="buscarPlaca"
        @elegir-modo="elegirModoEntrada"
        @update:vehiculo="form.vehiculo = $event"
        @crear-marca="onNuevaMarca"
        @editar="empezarEditarVehiculoEnPaso"
        @cancelar="cancelarEdicionVehiculo"
        @guardar="guardarPasoVehiculo"
      />

      <PasoCliente
        v-else-if="paso === 2"
        :resumen-vehiculo="resumenVehiculo"
        :puede-editar-vehiculo="puedeEditarVehiculoUI"
        :cliente="form.cliente"
        :errores="errores"
        :bloqueado="clienteBloqueado"
        :nombre-bloqueado="nombreClienteBloqueado"
        :consultado="clienteConsultado"
        :es-nuevo="clienteEraNuevo"
        :puede-editar-cliente="puedeEditarClienteUI"
        :editando="editandoCliente"
        :cliente-confirmado="clienteConfirmado"
        :guardando-paso="guardandoPaso"
        @editar-vehiculo="irAEditarVehiculo"
        @cambiar-vehiculo="cambiarVehiculo"
        @update:cliente="form.cliente = $event"
        @actualizar-nombre="onCambioNombre"
        @marcar-cliente-nuevo="marcarClienteNuevo"
        @seleccionar-cliente="aplicarCliente"
        @editar-cliente="empezarEditarClienteEnPaso"
        @cambiar-cliente="cambiarCliente"
        @atras="irAPaso(1)"
        @cancelar="cancelarEdicionCliente"
        @guardar="guardarPasoCliente"
      />

      <PasoRecepcion
        v-else
        :resumen-vehiculo="resumenVehiculo"
        :resumen-cliente="resumenCliente"
        :puede-editar-vehiculo="puedeEditarVehiculoUI"
        :puede-editar-cliente="puedeEditarClienteUI"
        :descripcion-informal="form.descripcionInformal"
        :estado-ingreso="form.estadoIngreso"
        :observacion-ingreso="form.observacionIngreso"
        :errores="errores"
        :foto-src="fotoSrc"
        :puede-cambiar-registro="puedeCambiarRegistro"
        :puede-quitar-registro="puedeQuitarRegistro"
        :subiendo-foto="subiendoFoto"
        :recepcion-completa="recepcionCompleta"
        :guardando="guardando"
        @editar-vehiculo="irAEditarVehiculo"
        @cambiar-vehiculo="cambiarVehiculo"
        @editar-cliente="irAEditarCliente"
        @cambiar-cliente="cambiarCliente"
        @update:descripcion-informal="form.descripcionInformal = $event"
        @update:estado-ingreso="form.estadoIngreso = $event"
        @update:observacion-ingreso="form.observacionIngreso = $event"
        @seleccionar-foto="alElegirFoto"
        @quitar-foto="quitarRegistro"
        @atras="irAPaso(2)"
        @finalizar="completarBorrador"
      />
    </template>
  </div>
</template>
