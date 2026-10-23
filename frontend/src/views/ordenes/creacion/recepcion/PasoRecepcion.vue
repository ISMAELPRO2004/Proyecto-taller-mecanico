<script setup>
import ResumenAsociados from './ResumenAsociados.vue';
import FormIngresoOrden from './FormIngresoOrden.vue';
import FooterPasoRecepcion from './FooterPasoRecepcion.vue';
import CampoFoto from '../../compartido/CampoFoto.vue';

defineProps({
  resumenVehiculo: { type: Object, required: true },
  resumenCliente: { type: Object, required: true },
  puedeEditarVehiculo: { type: Boolean, default: false },
  puedeEditarCliente: { type: Boolean, default: false },
  descripcionInformal: { type: String, default: '' },
  estadoIngreso: { type: String, default: 'ACEPTADO' },
  observacionIngreso: { type: String, default: '' },
  errores: { type: Object, default: () => ({}) },
  fotoSrc: { type: String, default: '' },
  puedeCambiarRegistro: { type: Boolean, default: false },
  puedeQuitarRegistro: { type: Boolean, default: false },
  subiendoFoto: { type: Boolean, default: false },
  recepcionCompleta: { type: Boolean, default: false },
  guardando: { type: Boolean, default: false },
});

defineEmits([
  'editar-vehiculo',
  'cambiar-vehiculo',
  'editar-cliente',
  'cambiar-cliente',
  'update:descripcionInformal',
  'update:estadoIngreso',
  'update:observacionIngreso',
  'seleccionar-foto',
  'quitar-foto',
  'atras',
  'finalizar',
]);
</script>

<template>
  <div class="space-y-8">
    <ResumenAsociados
      :resumen-vehiculo="resumenVehiculo"
      :resumen-cliente="resumenCliente"
      :puede-editar-vehiculo="puedeEditarVehiculo"
      :puede-editar-cliente="puedeEditarCliente"
      @editar-vehiculo="$emit('editar-vehiculo')"
      @cambiar-vehiculo="$emit('cambiar-vehiculo')"
      @editar-cliente="$emit('editar-cliente')"
      @cambiar-cliente="$emit('cambiar-cliente')"
    />

    <FormIngresoOrden
      :descripcion-informal="descripcionInformal"
      :estado-ingreso="estadoIngreso"
      :observacion-ingreso="observacionIngreso"
      :errores="errores"
      @update:descripcion-informal="$emit('update:descripcionInformal', $event)"
      @update:estado-ingreso="$emit('update:estadoIngreso', $event)"
      @update:observacion-ingreso="$emit('update:observacionIngreso', $event)"
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
      @seleccionar="$emit('seleccionar-foto', $event)"
      @quitar="$emit('quitar-foto')"
    />

    <FooterPasoRecepcion
      :recepcion-completa="recepcionCompleta"
      :guardando="guardando"
      @atras="$emit('atras')"
      @finalizar="$emit('finalizar')"
    />
  </div>
</template>
