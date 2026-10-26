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
  oscuro: { type: Boolean, default: false },
  obligatoria: { type: Boolean, default: false },
  error: { type: String, default: '' },
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
  <div
    :class="oscuro
      ? 'space-y-4 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:p-7'
      : 'space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4'"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-2.5">
        <div
          v-if="oscuro"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan"
        >
          <Camera class="h-4 w-4" />
        </div>
        <div>
          <p :class="oscuro ? 'font-display text-base font-bold uppercase tracking-wide text-lyer-fg' : 'text-[10px] font-black uppercase tracking-widest text-slate-500'">
            {{ titulo }}
            <span v-if="obligatoria" class="text-lyer-accent">*</span>
          </p>
          <p v-if="ayuda" :class="oscuro ? 'mt-0.5 text-xs text-lyer-muted' : 'mt-0.5 text-[11px] text-lyer-muted'">{{ ayuda }}</p>
          <p v-if="puedeCambiar && esMovil" :class="oscuro ? 'mt-1 text-[11px] font-semibold text-lyer-cyan' : 'mt-1 text-[10px] font-bold text-emerald-600'">
            En el celular puedes tomar la foto o elegirla de la galería.
          </p>
        </div>
      </div>
      <span
        v-if="src && !puedeCambiar"
        :class="oscuro
          ? 'inline-flex shrink-0 items-center gap-1.5 rounded-md border border-lyer-linea/50 bg-lyer-fondo px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-lyer-muted'
          : 'shrink-0 text-lyer-muted'"
      >
        <Lock class="h-3.5 w-3.5 text-amber-400" />
        <span v-if="oscuro">Bloqueado tras registro</span>
      </span>
    </div>

    <div
      :class="oscuro
        ? ['relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-lyer-fondo', error ? 'border-rose-400' : 'border-lyer-linea hover:border-lyer-cyan/50']
        : 'flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-white'"
    >
      <img v-if="vista" :src="vista" :alt="titulo" :class="oscuro ? 'max-h-[300px] w-full object-cover' : 'h-full w-full object-cover'" />
      <div v-else :class="oscuro ? 'px-4 py-10 text-center text-slate-500' : 'px-4 text-center text-lyer-muted'">
        <div :class="oscuro ? 'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-lyer-linea bg-lyer-card text-lyer-muted' : ''">
          <Camera :class="oscuro ? 'h-8 w-8' : 'mx-auto mb-2 h-8 w-8'" />
        </div>
        <p :class="oscuro ? 'text-xs font-bold uppercase tracking-widest text-lyer-muted' : 'text-[10px] font-bold uppercase tracking-widest'">
          {{ oscuro ? 'Sin foto registrada' : 'Sin foto' }}
        </p>
        <p v-if="oscuro" class="mx-auto mt-1 max-w-md text-xs text-slate-500">
          JPG, PNG o WEBP, hasta 5 MB. Muestra la placa y el frente de la unidad.
        </p>
        <p v-if="error && !vista" class="mt-2 text-xs font-medium text-rose-300">{{ error }}</p>
      </div>
      <button
        v-if="oscuro && puedeQuitar && vista"
        type="button"
        class="absolute right-2 top-2 rounded-lg border border-rose-500/40 bg-rose-950/80 p-2 text-rose-300 hover:bg-rose-900"
        title="Quitar imagen"
        :disabled="subiendo"
        @click="quitar"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>

    <div v-if="puedeCambiar || puedeQuitar" class="flex flex-wrap gap-2">
      <template v-if="puedeCambiar && esMovil">
        <button
          type="button"
          :class="oscuro
          ? 'inline-flex h-11 flex-1 min-w-[8rem] items-center justify-center gap-2 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-4 text-xs font-bold uppercase tracking-wider text-lyer-fg'
          : 'btn btn-sm min-w-[8rem] flex-1 rounded-xl border-none bg-lyer-green text-lyer-fg'"
          :disabled="subiendo"
          @click="abrirCamara"
        >
          <span v-if="subiendo" class="loading loading-spinner loading-xs" />
          <Camera v-else class="w-4 h-4" />
          Tomar foto
        </button>
        <button
          type="button"
          :class="oscuro
          ? 'inline-flex h-11 flex-1 min-w-[8rem] items-center justify-center gap-2 rounded-xl border border-lyer-linea/50 bg-lyer-hover px-4 text-xs font-semibold uppercase tracking-wider text-lyer-fg'
          : 'btn btn-sm min-w-[8rem] flex-1 rounded-xl border border-emerald-100 bg-white text-lyer-green'"
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
        :class="oscuro
          ? 'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-lyer-accent/40 bg-lyer-boton px-5 text-xs font-bold uppercase tracking-wider text-lyer-fg'
          : 'btn btn-sm flex-1 rounded-xl border-none bg-lyer-green text-lyer-fg'"
        :disabled="subiendo"
        @click="abrirGaleria"
      >
        <span v-if="subiendo" class="loading loading-spinner loading-xs" />
        <ImagePlus v-else class="w-4 h-4" />
        {{ vista ? 'Cambiar archivo' : 'Elegir archivo' }}
      </button>

      <button
        v-if="!oscuro && puedeQuitar && vista"
        type="button"
        class="btn btn-sm btn-ghost rounded-xl text-red-400"
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
