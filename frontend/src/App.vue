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
  max-width: min(92vw, 22rem) !important;
  padding: 0.55rem 0.8rem !important;
  font-size: 0.8rem !important;
  border-radius: 0.85rem !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}
.lyer-toast .swal2-icon {
  width: 1.45rem !important;
  height: 1.45rem !important;
  margin: 0 0.45rem 0 0 !important;
}
.lyer-toast .swal2-title,
.lyer-toast-title {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 0.8rem !important;
  line-height: 1.3 !important;
  text-align: left !important;
}
.lyer-toast .swal2-timer-progress-bar {
  height: 2px !important;
}
.lyer-confirm {
  max-width: min(92vw, 24rem) !important;
  padding: 1.1rem 1rem 1rem !important;
}
.lyer-confirm .swal2-title {
  font-size: 1.05rem !important;
}
.lyer-confirm .swal2-html-container {
  font-size: 0.85rem !important;
  margin: 0.4rem 0 0.8rem !important;
}
</style>
