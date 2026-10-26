<script setup>
import { computed } from 'vue';
import { X, User, Car, FileText, Camera, Clock, ClipboardList, AlertTriangle } from 'lucide-vue-next';
import { labelEstadoOrden } from '../../../../constants/estadosOrden.js';
import { useCargaDetalleOrden } from './useCargaDetalleOrden.js';

const props = defineProps({
  ordenId: { type: Number, default: null },
  isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'continuar']);
const { orden, loading, fotos } = useCargaDetalleOrden(props, ['registro']);

const fechaIngreso = computed(() => {
  const valor = orden.value?.fechaCreacion;
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
});

const etiquetaPaso = computed(() => {
  const paso = orden.value?.pasoRecepcion;
  if (paso === 1) return 'Paso 1 de 3 · Solo vehículo';
  if (paso === 2) return 'Paso 2 de 3 · Vehículo y cliente';
  return 'Recepción completa · Pendiente de aceptar';
});

const medida = (valor, unidad) => {
  if (valor === null || valor === undefined || valor === '') return '—';
  const n = Number(valor);
  const texto = Number.isFinite(n) ? n.toLocaleString('es-PE') : String(valor);
  return `${texto} ${unidad}`;
};

const ingresoObservado = computed(() => orden.value?.estadoIngreso === 'OBSERVADO');
</script>

<template>
  <div :class="['modal', { 'modal-open': isOpen }]">
    <div class="modal-box flex max-h-[92vh] w-11/12 max-w-3xl flex-col overflow-hidden !border !border-[#4a2870]/60 !bg-[#160a24] p-0 text-slate-100 shadow-2xl sm:rounded-2xl">
      <div class="h-1 w-full shrink-0 bg-gradient-to-r from-lyer-green via-lyer-accent to-lyer-cyan" />

      <header class="flex shrink-0 items-center justify-between gap-3 border-b border-[#4a2870]/50 bg-[#10041f] px-5 py-4 sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <ClipboardList class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate font-display text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
                Borrador {{ orden?.numeroOrden || '...' }}
              </h3>
              <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                <span class="h-1.5 w-1.5 rounded-full bg-current" />
                {{ orden ? labelEstadoOrden(orden.estado) : 'En espera' }}
              </span>
            </div>
            <p class="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-slate-400">{{ etiquetaPaso }}</p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#4a2870]/50 bg-[#140a22] text-slate-400 hover:text-white"
          title="Cerrar"
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </header>

      <div class="flex-1 space-y-5 overflow-y-auto bg-[#120818] px-5 py-5 sm:px-6">
        <div v-if="loading" class="flex flex-col items-center gap-3 py-20 text-center">
          <span class="loading loading-ring loading-lg text-lyer-accent" />
          <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cargando el borrador</p>
        </div>

        <div v-else-if="orden" class="space-y-5">
          <section class="space-y-2">
            <div class="flex items-center gap-2 text-slate-300">
              <Car class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Vehículo</span>
            </div>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="rounded-xl border border-lyer-cyan/30 bg-[#160a24] p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Placa</span>
                <p class="mt-2 font-mono text-lg font-bold tracking-widest text-lyer-cyan">{{ orden.placa || '—' }}</p>
              </div>
              <div class="rounded-xl border border-[#4a2870]/45 bg-[#160a24] p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Marca / modelo</span>
                <p class="mt-2 truncate text-sm font-bold uppercase text-white">
                  {{ orden.vehiculo?.marca?.nombre || '—' }} {{ orden.vehiculo?.modelo }}
                </p>
              </div>
              <div class="rounded-xl border border-[#4a2870]/45 bg-[#160a24] p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Kilometraje</span>
                <p class="mt-2 font-mono text-sm font-bold text-slate-100">{{ medida(orden.vehiculo?.kilometraje, 'km') }}</p>
              </div>
              <div class="rounded-xl border border-[#4a2870]/45 bg-[#160a24] p-3.5">
                <span class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Horómetro</span>
                <p class="mt-2 font-mono text-sm font-bold text-slate-100">{{ medida(orden.vehiculo?.horometro, 'h') }}</p>
              </div>
            </div>
          </section>

          <section class="space-y-2">
            <div class="flex items-center gap-2 text-slate-300">
              <User class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Cliente</span>
            </div>
            <div v-if="orden.cliente" class="space-y-3 rounded-xl border border-[#4a2870]/45 bg-[#160a24] p-4 sm:p-5">
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="font-display text-xl font-bold text-white">{{ orden.cliente.nombreRazonSocial }}</h4>
                <span
                  v-if="orden.cliente.numeroDocumento"
                  class="rounded-md border border-[#4a2870]/50 bg-[#140a22] px-2 py-0.5 font-mono text-[11px] text-slate-300"
                >
                  {{ orden.cliente.tipoDocumento || 'DOC' }} {{ orden.cliente.numeroDocumento }}
                </span>
              </div>
              <dl class="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Celular</dt>
                  <dd class="mt-0.5 text-slate-100">{{ orden.cliente.celular || '—' }}</dd>
                </div>
                <div>
                  <dt class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Correo</dt>
                  <dd class="mt-0.5 text-slate-100">{{ orden.cliente.correo || '—' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="font-mono text-[10px] uppercase tracking-wider text-slate-400">Quién deja el vehículo</dt>
                  <dd class="mt-0.5 text-slate-100">{{ orden.cliente.representante || '—' }}</dd>
                </div>
              </dl>
            </div>
            <p v-else class="rounded-xl border border-dashed border-[#4a2870]/50 bg-[#160a24] px-4 py-6 text-center text-sm text-slate-400">
              El cliente todavía no está cargado en este borrador.
            </p>
          </section>

          <section class="space-y-2">
            <div class="flex items-center gap-2 text-slate-300">
              <FileText class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Recepción</span>
            </div>
            <div class="space-y-3 rounded-xl border border-[#4a2870]/45 bg-[#160a24] p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span
                  :class="[
                    'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                    ingresoObservado ? 'border-amber-400/40 bg-amber-500/10 text-amber-200' : 'border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan',
                  ]"
                >
                  Ingreso {{ ingresoObservado ? 'observado' : 'aceptado' }}
                </span>
                <p v-if="fechaIngreso" class="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Clock class="h-3.5 w-3.5" />
                  {{ fechaIngreso }}
                </p>
              </div>
              <div v-if="ingresoObservado && orden.observacionIngreso" class="rounded-lg border-l-2 border-amber-400 bg-[#140a22] px-4 py-3">
                <p class="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                  <AlertTriangle class="h-3.5 w-3.5" />
                  Observación de ingreso
                </p>
                <p class="mt-1 text-sm leading-relaxed text-slate-100">{{ orden.observacionIngreso }}</p>
              </div>
              <div v-if="orden.descripcionInformal" class="rounded-lg border-l-2 border-lyer-cyan bg-[#140a22] px-4 py-3">
                <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Solicitud del cliente</p>
                <p class="mt-1 text-sm leading-relaxed text-slate-100">{{ orden.descripcionInformal }}</p>
              </div>
              <p v-else class="text-sm text-slate-500">Aún no hay solicitud escrita.</p>
              <p v-if="orden.creador?.nombreCompleto" class="font-mono text-[11px] text-slate-500">
                Registró {{ orden.creador.nombreCompleto }}
              </p>
            </div>
          </section>

          <section class="space-y-2">
            <div class="flex items-center gap-2 text-slate-300">
              <Camera class="h-4 w-4 text-lyer-cyan" />
              <span class="font-mono text-[11px] font-semibold uppercase tracking-wider">Foto de registro</span>
            </div>
            <article class="overflow-hidden rounded-xl border border-[#4a2870]/45 bg-[#160a24]">
              <img v-if="fotos.registro" :src="fotos.registro" alt="Foto de registro" class="max-h-64 w-full object-cover" />
              <div v-else class="flex h-40 flex-col items-center justify-center text-slate-500">
                <Camera class="mb-2 h-7 w-7" />
                <span class="text-[11px] font-semibold uppercase tracking-wider">Sin foto todavía</span>
              </div>
            </article>
          </section>
        </div>
      </div>

      <footer class="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#4a2870]/50 bg-[#10041f] px-5 py-4">
        <button
          type="button"
          class="rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-white"
          @click="emit('close')"
        >
          Cerrar
        </button>
        <button
          v-if="orden"
          type="button"
          class="rounded-xl border border-lyer-accent/40 bg-[#2a0a4a] px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#3a1260]"
          @click="emit('continuar', orden)"
        >
          {{ orden.pasoRecepcion != null ? 'Continuar recepción' : 'Editar borrador' }}
        </button>
      </footer>
    </div>
  </div>
</template>
