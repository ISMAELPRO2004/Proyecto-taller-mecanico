<script setup>
import TarjetaUsuario from './TarjetaUsuario.vue';

defineProps({
  usuarios: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(['editar', 'toggle', 'eliminar']);
</script>

<template>
  <div v-if="loading" class="py-16 text-center">
    <span class="loading loading-ring loading-md text-lyer-accent" />
  </div>
  <div v-else-if="!usuarios.length" class="py-16 text-center text-sm text-slate-400">
    No hay usuarios.
  </div>
  <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <TarjetaUsuario
      v-for="u in usuarios"
      :key="u.id"
      :usuario="u"
      @editar="$emit('editar', $event)"
      @toggle="$emit('toggle', $event)"
      @eliminar="$emit('eliminar', $event)"
    />
  </div>
</template>
