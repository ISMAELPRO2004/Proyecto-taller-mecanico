<script setup>
defineProps({
  modelValue: { type: String, required: true },
});

defineEmits(['update:modelValue']);

const tabs = [
  { id: 'clientes', label: 'Clientes' },
  { id: 'vehiculos', label: 'Vehículos' },
  { id: 'marcas', label: 'Marcas' },
];
</script>

<template>
  <div class="overflow-x-auto custom-scroll-sm pb-1">
    <div class="tabs tabs-boxed bg-slate-100 p-1 flex flex-nowrap min-w-max rounded-2xl border border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('update:modelValue', tab.id)"
        :class="[
          'tab tab-md md:tab-lg px-6 font-black rounded-xl whitespace-nowrap',
          modelValue === tab.id ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
