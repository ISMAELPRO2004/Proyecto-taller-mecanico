<script setup>
import { ClipboardList, ChevronDown, AlertTriangle, ShieldCheck } from 'lucide-vue-next';

defineProps({
  descripcionInformal: { type: String, default: '' },
  estadoIngreso: { type: String, default: 'ACEPTADO' },
  observacionIngreso: { type: String, default: '' },
  errores: { type: Object, default: () => ({}) },
});

defineEmits([
  'update:descripcionInformal',
  'update:estadoIngreso',
  'update:observacionIngreso',
]);

const campo = 'w-full rounded-xl border border-lyer-linea/50 bg-lyer-fondo p-4 text-sm leading-relaxed text-lyer-fg placeholder:text-lyer-muted focus:border-lyer-cyan focus:outline-none';
</script>

<template>
  <section class="space-y-6 rounded-2xl border border-lyer-linea/45 bg-lyer-card/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:p-7">
    <div class="flex items-center justify-between gap-3 border-b border-lyer-linea/40 pb-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg border border-lyer-cyan/30 bg-lyer-cyan/10 text-lyer-cyan">
          <ClipboardList class="h-4 w-4" />
        </div>
        <div>
          <h2 class="font-display text-base font-bold uppercase tracking-wide text-lyer-fg">Datos de recepción</h2>
          <p class="mt-0.5 text-xs text-lyer-muted">Lo que pide el cliente y el estado físico al ingresar</p>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <label class="text-xs font-bold uppercase tracking-wider text-lyer-fg">
          Solicitud del cliente
          <span class="text-lyer-accent">*</span>
        </label>
        <span class="text-[11px] font-medium uppercase tracking-wide text-lyer-muted">Voz del cliente</span>
      </div>
      <textarea
        :value="descripcionInformal"
        rows="4"
        placeholder="Lo que pide el cliente en este momento. Por ejemplo: revisar vibración al pasar de 60 km/h y el olor a freno en bajada."
        :class="[campo, errores.descripcionInformal ? 'border-rose-400 focus:border-rose-400' : '']"
        @input="$emit('update:descripcionInformal', $event.target.value)"
      />
      <p v-if="errores.descripcionInformal" class="text-xs text-rose-300">{{ errores.descripcionInformal }}</p>
      <p class="text-xs text-slate-500">
        El detalle de los trabajos se escribe después, cuando un supervisor valida la orden.
      </p>
    </div>

    <div class="space-y-5">
      <div class="space-y-2">
        <label class="text-xs font-bold uppercase tracking-wider text-lyer-fg">Estado de ingreso</label>
        <div class="relative max-w-md">
          <select
            :value="estadoIngreso"
            :class="[campo, 'h-12 cursor-pointer appearance-none py-0 pr-10 font-medium']"
            @change="$emit('update:estadoIngreso', $event.target.value)"
          >
            <option value="ACEPTADO">Todo conforme / sin daños</option>
            <option value="OBSERVADO">Observado / con daños o detalles</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-lyer-muted" />
        </div>
        <p class="text-xs text-slate-500">Estado físico general de la unidad al recepcionarla.</p>
      </div>

      <div v-if="estadoIngreso === 'OBSERVADO'" class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
            <AlertTriangle class="h-4 w-4" />
            Observación de ingreso
          </label>
          <span class="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Requerido si hay daño
          </span>
        </div>
        <textarea
          :value="observacionIngreso"
          rows="4"
          placeholder="Describe el daño o detalle al momento del ingreso..."
          :class="[
            campo,
            'min-h-28 resize-y',
            errores.observacionIngreso ? 'border-rose-400 focus:border-rose-400' : 'border-amber-500/40 focus:border-amber-400',
          ]"
          @input="$emit('update:observacionIngreso', $event.target.value)"
        />
        <p v-if="errores.observacionIngreso" class="text-xs text-rose-300">{{ errores.observacionIngreso }}</p>
        <p v-else class="flex items-center gap-1.5 text-xs italic text-amber-200/80">
          <ShieldCheck class="h-3.5 w-3.5" />
          Este campo protege al taller contra reclamos de daños que ya venían.
        </p>
      </div>
    </div>
  </section>
</template>
