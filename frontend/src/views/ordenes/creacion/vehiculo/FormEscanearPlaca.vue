<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Camera, Check, History, Keyboard, RefreshCw, Loader2 } from 'lucide-vue-next';
import { vehiculoService } from '../../../../services/vehiculoService.js';
import { notify } from '../../../../utils/alerts.js';
import { FORMATO_PLACA, MENSAJE_FORMATO_PLACA, formatearPlacaEscrita, errorPlacaEnCurso } from '../../../../utils/placa.js';
import { labelEstadoOrden } from '../../../../constants/estadosOrden.js';
import { nombreClienteOrden } from '../../../../utils/ordenDisplay.js';

const emit = defineEmits(['usar-placa', 'manual']);

const videoEl = ref(null);
const etapa = ref('camara');
const streamActivo = ref(null);
const fotoUrl = ref('');
const fotoFile = ref(null);
const reconociendo = ref(false);
const modeloDisponible = ref(false);
const placa = ref('');
const errorPlaca = ref('');
const consultando = ref(false);
const historial = ref([]);
const vehiculoNuevo = ref(false);
const marcaModelo = ref('');
const errorCamara = ref('');

const apagarCamara = () => {
  streamActivo.value?.getTracks().forEach((track) => track.stop());
  streamActivo.value = null;
  if (videoEl.value) videoEl.value.srcObject = null;
};

const prenderCamara = async () => {
  errorCamara.value = '';
  if (!navigator.mediaDevices?.getUserMedia) {
    errorCamara.value = 'Este dispositivo no permite usar la cámara. Escribe la placa a mano.';
    return;
  }
  apagarCamara();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    streamActivo.value = stream;
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      await videoEl.value.play().catch(() => {});
    }
  } catch {
    errorCamara.value = 'No se pudo encender la cámara. Revisa el permiso o escríbela a mano.';
  }
};

const capturar = async () => {
  const video = videoEl.value;
  if (!video?.videoWidth) {
    notify.error('Cámara', 'Espera a que la imagen esté lista.');
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) {
    notify.error('Cámara', 'No se pudo tomar la foto.');
    return;
  }
  if (fotoUrl.value) URL.revokeObjectURL(fotoUrl.value);
  fotoFile.value = new File([blob], 'placa.jpg', { type: 'image/jpeg' });
  fotoUrl.value = URL.createObjectURL(blob);
  apagarCamara();
  etapa.value = 'confirmar';
  placa.value = '';
  errorPlaca.value = '';
  reconociendo.value = true;
  try {
    const data = await vehiculoService.reconocerPlaca(fotoFile.value);
    modeloDisponible.value = !!data.disponible;
    if (data.placa) placa.value = formatearPlacaEscrita('', data.placa);
  } catch {
    modeloDisponible.value = false;
  } finally {
    reconociendo.value = false;
  }
};

const onPlacaInput = (e) => {
  const val = formatearPlacaEscrita(placa.value, e.target.value);
  e.target.value = val;
  placa.value = val;
  errorPlaca.value = errorPlacaEnCurso(val);
};

const repetirFoto = async () => {
  historial.value = [];
  vehiculoNuevo.value = false;
  marcaModelo.value = '';
  if (fotoUrl.value) URL.revokeObjectURL(fotoUrl.value);
  fotoUrl.value = '';
  fotoFile.value = null;
  placa.value = '';
  etapa.value = 'camara';
  await prenderCamara();
};

const confirmarDigitos = async () => {
  const limpia = placa.value.trim().toUpperCase();
  if (!FORMATO_PLACA.test(limpia)) {
    errorPlaca.value = MENSAJE_FORMATO_PLACA;
    return;
  }
  consultando.value = true;
  try {
    const data = await vehiculoService.buscarPorPlaca(limpia);
    historial.value = data.ordenes || [];
    vehiculoNuevo.value = false;
    marcaModelo.value = [data.marca?.nombre, data.modelo].filter(Boolean).join(' ');
    etapa.value = 'historial';
  } catch {
    historial.value = [];
    vehiculoNuevo.value = true;
    marcaModelo.value = '';
    etapa.value = 'historial';
  } finally {
    consultando.value = false;
  }
};

const crearOrden = () => {
  emit('usar-placa', placa.value.trim().toUpperCase());
};

onMounted(prenderCamara);
onBeforeUnmount(() => {
  apagarCamara();
  if (fotoUrl.value) URL.revokeObjectURL(fotoUrl.value);
});
</script>

<template>
  <section class="space-y-5 rounded-2xl border border-[#4a2870]/45 bg-[#221433]/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-8">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-bold uppercase tracking-tight text-white">Escanear placa</h2>
        <p class="mt-1 text-xs text-slate-400 sm:text-sm">
          Encuadra la placa, toma la foto y confirma los dígitos.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-lyer-cyan"
        @click="$emit('manual')"
      >
        <Keyboard class="h-4 w-4" />
        Escribir a mano
      </button>
    </div>

    <div v-if="etapa === 'camara'" class="space-y-4">
      <div class="relative overflow-hidden rounded-2xl border border-[#4a2870]/50 bg-black">
        <video
          ref="videoEl"
          class="aspect-[4/3] w-full object-cover"
          autoplay
          muted
          playsinline
        />
        <div class="pointer-events-none absolute inset-x-8 inset-y-10 rounded-xl border-2 border-lyer-cyan/70" />
      </div>
      <p v-if="errorCamara" class="text-sm text-rose-300">{{ errorCamara }}</p>
      <button
        v-if="!errorCamara"
        type="button"
        class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-lyer-accent font-display text-sm font-bold uppercase tracking-wider text-[#1a0633]"
        @click="capturar"
      >
        <Camera class="h-5 w-5" />
        Tomar foto
      </button>
    </div>

    <div v-else class="space-y-4">
      <img
        v-if="fotoUrl"
        :src="fotoUrl"
        alt="Placa capturada"
        class="aspect-[4/3] w-full rounded-2xl border border-[#4a2870]/50 object-cover"
      />

      <p class="text-xs text-slate-400">
        {{ modeloDisponible
          ? 'Revisa que el modelo haya leído bien la placa.'
          : 'El modelo aún no está conectado. Escribe los dígitos que ves en la foto.' }}
      </p>

      <div>
        <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Placa <span class="text-lyer-accent">*</span>
        </label>
        <input
          :value="placa"
          maxlength="12"
          placeholder="EJ: ABC-123"
          autocomplete="off"
          :disabled="reconociendo || consultando"
          :class="[
            'h-14 w-full rounded-xl border bg-[#140a22] px-4 font-mono text-xl font-bold uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none',
            errorPlaca ? 'border-rose-400' : 'border-[#4a2870]/50 focus:border-lyer-cyan',
          ]"
          @input="onPlacaInput"
        />
        <p v-if="errorPlaca" class="mt-2 text-sm text-rose-300">{{ errorPlaca }}</p>
        <p v-if="reconociendo" class="mt-2 inline-flex items-center gap-2 text-xs text-lyer-cyan">
          <Loader2 class="h-4 w-4 animate-spin" />
          Identificando dígitos…
        </p>
      </div>

      <div v-if="etapa === 'historial'" class="overflow-hidden rounded-xl border border-[#4a2870]/40">
        <div class="flex items-center gap-2 bg-[#160a24] px-4 py-3 text-slate-400">
          <History class="h-4 w-4" />
          <span class="text-[10px] font-bold uppercase tracking-widest">
            {{ vehiculoNuevo ? 'Sin historial' : `Historial (${historial.length})` }}
          </span>
        </div>
        <p v-if="vehiculoNuevo" class="px-4 py-3 text-sm text-slate-300">
          Esta placa no tiene órdenes. Se registrará como vehículo nuevo.
        </p>
        <p v-else-if="marcaModelo" class="px-4 pt-3 text-xs font-semibold uppercase tracking-wider text-lyer-cyan">
          {{ marcaModelo }}
        </p>
        <ul v-if="historial.length" class="divide-y divide-[#4a2870]/30">
          <li v-for="o in historial" :key="o.id" class="flex justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <span class="font-bold text-lyer-cyan">{{ o.numeroOrden }}</span>
              <span class="ml-2 text-xs text-slate-400">{{ nombreClienteOrden(o) }}</span>
            </div>
            <span class="text-[10px] font-bold uppercase text-slate-400">{{ labelEstadoOrden(o.estado) }}</span>
          </li>
        </ul>
        <p v-else-if="!vehiculoNuevo" class="px-4 py-3 text-sm text-slate-300">
          El vehículo existe, pero no tiene órdenes recientes.
        </p>
      </div>

      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#4a2870]/50 px-4 text-xs font-semibold uppercase tracking-wider text-slate-300"
          @click="repetirFoto"
        >
          <RefreshCw class="h-4 w-4" />
          Repetir foto
        </button>
        <button
          v-if="etapa === 'confirmar'"
          type="button"
          :disabled="reconociendo || consultando"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lyer-accent px-6 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633] disabled:opacity-60"
          @click="confirmarDigitos"
        >
          <span v-if="consultando" class="loading loading-spinner loading-sm" />
          <template v-else>
            <Check class="h-5 w-5" />
            Confirmar escaneo
          </template>
        </button>
        <button
          v-else
          type="button"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lyer-accent px-6 font-display text-sm font-bold uppercase tracking-wider text-[#1a0633]"
          @click="crearOrden"
        >
          Crear orden con este vehículo
        </button>
      </div>
    </div>
  </section>
</template>
