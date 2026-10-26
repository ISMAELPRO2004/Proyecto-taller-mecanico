<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  oscuro: { type: Boolean, default: false },
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
      <div
        :class="oscuro
          ? 'flex min-w-max flex-nowrap gap-1 rounded-2xl border border-[#4a2870]/50 bg-[#160a24] p-1'
          : 'tabs tabs-boxed flex min-w-max flex-nowrap rounded-2xl border border-slate-200 bg-slate-100 p-1'"
      >
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          @click="elegir(item.id)"
          :class="[
            'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold md:px-6 md:py-2.5',
            modelValue === item.id
              ? (oscuro ? 'border border-lyer-accent/40 bg-[#2a0a4a] text-white' : 'bg-white text-lyer-green shadow-sm')
              : (oscuro ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400'),
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
