<script setup>
import { Plus } from 'lucide-vue-next';

defineProps({
  nombre: { type: String, default: '' },
});

defineEmits(['update:nombre', 'crear']);
</script>

<template>
  <div class="flex gap-2">
    <input
      :value="nombre"
      type="text"
      placeholder="Nombre de la marca"
      aria-label="Nombre de la marca"
      class="h-11 w-full rounded-xl border border-[#4a2870]/60 bg-[#140a22] px-4 text-sm text-white placeholder:text-slate-500 focus:border-lyer-cyan/70 focus:outline-none sm:w-56"
      @input="$emit('update:nombre', $event.target.value)"
      @keyup.enter="$emit('crear')"
    />
    <button
      type="button"
      title="Crear marca"
      class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lyer-accent text-[#1a0633]"
      @click="$emit('crear')"
    >
      <Plus class="h-5 w-5" />
    </button>
  </div>
</template>
