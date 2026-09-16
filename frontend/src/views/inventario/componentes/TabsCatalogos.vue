<script setup>
defineProps({
  modelValue: { type: String, required: true },
  busqueda: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'update:busqueda', 'change']);

const tabs = { materiales: 'Repuestos', servicios: 'Servicios', terceros: 'Terceros' };

const seleccionarTab = (key) => {
  emit('update:modelValue', key);
  emit('change', key);
};
</script>

<template>
  <div class="flex flex-col lg:flex-row justify-between items-center gap-4">
    <div class="w-full lg:w-auto overflow-x-auto custom-scroll-sm pb-1">
      <div class="tabs tabs-boxed bg-slate-100 p-1 flex flex-nowrap min-w-max">
        <button v-for="(label, key) in tabs" :key="key" @click="seleccionarTab(key)"
          :class="['tab tab-md md:tab-lg px-6 font-bold transition-all whitespace-nowrap',
            modelValue === key ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400']">
          {{ label }}
        </button>
      </div>
    </div>
    <div class="relative w-full lg:w-96">
      <input :value="busqueda" @input="emit('update:busqueda', $event.target.value)" type="text"
        placeholder="Buscar..."
        class="input input-bordered w-full bg-slate-50 border-slate-100 rounded-xl text-sm" />
    </div>
  </div>
</template>
