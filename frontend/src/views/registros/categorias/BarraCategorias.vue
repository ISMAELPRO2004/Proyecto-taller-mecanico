<script setup>
import { Search } from 'lucide-vue-next';
import Tabs from '../../../components/ui/Tabs.vue';
import AltaMarca from '../marcas/AltaMarca.vue';

defineProps({
  tab: { type: String, required: true },
  tabs: { type: Array, required: true },
  busqueda: { type: String, default: '' },
  nuevaMarca: { type: String, default: '' },
});

defineEmits(['update:tab', 'update:busqueda', 'update:nuevaMarca', 'crear-marca']);
</script>

<template>
  <div class="space-y-4 border-b border-[#4a2870]/40 px-4 py-4 md:px-6">
    <Tabs :model-value="tab" :items="tabs" oscuro @update:model-value="$emit('update:tab', $event)" />
    <div class="flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          :value="busqueda"
          type="text"
          placeholder="Buscar..."
          class="h-11 w-full rounded-xl border border-[#4a2870]/60 bg-[#140a22] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none"
          @input="$emit('update:busqueda', $event.target.value)"
        />
      </div>
      <AltaMarca
        v-if="tab === 'marcas'"
        :nombre="nuevaMarca"
        @update:nombre="$emit('update:nuevaMarca', $event)"
        @crear="$emit('crear-marca')"
      />
    </div>
  </div>
</template>
