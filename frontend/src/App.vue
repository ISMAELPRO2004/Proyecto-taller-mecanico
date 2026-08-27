<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './components/layout/MainLayout.vue';

const route = useRoute();

// Solo mostramos el Layout si la ruta no es 'login'
// (Asegúrate de que tu ruta de login se llame exactamente 'login' en el router)
const needsLayout = computed(() => route.name !== 'login');
</script>

<template>
  <MainLayout v-if="needsLayout">
    <router-view />
  </MainLayout>

  <router-view v-else />
</template>

<style>
/* Reset global para asegurar que el scroll funcione bien con el sidebar */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Toasts por encima de modals DaisyUI */
.swal2-container {
  z-index: 99999 !important;
}
.lyer-toast {
  font-size: 0.85rem !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>