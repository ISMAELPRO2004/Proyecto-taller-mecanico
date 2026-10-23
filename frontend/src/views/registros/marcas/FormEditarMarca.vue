<script setup>
import { campo, etiqueta } from '../modal/campoRegistro.js';

defineProps({
  form: { type: Object, required: true },
  errores: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:form']);
</script>

<template>
  <label class="block space-y-1.5">
    <span :class="etiqueta">Nombre de la marca</span>
    <input
      :value="form.nombre"
      type="text"
      :class="[campo, errores.nombre ? 'border-rose-400' : '']"
      @input="emit('update:form', { ...form, nombre: $event.target.value })"
    />
    <p v-if="errores.nombre" class="mt-1 text-xs text-rose-300">{{ errores.nombre }}</p>
  </label>
</template>
