<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Camera, ImagePlus, Trash2, Lock } from 'lucide-vue-next';

const props = defineProps({
  titulo: { type: String, required: true },
  ayuda: { type: String, default: '' },
  src: { type: String, default: '' },
  puedeCambiar: { type: Boolean, default: false },
  puedeQuitar: { type: Boolean, default: false },
  subiendo: { type: Boolean, default: false },
});

const emit = defineEmits(['seleccionar', 'quitar']);

const inputGaleriaRef = ref(null);
const inputCamaraRef = ref(null);
const localUrl = ref('');
const esMovil = ref(false);

const vista = computed(() => localUrl.value || props.src);

const detectarMovil = () => {
  const touch = navigator.maxTouchPoints > 0
    || window.matchMedia('(pointer: coarse)').matches;
  const estrecho = window.matchMedia('(max-width: 768px)').matches;
  const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  esMovil.value = touch || estrecho || ua;
};

watch(() => props.src, () => {
  if (!localUrl.value) return;
  URL.revokeObjectURL(localUrl.value);
  localUrl.value = '';
});

onMounted(detectarMovil);
onBeforeUnmount(() => {
  if (localUrl.value) URL.revokeObjectURL(localUrl.value);
});

const abrirGaleria = () => {
  if (!props.puedeCambiar || props.subiendo) return;
  inputGaleriaRef.value?.click();
};

const abrirCamara = () => {
  if (!props.puedeCambiar || props.subiendo) return;
  inputCamaraRef.value?.click();
};

const onArchivo = (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (localUrl.value) URL.revokeObjectURL(localUrl.value);
  localUrl.value = URL.createObjectURL(file);
  emit('seleccionar', file);
};

const quitar = () => {
  if (localUrl.value) {
    URL.revokeObjectURL(localUrl.value);
    localUrl.value = '';
  }
  emit('quitar');
};
</script>

<template>
  <div class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">{{ titulo }}</p>
        <p v-if="ayuda" class="text-[11px] text-slate-400 mt-0.5">{{ ayuda }}</p>
        <p v-if="puedeCambiar && esMovil" class="text-[10px] text-emerald-600 font-bold mt-1">
          En el celular puedes tomar la foto o elegirla de la galería.
        </p>
      </div>
      <Lock v-if="src && !puedeCambiar" class="w-4 h-4 text-slate-300 shrink-0" />
    </div>

    <div class="aspect-[4/3] rounded-xl bg-white border border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
      <img v-if="vista" :src="vista" :alt="titulo" class="w-full h-full object-cover" />
      <div v-else class="text-center text-slate-300 px-4">
        <Camera class="w-8 h-8 mx-auto mb-2" />
        <p class="text-[10px] font-bold uppercase tracking-widest">Sin foto</p>
      </div>
    </div>

    <div v-if="puedeCambiar || puedeQuitar" class="flex flex-wrap gap-2">
      <template v-if="puedeCambiar && esMovil">
        <button
          type="button"
          class="btn btn-sm flex-1 min-w-[8rem] bg-lyer-green text-white border-none rounded-xl"
          :disabled="subiendo"
          @click="abrirCamara"
        >
          <span v-if="subiendo" class="loading loading-spinner loading-xs" />
          <Camera v-else class="w-4 h-4" />
          Tomar foto
        </button>
        <button
          type="button"
          class="btn btn-sm flex-1 min-w-[8rem] bg-white text-lyer-green border border-emerald-100 rounded-xl"
          :disabled="subiendo"
          @click="abrirGaleria"
        >
          <ImagePlus class="w-4 h-4" />
          Galería
        </button>
      </template>

      <button
        v-else-if="puedeCambiar"
        type="button"
        class="btn btn-sm flex-1 bg-lyer-green text-white border-none rounded-xl"
        :disabled="subiendo"
        @click="abrirGaleria"
      >
        <span v-if="subiendo" class="loading loading-spinner loading-xs" />
        <ImagePlus v-else class="w-4 h-4" />
        {{ vista ? 'Cambiar archivo' : 'Elegir archivo' }}
      </button>

      <button
        v-if="puedeQuitar && vista"
        type="button"
        class="btn btn-sm btn-ghost text-red-400 rounded-xl"
        :disabled="subiendo"
        @click="quitar"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Galería / PC: sin capture → abre selector de archivos -->
    <input
      ref="inputGaleriaRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="onArchivo"
    />
    <!-- Celular: capture pide la cámara trasera -->
    <input
      ref="inputCamaraRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      capture="environment"
      class="hidden"
      @change="onArchivo"
    />
  </div>
</template>
