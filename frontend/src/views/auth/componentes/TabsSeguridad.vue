<script setup>
import { Users, History } from 'lucide-vue-next';

defineProps({
  modelValue: { type: String, required: true },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="overflow-x-auto custom-scroll-sm pb-1">
    <div class="tabs tabs-boxed bg-slate-100 p-1 flex flex-nowrap min-w-max rounded-2xl border border-slate-200">
      <button
        @click="$emit('update:modelValue', 'usuarios')"
        :class="[
          'tab tab-md md:tab-lg px-6 md:px-8 font-black transition-all rounded-xl whitespace-nowrap',
          modelValue === 'usuarios' ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400'
        ]"
      >
        <Users class="w-4 h-4 mr-2" /> Usuarios
      </button>
      <button
        @click="$emit('update:modelValue', 'logs')"
        :class="[
          'tab tab-md md:tab-lg px-6 md:px-8 font-black transition-all rounded-xl whitespace-nowrap',
          modelValue === 'logs' ? 'bg-white text-lyer-green shadow-sm' : 'text-slate-400'
        ]"
      >
        <History class="w-4 h-4 mr-2" /> Auditoría
      </button>
    </div>
  </div>
</template>
