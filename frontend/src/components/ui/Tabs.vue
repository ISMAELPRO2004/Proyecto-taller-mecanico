<script setup>
defineProps({
  modelValue: { type: String, required: true },
  items: { type: Array, required: true },
});

const emit = defineEmits(['update:modelValue', 'change']);

const elegir = (id) => {
  emit('update:modelValue', id);
  emit('change', id);
};
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div class="w-full lg:w-auto overflow-x-auto custom-scroll-sm pb-1">
      <div class="tabs tabs-boxed bg-slate-100 p-1 flex flex-nowrap min-w-max rounded-2xl border border-slate-200">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          @click="elegir(item.id)"
          :class="[
            'tab tab-md md:tab-lg px-6 font-black rounded-xl whitespace-nowrap gap-2',
            modelValue === item.id ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400',
          ]"
        >
          <component :is="item.icon" v-if="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </button>
      </div>
    </div>
    <slot />
  </div>
</template>
