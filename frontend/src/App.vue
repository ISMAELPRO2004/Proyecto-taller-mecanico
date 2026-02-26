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
</style>