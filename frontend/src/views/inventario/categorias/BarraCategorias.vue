<script setup>
import Tabs from '../../../components/ui/Tabs.vue';

defineProps({
  tabActiva: { type: String, required: true },
  tabs: { type: Array, required: true },
  busqueda: { type: String, default: '' },
});

defineEmits(['update:tabActiva', 'update:busqueda', 'change']);
</script>

<template>
  <div class="border-b border-[#4a2870]/40 px-4 py-4 md:px-6">
    <Tabs
      :model-value="tabActiva"
      :items="tabs"
      oscuro
      @update:model-value="$emit('update:tabActiva', $event)"
      @change="$emit('change', $event)"
    >
      <input
        :value="busqueda"
        type="text"
        placeholder="Buscar..."
        class="h-11 w-full rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none lg:w-80"
        @input="$emit('update:busqueda', $event.target.value)"
      />
    </Tabs>
  </div>
</template>
