<script setup>
import { campo, etiqueta } from '../modal/campoRegistro.js';

const props = defineProps({
  form: { type: Object, required: true },
});

const emit = defineEmits(['update:form']);
</script>

<template>
  <label class="block space-y-1.5">
    <span :class="etiqueta">Nombre de la marca</span>
    <input
      :value="form.nombre"
      type="text"
      :class="campo"
      @input="emit('update:form', { ...form, nombre: $event.target.value })"
    />
  </label>
</template>
