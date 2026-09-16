<script setup>
import { computed } from 'vue';
import MainLayout from './components/layout/MainLayout.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const needsLayout = computed(() => route.name !== 'login');
</script>

<template>
  <!-- MainLayout ya renderiza su propio <router-view /> -->
  <MainLayout v-if="needsLayout" />
  <router-view v-else />
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.swal2-container {
  z-index: 99999 !important;
}
.lyer-toast {
  font-size: 0.85rem !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
