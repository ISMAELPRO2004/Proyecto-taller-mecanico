<script setup>
import { PlusCircle } from 'lucide-vue-next';

defineProps({
  creacion: { type: Object, required: true },
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-green-300">
      <PlusCircle class="h-4 w-4" />
      <span class="font-mono text-[11px] font-bold uppercase tracking-widest">Creado</span>
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="[label, val] in creacion.campos" :key="label" class="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <span class="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-green-300/80">{{ label }}</span>
        <span class="text-sm font-semibold text-lyer-fg">{{ val }}</span>
      </div>
    </div>
    <template v-if="creacion.materiales.length">
      <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-lyer-muted">Repuestos</p>
      <div class="overflow-hidden rounded-xl border border-lyer-linea/45">
        <table class="w-full text-sm text-lyer-fg">
          <thead class="bg-lyer-panel text-[11px] uppercase tracking-wider text-lyer-muted">
            <tr>
              <th class="px-4 py-2.5 text-left">Descripción</th>
              <th class="px-4 py-2.5 text-center">Cantidad</th>
              <th class="px-4 py-2.5 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-lyer-linea/35">
            <tr v-for="(m, i) in creacion.materiales" :key="i">
              <td class="px-4 py-2.5">{{ m.descripcion }}</td>
              <td class="px-4 py-2.5 text-center font-mono">{{ m.cantidad }}</td>
              <td class="px-4 py-2.5 text-right font-mono text-lyer-cyan">S/ {{ m.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-if="creacion.servicios.length">
      <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-lyer-muted">Servicios</p>
      <div class="overflow-hidden rounded-xl border border-lyer-linea/45">
        <table class="w-full text-sm text-lyer-fg">
          <tbody class="divide-y divide-lyer-linea/35">
            <tr v-for="(s, i) in creacion.servicios" :key="i">
              <td class="px-4 py-2.5">{{ s.descripcion }}</td>
              <td class="px-4 py-2.5 text-right font-mono text-lyer-cyan">S/ {{ s.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-if="creacion.terceros.length">
      <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-lyer-muted">Trabajos externos</p>
      <div class="overflow-hidden rounded-xl border border-lyer-linea/45">
        <table class="w-full text-sm text-lyer-fg">
          <tbody class="divide-y divide-lyer-linea/35">
            <tr v-for="(t, i) in creacion.terceros" :key="i">
              <td class="px-4 py-2.5">{{ t.descripcion }}</td>
              <td class="px-4 py-2.5 text-right font-mono text-amber-200">S/ {{ t.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-if="creacion.total !== null" class="flex items-center justify-between rounded-xl border border-lyer-linea/50 bg-lyer-barra px-5 py-4">
      <span class="font-mono text-[11px] font-bold uppercase tracking-widest text-lyer-muted">Total de la orden</span>
      <span class="font-mono text-lg font-bold text-lyer-cyan">S/ {{ creacion.total.toFixed(2) }}</span>
    </div>
  </div>
</template>
