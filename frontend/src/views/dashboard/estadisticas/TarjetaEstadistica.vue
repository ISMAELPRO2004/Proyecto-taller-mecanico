<script setup>
defineProps({
  titulo: { type: String, required: true },
  valor: { type: [Number, String], required: true },
  descripcion: { type: String, default: '' },
  barra: { type: String, default: 'bg-slate-400' },
  tono: { type: String, default: 'text-white' },
  etiqueta: { type: String, default: 'text-slate-400' },
  ancho: { type: String, default: '' },
  hover: { type: String, default: '' },
});
</script>

<template>
  <article
    :class="[
      'relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-4 shadow-md sm:p-5',
      hover,
      ancho,
    ]"
  >
    <div :class="['absolute bottom-0 left-0 h-1 w-full', barra]" />
    <div>
      <p :class="['text-[11px] font-semibold uppercase tracking-wider', etiqueta]">{{ titulo }}</p>
      <h3 :class="['mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl', tono]">{{ valor }}</h3>
    </div>
    <p class="mt-3 truncate text-xs text-slate-400">{{ descripcion }}</p>
  </article>
</template>
