<script setup>
import Tabs from '../../../components/ui/Tabs.vue';

defineProps({
  tabActiva: { type: String, required: true },
  tabs: { type: Array, required: true },
});

defineEmits(['update:tabActiva']);
</script>

<template>
  <Tabs
    :model-value="tabActiva"
    :items="tabs"
    oscuro
    @update:model-value="$emit('update:tabActiva', $event)"
  />
</template>
