<script setup>
import { Trash2 } from 'lucide-vue-next';

defineProps({
  eliminacion: { type: Object, required: true },
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-rose-300">
      <Trash2 class="h-4 w-4" />
      <span class="font-mono text-[11px] font-bold uppercase tracking-widest">Eliminado</span>
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="[label, val] in eliminacion.campos" :key="label" class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
        <span class="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-rose-300/80">{{ label }}</span>
        <span class="text-sm font-semibold text-lyer-fg">{{ val }}</span>
      </div>
    </div>
    <template v-if="eliminacion.materiales.length">
      <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-300">Repuestos incluidos</p>
      <div class="overflow-hidden rounded-xl border border-rose-500/30">
        <table class="w-full text-sm text-lyer-fg">
          <tbody class="divide-y divide-rose-500/20">
            <tr v-for="(m, i) in eliminacion.materiales" :key="i">
              <td class="px-4 py-2.5">{{ m.descripcion }}</td>
              <td class="px-4 py-2.5 text-center font-mono text-rose-200">x{{ m.cantidad }}</td>
              <td class="px-4 py-2.5 text-right font-mono">S/ {{ m.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-if="eliminacion.servicios.length || eliminacion.terceros.length">
      <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-300">Servicios incluidos</p>
      <div class="overflow-hidden rounded-xl border border-rose-500/30">
        <table class="w-full text-sm text-lyer-fg">
          <tbody class="divide-y divide-rose-500/20">
            <tr v-for="(s, i) in eliminacion.servicios" :key="'s' + i">
              <td class="px-4 py-2.5">{{ s.descripcion }}</td>
              <td class="px-4 py-2.5 text-right font-mono">S/ {{ s.monto.toFixed(2) }}</td>
            </tr>
            <tr v-for="(t, i) in eliminacion.terceros" :key="'t' + i">
              <td class="px-4 py-2.5">{{ t.descripcion }}</td>
              <td class="px-4 py-2.5 text-right font-mono">S/ {{ t.monto.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-if="eliminacion.total" class="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4">
      <span class="font-mono text-[11px] font-bold uppercase tracking-widest text-rose-200">Total eliminado</span>
      <span class="font-mono text-lg font-bold text-rose-200">S/ {{ eliminacion.total.toFixed(2) }}</span>
    </div>
  </div>
</template>
